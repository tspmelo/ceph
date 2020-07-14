// import { TreeNode } from './tree-node';

export class TreeDatabase {
  dataMap: Map<string, string[]>;

  rootLevelNodes: string[] = ['Fruits', 'Vegetables'];

  /** Initial data from database */
  // initialData(): TreeNode[] {
  //   // return this.rootLevelNodes.map((name) => new TreeNode());
  // }

  getChildren(node: string): string[] | undefined {
    return this.dataMap.get(node);
  }

  isExpandable(node: string): boolean {
    return this.dataMap.has(node);
  }
}
