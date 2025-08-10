import type { Node } from '../types/diagram';

export function getNodeById(nodes: Node[], id: string): Node | undefined {
  return nodes.find(node => node.id === id);
}

export function getNodeCenter(node: Node): { x: number; y: number } {
  if (node.type === 'external' && node.radius) {
    return { 
      x: node.x + (node.radius || 50), 
      y: node.y + (node.radius || 50) 
    };
  }
  return {
    x: node.x + (node.width || 0) / 2,
    y: node.y + (node.height || 0) / 2
  };
}

export function getIntersection(source: Node, target: Node): { x1: number; y1: number; x2: number; y2: number } {
  const sourceCenter = getNodeCenter(source);
  const targetCenter = getNodeCenter(target);
  
  let x1: number, y1: number, x2: number, y2: number;
  
  if (source.type === 'external') {
    const intersection = circleIntersection(targetCenter, sourceCenter, source.radius || 50);
    x1 = intersection.x;
    y1 = intersection.y;
  } else {
    const sourceBounds = getNodeBounds(source);
    const intersection = rectIntersection(targetCenter, sourceBounds);
    x1 = intersection.x;
    y1 = intersection.y;
  }
  
  if (target.type === 'external') {
    const intersection = circleIntersection(sourceCenter, targetCenter, target.radius || 50);
    x2 = intersection.x;
    y2 = intersection.y;
  } else {
    const targetBounds = getNodeBounds(target);
    const intersection = rectIntersection(sourceCenter, targetBounds);
    x2 = intersection.x;
    y2 = intersection.y;
  }
  
  return { x1, y1, x2, y2 };
}

export function rectIntersection(p: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number }): { x: number; y: number } {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const dx = p.x - centerX;
  const dy = p.y - centerY;
  
  if (Math.abs(dx) * rect.height <= Math.abs(dy) * rect.width) {
    // Intersection with top or bottom edge
    const sign = dy > 0 ? 1 : -1;
    return { x: centerX + (dx * rect.height) / (2 * Math.abs(dy)), y: centerY + sign * rect.height / 2 };
  } else {
    // Intersection with left or right edge
    const sign = dx > 0 ? 1 : -1;
    return { x: centerX + sign * rect.width / 2, y: centerY + (dy * rect.width) / (2 * Math.abs(dx)) };
  }
}

export function circleIntersection(p: { x: number; y: number }, c: { x: number; y: number }, r: number): { x: number; y: number } {
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return { x: c.x + r, y: c.y };
  
  return {
    x: c.x + (dx * r) / distance,
    y: c.y + (dy * r) / distance
  };
}

export function getNodeBounds(n: Node) {
  if (n.type === 'external' && n.radius) {
    const d = (n.radius ?? 50) * 2;
    return { x: n.x, y: n.y, width: d, height: d };
  }
  return { x: n.x, y: n.y, width: n.width ?? 150, height: n.height ?? 80 };
}
