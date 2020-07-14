import { ArrayDataSource } from '@angular/cdk/collections';
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

import { TreeNode } from './tree-node';

@Component({
  selector: 'cd-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnChanges {
  @ViewChild('tree') tree: CdkTree<TreeNode>;

  @Input() data: TreeNode[];

  @Input() nameTpl: TemplateRef<any>;

  @Output() nSelect = new EventEmitter<number>();

  treeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  dataSource = new ArrayDataSource(this.data);
  activeNode: number;

  ngOnChanges() {
    this.dataSource = new ArrayDataSource(this.data);
    this.treeControl.dataNodes = this.data;
    this.treeControl.expandAll();
  }

  hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;

  clickNode(id: number) {
    this.activeNode = id;
    this.nSelect.emit(id);
  }
}
