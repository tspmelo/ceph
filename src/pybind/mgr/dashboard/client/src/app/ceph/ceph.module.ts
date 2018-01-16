import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CephRoutingModule } from './ceph-routing.module';
import { HealthModule } from './health/health.module';
import { ClusterModule } from './cluster/cluster.module';
import { BlockModule } from './block/block.module';
import { RgwModule } from './rgw/rgw.module';

@NgModule({
  imports: [
    CommonModule,
    CephRoutingModule,
    HealthModule,
    ClusterModule,
    BlockModule,
    RgwModule
  ]
})
export class CephModule { }
