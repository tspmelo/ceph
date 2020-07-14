import { Component, OnInit } from '@angular/core';

import { HealthService } from '../../../shared/api/health.service';
import { TreeNode } from '../../../shared/components/tree/tree-node';
import { Icons } from '../../../shared/enum/icons.enum';

@Component({
  selector: 'cd-crushmap',
  templateUrl: './crushmap.component.html',
  styleUrls: ['./crushmap.component.scss']
})
export class CrushmapComponent implements OnInit {
  icons = Icons;
  loadingIndicator = true;
  nodes: any[] = [];

  metadata: any;
  metadataTitle: string;
  metadataKeyMap: { [key: number]: any } = {};

  constructor(private healthService: HealthService) {}

  ngOnInit() {
    this.healthService.getFullHealth().subscribe((data: any) => {
      this.loadingIndicator = false;
      this.nodes = this.abstractTreeData(data);
    });
  }

  private abstractTreeData(data: any): any[] {
    const nodes = data.osd_map.tree.nodes || [];

    const treeNodeMap: { [key: number]: any } = {};

    if (0 === nodes.length) {
      return [
        {
          name: 'No nodes!'
        }
      ];
    }

    const roots: any[] = [];
    nodes.reverse().forEach((node: any) => {
      if (node.type === 'root') {
        roots.push(node.id);
      }
      treeNodeMap[node.id] = this.generateTreeLeaf(node, treeNodeMap);
    });

    const children = roots.map((id) => {
      return treeNodeMap[id];
    });

    return children;
  }

  private generateTreeLeaf(node: any, treeNodeMap: any): TreeNode {
    this.metadataKeyMap[node.id] = node;

    const name: string = node.name + ' (' + node.type + ')';
    const children: any[] = [];
    const resultNode: TreeNode = {
      id: node.id,
      name,
      other: { status: node.status, type: node.type }
    };

    if (node.children) {
      node.children.sort().forEach((childId: any) => {
        children.push(treeNodeMap[childId]);
      });

      resultNode.children = children;
    }

    return resultNode;
  }

  onNodeSelected(node: TreeNode) {
    if (node.id !== undefined) {
      const { name, type, status, ...remain } = this.metadataKeyMap[node.id];
      this.metadata = remain;
      this.metadataTitle = node.name;
    } else {
      delete this.metadata;
      delete this.metadataTitle;
    }
  }
}
