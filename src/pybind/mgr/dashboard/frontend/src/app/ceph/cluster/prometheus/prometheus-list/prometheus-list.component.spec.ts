import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { ToastrModule } from 'ngx-toastr';

import { configureTestBed, i18nProviders } from '../../../../../testing/unit-test-helper';
import { SharedModule } from '../../../../shared/shared.module';
import { PrometheusListComponent } from './prometheus-list.component';

describe('PrometheusListComponent', () => {
  let component: PrometheusListComponent;
  let fixture: ComponentFixture<PrometheusListComponent>;

  configureTestBed({
    imports: [HttpClientTestingModule, TabsModule.forRoot(), ToastrModule.forRoot(), SharedModule],
    declarations: [PrometheusListComponent],
    providers: [i18nProviders]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrometheusListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
