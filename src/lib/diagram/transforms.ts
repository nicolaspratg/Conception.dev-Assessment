export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export interface ZoomOptions {
  animate?: boolean;
  center?: { x: number; y: number };
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function applyTransform(
  group: SVGGElement | null | undefined,
  x: number,
  y: number,
  scale: number,
  pz?: any,
  animate = false
) {
  if (!group) return;
  
  if (pz) {
    try {
      // Use absolute zoom + pan (order matters)
      pz.zoom(scale, { animate });
      pz.pan(x, y, { animate });
    } catch {
      group.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
    }
  } else {
    group.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
  }
}

export function centerAnchoredZoom(
  rect: DOMRect,
  cur: { x: number; y: number; scale: number },
  factor: number,
  focal?: { x: number; y: number }
): Transform {
  // Use provided focal point or default to center
  const cx = focal ? focal.x : rect.width / 2;
  const cy = focal ? focal.y : rect.height / 2;

  // Convert that center to world coords using current transform
  const wx = (cx - cur.x) / cur.scale;
  const wy = (cy - cur.y) / cur.scale;

  const nextScale = clamp(cur.scale * factor, 0.5, 3);
  const nextX = cx - wx * nextScale;
  const nextY = cy - wy * nextScale;

  return { x: nextX, y: nextY, scale: nextScale };
}
