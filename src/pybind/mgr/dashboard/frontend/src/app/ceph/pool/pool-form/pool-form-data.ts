import { Pool } from '../pool';

export class PoolFormData {
  poolTypes: string[] = ['erasure', 'replicated'];
  apps: string[] = [];
  pgs = 1;
  pool: Pool; // Only available during edit mode
}
