import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';
import { BsModalRef } from 'ngx-bootstrap';

import { RbdService } from '../../../shared/api/rbd.service';
import { CdFormBuilder } from '../../../shared/forms/cd-form-builder';
import { CdFormGroup } from '../../../shared/forms/cd-form-group';
import { ExecutingTask } from '../../../shared/models/executing-task';
import { FinishedTask } from '../../../shared/models/finished-task';
import { TaskWrapperService } from '../../../shared/services/task-wrapper.service';

@Component({
  selector: 'cd-rbd-trash-move-modal',
  templateUrl: './rbd-trash-move-modal.component.html',
  styleUrls: ['./rbd-trash-move-modal.component.scss']
})
export class RbdTrashMoveModalComponent implements OnInit {
  metaType: string;
  poolName: string;
  imageName: string;
  loadImages: Function;
  executingTasks: ExecutingTask[];

  deleteForm: CdFormGroup;
  minDate = new Date();
  bsConfig = {
    dateInputFormat: 'YYYY-MM-DD HH:mm:ss',
    containerClass: 'theme-default'
  };
  pattern: string;

  constructor(
    private rbdService: RbdService,
    public modalRef: BsModalRef,
    private fb: CdFormBuilder,
    private taskWrapper: TaskWrapperService
  ) {
    this.createForm();
  }

  createForm() {
    this.deleteForm = this.fb.group({
      expiresAt: new Date()
    });
  }

  ngOnInit() {
    this.pattern = `${this.poolName}/${this.imageName}`;
  }

  deleteRbd() {
    const expiresAt = this.deleteForm.getValue('expiresAt');
    let delay = moment(expiresAt).diff(moment(), 'seconds', true);

    if (delay < 0) {
      delay = 0;
    }

    this.taskWrapper
      .wrapTaskAroundCall({
        task: new FinishedTask('rbd/trash/move', {
          pool_name: this.poolName,
          image_name: this.imageName
        }),
        call: this.rbdService.moveTrash(this.poolName, this.imageName, delay)
      })
      .subscribe(undefined, undefined, () => {
        this.modalRef.hide();
        this.loadImages(null);
      });
  }
}
