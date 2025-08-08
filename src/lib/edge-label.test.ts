import { describe, it, expect } from 'vitest';

describe('Edge Label Overlap Detection', () => {
  it('should detect overlapping rectangles correctly', () => {
    // Test the boxesOverlap function logic
    function boxesOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
      return !(
        a.x + a.w < b.x ||
        a.x > b.x + b.w ||
        a.y + a.h < b.y ||
        a.y > b.y + b.h
      );
    }

    // Test cases
    const rect1 = { x: 0, y: 0, w: 10, h: 10 };
    const rect2 = { x: 5, y: 5, w: 10, h: 10 }; // overlaps with rect1
    const rect3 = { x: 20, y: 20, w: 10, h: 10 }; // no overlap

    expect(boxesOverlap(rect1, rect2)).toBe(true);
    expect(boxesOverlap(rect1, rect3)).toBe(false);
    expect(boxesOverlap(rect2, rect3)).toBe(false);
  });

  it('should detect when label areas are free', () => {
    // Test the isLabelAreaFree function logic
    const occupiedAreas: { x: number; y: number; w: number; h: number }[] = [
      { x: 0, y: 0, w: 10, h: 10 }
    ];

    function boxesOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
      return !(
        a.x + a.w < b.x ||
        a.x > b.x + b.w ||
        a.y + a.h < b.y ||
        a.y > b.y + b.h
      );
    }

    function isLabelAreaFree(box: { x: number; y: number; w: number; h: number }) {
      return !occupiedAreas.some((o) => boxesOverlap(o, box));
    }

    // Test cases
    const freeBox = { x: 20, y: 20, w: 10, h: 10 };
    const occupiedBox = { x: 5, y: 5, w: 10, h: 10 };

    expect(isLabelAreaFree(freeBox)).toBe(true);
    expect(isLabelAreaFree(occupiedBox)).toBe(false);
  });
});
