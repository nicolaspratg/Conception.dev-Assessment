import dagre from 'dagre';
import type { Node, Edge } from './types/diagram';

type Rankdir = 'TB' | 'LR';
type LayoutOpts = { rankdir?: Rankdir; nodesep?: number; ranksep?: number };

const SIZE = {
  component: { w: 150, h: 80 },
  datastore: { w: 120, h: 90 },
  external:  { w: 100, h: 100 },
  custom:    { w: 120, h: 60 }
} as const;

export function computeLayout(nodes: Node[], edges: Edge[], _cw: number, _ch: number, opts: LayoutOpts = {}) {
  const g = new dagre.graphlib.Graph()
    .setGraph({
      rankdir: opts.rankdir ?? 'TB',
      nodesep: opts.nodesep ?? 60,
      ranksep: opts.ranksep ?? 110,
      marginx: 20,
      marginy: 20
    })
    .setDefaultEdgeLabel(() => ({}));

  for (const n of nodes) {
    const s = SIZE[n.type] ?? SIZE.component;
    const w = n.type === 'external' ? (n.radius ?? 50) * 2 : (n.width ?? s.w);
    const h = n.type === 'external' ? (n.radius ?? 50) * 2 : (n.height ?? s.h);
    g.setNode(n.id, { width: w, height: h });
  }
  for (const e of edges) g.setEdge(e.source, e.target);

  dagre.layout(g);

  return nodes.map(n => {
    const d = g.node(n.id);
    return { ...n, width: d.width, height: d.height, x: d.x - d.width / 2, y: d.y - d.height / 2 };
  });
}
