import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HealthComponent } from './health/health/health.component';
import { ServersComponent } from './cluster/servers/servers.component';
import { MirroringComponent } from './block/mirroring/mirroring.component';
import { IscsiComponent } from './block/iscsi/iscsi.component';

const routes: Routes = [
  { path: '', component: HealthComponent },
  { path: 'health', component: HealthComponent },
  { path: 'servers', component: ServersComponent },
  { path: 'rbd_mirroring', component: MirroringComponent },
  { path: 'rbd_iscsi', component: IscsiComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CephRoutingModule { }
