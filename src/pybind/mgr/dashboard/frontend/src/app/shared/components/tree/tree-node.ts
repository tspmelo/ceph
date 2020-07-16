export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  hasChildren?: boolean;
  isLoading?: boolean;
  isExpanded?: boolean;
  other?: any;
}
