import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { ToastModule } from 'ng2-toastr';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BehaviorSubject, of } from 'rxjs';

import {
  configureTestBed,
  i18nProviders,
  PermissionHelper
} from '../../../../testing/unit-test-helper';
import { RbdService } from '../../../shared/api/rbd.service';
import { ActionLabels } from '../../../shared/constants/app.constants';
import { TableActionsComponent } from '../../../shared/datatable/table-actions/table-actions.component';
import { ViewCacheStatus } from '../../../shared/enum/view-cache-status.enum';
import { ExecutingTask } from '../../../shared/models/executing-task';
import { SummaryService } from '../../../shared/services/summary.service';
import { TaskListService } from '../../../shared/services/task-list.service';
import { SharedModule } from '../../../shared/shared.module';
import { RbdConfigurationListComponent } from '../rbd-configuration-list/rbd-configuration-list.component';
import { RbdDetailsComponent } from '../rbd-details/rbd-details.component';
import { RbdSnapshotListComponent } from '../rbd-snapshot-list/rbd-snapshot-list.component';
import { RbdListComponent } from './rbd-list.component';
import { RbdModel } from './rbd-model';

describe('RbdListComponent', () => {
  let fixture: ComponentFixture<RbdListComponent>;
  let component: RbdListComponent;
  let summaryService: SummaryService;
  let rbdService: RbdService;

  const refresh = (data) => {
    summaryService['summaryDataSource'].next(data);
  };

  configureTestBed({
    imports: [
      SharedModule,
      BsDropdownModule.forRoot(),
      TabsModule.forRoot(),
      ModalModule.forRoot(),
      TooltipModule.forRoot(),
      ToastModule.forRoot(),
      AlertModule.forRoot(),
      RouterTestingModule,
      HttpClientTestingModule
    ],
    declarations: [
      RbdListComponent,
      RbdDetailsComponent,
      RbdSnapshotListComponent,
      RbdConfigurationListComponent
    ],
    providers: [TaskListService, i18nProviders]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RbdListComponent);
    component = fixture.componentInstance;
    summaryService = TestBed.get(SummaryService);
    rbdService = TestBed.get(RbdService);

    // this is needed because summaryService isn't being reset after each test.
    summaryService['summaryDataSource'] = new BehaviorSubject(null);
    summaryService['summaryData$'] = summaryService['summaryDataSource'].asObservable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('after ngOnInit', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(rbdService, 'list').and.callThrough();
    });

    it('should load images on init', () => {
      refresh({});
      expect(rbdService.list).toHaveBeenCalled();
    });

    it('should not load images on init because no data', () => {
      refresh(undefined);
      expect(rbdService.list).not.toHaveBeenCalled();
    });

    it('should call error function on init when summary service fails', () => {
      spyOn(component.table, 'reset');
      summaryService['summaryDataSource'].error(undefined);
      expect(component.table.reset).toHaveBeenCalled();
      expect(component.viewCacheStatusList).toEqual([{ status: ViewCacheStatus.ValueException }]);
    });
  });

  describe('handling of executing tasks', () => {
    let images: RbdModel[];

    const addImage = (name) => {
      const model = new RbdModel();
      model.id = '-1';
      model.name = name;
      model.pool_name = 'rbd';
      images.push(model);
    };

    const addTask = (name: string, image_name: string) => {
      const task = new ExecutingTask();
      task.name = name;
      switch (task.name) {
        case 'rbd/copy':
          task.metadata = {
            dest_pool_name: 'rbd',
            dest_image_name: 'd'
          };
          break;
        case 'rbd/clone':
          task.metadata = {
            child_pool_name: 'rbd',
            child_image_name: 'd'
          };
          break;
        default:
          task.metadata = {
            pool_name: 'rbd',
            image_name: image_name
          };
          break;
      }
      summaryService.addRunningTask(task);
    };

    const expectImageTasks = (image: RbdModel, executing: string) => {
      expect(image.cdExecuting).toEqual(executing);
    };

    beforeEach(() => {
      images = [];
      addImage('a');
      addImage('b');
      addImage('c');
      component.images = images;
      refresh({ executing_tasks: [], finished_tasks: [] });
      spyOn(rbdService, 'list').and.callFake(() =>
        of([{ poool_name: 'rbd', status: 1, value: images }])
      );
      fixture.detectChanges();
    });

    it('should gets all images without tasks', () => {
      expect(component.images.length).toBe(3);
      expect(component.images.every((image) => !image.cdExecuting)).toBeTruthy();
    });

    it('should add a new image from a task', () => {
      addTask('rbd/create', 'd');
      expect(component.images.length).toBe(4);
      expectImageTasks(component.images[0], undefined);
      expectImageTasks(component.images[1], undefined);
      expectImageTasks(component.images[2], undefined);
      expectImageTasks(component.images[3], 'Creating');
    });

    it('should show when a image is being cloned', () => {
      addTask('rbd/clone', 'd');
      expect(component.images.length).toBe(4);
      expectImageTasks(component.images[0], undefined);
      expectImageTasks(component.images[1], undefined);
      expectImageTasks(component.images[2], undefined);
      expectImageTasks(component.images[3], 'Cloning');
    });

    it('should show when a image is being copied', () => {
      addTask('rbd/copy', 'd');
      expect(component.images.length).toBe(4);
      expectImageTasks(component.images[0], undefined);
      expectImageTasks(component.images[1], undefined);
      expectImageTasks(component.images[2], undefined);
      expectImageTasks(component.images[3], 'Copying');
    });

    it('should show when an existing image is being modified', () => {
      addTask('rbd/edit', 'a');
      addTask('rbd/delete', 'b');
      addTask('rbd/flatten', 'c');
      expect(component.images.length).toBe(3);
      expectImageTasks(component.images[0], 'Updating');
      expectImageTasks(component.images[1], 'Deleting');
      expectImageTasks(component.images[2], 'Flattening');
    });
  });

  it('should test all TableActions combinations', () => {
    let tableActions: TableActionsComponent;
    let permissionHelper: PermissionHelper;
    permissionHelper = new PermissionHelper(component.permission);
    tableActions = permissionHelper.setPermissionsAndGetActions(component.tableActions);

    expect(tableActions).toEqual({
      'true-true-true': {
        actions: ['Create', 'Edit', 'Copy', 'Flatten', 'Delete', 'Move to Trash'],
        primary: { multiple: 'Create', executing: 'Edit', single: 'Edit', no: 'Create' }
      },
      'true-true-false': {
        actions: ['Create', 'Edit', 'Copy', 'Flatten'],
        primary: { multiple: 'Create', executing: 'Edit', single: 'Edit', no: 'Create' }
      },
      'true-false-true': {
        actions: ['Create', 'Copy', 'Delete', 'Move to Trash'],
        primary: { multiple: 'Create', executing: 'Copy', single: 'Copy', no: 'Create' }
      },
      'true-false-false': {
        actions: ['Create', 'Copy'],
        primary: { multiple: 'Create', executing: 'Copy', single: 'Copy', no: 'Create' }
      },
      'false-true-true': {
        actions: ['Edit', 'Flatten', 'Delete', 'Move to Trash'],
        primary: { multiple: 'Edit', executing: 'Edit', single: 'Edit', no: 'Edit' }
      },
      'false-true-false': {
        actions: ['Edit', 'Flatten'],
        primary: { multiple: 'Edit', executing: 'Edit', single: 'Edit', no: 'Edit' }
      },
      'false-false-true': {
        actions: ['Delete', 'Move to Trash'],
        primary: { multiple: 'Delete', executing: 'Delete', single: 'Delete', no: 'Delete' }
      },
      'false-false-false': {
        actions: [],
        primary: { multiple: '', executing: '', single: '', no: '' }
      }
    });
  });
});
