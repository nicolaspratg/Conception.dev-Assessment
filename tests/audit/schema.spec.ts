import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import exampleDiagram from '../../src/lib/diagram/example-diagram.json';

// Import the schemas from the API route (same validation logic)
const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['component', 'external', 'datastore', 'custom']),
  label: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  shape: z.enum(['rectangle', 'circle', 'cylinder', 'hexagon', 'diamond', 'triangle']).optional(),
});

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string(),
});

const DiagramSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

describe('Schema Validation Audit', () => {
  it('should validate example diagram against Zod schema', () => {
    // This test ensures our example data matches the API schema
    expect(() => DiagramSchema.parse(exampleDiagram)).not.toThrow();
    
    const validated = DiagramSchema.parse(exampleDiagram);
    expect(validated.nodes).toHaveLength(4);
    expect(validated.edges).toHaveLength(3);
  });

  it('should validate each node type correctly', () => {
    const componentNode = {
      id: 'c1',
      type: 'component' as const,
      label: 'Web App',
      x: 100,
      y: 100,
      width: 200,
      height: 120
    };

    const externalNode = {
      id: 'e1',
      type: 'external' as const,
      label: 'API',
      x: 300,
      y: 100,
      radius: 60
    };

    const datastoreNode = {
      id: 'd1',
      type: 'datastore' as const,
      label: 'Database',
      x: 100,
      y: 300,
      width: 120,
      height: 80
    };

    const customNode = {
      id: 'custom1',
      type: 'custom' as const,
      label: 'Load Balancer',
      x: 200,
      y: 200,
      shape: 'hexagon' as const
    };

    expect(() => NodeSchema.parse(componentNode)).not.toThrow();
    expect(() => NodeSchema.parse(externalNode)).not.toThrow();
    expect(() => NodeSchema.parse(datastoreNode)).not.toThrow();
    expect(() => NodeSchema.parse(customNode)).not.toThrow();
  });

  it('should validate edge schema correctly', () => {
    const validEdge = {
      id: 'e1',
      source: 'node1',
      target: 'node2',
      label: 'API call'
    };

    expect(() => EdgeSchema.parse(validEdge)).not.toThrow();
  });

  it('should reject invalid node types', () => {
    const invalidNode = {
      id: 'inv1',
      type: 'invalid_type',
      label: 'Invalid',
      x: 100,
      y: 100
    };

    expect(() => NodeSchema.parse(invalidNode)).toThrow();
  });

  it('should reject invalid shape types', () => {
    const invalidShape = {
      id: 'inv1',
      type: 'custom',
      label: 'Invalid Shape',
      x: 100,
      y: 100,
      shape: 'invalid_shape'
    };

    expect(() => NodeSchema.parse(invalidShape)).toThrow();
  });

  it('should require all mandatory fields', () => {
    const incompleteNode = {
      id: 'inc1',
      type: 'component',
      // missing label, x, y
    };

    expect(() => NodeSchema.parse(incompleteNode)).toThrow();
  });

  it('should validate complete diagram structure', () => {
    const validDiagram = {
      nodes: [
        {
          id: '1',
          type: 'component',
          label: 'App',
          x: 100,
          y: 100,
          width: 200,
          height: 120
        }
      ],
      edges: [
        {
          id: 'e1',
          source: '1',
          target: '1',
          label: 'self-loop'
        }
      ]
    };

    expect(() => DiagramSchema.parse(validDiagram)).not.toThrow();
  });

  it('should handle empty diagrams', () => {
    const emptyDiagram = {
      nodes: [],
      edges: []
    };

    expect(() => DiagramSchema.parse(emptyDiagram)).not.toThrow();
  });
});
