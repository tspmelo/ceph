import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceListPipe } from './service-list.pipe';
import { ServersComponent } from './servers/servers.component';
import { SharedModule } from '../../shared/shared.module';
import { MonitorsComponent } from './monitors/monitors.component';
import { MonitorSparklineDataPipe } from './monitor-sparkline-data.pipe';
import { OsdComponent } from './osd/osd.component';
import { OsdUpInStylePipe } from './osd-up-in-style.pipe';
import { OsdUpPipe } from './osd-up.pipe';
import { OsdInPipe } from './osd-in.pipe';
import { OsdSparklineDataPipe } from './osd-sparkline-data.pipe';
import { OsdDetailComponent } from './osd-detail/osd-detail.component';
import { OsdPerfHistogramComponent } from './osd-perf-histogram/osd-perf-histogram.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    ServersComponent,
    ServiceListPipe,
    MonitorsComponent,
    MonitorSparklineDataPipe,
    OsdComponent,
    OsdUpInStylePipe,
    OsdUpPipe,
    OsdInPipe,
    OsdSparklineDataPipe,
    OsdDetailComponent,
    OsdPerfHistogramComponent
  ],
  exports: []
})
export class ClusterModule { }
