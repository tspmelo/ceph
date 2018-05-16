import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ToastModule, ToastsManager } from 'ng2-toastr';

import { AppComponent } from './app.component';
import { BlockModule } from './ceph/block/block.module';
import { ClusterModule } from './ceph/cluster/cluster.module';
import { CoreModule } from './core/core.module';
import { AuthStorageService } from './shared/services/auth-storage.service';
import { SharedModule } from './shared/shared.module';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  const fakeService = {
    isLoggedIn: () => {
      return true;
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ToastModule.forRoot()],
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: AuthStorageService, useValue: fakeService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
