import { Component, OnInit } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { I18n } from '@tspmelo/i18n-polyfill';
import * as _ from 'lodash';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { forkJoin as observableForkJoin } from 'rxjs';

import { MgrModuleService } from '../../../shared/api/mgr-module.service';
import { TelemetryService } from '../../../shared/api/telemetry.service';
import { NotificationType } from '../../../shared/enum/notification-type.enum';
import { CdFormBuilder } from '../../../shared/forms/cd-form-builder';
import { CdFormGroup } from '../../../shared/forms/cd-form-group';
import { CdValidators } from '../../../shared/forms/cd-validators';
import { NotificationService } from '../../../shared/services/notification.service';
import { TelemetryNotificationService } from '../../../shared/services/telemetry-notification.service';
import { TextToDownloadService } from '../../../shared/services/text-to-download.service';

@Component({
  selector: 'cd-telemetry',
  templateUrl: './telemetry.component.html',
  styleUrls: ['./telemetry.component.scss']
})
export class TelemetryComponent implements OnInit {
  @BlockUI()
  blockUI: NgBlockUI;

  error = false;
  configForm: CdFormGroup;
  licenseAgrmt = false;
  loading = false;
  moduleEnabled: boolean;
  options: Object = {};
  previewForm: CdFormGroup;
  requiredFields = [
    'channel_basic',
    'channel_crash',
    'channel_device',
    'channel_ident',
    'interval',
    'proxy',
    'contact',
    'description'
  ];
  report: object = undefined;
  reportId: number = undefined;
  sendToUrl = '';
  sendToDeviceUrl = '';
  step = 1;

  constructor(
    private formBuilder: CdFormBuilder,
    private mgrModuleService: MgrModuleService,
    private notificationService: NotificationService,
    private router: Router,
    private telemetryService: TelemetryService,
    private i18n: I18n,
    private textToDownloadService: TextToDownloadService,
    private telemetryNotificationService: TelemetryNotificationService
  ) {}

  ngOnInit() {
    this.loading = true;
    const observables = [
      this.mgrModuleService.getOptions('telemetry'),
      this.mgrModuleService.getConfig('telemetry')
    ];
    observableForkJoin(observables).subscribe(
      (resp: object) => {
        const configResp = resp[1];
        this.moduleEnabled = configResp['enabled'];
        this.sendToUrl = configResp['url'];
        this.sendToDeviceUrl = configResp['device_url'];
        this.options = _.pick(resp[0], this.requiredFields);
        const configs = _.pick(configResp, this.requiredFields);
        this.createConfigForm();
        this.configForm.setValue(configs);
        this.loading = false;
      },
      (_error) => {
        this.error = true;
      }
    );
  }

  private createConfigForm() {
    const controlsConfig = {};
    _.forEach(Object.values(this.options), (option) => {
      controlsConfig[option.name] = [option.default_value, this.getValidators(option)];
    });
    this.configForm = this.formBuilder.group(controlsConfig);
  }

  private createPreviewForm() {
    const controls = {
      report: JSON.stringify(this.report, null, 2),
      reportId: this.reportId,
      licenseAgrmt: [this.licenseAgrmt, Validators.requiredTrue]
    };
    this.previewForm = this.formBuilder.group(controls);
  }

  private getValidators(option: any): ValidatorFn[] {
    const result = [];
    switch (option.type) {
      case 'int':
        result.push(CdValidators.number());
        result.push(Validators.required);
        if (_.isNumber(option.min)) {
          result.push(Validators.min(option.min));
        }
        if (_.isNumber(option.max)) {
          result.push(Validators.max(option.max));
        }
        break;
      case 'str':
        if (_.isNumber(option.min)) {
          result.push(Validators.minLength(option.min));
        }
        if (_.isNumber(option.max)) {
          result.push(Validators.maxLength(option.max));
        }
        break;
    }
    return result;
  }

  private getReport() {
    this.loading = true;
    this.telemetryService.getReport().subscribe(
      (resp: object) => {
        this.report = resp;
        this.reportId = resp['report']['report_id'];
        this.createPreviewForm();
        this.loading = false;
        this.step++;
      },
      (_error) => {
        this.error = true;
      }
    );
  }

  updateConfig() {
    const config = {};
    _.forEach(Object.values(this.options), (option) => {
      const control = this.configForm.get(option.name);
      // Append the option only if the value has been modified.
      if (control.dirty && control.valid) {
        config[option.name] = control.value;
      }
    });
    this.mgrModuleService.updateConfig('telemetry', config).subscribe(
      () => {
        this.disableModule(
          this.i18n(
            `Your settings have been applied successfully. \
Due to privacy/legal reasons the Telemetry module is now disabled until you \
complete the next step and accept the license.`
          ),
          () => {
            this.getReport();
          }
        );
      },
      () => {
        // Reset the 'Submit' button.
        this.configForm.setErrors({ cdSubmitButton: true });
      }
    );
  }

  download(report: object, fileName: string) {
    this.textToDownloadService.download(JSON.stringify(report, null, 2), fileName);
  }

  disableModule(message: string = null, followUpFunc: Function = null) {
    this.telemetryService.enable(false).subscribe(() => {
      this.telemetryNotificationService.setVisibility(true);
      if (message) {
        this.notificationService.show(NotificationType.success, message);
      }
      if (followUpFunc) {
        followUpFunc();
      } else {
        this.router.navigate(['']);
      }
    });
  }

  next() {
    if (this.configForm.pristine) {
      this.getReport();
    } else {
      this.updateConfig();
    }
  }

  back() {
    this.step--;
  }

  onSubmit() {
    this.telemetryService.enable().subscribe(() => {
      this.telemetryNotificationService.setVisibility(false);
      this.notificationService.show(
        NotificationType.success,
        this.i18n('The Telemetry module has been configured and activated successfully.')
      );
      this.router.navigate(['']);
    });
  }
}
