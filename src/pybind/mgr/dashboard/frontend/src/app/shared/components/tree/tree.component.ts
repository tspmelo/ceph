import { CdkTree, NestedTreeControl } from '@angular/cdk/tree';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';

import { TreeAsyncDataSource } from './tree-async.datasource';
import { TreeNode } from './tree-node';
import { TreeDatabase } from './tree.database';
import { TreeDataSource } from './tree.datasource';

@Component({
  selector: 'cd-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnChanges {
  @ViewChild('tree') tree: CdkTree<TreeNode>;

  @Input() data: TreeNode[];
  @Input() nameTpl: TemplateRef<any>;
  @Input() loadingTpl: TemplateRef<any>;
  @Input() database: TreeDatabase;

  @Output() selectNode = new EventEmitter<TreeNode>();

  treeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  dataSource: TreeDataSource;
  activeNode: string;

  constructor() {
    if (this.database) {
      this.dataSource = new TreeAsyncDataSource(this.treeControl, this.database);
    } else {
      this.dataSource = new TreeDataSource(this.treeControl);
    }
  }

  ngOnChanges() {
    this.dataSource.data = this.data;
  }

  hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;

  clickNode(node: TreeNode) {
    this.activeNode = node.id;
    // if (this.database) {
    //   // TODO: expand
    // }
    this.selectNode.emit(node);
  }
}
