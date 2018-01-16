import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceListPipe } from './service-list.pipe';
import { ServersComponent } from './servers/servers.component';
import { SharedModule } from '../../shared/shared.module';
import { MonitorsComponent } from './monitors/monitors.component';
import { MonitorSparklineDataPipe } from './monitor-sparkline-data.pipe';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [ServersComponent, ServiceListPipe, MonitorsComponent, MonitorSparklineDataPipe],
  exports: []
})
export class ClusterModule { }
