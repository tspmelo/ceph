export interface CrushStep {
  op: string;
  item_name?: string;
  item?: number;
  type?: string;
  num?: number;
}
export interface CrushRule {
  max_size: number;
  min_size: number;
  rule_id: 0;
  rule_name: string;
  ruleset: number;
  steps: CrushStep[];
}
