import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { RgwUserService } from '../../../shared/api/rgw-user.service';
import { RgwUserDetailsComponent } from '../rgw-user-details/rgw-user-details.component';
import { RgwUserListComponent } from './rgw-user-list.component';
import { BsModalService } from 'ngx-bootstrap';

describe('RgwUserListComponent', () => {
  let component: RgwUserListComponent;
  let fixture: ComponentFixture<RgwUserListComponent>;

  const fakeService = {};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RgwUserListComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: RgwUserService, useValue: fakeService },
        { provide: BsModalService, useValue: fakeService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RgwUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
