import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthColorPipe } from './health-color.pipe';
import { ShortVersionPipe } from './short-version.pipe';
import { DimlessBinaryPipe } from './dimless-binary.pipe';
import { DimlessPipe } from './dimless.pipe';
import { BlockHealthColorPipe } from './block-health-color.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    HealthColorPipe,
    ShortVersionPipe,
    DimlessBinaryPipe,
    DimlessPipe,
    BlockHealthColorPipe
  ],
  exports: [HealthColorPipe, ShortVersionPipe, DimlessBinaryPipe, DimlessPipe, BlockHealthColorPipe],
  providers: [DimlessBinaryPipe]
})
export class PipesModule {}
