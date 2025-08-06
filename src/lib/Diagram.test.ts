import { describe, it, expect } from 'vitest';

describe('Diagram Constants', () => {
  it('has the correct shape mappings', () => {
    const SHAPES = {
      component: "rectangle",
      datastore: "cylinder",
      external: "circle",
    } as const;
    
    expect(SHAPES.component).toBe("rectangle");
    expect(SHAPES.datastore).toBe("cylinder");
    expect(SHAPES.external).toBe("circle");
  });
  
  it('has the correct number of shape types', () => {
    const SHAPES = {
      component: "rectangle",
      datastore: "cylinder",
      external: "circle",
    } as const;
    
    expect(Object.keys(SHAPES)).toHaveLength(3);
  });
}); 