import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ViewCacheStatus } from '../../../shared/enum/view-cache-status.enum';
import { CdTableSelection } from '../../../shared/models/cd-table-selection';
import { ExecutingTask } from '../../../shared/models/executing-task';
import { SummaryService } from '../../../shared/services/summary.service';
import { SharedModule } from '../../../shared/shared.module';
import { RbdTrashListComponent } from './rbd-trash-list.component';

describe('RbdTrashListComponent', () => {
  let component: RbdTrashListComponent;
  let fixture: ComponentFixture<RbdTrashListComponent>;

  const running_tasks: ExecutingTask[] = [
    {
      name: 'rbd/trash/restore',
      begin_time: '2018-07-31T13:44:28.178523Z',
      progress: 100,
      metadata: { pool_name: 'rbd', new_image_name: 'tcmu-lu', image_id: '1' }
    },
    {
      name: 'rbd/trash/remove',
      begin_time: '2018-07-31T13:18:39.656869Z',
      progress: 100,
      ret_value: null,
      metadata: { pool_name: 'rbd', image_name: 'tcmu-lu', image_id: '2' }
    },
    {
      name: 'rbd/trash/move',
      begin_time: '2018-07-31T13:18:39.656869Z',
      progress: 100,
      ret_value: null,
      metadata: { pool_name: 'rbd', image_name: 'tcmu-lu3', image_id: '3' }
    },
    {
      name: 'rbd/trash/move',
      begin_time: '2018-07-31T13:18:39.656869Z',
      progress: 100,
      ret_value: null,
      metadata: { pool_name: 'rbd', image_name: 'tcmu-lu4', image_id: '2' }
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RbdTrashListComponent],
      imports: [SharedModule, HttpClientTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RbdTrashListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadImage when summary is trigged', () => {
    spyOn(component, 'loadImages').and.callThrough();
    const summaryService = TestBed.get(SummaryService);
    summaryService.summaryDataSource.next({ executingTasks: null });
    expect(component.loadImages).toHaveBeenCalled();
  });

  it(
    'should unsubscribe on ngOnDestroy',
    fakeAsync(() => {
      tick();
      expect(component.summaryDataSubscription).toBeTruthy();
      component.ngOnDestroy();
      expect(component.summaryDataSubscription.closed).toBeTruthy();
    })
  );

  it('should finish ngOnDestroy when there is no subscription', () => {
    component.summaryDataSubscription = null;
    component.ngOnDestroy();
    expect(component.summaryDataSubscription).toBeFalsy();
  });

  describe('should call loadImages', () => {
    let httpTesting: HttpTestingController;
    let req;
    const result = [
      {
        status: 0,
        pool_name: 'rbd',
        value: [
          {
            pool_name: 'rbd',
            name: 'tcmu-lu1',
            deletion_time: '2018-07-31T13:18:39Z',
            deferment_end_time: '2018-07-31T13:18:39Z',
            source: 'USER',
            id: '2'
          }
        ]
      },
      {
        status: 0,
        pool_name: 'foo',
        value: [
          {
            pool_name: 'foo',
            name: 'tcmu-lu2',
            deletion_time: '2018-07-31T13:18:39Z',
            deferment_end_time: '2018-07-31T13:18:39Z',
            source: 'USER',
            id: '1'
          }
        ]
      }
    ];

    beforeEach(() => {
      component.executingTasks = [];
      httpTesting = TestBed.get(HttpTestingController);
    });

    it('with executingTasks', () => {
      component.loadImages(running_tasks);
      req = httpTesting.expectOne('api/block/image/trash/');
      req.flush(result);

      expect(component.viewCacheStatusList).toEqual([
        {
          status: 0,
          statusFor: 'pools <strong>rbd</strong>, <strong>foo</strong>'
        }
      ]);
      expect(component.images).toEqual([result[0].value[0], result[1].value[0]]);
      expect(component.executingTasks).toEqual(running_tasks);
    });

    it('and receive error', () => {
      component.loadImages(null);
      req = httpTesting.expectOne('api/block/image/trash/');
      req.flush(null, { status: 500, statusText: 'failure' });
      expect(component.viewCacheStatusList).toEqual([{ status: ViewCacheStatus.ValueException }]);
    });
  });

  it('should call _getExecutingTasks', () => {
    const result = component._getExecutingTasks(running_tasks, '1');
    expect(result).toEqual([running_tasks[0]]);
  });

  it('should call updateSelection', () => {
    const selection = new CdTableSelection();
    selection.selected = ['foo'];
    selection.update();

    expect(component.selection.hasSelection).toBeFalsy();
    component.updateSelection(selection);
    expect(component.selection.hasSelection).toBeTruthy();
  });
});
