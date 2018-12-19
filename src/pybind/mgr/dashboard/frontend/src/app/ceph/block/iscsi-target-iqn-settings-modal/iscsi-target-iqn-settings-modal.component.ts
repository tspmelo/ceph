import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import * as _ from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { IscsiService } from '../../../shared/api/iscsi.service';
import { CdFormGroup } from '../../../shared/forms/cd-form-group';

@Component({
  selector: 'cd-iscsi-target-iqn-settings-modal',
  templateUrl: './iscsi-target-iqn-settings-modal.component.html',
  styleUrls: ['./iscsi-target-iqn-settings-modal.component.scss']
})
export class IscsiTargetIqnSettingsModalComponent implements OnInit {
  settingsForm: CdFormGroup;
  targetSettings: any;

  constructor(public modalRef: BsModalRef, public iscsiService: IscsiService) {}

  ngOnInit() {
    // this.targetSettings = _.cloneDeep(this.model.targetSettings);
    const fg = {};
    this.iscsiService.targetAdvancedSettings.forEach((value: any) => {
      fg[value.property] = new FormControl(this.targetSettings[value.property]);
    });
    this.settingsForm = new CdFormGroup(fg);
  }

  save() {
    //     _.forIn(this.targetSettings, (value, key) => {
    //       if (value === "" || value === null) {
    //         delete this.targetSettings[key];
    //       }
    //     });
    //     this.model.targetSettings = this.targetSettings;
    //     this.modalInstance.close("confirmed");
    console.log(this.targetSettings, this.settingsForm.value);
    // this.targetSettings = { ...this.settingsForm.value };
    // this.targetSettings
    _.assign(this.targetSettings, this.settingsForm.value);
    console.log(this.targetSettings, this.settingsForm.value);

    this.modalRef.hide();
  }
}
