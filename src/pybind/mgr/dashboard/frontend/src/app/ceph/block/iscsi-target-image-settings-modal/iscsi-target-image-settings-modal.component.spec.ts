import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IscsiTargetImageSettingsModalComponent } from './iscsi-target-image-settings-modal.component';

describe('IscsiTargetImageSettingsModalComponent', () => {
  let component: IscsiTargetImageSettingsModalComponent;
  let fixture: ComponentFixture<IscsiTargetImageSettingsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IscsiTargetImageSettingsModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IscsiTargetImageSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
