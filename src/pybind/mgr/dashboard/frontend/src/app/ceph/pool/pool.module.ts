import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TabsModule } from 'ngx-bootstrap/tabs';

import { BsDropdownModule } from 'ngx-bootstrap';
import { ServicesModule } from '../../shared/services/services.module';
import { SharedModule } from '../../shared/shared.module';
import {
  ErasureCodeProfileFormComponent
} from './erasure-code-profile/erasure-code-profile-form/erasure-code-profile-form.component';
import { ErasureCodeProfileService } from './erasure-code-profile/erasure-code-profile.service';
import { PoolFormComponent } from './pool-form/pool-form.component';
import { PoolListComponent } from './pool-list/pool-list.component';

@NgModule({
  imports: [
    CommonModule,
    TabsModule,
    SharedModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    BsDropdownModule,
    ServicesModule
  ],
  exports: [
    PoolListComponent,
    PoolFormComponent,
    ErasureCodeProfileFormComponent
  ],
  providers: [ErasureCodeProfileService],
  declarations: [
    PoolListComponent,
    PoolFormComponent,
    ErasureCodeProfileFormComponent
  ]
})
export class PoolModule { }
