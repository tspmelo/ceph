import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { BsModalRef } from 'ngx-bootstrap/modal';

import { IscsiService } from '../../../shared/api/iscsi.service';
import { CdFormGroup } from '../../../shared/forms/cd-form-group';

@Component({
  selector: 'cd-iscsi-target-image-settings-modal',
  templateUrl: './iscsi-target-image-settings-modal.component.html',
  styleUrls: ['./iscsi-target-image-settings-modal.component.scss']
})
export class IscsiTargetImageSettingsModalComponent implements OnInit {
  settingsForm: CdFormGroup;
  image: string;
  imagesSettings: any;

  constructor(public modalRef: BsModalRef, public iscsiService: IscsiService) {}

  ngOnInit() {
    const currentSettings = this.imagesSettings[this.image];
    const fg = {
      lun: new FormControl(currentSettings.lun, { validators: Validators.required }),
      uuid: new FormControl(currentSettings.uuid),
      retries: new FormControl(currentSettings.retries),
      sleep: new FormControl(currentSettings.sleep),
      retry_errors: new FormControl(currentSettings.retry_errors),
      advancedSettingsEnabled: new FormControl(currentSettings.advancedSettingsEnabled)
    };
    this.iscsiService.imageAdvancedSettings.forEach((value: any) => {
      fg[value.property] = new FormControl(currentSettings[value.property]);
    });
    this.settingsForm = new CdFormGroup(fg);
  }

  save() {
    // _.forIn(this.settings, (value, key) => {
    //   if (value === "" || value === null) {
    //     delete this.settings[key];
    //   } else if (key === "retry_errors" && _.isString(this.settings[key])) {
    //     this.settings[key] = JSON.parse("[" + value + "]");
    //   }
    // });
    // if (!this.advancedSettingsEnabled) {
    //   this.cephIscsiImageAdvangedSettings.forEach((value) => {
    //     delete this.settings[value.property];
    //   });
    // }
    // this.image.settings = this.settings;
    this.imagesSettings[this.image] = this.settingsForm.value;
    this.imagesSettings = { ...this.imagesSettings };
    this.modalRef.hide();
  }
}
