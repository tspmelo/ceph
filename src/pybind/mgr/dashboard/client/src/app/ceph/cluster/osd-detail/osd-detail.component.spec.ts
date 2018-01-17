import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsdDetailComponent } from './osd-detail.component';

describe('OsdDetailComponent', () => {
  let component: OsdDetailComponent;
  let fixture: ComponentFixture<OsdDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OsdDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsdDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
