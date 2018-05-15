import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CollapseModule, PopoverModule } from 'ngx-bootstrap';

import { NotificationService } from '../../../shared/services/notification.service';
import { SharedModule } from '../../../shared/shared.module';
import { LogoutComponent } from '../../auth/logout/logout.component';
import { NotificationsComponent } from '../notifications/notifications.component';
import { TaskManagerComponent } from '../task-manager/task-manager.component';
import { NavigationComponent } from './navigation.component';
import { HealthColorPipe } from '../../../shared/pipes/health-color.pipe';
import { SummaryService } from '../../../shared/services/summary.service';
import { AuthStorageService } from '../../../shared/services/auth-storage.service';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  const fakeNotificationService = new NotificationService(null, null);
  const fakeSummaryService = new SummaryService(null, null, null);

  const fakeService = {};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [NavigationComponent, HealthColorPipe],
      providers: [
        { provide: NotificationService, useValue: fakeNotificationService },
        { provide: SummaryService, useValue: fakeSummaryService },
        { provide: AuthStorageService, useValue: fakeService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
