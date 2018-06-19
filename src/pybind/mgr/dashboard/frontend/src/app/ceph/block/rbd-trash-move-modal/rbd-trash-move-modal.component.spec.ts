import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import * as moment from 'moment';
import { ToastModule } from 'ng2-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { configureTestBed } from '../../../../testing/unit-test-helper';
import { ApiModule } from '../../../shared/api/api.module';
import { NotificationService } from '../../../shared/services/notification.service';
import { ServicesModule } from '../../../shared/services/services.module';
import { SharedModule } from '../../../shared/shared.module';
import { RbdTrashMoveModalComponent } from './rbd-trash-move-modal.component';

describe('RbdTrashMoveModalComponent', () => {
  let component: RbdTrashMoveModalComponent;
  let fixture: ComponentFixture<RbdTrashMoveModalComponent>;
  let httpTesting: HttpTestingController;

  configureTestBed({
    imports: [
      ReactiveFormsModule,
      HttpClientTestingModule,
      SharedModule,
      ServicesModule,
      ApiModule,
      ToastModule.forRoot(),
      BsDatepickerModule.forRoot()
    ],
    declarations: [RbdTrashMoveModalComponent],
    providers: [BsModalRef, BsModalService]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RbdTrashMoveModalComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.get(HttpTestingController);

    component.metaType = 'RBD';
    component.poolName = 'foo';
    component.imageName = 'bar';
    component.loadImages = () => {};
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.deleteForm).toBeDefined();
  });

  it('should finish running ngOnInit', () => {
    fixture.detectChanges();
    expect(component.pattern).toEqual('foo/bar');
  });

  describe('should call deleteRbd', () => {
    let notificationService;

    beforeEach(() => {
      notificationService = TestBed.get(NotificationService);
      spyOn(notificationService, 'show').and.stub();
      spyOn(component.modalRef, 'hide').and.callThrough();
      spyOn(component, 'loadImages').and.callThrough();
    });

    afterEach(() => {
      expect(notificationService.show).toHaveBeenCalledTimes(1);
      expect(component.modalRef.hide).toHaveBeenCalledTimes(1);
      expect(component.loadImages).toHaveBeenCalledTimes(1);
    });

    it('with normal delay', () => {
      component.deleteRbd();
      const req = httpTesting.expectOne('api/block/image/foo/bar/move_trash');
      req.flush(null);
      expect(req.request.body).toEqual({ delay: 0 });
    });

    it('with delay < 0', () => {
      const oldDate = moment()
        .subtract(24, 'hour')
        .toDate();
      component.deleteForm.patchValue({ expiresAt: oldDate });

      component.deleteRbd();
      const req = httpTesting.expectOne('api/block/image/foo/bar/move_trash');
      req.flush(null);
      expect(req.request.body).toEqual({ delay: 0 });
    });

    it('with delay < 0', () => {
      const oldDate = moment()
        .add(24, 'hour')
        .toISOString();
      fixture.detectChanges();
      component.deleteForm.patchValue({ expiresAt: oldDate });

      component.deleteRbd();
      const req = httpTesting.expectOne('api/block/image/foo/bar/move_trash');
      req.flush(null);
      expect(req.request.body.delay).toBeGreaterThan(86390);
    });
  });
});
