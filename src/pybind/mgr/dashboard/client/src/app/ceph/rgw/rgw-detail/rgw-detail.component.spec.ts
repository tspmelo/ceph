import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RgwDetailComponent } from './rgw-detail.component';

describe('RgwDetailComponent', () => {
  let component: RgwDetailComponent;
  let fixture: ComponentFixture<RgwDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RgwDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RgwDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
