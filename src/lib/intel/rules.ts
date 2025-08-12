import type { Node, Edge } from '../types/diagram';

export type ComponentKey =
  | 'web_app' | 'api_gateway' | 'service'
  | 'queue' | 'stream' | 'worker'
  | 'cache' | 'db_sql' | 'db_timeseries' | 'db_nosql'
  | 'warehouse' | 'monitoring' | 'auth';

export const components: Record<ComponentKey, (id: string, label?: string) => Omit<Node, 'x' | 'y'>> = {
  web_app: (id, label='Web Client') => ({ id, type:'component', label }),
  api_gateway: (id, label='Edge Function') => ({ id, type:'component', label }),
  service: (id, label='Service') => ({ id, type:'component', label }),
  queue: (id, label='Message Queue') => ({ id, type:'component', label }),
  stream: (id, label='Event Stream') => ({ id, type:'external', label, shape:'circle', radius:50 }),
  worker: (id, label='Worker') => ({ id, type:'component', label }),
  cache: (id, label='Cache') => ({ id, type:'component', label }),
  db_sql: (id, label='PostgreSQL') => ({ id, type:'datastore', label, shape:'cylinder' }),
  db_timeseries: (id, label='Time-series DB') => ({ id, type:'datastore', label, shape:'cylinder' }),
  db_nosql: (id, label='Document DB') => ({ id, type:'datastore', label, shape:'cylinder' }),
  warehouse: (id, label='Data Warehouse') => ({ id, type:'datastore', label, shape:'cylinder' }),
  monitoring: (id, label='Monitoring') => ({ id, type:'external', label, shape:'rectangle' }),
  auth: (id, label='Auth') => ({ id, type:'external', label, shape:'rectangle' }),
};

// small helper
export const edge = (id: string, source: string, target: string, label?: string): Edge =>
  ({ id, source, target, label: label || '', directed: true });
