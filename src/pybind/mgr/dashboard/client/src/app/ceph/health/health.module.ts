import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthComponent } from './health/health.component';
import { PgStatusStylePipe } from './pg-status-style.pipe';
import { LogColorPipe } from './log-color.pipe';
import { SharedModule } from '../../shared/shared.module';
import { MonSummaryPipe } from './mon-summary.pipe';
import { MdsSummaryPipe } from './mds-summary.pipe';
import { MgrSummaryPipe } from './mgr-summary.pipe';
import { OsdSummaryPipe } from './osd-summary.pipe';
import { PgStatusPipe } from './pg-status.pipe';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    HealthComponent,
    PgStatusStylePipe,
    LogColorPipe,
    MonSummaryPipe,
    MdsSummaryPipe,
    MgrSummaryPipe,
    OsdSummaryPipe,
    PgStatusPipe
  ]
})
export class HealthModule {}
