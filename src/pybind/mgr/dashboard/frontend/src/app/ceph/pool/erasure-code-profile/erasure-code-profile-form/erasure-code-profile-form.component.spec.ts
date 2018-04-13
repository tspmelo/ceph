import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErasureCodeProfileFormComponent } from './erasure-code-profile-form.component';

describe('ErasureCodeProfileFormComponent', () => {
  let component: ErasureCodeProfileFormComponent;
  let fixture: ComponentFixture<ErasureCodeProfileFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErasureCodeProfileFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErasureCodeProfileFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
