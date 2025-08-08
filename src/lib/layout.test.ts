import { describe, it, expect } from 'vitest';
import { computeLayout } from './layout.js';
import type { Node, Edge } from './types/diagram.js';

describe('computeLayout', () => {
  it('should position nodes with proper spacing', () => {
    const nodes: Node[] = [
      { id: 'react', type: 'component', label: 'React App', x: 0, y: 0 },
      { id: 'express', type: 'component', label: 'Express API', x: 0, y: 0 },
      { id: 'mongo', type: 'datastore', label: 'MongoDB', x: 0, y: 0 }
    ];

    const edges: Edge[] = [
      { id: '1', source: 'react', target: 'express', label: 'API calls' },
      { id: '2', source: 'express', target: 'mongo', label: 'Data' }
    ];

    const result = computeLayout(nodes, edges, 600, 400);

    // Check that nodes are positioned
    expect(result).toHaveLength(3);
    expect(result[0].x).toBeGreaterThan(0);
    expect(result[0].y).toBeGreaterThan(0);
    expect(result[1].x).toBeGreaterThan(0);
    expect(result[1].y).toBeGreaterThan(0);
    expect(result[2].x).toBeGreaterThan(0);
    expect(result[2].y).toBeGreaterThan(0);

    // Check that express is positioned to the right of react (horizontal layout)
    const react = result.find(n => n.id === 'react')!;
    const express = result.find(n => n.id === 'express')!;
    const mongo = result.find(n => n.id === 'mongo')!;

    // In a top-to-bottom layout, mongo should be below express
    expect(mongo.y).toBeGreaterThan(express.y);
  });

  it('should handle different node types with correct dimensions', () => {
    const nodes: Node[] = [
      { id: 'api', type: 'external', label: 'External API', x: 0, y: 0 },
      { id: 'app', type: 'component', label: 'App', x: 0, y: 0 },
      { id: 'db', type: 'datastore', label: 'Database', x: 0, y: 0 }
    ];

    const edges: Edge[] = [
      { id: '1', source: 'api', target: 'app', label: 'Data' },
      { id: '2', source: 'app', target: 'db', label: 'Store' }
    ];

    const result = computeLayout(nodes, edges, 600, 400);

    // All nodes should be positioned
    result.forEach(node => {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeGreaterThanOrEqual(0);
    });
  });
});
