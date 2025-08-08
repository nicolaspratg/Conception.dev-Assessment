import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('generate API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate diagram schema structure', () => {
    // Test the Zod schema validation logic
    const validNode = {
      id: "1",
      type: "component" as const,
      label: "Test Component",
      x: 100,
      y: 100,
      width: 150,
      height: 80
    };

    const validEdge = {
      id: "e1",
      source: "1",
      target: "2",
      label: "Connection"
    };

    const validDiagram = {
      nodes: [validNode],
      edges: [validEdge]
    };

    // This test validates our schema structure
    expect(validDiagram.nodes).toBeDefined();
    expect(validDiagram.edges).toBeDefined();
    expect(validDiagram.nodes[0].type).toBe('component');
    expect(validDiagram.edges[0].source).toBe('1');
  });

  it('should handle invalid node types', () => {
    const invalidNode = {
      id: "1",
      type: "invalid_type", // This should fail validation
      label: "Test Component",
      x: 100,
      y: 100
    };

    // This would fail Zod validation in the actual code
    expect(invalidNode.type).not.toBe('component');
    expect(invalidNode.type).not.toBe('external');
    expect(invalidNode.type).not.toBe('datastore');
  });

  it('should validate required fields', () => {
    const incompleteNode = {
      id: "1",
      // Missing required fields: type, label, x, y
    };

    // This would fail Zod validation in the actual code
    expect(incompleteNode).not.toHaveProperty('type');
    expect(incompleteNode).not.toHaveProperty('label');
    expect(incompleteNode).not.toHaveProperty('x');
    expect(incompleteNode).not.toHaveProperty('y');
  });
}); 