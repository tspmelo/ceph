import { Component, OnDestroy, OnInit } from '@angular/core';

import * as _ from 'lodash';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

import { RbdService } from '../../../shared/api/rbd.service';
import { CellTemplate } from '../../../shared/enum/cell-template.enum';
import { ViewCacheStatus } from '../../../shared/enum/view-cache-status.enum';
import { CdTableColumn } from '../../../shared/models/cd-table-column';
import { CdTableSelection } from '../../../shared/models/cd-table-selection';
import { ExecutingTask } from '../../../shared/models/executing-task';
import { CdDatePipe } from '../../../shared/pipes/cd-date.pipe';
import { SummaryService } from '../../../shared/services/summary.service';
import { RbdModel } from '../rbd-list/rbd-model';
import { RbdTrashDeleteModalComponent } from '../rbd-trash-delete-modal/rbd-trash-delete-modal.component';
import { RbdTrashPurgeModalComponent } from '../rbd-trash-purge-modal/rbd-trash-purge-modal.component';
import { RbdTrashRestoreModalComponent } from '../rbd-trash-restore-modal/rbd-trash-restore-modal.component';

@Component({
  selector: 'cd-rbd-trash-list',
  templateUrl: './rbd-trash-list.component.html',
  styleUrls: ['./rbd-trash-list.component.scss']
})
export class RbdTrashListComponent implements OnInit, OnDestroy {
  images: any;
  executingTasks: ExecutingTask[] = [];
  columns: CdTableColumn[];
  retries: number;
  viewCacheStatusList: any[];
  selection = new CdTableSelection();

  summaryDataSubscription = null;

  modalRef: BsModalRef;

  constructor(
    private rbdService: RbdService,
    private summaryService: SummaryService,
    private modalService: BsModalService,
    private cdDatePipe: CdDatePipe
  ) {}

  ngOnInit() {
    this.columns = [
      {
        name: 'ID',
        prop: 'id',
        flexGrow: 1,
        cellTransformation: CellTemplate.executing
      },
      {
        name: 'Name',
        prop: 'name',
        flexGrow: 1
      },
      {
        name: 'Pool',
        prop: 'pool_name',
        flexGrow: 1
      },
      {
        name: 'Expires At',
        prop: 'deferment_end_time',
        flexGrow: 1,
        cellClass: 'text-right',
        pipe: this.cdDatePipe
      },
      {
        name: 'Deleted At',
        prop: 'deletion_time',
        flexGrow: 1,
        cellClass: 'text-right',
        pipe: this.cdDatePipe
      }
    ];

    this.summaryDataSubscription = this.summaryService.subscribe((data: any) => {
      if (data) {
        this.loadImages(data.executing_tasks);
      }
    });
  }

  ngOnDestroy() {
    if (this.summaryDataSubscription) {
      this.summaryDataSubscription.unsubscribe();
    }
  }

  loadImages(executingTasks) {
    if (executingTasks === null) {
      executingTasks = this.executingTasks;
    }
    this.rbdService.listTrash().subscribe(
      (resp: any[]) => {
        let images = [];
        const viewCacheStatusMap = {};
        resp.forEach((pool) => {
          if (_.isUndefined(viewCacheStatusMap[pool.status])) {
            viewCacheStatusMap[pool.status] = [];
          }
          viewCacheStatusMap[pool.status].push(pool.pool_name);
          images = images.concat(pool.value);
        });

        const viewCacheStatusList = [];
        _.forEach(viewCacheStatusMap, (value: any, key) => {
          viewCacheStatusList.push({
            status: parseInt(key, 10),
            statusFor:
              (value.length > 1 ? 'pools ' : 'pool ') +
              '<strong>' +
              value.join('</strong>, <strong>') +
              '</strong>'
          });
        });
        this.viewCacheStatusList = viewCacheStatusList;
        images.forEach((image) => {
          image.executingTasks = this._getExecutingTasks(executingTasks, image.id);
        });
        this.images = this.merge(images, executingTasks);
        this.executingTasks = executingTasks;
      },
      () => {
        this.viewCacheStatusList = [{ status: ViewCacheStatus.ValueException }];
      }
    );
  }

  _getExecutingTasks(executingTasks: ExecutingTask[], imageId): ExecutingTask[] {
    let result: ExecutingTask[] = [];
    const tasks = ['rbd/trash/restore', 'rbd/trash/remove'];

    result = executingTasks.filter(
      (executingTask) =>
        tasks.includes(executingTask.name) && imageId === executingTask.metadata['image_id']
    );

    return result;
  }

  private merge(rbds: RbdModel[], executingTasks: ExecutingTask[] = []) {
    const resultRBDs = _.clone(rbds);
    executingTasks.forEach((executingTask) => {
      const rbdExecuting = resultRBDs.find((rbd) => {
        return rbd.id === executingTask.metadata['image_id'];
      });

      if (rbdExecuting) {
        if (executingTask.name === 'rbd/trash/remove') {
          rbdExecuting.cdExecuting = 'deleting';
        } else if (executingTask.name === 'rbd/trash/restore') {
          rbdExecuting.cdExecuting = 'restoring';
        }
      }
    });
    return resultRBDs;
  }

  updateSelection(selection: CdTableSelection) {
    this.selection = selection;
  }

  restoreModal() {
    const initialState = {
      metaType: 'RBD',
      poolName: this.selection.first().pool_name,
      imageName: this.selection.first().name,
      imageId: this.selection.first().id,
      loadImages: () => this.loadImages(null)
    };

    this.modalRef = this.modalService.show(RbdTrashRestoreModalComponent, { initialState });
  }

  deleteModal() {
    const initialState = {
      metaType: 'RBD',
      poolName: this.selection.first().pool_name,
      imageName: this.selection.first().name,
      imageId: this.selection.first().id,
      expiresAt: this.selection.first().deferment_end_time,
      loadImages: () => this.loadImages(null)
    };

    this.modalRef = this.modalService.show(RbdTrashDeleteModalComponent, { initialState });
  }

  purgeModal() {
    this.modalService.show(RbdTrashPurgeModalComponent);
  }
}
