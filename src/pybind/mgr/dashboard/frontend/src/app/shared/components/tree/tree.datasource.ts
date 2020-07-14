import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';

import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TreeNode } from './tree-node';

/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
export class TreeDataSource implements DataSource<TreeNode> {
  dataChange = new BehaviorSubject<TreeNode[]>([]);

  get data(): TreeNode[] {
    return this.dataChange.value;
  }
  set data(value: TreeNode[]) {
    this.treeControl.dataNodes = value;
    this.dataChange.next(value);
    this.treeControl.expandAll();
  }

  constructor(public treeControl: NestedTreeControl<TreeNode>) {}

  connect(collectionViewer: CollectionViewer): Observable<TreeNode[]> {
    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect() {
    this.dataChange.unsubscribe();
  }
}
