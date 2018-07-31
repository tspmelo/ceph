import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsModule } from 'ngx-bootstrap/tabs';

import { configureTestBed } from '../../../../testing/unit-test-helper';
import { SharedModule } from '../../../shared/shared.module';
import { PerformanceCounterModule } from '../../performance-counter/performance-counter.module';
import { RgwDaemonDetailsComponent } from '../rgw-daemon-details/rgw-daemon-details.component';
import { RgwDaemonListComponent } from './rgw-daemon-list.component';

describe('RgwDaemonListComponent', () => {
  let component: RgwDaemonListComponent;
  let fixture: ComponentFixture<RgwDaemonListComponent>;

  configureTestBed({
    declarations: [RgwDaemonListComponent, RgwDaemonDetailsComponent],
    imports: [HttpClientModule, TabsModule.forRoot(), PerformanceCounterModule, SharedModule]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RgwDaemonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
