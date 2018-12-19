import { Component } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { IscsiService } from '../../../shared/api/iscsi.service';
import { RbdService } from '../../../shared/api/rbd.service';
import { SelectMessages } from '../../../shared/components/select/select-messages.model';
import { SelectOption } from '../../../shared/components/select/select-option.model';
import { CdFormGroup } from '../../../shared/forms/cd-form-group';
import { CdValidators } from '../../../shared/forms/cd-validators';
import { IscsiTargetImageSettingsModalComponent } from '../iscsi-target-image-settings-modal/iscsi-target-image-settings-modal.component';
import { IscsiTargetIqnSettingsModalComponent } from '../iscsi-target-iqn-settings-modal/iscsi-target-iqn-settings-modal.component';

@Component({
  selector: 'cd-iscsi-target-form',
  templateUrl: './iscsi-target-form.component.html',
  styleUrls: ['./iscsi-target-form.component.scss']
})
export class IscsiTargetFormComponent {
  targetForm: CdFormGroup;
  modalRef: BsModalRef;
  targetSettings: any = {};
  currentLun = 0;

  imagesAll: any[];
  imagesSelections: SelectOption[];
  imagesSettings: any = {};
  messages = new SelectMessages({ empty: 'Please add an image.' });

  constructor(
    private iscsiService: IscsiService,
    private modalService: BsModalService,
    private rbdService: RbdService
  ) {
    this.rbdService.list().subscribe((resp: any[]) => {
      this.imagesAll = resp;
      this.imagesSelections = resp
        .reduce((acc, cur) => acc.concat(cur.value), [])
        .map((image) => new SelectOption(false, `${image.pool_name}/${image.name}`, ''));
    });

    this.createForm();
  }

  createForm() {
    this.targetForm = new CdFormGroup({
      targetIqn: new FormControl('iqn.2003-01.com.redhat.iscsi.gw:' + Date.now(), {
        validators: [Validators.required]
      }),
      portals: new FormArray([new FormControl('')], {
        validators: [Validators.required]
      }),
      images: new FormControl([], {
        // validators: [Validators.required]
      }),
      useAuthentication: new FormControl(false),
      user: new FormControl('', {
        validators: [
          CdValidators.requiredIf({
            useAuthentication: true,
            initiators: []
          })
        ]
      }),
      password: new FormControl('', {
        validators: [
          CdValidators.requiredIf({
            useAuthentication: true,
            initiators: []
          })
        ]
      }),
      initiators: new FormArray([], {
        validators: [
          CdValidators.requiredIf({
            useAuthentication: true,
            user: '',
            password: ''
          })
        ]
      }),
      useMutualAuthentication: new FormControl(false),
      mutualUser: new FormControl('', {
        validators: [
          CdValidators.requiredIf({
            useMutualAuthentication: true
          })
        ]
      }),
      mutualPassword: new FormControl('', {
        validators: [
          CdValidators.requiredIf({
            useMutualAuthentication: true
          })
        ]
      }),
      useDiscoveryAuthentication: new FormControl(false),
      discoveryUser: new FormControl('', {
        validators: [
          CdValidators.requiredIf({
            useDiscoveryAuthentication: true
          })
        ]
      }),
      discoveryPassword: new FormControl('', {
        validators: [
          CdValidators.requiredIf({
            useDiscoveryAuthentication: true
          })
        ]
      })
    });
  }

  get portals() {
    return this.targetForm.get('portals') as FormArray;
  }

  addPortal() {
    this.portals.push(new FormControl(''));
    console.log(this.imagesSettings);

    return false;
  }

  removePortal(index: number) {
    this.portals.removeAt(index);
    return false;
  }

  get images() {
    return this.targetForm.get('images') as FormControl;
  }

  removeImage(index: number, image: string) {
    this.imagesSelections.forEach((value) => {
      if (value.name === image) {
        value.selected = false;
      }
    });
    this.images.value.splice(index, 1);
    return false;
  }

  get initiators() {
    return this.targetForm.get('initiators') as FormArray;
  }

  addInitiator() {
    this.initiators.push(new FormControl(''));
    return false;
  }

  removeInitiator(index: number) {
    this.initiators.removeAt(index);
    return false;
  }

  submit() {
    console.log(this.targetForm.value);

    const request = {
      target_iqn: this.targetForm.getValue('targetIqn'),
      target_controls: undefined,
      portals: [],
      disks: [],
      clients: []
    };

    this.targetForm.getValue('images').forEach((element) => {
      const imageSplit = element.split('/');
      request.disks.push({
        pool: imageSplit[0],
        image: imageSplit[1],
        controls: this.imagesSettings[element]
      });
    });

    this.targetForm.getValue('portals').forEach((element) => {
      const portalSplit = element.split(':');
      request.portals.push({
        host: portalSplit[0],
        ip: portalSplit[1]
      });
    });

    console.log(request);

    this.iscsiService.createTarget(request).subscribe(
      (data: any) => {
        console.log(data);
      },
      () => {
        this.targetForm.setErrors({ cdSubmitButton: true });
      }
    );
  }

  onUseAuthenticationChange() {
    if (!this.targetForm.getValue('useAuthentication')) {
      this.targetForm.get('dataPool').setValue(null);
      // this.onDataPoolChange(null);
    }
  }

  onUseMutualAuthenticationChange() {
    if (!this.targetForm.getValue('useMutualAuthentication')) {
      this.targetForm.get('dataPool').setValue(null);
      // this.onDataPoolChange(null);
    }
  }

  onUseDiscoveryAuthenticationChange() {
    if (!this.targetForm.getValue('useDiscoveryAuthentication')) {
      this.targetForm.get('dataPool').setValue(null);
      // this.onDataPoolChange(null);
    }
  }

  targetSettingsModal() {
    const initialState = {
      targetSettings: this.targetSettings
    };

    this.modalRef = this.modalService.show(IscsiTargetIqnSettingsModalComponent, { initialState });
  }

  imageSettingsModal(image) {
    const initialState = {
      imagesSettings: this.imagesSettings,
      image: image
    };

    this.modalRef = this.modalService.show(IscsiTargetImageSettingsModalComponent, {
      initialState
    });
  }

  onSelection($event) {
    const option = $event.option;
    if (option.selected) {
      if (!this.imagesSettings[option.name]) {
        this.imagesSettings[option.name] = {
          lun: ++this.currentLun
        };
      }
    }
  }
}

// TODO: Authentication: user/pass é opcional. temos 'e de ter user/pass e/ou initiators.
// usar o picker dos roles para escolher images
