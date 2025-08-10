import { describe, it, expect } from 'vitest';
import { clamp, centerAnchoredZoom } from '../../src/lib/diagram/transforms';

describe('transforms', () => {
  describe('clamp', () => {
    it('clamps values to range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('handles edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('centerAnchoredZoom', () => {
    it('maintains center point during zoom', () => {
      const rect = { width: 800, height: 600 } as DOMRect;
      const current = { x: 100, y: 100, scale: 1 };
      const factor = 1.2;

      const result = centerAnchoredZoom(rect, current, factor);

      // Should zoom in (scale increases)
      expect(result.scale).toBeGreaterThan(current.scale);
      
      // Should maintain center point (approximately)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // The center in world coordinates should remain the same
      const worldCenterX1 = (centerX - current.x) / current.scale;
      const worldCenterY1 = (centerY - current.y) / current.scale;
      const worldCenterX2 = (centerX - result.x) / result.scale;
      const worldCenterY2 = (centerY - result.y) / result.scale;
      
      expect(worldCenterX2).toBeCloseTo(worldCenterX1, 1);
      expect(worldCenterY2).toBeCloseTo(worldCenterY1, 1);
    });

    it('handles zoom out', () => {
      const rect = { width: 800, height: 600 } as DOMRect;
      const current = { x: 100, y: 100, scale: 1 };
      const factor = 0.8;

      const result = centerAnchoredZoom(rect, current, factor);

      // Should zoom out (scale decreases)
      expect(result.scale).toBeLessThan(current.scale);
      expect(result.scale).toBeGreaterThanOrEqual(0.5); // min scale
    });

    it('respects scale limits', () => {
      const rect = { width: 800, height: 600 } as DOMRect;
      const current = { x: 100, y: 100, scale: 1 };
      
      // Try to zoom out too much
      const result1 = centerAnchoredZoom(rect, current, 0.1);
      expect(result1.scale).toBe(0.5); // min scale
      
      // Try to zoom in too much
      const result2 = centerAnchoredZoom(rect, current, 10);
      expect(result2.scale).toBe(3); // max scale
    });

    it('handles different starting positions', () => {
      const rect = { width: 800, height: 600 } as DOMRect;
      const current1 = { x: 0, y: 0, scale: 1 };
      const current2 = { x: 200, y: 200, scale: 1 };
      const factor = 1.5;

      const result1 = centerAnchoredZoom(rect, current1, factor);
      const result2 = centerAnchoredZoom(rect, current2, factor);

      // Both should zoom in by the same factor
      expect(result1.scale).toBeCloseTo(result2.scale, 1);
      
      // But positions should be different
      expect(result1.x).not.toBe(result2.x);
      expect(result1.y).not.toBe(result2.y);
    });
  });
});
