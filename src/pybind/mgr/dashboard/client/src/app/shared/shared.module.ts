import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from './pipes/pipes.module';
import { ServicesModule } from './services/services.module';

@NgModule({
  imports: [
    CommonModule,
    PipesModule,
    ServicesModule
  ],
  exports: [
    PipesModule,
    ServicesModule
  ],
  declarations: []
})
export class SharedModule { }
