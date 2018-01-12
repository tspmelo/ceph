import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MirroringComponent } from './mirroring/mirroring.component';
import { MirrorHealthColorPipe } from './mirror-health-color.pipe';
import { SyncProgressBarPipe } from './sync-progress-bar.pipe';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [MirroringComponent, MirrorHealthColorPipe, SyncProgressBarPipe]
})
export class BlockModule { }
