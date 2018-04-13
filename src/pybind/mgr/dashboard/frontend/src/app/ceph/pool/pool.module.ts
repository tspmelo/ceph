import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TabsModule } from 'ngx-bootstrap/tabs';

import { ServicesModule } from '../../shared/services/services.module';
import { SharedModule } from '../../shared/shared.module';
import { PoolListComponent } from './pool-list/pool-list.component';
import {ErasureCodeProfileFormComponent}
  from './erasure-code-profile/erasure-code-profile-form/erasure-code-profile-form.component';
import {ErasureCodeProfileService} from './erasure-code-profile/erasure-code-profile.service';

@NgModule({
  imports: [
    CommonModule,
    TabsModule,
    SharedModule,
    ServicesModule
  ],
  exports: [
    PoolListComponent,
    ErasureCodeProfileFormComponent
  ],
  providers: [ErasureCodeProfileService],
  declarations: [
    PoolListComponent,
    ErasureCodeProfileFormComponent
  ]
})
export class PoolModule { }
