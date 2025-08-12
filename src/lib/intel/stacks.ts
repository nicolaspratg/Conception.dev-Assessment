import type { Level } from './types';

export interface StackPreset {
  level: Level;
  notes: string[];
  // knobs that influence planning
  include: Partial<Record<'stream'|'queue'|'cache'|'warehouse'|'timeseries', boolean>>;
}

export const STACKS: Record<Level, StackPreset> = {
  starter: {
    level: 'starter',
    include: { queue: true, cache: false, stream: false, warehouse: false, timeseries: false },
    notes: ['Simple monolith + queue', 'Good for prototypes / low traffic'],
  },
  standard: {
    level: 'standard',
    include: { queue: true, cache: true, stream: true, warehouse: true, timeseries: true },
    notes: ['Event-driven ingestion', 'Analytics-ready'],
  },
  scale: {
    level: 'scale',
    include: { queue: true, cache: true, stream: true, warehouse: true, timeseries: true },
    notes: ['Horizontal scaling + resilience paths', 'Backpressure & observability'],
  },
};
