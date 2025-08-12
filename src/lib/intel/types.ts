import type { DiagramData } from '../types/diagram';

export type Level = 'starter' | 'standard' | 'scale';

export const Burst = ['low','medium','high'] as const;
export type Burst = typeof Burst[number];

export interface ExtractSpec {
  // WHAT it is
  domain: string[];                // ['saas', 'ab_testing']
  functional: string[];            // ['event_ingest','metrics','reporting']
  // HOW it should behave
  nonFunctional: string[];         // ['scalability','resilience','low_latency']
  traffic?: {                      // rough sizing; optional but useful
    eventsPerSec?: number;         // e.g. 5000
    burstiness?: Burst;            // 'high'
    usersConcurrent?: number;
  };
  constraints?: {
    cloud?: 'aws'|'gcp'|'azure'|'any';
    language?: string;             // 'any' if not stated
    persistence?: 'sql'|'nosql'|'any';
  };
  // optional extras we may infer
  security?: string[];             // ['auth','rbac','encryption_at_rest']
  analytics?: string[];            // ['warehouse','dashboards']
}

// The planner's output we'll feed straight to your renderer
export interface PlannedDiagram {
  data: DiagramData;               // your existing {nodes,edges}
  level: Level;                    // chosen stack
  rationale: string[];             // short bullets to show in UI later
}
