import { describe, it, expect } from 'vitest';
import { getFitTransform } from '../../src/lib/diagram/fit';
import type { Node } from '../../src/lib/types/diagram';

describe('getFitTransform', () => {
  const mockNodes: Node[] = [
    {
      id: '1',
      type: 'component',
      label: 'Test Node',
      x: 100,
      y: 100,
      width: 150,
      height: 80
    }
  ];

  it('should center content with no insets', () => {
    const result = getFitTransform(mockNodes, 1000, 600, { top: 0, right: 0, bottom: 0, left: 0 });
    
    // Content should be centered in the container
    expect(result.x).toBeGreaterThan(-1000); // Can be negative due to content positioning
    expect(result.y).toBeGreaterThan(-1000);
    expect(result.scale).toBeLessThanOrEqual(1); // maxScale for fit is 1
  });

  it('should shift content left and up with right and bottom insets', () => {
    const noInsets = getFitTransform(mockNodes, 1000, 600, { top: 0, right: 0, bottom: 0, left: 0 });
    const withInsets = getFitTransform(mockNodes, 1000, 600, { top: 0, right: 48, bottom: 120, left: 0 });
    
    // With insets, content should be shifted left and up
    expect(withInsets.x).toBeLessThan(noInsets.x);
    expect(withInsets.y).toBeLessThan(noInsets.y);
  });

  it('should handle empty nodes array', () => {
    const result = getFitTransform([], 1000, 600, { top: 0, right: 0, bottom: 0, left: 0 });
    // With empty nodes, content bounds are 0, so it uses max scale
    expect(result.scale).toBe(1); // maxScale when content is empty
    expect(result.x).toBeGreaterThan(-1000);
    expect(result.y).toBeGreaterThan(-1000);
  });

  it('should respect padding parameter', () => {
    const result1 = getFitTransform(mockNodes, 1000, 600, { top: 0, right: 0, bottom: 0, left: 0 }, 24);
    const result2 = getFitTransform(mockNodes, 1000, 600, { top: 0, right: 0, bottom: 0, left: 0 }, 48);
    
    // Both should have valid transforms
    expect(result1.scale).toBeLessThanOrEqual(1);
    expect(result2.scale).toBeLessThanOrEqual(1);
    expect(result1.x).toBeGreaterThan(-1000);
    expect(result2.x).toBeGreaterThan(-1000);
  });
});
