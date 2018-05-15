import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import { ToastModule } from 'ng2-toastr';
import { Observable } from 'rxjs/Observable';

import { ExecutingTask } from '../models/executing-task';
import { FinishedTask } from '../models/finished-task';
import { SharedModule } from '../shared.module';
import { NotificationService } from './notification.service';
import { TaskWrapperService } from './task-wrapper.service';

describe('TaskWrapperService', () => {
  let service: TaskWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ToastModule.forRoot(), SharedModule],
      providers: [TaskWrapperService]
    });
  });

  beforeEach(inject([TaskWrapperService], (wrapper: TaskWrapperService) => {
    service = wrapper;
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('wrapTaskAroundCall', () => {
    let notify: NotificationService;
    let tasks: ExecutingTask[];

    const fakeCall = (status?) =>
      new Observable(observer => {
        if (!status) {
          observer.error({ error: 'failed' });
        }
        observer.next({ status: status });
        observer.complete();
      });

    const callWrapTaskAroundCall = (status, name) => {
      return service.wrapTaskAroundCall({
        task: new FinishedTask(name, { sth: 'else' }),
        call: fakeCall(status),
        tasks: tasks
      });
    };

    beforeEach(() => {
      tasks = [];
      notify = TestBed.get(NotificationService);
      spyOn(notify, 'show');
      spyOn(service, '_handleExecutingTasks').and.callThrough();
    });

    it('should simulate a synchronous task', () => {
      let passed = false;
      callWrapTaskAroundCall(200, 'sync').subscribe(
        null,
        null,
        () => (passed = true)
      );
      expect(service._handleExecutingTasks).not.toHaveBeenCalled();
      expect(passed).toBeTruthy();
      expect(tasks.length).toBe(0);
    });

    it('should simulate a asynchronous task', () => {
      let passed = false;
      callWrapTaskAroundCall(202, 'async').subscribe(
        null,
        null,
        () => (passed = true)
      );
      expect(service._handleExecutingTasks).toHaveBeenCalled();
      expect(passed).toBeTruthy();
      expect(tasks.length).toBe(1);
    });

    it('should simulate a task failure', () => {
      let passed = false;
      callWrapTaskAroundCall(null, 'async').subscribe(
        null,
        () => (passed = true),
        null
      );
      expect(service._handleExecutingTasks).not.toHaveBeenCalled();
      expect(passed).toBeTruthy();
      expect(tasks.length).toBe(0);
    });
  });
});
