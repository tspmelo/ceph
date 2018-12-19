import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IscsiTargetFormComponent } from './iscsi-target-form.component';

describe('IscsiTargetFormComponent', () => {
  let component: IscsiTargetFormComponent;
  let fixture: ComponentFixture<IscsiTargetFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IscsiTargetFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IscsiTargetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
