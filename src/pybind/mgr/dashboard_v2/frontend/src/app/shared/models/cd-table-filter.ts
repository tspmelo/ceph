export interface CdTableFilter {
  label: string;
  prop: string;
  options: string[];
  value: string;
  applyFilter: Function;
}
