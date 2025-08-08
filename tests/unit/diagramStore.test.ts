import { describe, it, expect } from 'vitest';
import { diagramStore } from '../../src/lib/stores/diagramStore.js';
import type { DiagramData } from '../../src/lib/types/diagram.js';

describe('Diagram Store', () => {
  it('initializes with example data', () => {
    let currentValue: DiagramData | undefined;
    const unsubscribe = diagramStore.subscribe(value => {
      currentValue = value;
    });
    
    expect(currentValue).toBeDefined();
    expect(currentValue!.nodes).toBeDefined();
    expect(currentValue!.edges).toBeDefined();
    expect(currentValue!.nodes.length).toBeGreaterThan(0);
    
    unsubscribe();
  });

  it('can be updated with new data', () => {
    const newData: DiagramData = {
      nodes: [{ id: '1', type: 'component', label: 'Test', x: 100, y: 100 }],
      edges: []
    };

    diagramStore.set(newData);
    
    let currentValue: DiagramData | undefined;
    const unsubscribe = diagramStore.subscribe(value => {
      currentValue = value;
    });
    
    expect(currentValue).toEqual(newData);
    
    unsubscribe();
  });
}); 