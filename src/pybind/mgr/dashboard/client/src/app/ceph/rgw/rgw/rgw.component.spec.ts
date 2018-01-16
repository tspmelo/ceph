import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RgwComponent } from './rgw.component';

describe('RgwComponent', () => {
  let component: RgwComponent;
  let fixture: ComponentFixture<RgwComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RgwComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RgwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
