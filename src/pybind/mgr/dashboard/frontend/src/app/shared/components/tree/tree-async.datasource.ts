import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';

import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TreeNode } from './tree-node';
import { TreeDatabase } from './tree.database';
import { TreeDataSource } from './tree.datasource';

/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
export class TreeAsyncDataSource extends TreeDataSource {
  set data(value: TreeNode[]) {
    this.treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(_treeControl: NestedTreeControl<TreeNode>, private _database: TreeDatabase) {
    super(_treeControl);
  }

  connect(collectionViewer: CollectionViewer): Observable<TreeNode[]> {
    this.treeControl.expansionModel.changed.subscribe((change) => {
      if (
        (change as SelectionChange<TreeNode>).added ||
        (change as SelectionChange<TreeNode>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<TreeNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<TreeNode>) {
    if (change.added) {
      change.added.forEach((node) => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach((node) => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: TreeNode, _expand: boolean) {
    const children = this._database.getChildren(node.id);
    const index = this.data.indexOf(node);
    if (!children || index < 0) {
      // If no children, or cannot find the node, no op
      return;
    }

    node.isLoading = true;

    // setTimeout(() => {
    //   if (expand) {
    //     const nodes = children.map(
    //       (name) => new TreeNode(name, node.level + 1, this._database.isExpandable(name))
    //     );
    //     this.data.splice(index + 1, 0, ...nodes);
    //   } else {
    //     let count = 0;
    //     for (
    //       let i = index + 1;
    //       i < this.data.length && this.data[i].level > node.level;
    //       i++, count++
    //     ) {}
    //     this.data.splice(index + 1, count);
    //   }

    //   // notify the change
    //   this.dataChange.next(this.data);
    //   node.isLoading = false;
    // }, 1000);
  }
}
