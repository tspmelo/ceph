import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MirroringComponent } from './mirroring/mirroring.component';
import { MirrorHealthColorPipe } from './mirror-health-color.pipe';
import { SyncProgressBarPipe } from './sync-progress-bar.pipe';
import { SharedModule } from '../../shared/shared.module';
import { IscsiComponent } from './iscsi/iscsi.component';
import { RelativeDatePipe } from './relative-date.pipe';
import { SparklineDataPipe } from './sparkline-data.pipe';
import { PoolComponent } from './pool/pool.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [MirroringComponent, MirrorHealthColorPipe, SyncProgressBarPipe, IscsiComponent, RelativeDatePipe, SparklineDataPipe, PoolComponent]
})
export class BlockModule { }
