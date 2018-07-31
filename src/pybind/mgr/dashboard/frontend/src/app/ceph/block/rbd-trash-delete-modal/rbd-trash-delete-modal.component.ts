import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';

import * as moment from 'moment';
import { BsModalRef } from 'ngx-bootstrap';

import { RbdService } from '../../../shared/api/rbd.service';
import { CdFormBuilder } from '../../../shared/forms/cd-form-builder';
import { CdFormGroup } from '../../../shared/forms/cd-form-group';
import { ExecutingTask } from '../../../shared/models/executing-task';
import { FinishedTask } from '../../../shared/models/finished-task';
import { TaskWrapperService } from '../../../shared/services/task-wrapper.service';

@Component({
  selector: 'cd-rbd-trash-delete-modal',
  templateUrl: './rbd-trash-delete-modal.component.html',
  styleUrls: ['./rbd-trash-delete-modal.component.scss']
})
export class RbdTrashDeleteModalComponent implements OnInit {
  metaType: string;
  poolName: string;
  imageName: string;
  imageId: string;
  loadImages: Function;
  executingTasks: ExecutingTask[];
  expiresAt: string;

  deleteForm: CdFormGroup;
  pattern: string;

  constructor(
    private rbdService: RbdService,
    public modalRef: BsModalRef,
    private fb: CdFormBuilder,
    private taskWrapper: TaskWrapperService
  ) {}

  createForm() {
    this.deleteForm = this.fb.group({
      confirmation: ['', [Validators.pattern(this.pattern), Validators.required]]
    });
  }

  ngOnInit() {
    this.pattern = `${this.poolName}/${this.imageName}@${this.imageId}`;
    if (!this.isExpired()) {
      this.pattern += ' --force';
    }
    this.createForm();
  }

  isExpired(): boolean {
    return moment().isAfter(this.expiresAt);
  }

  deleteRbd() {
    if (!this.deleteForm.valid) {
      return;
    }

    const force = !this.isExpired();

    this.taskWrapper
      .wrapTaskAroundCall({
        task: new FinishedTask('rbd/trash/remove', {
          pool_name: this.poolName,
          image_id: this.imageId,
          image_name: this.imageName
        }),
        call: this.rbdService.removeTrash(this.poolName, this.imageId, this.imageName, force)
      })
      .subscribe(
        undefined,
        () => {
          this.deleteForm.setErrors({ cdSubmitButton: true });
        },
        () => {
          this.modalRef.hide();
          this.loadImages(null);
        }
      );
  }
}
