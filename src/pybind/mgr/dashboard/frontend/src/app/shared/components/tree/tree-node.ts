export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  isLoading?: boolean;
  other?: any;
}
