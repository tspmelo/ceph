import { TreeNode } from '../../../shared/components/tree/tree-node';
import { CephfsDir } from '../../../shared/models/cephfs-directory-models';

export class CephfsTreeDatabase {
  private dirs: CephfsDir[];
  nodes: TreeNode[];
  private requestedPaths: string[];
  private loadingTimeout: any;

  constructor() {
    this.setRootNode();
    this.firstCall();
  }

  private setRootNode() {
    this.nodes = [
      {
        name: '/',
        id: '/',
        isExpanded: true
      }
    ];
  }

  private firstCall() {
    const path = '/';
    setTimeout(() => {
      this.getNode(path).loadNodeChildren();
    }, 10);
  }

  private updateDirectoriesParentNode(dir: CephfsDir) {
    const parent = dir.parent;
    if (!parent) {
      return;
    }
    const node = this.getNode(parent);
    if (!node) {
      // Node will not be found for new sub sub directories - this is the intended behaviour
      return;
    }
    const children = this.getChildren(parent);
    node.data.children = children;
    node.data.hasChildren = children.length > 0;
    this.treeComponent.treeModel.update();
  }

  deleteSnapshotModal() {
    this.modalRef = this.modalService.show(CriticalConfirmationModalComponent, {
      itemDescription: this.i18n('CephFs Snapshot'),
      itemNames: this.snapshot.selection.selected.map((snapshot: CephfsSnapshot) => snapshot.name),
      submitAction: () => this.deleteSnapshot()
    });
  }

  private addNewDirectory(newDir: CephfsDir) {
    this.dirs.push(newDir);
    this.nodeIds[newDir.path] = newDir;
    this.updateDirectoriesParentNode(newDir);
  }

  private updateExistingDirectory(source: CephfsDir[], updatedDir: CephfsDir) {
    const currentDirObject = source.find((sub) => sub.path === updatedDir.path);
    Object.assign(currentDirObject, updatedDir);
  }

  private removeOldDirectory(rmDir: CephfsDir) {
    const path = rmDir.path;
    // Remove directory from local variables
    _.remove(this.dirs, (d) => d.path === path);
    delete this.nodeIds[path];
    this.updateDirectoriesParentNode(rmDir);
  }

  private updateTreeStructure(dirs: CephfsDir[]) {
    const getChildrenAndPaths = (
      directories: CephfsDir[],
      parent: string
    ): { children: CephfsDir[]; paths: string[] } => {
      const children = directories.filter((d) => d.parent === parent);
      const paths = children.map((d) => d.path);
      return { children, paths };
    };

    const parents = _.uniq(dirs.map((d) => d.parent).sort());
    parents.forEach((p) => {
      const received = getChildrenAndPaths(dirs, p);
      const cached = getChildrenAndPaths(this.dirs, p);

      cached.children.forEach((d) => {
        if (!received.paths.includes(d.path)) {
          this.removeOldDirectory(d);
        }
      });
      received.children.forEach((d) => {
        if (cached.paths.includes(d.path)) {
          this.updateExistingDirectory(cached.children, d);
        } else {
          this.addNewDirectory(d);
        }
      });
    });
  }

  updateDirectory(path: string): Promise<any[]> {
    this.unsetLoadingIndicator();
    if (!this.requestedPaths.includes(path)) {
      this.requestedPaths.push(path);
    } else if (this.loading[path] === true) {
      return undefined; // Path is currently fetched.
    }
    return new Promise((resolve) => {
      this.setLoadingIndicator(path, true);
      this.cephfsService.lsDir(this.id, path).subscribe((dirs) => {
        this.updateTreeStructure(dirs);
        this.updateQuotaTable();
        this.updateTree();
        resolve(this.getChildren(path));
        this.setLoadingIndicator(path, false);
      });
    });
  }

  private setLoadingIndicator(path: string, loading: boolean) {
    this.loading[path] = loading;
    this.unsetLoadingIndicator();
  }

  private getSubDirectories(path: string, tree: CephfsDir[] = this.dirs): CephfsDir[] {
    return tree.filter((d) => d.parent === path);
  }

  private getChildren(path: string): any[] {
    const subTree = this.getSubTree(path);
    return _.sortBy(this.getSubDirectories(path), 'path').map((dir) =>
      this.createNode(dir, subTree)
    );
  }

  private createNode(dir: CephfsDir, subTree?: CephfsDir[]): any {
    this.nodeIds[dir.path] = dir;
    if (!subTree) {
      this.getSubTree(dir.parent);
    }
    return {
      name: dir.name,
      id: dir.path,
      hasChildren: this.getSubDirectories(dir.path, subTree).length > 0
    };
  }

  private getSubTree(path: string): CephfsDir[] {
    return this.dirs.filter((d) => d.parent && d.parent.startsWith(path));
  }

  refreshAllDirectories() {
    // In order to make the page scrollable during load, the render cycle for each node
    // is omitted and only be called if all updates were loaded.
    this.loadingIndicator = true;
    this.requestedPaths.map((path) => this.forceDirRefresh(path));
    const interval = setInterval(() => {
      this.updateTree(true);
      if (!this.loadingIndicator) {
        clearInterval(interval);
      }
    }, 3000);
  }

  unsetLoadingIndicator() {
    if (!this.loadingIndicator) {
      return;
    }
    clearTimeout(this.loadingTimeout);
    this.loadingTimeout = setTimeout(() => {
      const loading = Object.values(this.loading).some((l) => l);
      if (loading) {
        return this.unsetLoadingIndicator();
      }
      this.loadingIndicator = false;
      this.updateTree();
      // The problem is that we can't subscribe to an useful updated tree event and the time
      // between fetching all calls and rebuilding the tree can take some time
    }, 3000);
  }
}
