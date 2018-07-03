import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import * as moment from 'moment';
import { ToastModule } from 'ng2-toastr';
import { BsModalRef, ModalModule } from 'ngx-bootstrap';

import { NotificationService } from '../../../shared/services/notification.service';
import { SharedModule } from '../../../shared/shared.module';
import { RbdTrashDeleteModalComponent } from './rbd-trash-delete-modal.component';

describe('RbdTrashDeleteModalComponent', () => {
  let component: RbdTrashDeleteModalComponent;
  let fixture: ComponentFixture<RbdTrashDeleteModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RbdTrashDeleteModalComponent],
      imports: [
        SharedModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        ModalModule.forRoot(),
        ToastModule.forRoot()
      ],
      providers: [BsModalRef]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RbdTrashDeleteModalComponent);
    component = fixture.componentInstance;

    component.metaType = 'RBD';
    component.poolName = 'foo';
    component.imageName = 'bar';
    component.imageId = 'baz';
    component.loadImages = () => {};
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.deleteForm).toBeDefined();
  });

  it('should finish running ngOnInit without expired date', () => {
    component.expiresAt = moment()
      .add(10, 'hour')
      .toISOString();
    fixture.detectChanges();
    expect(component.pattern).toEqual('foo/bar@baz --force');
  });

  it('should finish running ngOnInit with expired date', () => {
    component.expiresAt = moment()
      .subtract(10, 'hour')
      .toISOString();
    fixture.detectChanges();
    expect(component.pattern).toEqual('foo/bar@baz');
  });

  describe('should call deleteRbd', () => {
    let httpTesting: HttpTestingController;
    let notificationService: NotificationService;
    let req;

    beforeEach(() => {
      httpTesting = TestBed.get(HttpTestingController);
      notificationService = TestBed.get(NotificationService);
      fixture.detectChanges();

      component.poolName = 'foo';
      component.imageId = 'bar';
      component.imageName = 'baz';
      component.loadImages = () => true;

      spyOn(component.modalRef, 'hide').and.stub();
      spyOn(component.deleteForm, 'setErrors').and.stub();
      spyOn(notificationService, 'show').and.stub();
      spyOn(component, 'loadImages').and.stub();
    });

    it('with invalid form', () => {
      component.deleteForm.setErrors({ cdSubmitButton: true });
      component.deleteRbd();

      httpTesting.verify();
      expect(component.deleteForm.setErrors).toHaveBeenCalledTimes(1);
      expect(component.loadImages).toHaveBeenCalledTimes(0);
      expect(component.modalRef.hide).toHaveBeenCalledTimes(0);
    });

    it('with success', () => {
      component.deleteForm.patchValue({ confirmation: component.pattern });
      component.deleteRbd();

      req = httpTesting.expectOne('api/block/image/trash/foo/bar/?image_name=baz&force=true');
      req.flush(null);
      expect(component.deleteForm.setErrors).toHaveBeenCalledTimes(0);
      expect(component.loadImages).toHaveBeenCalledTimes(1);
      expect(component.modalRef.hide).toHaveBeenCalledTimes(1);
    });

    it('with failure', () => {
      component.deleteForm.patchValue({ confirmation: component.pattern });
      component.deleteRbd();

      req = httpTesting.expectOne('api/block/image/trash/foo/bar/?image_name=baz&force=true');
      req.flush(null, { status: 500, statusText: 'failure' });
      expect(component.deleteForm.setErrors).toHaveBeenCalledTimes(1);
      expect(component.loadImages).toHaveBeenCalledTimes(0);
      expect(component.modalRef.hide).toHaveBeenCalledTimes(0);
    });
  });
});
