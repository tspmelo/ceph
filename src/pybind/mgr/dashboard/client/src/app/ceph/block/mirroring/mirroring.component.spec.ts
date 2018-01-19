import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MirroringComponent } from './mirroring.component';

describe('MirroringComponent', () => {
  let component: MirroringComponent;
  let fixture: ComponentFixture<MirroringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MirroringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MirroringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
