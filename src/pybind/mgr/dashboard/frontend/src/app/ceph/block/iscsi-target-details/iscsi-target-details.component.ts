import { Component, Input, OnChanges, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { I18n } from '@ngx-translate/i18n-polyfill';
import * as _ from 'lodash';

import { TreeNode } from '../../../shared/components/tree/tree-node';
import { TableComponent } from '../../../shared/datatable/table/table.component';
import { Icons } from '../../../shared/enum/icons.enum';
import { CdTableColumn } from '../../../shared/models/cd-table-column';
import { BooleanTextPipe } from '../../../shared/pipes/boolean-text.pipe';
import { IscsiBackstorePipe } from '../../../shared/pipes/iscsi-backstore.pipe';

@Component({
  selector: 'cd-iscsi-target-details',
  templateUrl: './iscsi-target-details.component.html',
  styleUrls: ['./iscsi-target-details.component.scss']
})
export class IscsiTargetDetailsComponent implements OnChanges, OnInit {
  @Input()
  selection: any;
  @Input()
  settings: any;
  @Input()
  cephIscsiConfigVersion: number;

  @ViewChild('highlightTpl', { static: true })
  highlightTpl: TemplateRef<any>;

  private detailTable: TableComponent;
  @ViewChild('detailTable')
  set content(content: TableComponent) {
    this.detailTable = content;
    if (content) {
      content.updateColumns();
    }
  }

  icons = Icons;
  columns: CdTableColumn[];
  data: any;
  metadata: any = {};
  selectedItem: any;
  title: string;

  nodes: TreeNode[] = [];

  constructor(
    private i18n: I18n,
    private iscsiBackstorePipe: IscsiBackstorePipe,
    private booleanTextPipe: BooleanTextPipe
  ) {}

  ngOnInit() {
    this.columns = [
      {
        prop: 'displayName',
        name: this.i18n('Name'),
        flexGrow: 1,
        cellTemplate: this.highlightTpl
      },
      {
        prop: 'current',
        name: this.i18n('Current'),
        flexGrow: 1,
        cellTemplate: this.highlightTpl
      },
      {
        prop: 'default',
        name: this.i18n('Default'),
        flexGrow: 1,
        cellTemplate: this.highlightTpl
      }
    ];
  }

  ngOnChanges() {
    if (this.selection) {
      this.selectedItem = this.selection;
      this.generateTree();
    }

    this.data = undefined;
  }

  private generateTree() {
    const target_meta = _.cloneDeep(this.selectedItem.target_controls);
    // Target level authentication was introduced in ceph-iscsi config v11
    if (this.cephIscsiConfigVersion > 10) {
      _.extend(target_meta, _.cloneDeep(this.selectedItem.auth));
    }
    this.metadata = { root: target_meta };
    const cssClasses = {
      target: {
        expanded: _.join(
          this.selectedItem.cdExecuting
            ? [Icons.large, Icons.spinner, Icons.spin]
            : [Icons.large, Icons.bullseye],
          ' '
        )
      },
      initiators: {
        expanded: _.join([Icons.large, Icons.user], ' '),
        leaf: _.join([Icons.user], ' ')
      },
      groups: {
        expanded: _.join([Icons.large, Icons.users], ' '),
        leaf: _.join([Icons.users], ' ')
      },
      disks: {
        expanded: _.join([Icons.large, Icons.disk], ' '),
        leaf: _.join([Icons.disk], ' ')
      },
      portals: {
        expanded: _.join([Icons.large, Icons.server], ' '),
        leaf: _.join([Icons.server], ' ')
      }
    };

    const disks: TreeNode[] = [];
    _.forEach(this.selectedItem.disks, (disk, diskKey) => {
      const metaId = 'disk_' + disk.pool + '_' + disk.image;
      this.metadata[metaId] = {
        controls: disk.controls,
        backstore: disk.backstore
      };
      ['wwn', 'lun'].forEach((k) => {
        if (k in disk) {
          this.metadata[metaId][k] = disk[k];
        }
      });
      disks.push({
        id: `d:${diskKey}`,
        name: `${disk.pool}/${disk.image}`,
        other: {
          metaId,
          cdIcon: cssClasses.disks.leaf
        }
      });
    });

    const portals: TreeNode[] = [];
    _.forEach(this.selectedItem.portals, (portal, portalKey) => {
      portals.push({
        id: `p:${portalKey}`,
        name: `${portal.host}:${portal.ip}`,
        other: {
          cdIcon: cssClasses.portals.leaf
        }
      });
    });

    const clients: TreeNode[] = [];
    _.forEach(this.selectedItem.clients, (client, clientKey) => {
      const client_metadata = _.cloneDeep(client.auth);
      if (client.info) {
        _.extend(client_metadata, client.info);
        delete client_metadata['state'];
        _.forEach(Object.keys(client.info.state), (state) => {
          client_metadata[state.toLowerCase()] = client.info.state[state];
        });
      }
      this.metadata['client_' + client.client_iqn] = client_metadata;

      const luns: TreeNode[] = [];
      client.luns.forEach((lun: Record<string, any>, lunKey: number) => {
        luns.push({
          id: `c:${clientKey},l:${lunKey}`,
          name: `${lun.pool}/${lun.image}`,
          other: {
            metaId: 'disk_' + lun.pool + '_' + lun.image,
            cdIcon: cssClasses.disks.leaf
          }
        });
      });

      let status = '';
      if (client.info) {
        status = Object.keys(client.info.state).includes('LOGGED_IN') ? 'logged_in' : 'logged_out';
      }
      clients.push({
        id: `c:${clientKey}`,
        name: client.client_iqn,
        children: luns,
        other: {
          metaId: 'client_' + client.client_iqn,
          status: status,
          cdIcon: cssClasses.initiators.leaf
        }
      });
    });

    const groups: TreeNode[] = [];
    _.forEach(this.selectedItem.groups, (group, groupKey) => {
      const luns: TreeNode[] = [];
      group.disks.forEach((disk: Record<string, any>, diskKey: number) => {
        luns.push({
          id: `g:${groupKey},d:${diskKey}`,
          name: `${disk.pool}/${disk.image}`,
          other: {
            metaId: 'disk_' + disk.pool + '_' + disk.image,
            cdIcon: cssClasses.disks.leaf
          }
        });
      });

      const initiators: TreeNode[] = [];
      group.members.forEach((member: string, initiatorKey: number) => {
        initiators.push({
          id: `g:${groupKey},i:${initiatorKey}`,
          name: member,
          other: {
            metaId: 'client_' + member
          }
        });
      });

      groups.push({
        id: `g:${groupKey}`,
        name: group.group_id,
        children: [
          {
            id: `g:${groupKey},disks`,
            name: 'Disks',
            children: luns,
            other: {
              cdIcon: cssClasses.disks.expanded
            }
          },
          {
            id: `g:${groupKey},initiators`,
            name: 'Initiators',
            children: initiators,
            other: {
              cdIcon: cssClasses.initiators.expanded
            }
          }
        ],
        other: {
          cdIcon: cssClasses.groups.leaf
        }
      });
    });

    this.nodes = [
      {
        id: 'root',
        name: this.selectedItem.target_iqn,
        other: {
          metaId: 'root',
          cdIcon: cssClasses.target.expanded
        },
        children: [
          {
            id: 'r,d',
            name: 'Disks',
            children: disks,
            other: {
              cdIcon: cssClasses.disks.expanded
            }
          },
          {
            id: 'r,p',
            name: 'Portals',
            children: portals,
            other: {
              cdIcon: cssClasses.portals.expanded
            }
          },
          {
            id: 'r,i',
            name: 'Initiators',
            children: clients,
            other: {
              cdIcon: cssClasses.initiators.expanded
            }
          },
          {
            id: 'r,g',
            name: 'Groups',
            children: groups,
            other: {
              cdIcon: cssClasses.groups.expanded
            }
          }
        ]
      }
    ];
  }

  private format(value: any) {
    if (typeof value === 'boolean') {
      return this.booleanTextPipe.transform(value);
    }
    return value;
  }

  onNodeSelected(node: TreeNode) {
    this.title = node.name;
    const id = node?.other?.metaId;
    if (id) {
      const tempData = this.metadata[id] || {};

      if (id === 'root') {
        this.detailTable?.toggleColumn({ prop: 'default', isHidden: true });
        this.data = _.map(this.settings.target_default_controls, (value, key) => {
          value = this.format(value);
          return {
            displayName: key,
            default: value,
            current: !_.isUndefined(tempData[key]) ? this.format(tempData[key]) : value
          };
        });
        // Target level authentication was introduced in ceph-iscsi config v11
        if (this.cephIscsiConfigVersion > 10) {
          ['user', 'password', 'mutual_user', 'mutual_password'].forEach((key) => {
            this.data.push({
              displayName: key,
              default: null,
              current: tempData[key]
            });
          });
        }
      } else if (id.startsWith('disk_')) {
        this.detailTable?.toggleColumn({ prop: 'default', isHidden: true });
        this.data = _.map(this.settings.disk_default_controls[tempData.backstore], (value, key) => {
          value = this.format(value);
          return {
            displayName: key,
            default: value,
            current: !_.isUndefined(tempData.controls[key])
              ? this.format(tempData.controls[key])
              : value
          };
        });
        this.data.push({
          displayName: 'backstore',
          default: this.iscsiBackstorePipe.transform(this.settings.default_backstore),
          current: this.iscsiBackstorePipe.transform(tempData.backstore)
        });
        ['wwn', 'lun'].forEach((k) => {
          if (k in tempData) {
            this.data.push({
              displayName: k,
              default: undefined,
              current: tempData[k]
            });
          }
        });
      } else {
        this.detailTable?.toggleColumn({ prop: 'default', isHidden: false });
        this.data = _.map(tempData, (value, key) => {
          return {
            displayName: key,
            default: undefined,
            current: this.format(value)
          };
        });
      }
    } else {
      this.data = undefined;
    }

    this.detailTable?.updateColumns();
  }
}
