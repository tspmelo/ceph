import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from './pipes/pipes.module';
import { ServicesModule } from './services/services.module';
import { ComponentsModule } from './components/components.module';

@NgModule({
  imports: [
    CommonModule,
    PipesModule,
    ServicesModule,
    ComponentsModule
  ],
  exports: [
    PipesModule,
    ServicesModule,
    ComponentsModule
  ],
  declarations: []
})
export class SharedModule { }
