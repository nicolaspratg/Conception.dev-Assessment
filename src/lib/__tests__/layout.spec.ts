import { describe, it, expect } from 'vitest';
import { computeLayout } from '../layout';

const N = (id: string, type: string = 'component') => ({ id, type, label: id, x: 0, y: 0 });

describe('dagre layout', () => {
  it('produces non-overlapping node boxes', () => {
    const nodes = [N('A'), N('B'), { ...N('DB','datastore') }];
    const edges = [{source:'A',target:'B',label:''}, {source:'B',target:'DB',label:''}];
    const out = computeLayout(nodes as any, edges as any, 800, 600);
    const boxes = out.nodes.map(n => ({ x:n.x, y:n.y, w:n.width, h:n.height }));
    const overlap = (a: {x: number, y: number, w: number, h: number}, b: {x: number, y: number, w: number, h: number}) => !(a.x+a.w<=b.x || b.x+b.w<=a.x || a.y+a.h<=b.y || b.y+b.h<=a.y);
    for (let i=0;i<boxes.length;i++) for (let j=i+1;j<boxes.length;j++)
      expect(overlap(boxes[i],boxes[j])).toBe(false);
  });

  it('handles complex diagram with multiple node types without overlaps', () => {
    const nodes = [
      { id: '1', type: 'component', label: 'Web Client', x: 0, y: 0 },
      { id: '2', type: 'external', label: 'OpenAI API', x: 0, y: 0, radius: 60 },
      { id: '3', type: 'datastore', label: 'PostgreSQL', x: 0, y: 0 },
      { id: '4', type: 'component', label: 'Edge Function', x: 0, y: 0 },
      { id: '5', type: 'custom', label: 'Load Balancer', x: 0, y: 0 }
    ];
    const edges = [
      {source:'1',target:'2',label:'API call'},
      {source:'1',target:'4',label:'fetch'}, 
      {source:'4',target:'3',label:'query'},
      {source:'5',target:'1',label:'route'}
    ];
    const out = computeLayout(nodes as any, edges as any, 1000, 800);
    const boxes = out.nodes.map(n => ({ x:n.x, y:n.y, w:n.width, h:n.height }));
    const overlap = (a: {x: number, y: number, w: number, h: number}, b: {x: number, y: number, w: number, h: number}) => !(a.x+a.w<=b.x || b.x+b.w<=a.x || a.y+a.h<=b.y || b.y+b.h<=a.y);
    
    // Check no overlaps
    for (let i=0;i<boxes.length;i++) for (let j=i+1;j<boxes.length;j++)
      expect(overlap(boxes[i],boxes[j])).toBe(false);
    
    // Check all nodes have reasonable positions
    expect(out.nodes.length).toBe(5);
    out.nodes.forEach(node => {
      expect(node.x).toBeTypeOf('number');
      expect(node.y).toBeTypeOf('number');
      expect(node.width).toBeGreaterThan(0);
      expect(node.height).toBeGreaterThan(0);
    });
  });

  it('supports LR rankdir with distinct x positions for chain A→B→C', () => {
    const nodes = [N('A'), N('B'), N('C')];
    const edges = [{source:'A',target:'B',label:''}, {source:'B',target:'C',label:''}];
    const result = computeLayout(nodes as any, edges as any, 800, 600, { rankdir: 'LR' });
    
    expect(result.nodes.length).toBe(3);
    const xPositions = result.nodes.map(n => n.x).sort((a, b) => a - b);
    // In LR layout, x positions should be monotonically increasing for a chain
    expect(xPositions[0]).toBeLessThan(xPositions[1]);
    expect(xPositions[1]).toBeLessThan(xPositions[2]);
  });
});
