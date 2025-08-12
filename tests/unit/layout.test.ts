import { describe, it, expect } from 'vitest';
import { computeLayout } from '../../src/lib/layout.js';
import type { Node, Edge } from '../../src/lib/types/diagram.js';

describe('computeLayout', () => {
  it('should position nodes with proper spacing', () => {
    const nodes: Node[] = [
      { id: '1', type: 'component', label: 'Node 1', x: 0, y: 0 },
      { id: '2', type: 'component', label: 'Node 2', x: 0, y: 0 },
      { id: '3', type: 'component', label: 'Node 3', x: 0, y: 0 }
    ];
    
    const edges: Edge[] = [
      { id: 'e1', source: '1', target: '2', label: 'Connection 1' },
      { id: 'e2', source: '2', target: '3', label: 'Connection 2' }
    ];
    
    const result = computeLayout(nodes, edges, 800, 600);
    
    expect(result.nodes).toHaveLength(3);
    
    // Check that nodes are positioned (not all at 0,0)
    const positions = result.nodes.map(n => ({ x: n.x, y: n.y }));
    const uniquePositions = new Set(positions.map(p => `${p.x},${p.y}`));
    expect(uniquePositions.size).toBeGreaterThan(1);
  });

  it('should handle different node types with correct dimensions', () => {
    const nodes: Node[] = [
      { id: '1', type: 'component', label: 'Component', x: 0, y: 0 },
      { id: '2', type: 'external', label: 'External', x: 0, y: 0 },
      { id: '3', type: 'datastore', label: 'Database', x: 0, y: 0 }
    ];
    
    const edges: Edge[] = [
      { id: 'e1', source: '1', target: '2', label: 'API Call' },
      { id: 'e2', source: '2', target: '3', label: 'Query' }
    ];
    
    const result = computeLayout(nodes, edges, 800, 600);
    
    expect(result.nodes[0].width).toBe(150); // component
    expect(result.nodes[0].height).toBe(80);
    expect(result.nodes[1].width).toBe(100); // external
    expect(result.nodes[1].height).toBe(100);
    expect(result.nodes[2].width).toBe(120); // datastore
    expect(result.nodes[2].height).toBe(90);
  });

  it('should return nodes with proper positioning', () => {
    const nodes: Node[] = [
      { id: '1', type: 'component', label: 'Source', x: 0, y: 0 },
      { id: '2', type: 'component', label: 'Target', x: 0, y: 0 }
    ];
    
    const edges: Edge[] = [
      { id: 'e1', source: '1', target: '2', label: 'Connection' }
    ];
    
    const result = computeLayout(nodes, edges, 800, 600);
    
    // Verify nodes have proper positioning and dimensions
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0].x).toBeTypeOf('number');
    expect(result.nodes[0].y).toBeTypeOf('number');
    expect(result.nodes[0].width).toBeGreaterThan(0);
    expect(result.nodes[0].height).toBeGreaterThan(0);
  });
});
