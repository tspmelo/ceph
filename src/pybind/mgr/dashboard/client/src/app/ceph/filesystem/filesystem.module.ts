import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilesystemComponent } from './filesystem/filesystem.component';
import { ClientComponent } from './client/client.component';
import { PoolSizeBarPipe } from './pool-size-bar.pipe';
import { SharedModule } from '../../shared/shared.module';
import { AppRoutingModule } from '../../app-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule
  ],
  declarations: [FilesystemComponent, ClientComponent, PoolSizeBarPipe]
})
export class FilesystemModule { }
