// src/lib/layout.ts
import dagre from 'dagre';
import type { DiagramData } from './types/diagram';
import { measureText, pillSize } from './diagram/measure';

const NODE_HPAD = 24;
const NODE_VPAD = 16;
const NODE_MAX_WIDTH = 320;
const NODE_FONT = 14;

const CHIP_FONT = 12;
const GRAPH_BASE_MARGIN = 48;

export function computeLayout(data: DiagramData) {
  const g = new dagre.graphlib.Graph({ multigraph: true, compound: false });
  g.setDefaultEdgeLabel(() => ({}));

  // Measure nodes
  const nodesMeasured = data.nodes.map((n) => {
    const { width, height } = measureText(n.label ?? '', NODE_FONT, NODE_MAX_WIDTH);
    const w = Math.max(80, Math.min(NODE_MAX_WIDTH, width + NODE_HPAD * 2));
    const h = Math.max(40, height + NODE_VPAD * 2);
    return { ...n, _w: w, _h: h };
  });

  // Measure edge chips
  const edgesMeasured = data.edges.map((e) => {
    const chip = pillSize(e.label ?? '', CHIP_FONT);
    return { ...e, _chipW: chip.width, _chipH: chip.height };
  });

  // Adaptive spacing & margins
  const maxNodeW = Math.max(80, ...nodesMeasured.map((n: any) => n._w));
  const maxChipW = Math.max(64, ...edgesMeasured.map((e: any) => e._chipW));

  const nodesep = Math.round(Math.max(80, maxNodeW * 0.25));
  const ranksep = Math.round(Math.max(100, maxNodeW * 0.35));
  const edgesep = 20;

  const marginx = GRAPH_BASE_MARGIN + Math.round(maxChipW * 0.5);
  const marginy = GRAPH_BASE_MARGIN + 24;

  g.setGraph({
    rankdir: 'LR',
    nodesep,
    ranksep,
    edgesep,
    marginx,
    marginy,
    acyclicer: 'greedy',
    ranker: 'tight-tree'
  });

  // Nodes
  for (const n of nodesMeasured) {
    g.setNode(n.id, {
      width: (n as any)._w,
      height: (n as any)._h,
      label: n.label
    });
  }

  // Edges (minlen helps keep chips off nodes)
  for (const e of edgesMeasured) {
    const minlen = Math.max(1, Math.ceil(((e as any)._chipW ?? 60) / 60));
    g.setEdge(e.source, e.target, {
      label: e.label,
      labelpos: 'c',
      labeloffset: 14,
      minlen
    }, e.id);
  }

  dagre.layout(g);

  // Back-fill positions
  const nodes = nodesMeasured.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      x: pos.x,
      y: pos.y,
      width: (n as any)._w,
      height: (n as any)._h
    };
  });

  const edges = edgesMeasured.map((e) => {
    const edge = g.edge({ v: e.source, w: e.target, name: e.id });
    return { ...e, points: edge?.points ?? [] };
  });

  return { nodes, edges, meta: { nodesep, ranksep, marginx, marginy } };
}
