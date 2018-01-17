import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsdPerfHistogramComponent } from './osd-perf-histogram.component';

describe('OsdPerfHistogramComponent', () => {
  let component: OsdPerfHistogramComponent;
  let fixture: ComponentFixture<OsdPerfHistogramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OsdPerfHistogramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsdPerfHistogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
