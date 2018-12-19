import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IscsiTargetIqnSettingsModalComponent } from './iscsi-target-iqn-settings-modal.component';

describe('IscsiTargetIqnSettingsModalComponent', () => {
  let component: IscsiTargetIqnSettingsModalComponent;
  let fixture: ComponentFixture<IscsiTargetIqnSettingsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IscsiTargetIqnSettingsModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IscsiTargetIqnSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
