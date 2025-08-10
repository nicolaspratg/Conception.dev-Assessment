import { describe, it, expect } from 'vitest';
import { SHAPES } from '../../src/lib/diagram/constants';

describe('Diagram Constants', () => {
  it('has the correct shape mappings', () => {
    expect(SHAPES.component).toBe("rectangle");
    expect(SHAPES.datastore).toBe("cylinder");
    expect(SHAPES.external).toBe("circle");
  });
  
  it('has the correct number of shape types', () => {
    expect(Object.keys(SHAPES)).toHaveLength(3);
  });
}); 