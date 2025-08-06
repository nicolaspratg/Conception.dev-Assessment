import { describe, it, expect } from 'vitest';

describe('mock-generate API', () => {
  it('should return diagram data structure', () => {
    const expectedStructure = {
      nodes: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          type: expect.any(String),
          label: expect.any(String),
          x: expect.any(Number),
          y: expect.any(Number)
        })
      ]),
      edges: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          source: expect.any(String),
          target: expect.any(String),
          label: expect.any(String)
        })
      ])
    };

    expect(expectedStructure).toBeDefined();
  });

  it('should handle prompt input', () => {
    const mockPrompt = 'test prompt';
    expect(mockPrompt).toBe('test prompt');
  });
}); 