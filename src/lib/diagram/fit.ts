import type { Node, Edge } from '../types/diagram';

export type Insets = { top: number; right: number; bottom: number; left: number };

export function getNodeBounds(n: Node) {
  // IMPORTANT: our data uses top-left x,y for all nodes.
  // 'external' circles render at cx = x + r, cy = y + r, so bounds are x..x+2r
  if (n.type === 'external') {
    const r = n.radius ?? 50;
    return { x: n.x, y: n.y, w: r * 2, h: r * 2 };
  }
  // datastore + component + custom: use width/height defaults
  const w = n.width ?? 150;
  const h = n.height ?? 80;
  return { x: n.x, y: n.y, w, h };
}

export function contentBounds(nodes: Node[], edges: Edge[]) {
  if (!nodes?.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const n of nodes) {
    const w = (n as any).width ?? 80;
    const h = (n as any).height ?? 40;
    const left = n.x - w / 2;
    const right = n.x + w / 2;
    const top = n.y - h / 2;
    const bottom = n.y + h / 2;
    if (left < minX) minX = left;
    if (right > maxX) maxX = right;
    if (top < minY) minY = top;
    if (bottom > maxY) maxY = bottom;
  }

  const maxChipW = Math.max(0, ...edges.map((e: any) => e._chipW ?? 0));
  const maxChipH = Math.max(0, ...edges.map((e: any) => e._chipH ?? 0));
  const extra = Math.max(24, Math.ceil(Math.max(maxChipW, maxChipH) * 0.6));

  return {
    minX: minX - extra,
    minY: minY - extra,
    maxX: maxX + extra,
    maxY: maxY + extra
  };
}

/**
 * Compute pan/scale to center content inside the visible area (container - insets).
 * padding is margin INSIDE the visible area.
 */
export function getFitTransform(
  nodes: Node[],
  edges: Edge[],
  containerW: number,
  containerH: number,
  insets: Insets,
  padding = 24,
  minScale = 0.05,
  maxScale = 1
) {
  const { minX, minY, maxX, maxY } = contentBounds(nodes, edges);
  const contentW = Math.max(1, maxX - minX);
  const contentH = Math.max(1, maxY - minY);

  const availW = Math.max(1, containerW - insets.left - insets.right - padding * 2);
  const availH = Math.max(1, containerH - insets.top  - insets.bottom - padding * 2);

  const s = Math.min(availW / contentW, availH / contentH);
  const scale = Math.max(minScale, Math.min(maxScale, s));

  // center content inside visible rect, then shift by insets + padding
  const screenContentW = contentW * scale;
  const screenContentH = contentH * scale;

  const leftInVisible  = (availW - screenContentW) / 2;
  const topInVisible   = (availH - screenContentH) / 2;

  const panX = insets.left + padding + leftInVisible - minX * scale;
  const panY = insets.top  + padding + topInVisible  - minY * scale;

  return { x: panX, y: panY, scale };
}
