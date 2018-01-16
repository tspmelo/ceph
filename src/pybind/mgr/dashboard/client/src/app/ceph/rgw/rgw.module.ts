import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RgwComponent } from './rgw/rgw.component';
import { RgwDetailComponent } from './rgw-detail/rgw-detail.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [RgwComponent, RgwDetailComponent]
})
export class RgwModule { }
