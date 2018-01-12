import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HealthComponent } from './health/health/health.component';
import { ServersComponent } from './cluster/servers/servers.component';
import { MirroringComponent } from './block/mirroring/mirroring.component';

const routes: Routes = [
  { path: '', component: HealthComponent },
  { path: 'health', component: HealthComponent },
  { path: 'servers', component: ServersComponent },
  { path: 'rbd_mirroring', component: MirroringComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CephRoutingModule { }
