import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HealthComponent } from './health/health/health.component';
import { ServersComponent } from './cluster/servers/servers.component';
import { MirroringComponent } from './block/mirroring/mirroring.component';
import { IscsiComponent } from './block/iscsi/iscsi.component';
import { RgwComponent } from './rgw/rgw/rgw.component';
import { RgwDetailComponent } from './rgw/rgw-detail/rgw-detail.component';
import { MonitorsComponent } from './cluster/monitors/monitors.component';
import { PoolComponent } from './block/pool/pool.component';
import { FilesystemComponent } from './filesystem/filesystem/filesystem.component';
import { ClientComponent } from './filesystem/client/client.component';

const routes: Routes = [
  { path: '', component: HealthComponent },
  { path: 'health', component: HealthComponent },
  { path: 'servers', component: ServersComponent },
  { path: 'rbd_mirroring', component: MirroringComponent },
  { path: 'rbd_iscsi', component: IscsiComponent },
  { path: 'rgw', component: RgwComponent },
  { path: 'rgw_detail/:id', component: RgwDetailComponent },
  { path: 'monitors', component: MonitorsComponent },
  { path: 'rbd_pool/:id', component: PoolComponent },
  { path: 'filesystem/:id', component: FilesystemComponent },
  { path: 'clients/:id', component: ClientComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CephRoutingModule { }
