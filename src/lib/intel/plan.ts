import type { ExtractSpec, Level, PlannedDiagram } from './types';
import { STACKS } from './stacks';
import { components as C, edge } from './rules';

let id = 0; 
const nid = (p: string) => `${p}-${++id}`;

function chooseLevel(spec: ExtractSpec): Level {
  const e = spec.traffic?.eventsPerSec ?? 0;
  const burst = spec.traffic?.burstiness ?? 'medium';
  const wantsScale = spec.nonFunctional?.some(x => ['scalability','resilience','fault_tolerance'].includes(x));
  if (e > 5000 || burst === 'high' || wantsScale) return 'standard';
  if (e > 50000) return 'scale';
  return 'starter';
}

export function plan(spec: ExtractSpec, forced?: Level): PlannedDiagram {
  id = 0;
  const level = forced ?? chooseLevel(spec);
  const knobs = STACKS[level].include;

  // Core path
  const web = { ...C.web_app(nid('web'), 'Web Client'), x: 0, y: 0 };
  const edgeFn = { ...C.api_gateway(nid('edge'), 'Edge Function'), x: 0, y: 0 };
  const svc = { ...C.service(nid('svc'), 'Application Service'), x: 0, y: 0 };

  const nodes = [web, edgeFn, svc];
  const edges = [
    edge(nid('e'), web.id, edgeFn.id, 'HTTPS'),
    edge(nid('e'), edgeFn.id, svc.id, 'API'),
  ];

  // Ingest / events
  const needsEvents = spec.functional.includes('event_ingest');
  if (needsEvents && knobs.stream) {
    const stream = { ...C.stream(nid('stream')), x: 0, y: 0 };
    const worker = { ...C.worker(nid('worker'), 'Ingest Worker'), x: 0, y: 0 };
    nodes.push(stream, worker);
    edges.push(
      edge(nid('e'), svc.id, stream.id, 'produce'),
      edge(nid('e'), stream.id, worker.id, 'consume'),
    );
  } else if (needsEvents && knobs.queue) {
    const q = { ...C.queue(nid('queue')), x: 0, y: 0 };
    const worker = { ...C.worker(nid('worker'), 'Ingest Worker'), x: 0, y: 0 };
    nodes.push(q, worker);
    edges.push(edge(nid('e'), svc.id, q.id, 'enqueue'), edge(nid('e'), q.id, worker.id, 'dequeue'));
  }

  // Storage
  const wantsTS = spec.functional.includes('metrics') || spec.analytics?.includes('time_series');
  if (wantsTS && knobs.timeseries) {
    const ts = { ...C.db_timeseries(nid('ts')), x: 0, y: 0 };
    nodes.push(ts);
    // Find the worker or use service for time-series writes
    const writer = nodes.find(n => n.label?.includes('Worker')) || svc;
    edges.push(edge(nid('e'), writer.id, ts.id, 'write'));
  }
  const sql = { ...C.db_sql(nid('db'), 'Operational DB'), x: 0, y: 0 };
  nodes.push(sql);
  edges.push(edge(nid('e'), svc.id, sql.id, 'CRUD'));

  if (spec.analytics?.includes('warehouse') || spec.functional.includes('reporting') || knobs.warehouse) {
    const wh = { ...C.warehouse(nid('wh')), x: 0, y: 0 };
    nodes.push(wh);
    edges.push(edge(nid('e'), sql.id, wh.id, 'ETL/ELT'));
  }

  // Cache
  if (knobs.cache || spec.nonFunctional.includes('low_latency')) {
    const cache = { ...C.cache(nid('cache')), x: 0, y: 0 };
    nodes.push(cache);
    edges.push(edge(nid('e'), svc.id, cache.id, 'hot keys'));
  }

  // Observability & Auth (optional)
  if (spec.nonFunctional.includes('observability') || level !== 'starter') {
    const mon = { ...C.monitoring(nid('mon'), 'Monitoring'), x: 0, y: 0 };
    nodes.push(mon);
    edges.push(edge(nid('e'), svc.id, mon.id, 'metrics'), edge(nid('e'), edgeFn.id, mon.id, 'logs'));
  }
  if (spec.security?.includes('auth')) {
    const auth = { ...C.auth(nid('auth')), x: 0, y: 0 };
    nodes.push(auth);
    edges.push(edge(nid('e'), web.id, auth.id, 'OIDC'));
  }

  return {
    level,
    data: { nodes, edges },
    rationale: [
      `Selected ${level} stack`,
      needsEvents ? 'Event ingestion decoupled via stream/queue' : 'No event ingestion detected',
      'Operational SQL for core data',
      wantsTS ? 'Time-series storage for metrics' : 'General metrics via monitoring',
      (spec.functional.includes('reporting') ? 'Warehouse for analytics' : 'Warehouse optional'),
    ].filter(Boolean),
  };
}

// Optional helper to return three options for the UI:
export function planAllLevels(spec: ExtractSpec): PlannedDiagram[] {
  return (['starter','standard','scale'] as Level[]).map(level => plan(spec, level));
}
