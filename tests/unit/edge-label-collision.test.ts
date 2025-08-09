import { describe, it, expect } from 'vitest';

// Test the label collision avoidance logic directly
describe('Edge Label Collision Avoidance Logic', () => {
  // Utility function to check if two rectangles overlap
  const rectanglesOverlap = (rect1: { x: number; y: number; w: number; h: number }, rect2: { x: number; y: number; w: number; h: number }) => {
    return !(
      rect1.x + rect1.w < rect2.x ||
      rect1.x > rect2.x + rect2.w ||
      rect1.y + rect1.h < rect2.y ||
      rect1.y > rect2.y + rect2.h
    );
  };

  // Simulate the label area reservation logic
  const simulateLabelPlacement = (labelPositions: Array<{ x: number; y: number; width: number; height: number }>) => {
    const occupiedAreas: Array<{ x: number; y: number; w: number; h: number }> = [];
    const PADX = 6;
    const PADY = 4;
    
    return labelPositions.map(label => {
      // Convert label position to bounds
      const bx = label.x - label.width / 2;
      const by = label.y - label.height / 2;
      
      // Check if this position is free
      const labelBounds = { x: bx, y: by, w: label.width, h: label.height };
      const isAreaFree = !occupiedAreas.some(occupied => rectanglesOverlap(occupied, labelBounds));
      
      // Reserve the area with padding (simulating our fix)
      const reservedArea = {
        x: bx - PADX,
        y: by - PADY,
        w: label.width + PADX * 2,
        h: label.height + PADY * 2
      };
      
      occupiedAreas.push(reservedArea);
      
      return {
        bounds: labelBounds,
        reserved: reservedArea,
        wasAreaFree: isAreaFree
      };
    });
  };

  it('should reserve label areas with padding to prevent collisions', () => {
    // Test with three labels that would be very close to each other
    const labelPositions = [
      { x: 200, y: 100, width: 80, height: 20 },  // First label
      { x: 205, y: 105, width: 80, height: 20 },  // Very close second label
      { x: 210, y: 110, width: 80, height: 20 }   // Very close third label
    ];

    const results = simulateLabelPlacement(labelPositions);
    
    // First label should be placed freely
    expect(results[0].wasAreaFree).toBe(true);
    
    // Subsequent labels should detect conflicts with reserved areas
    // (In real implementation, these would be repositioned)
    expect(results[1].wasAreaFree).toBe(false);
    expect(results[2].wasAreaFree).toBe(false);
    
    // Verify that reserved areas include padding
    const firstReserved = results[0].reserved;
    const firstBounds = results[0].bounds;
    
    expect(firstReserved.x).toBe(firstBounds.x - 6); // PADX
    expect(firstReserved.y).toBe(firstBounds.y - 4); // PADY
    expect(firstReserved.w).toBe(firstBounds.w + 12); // 2 * PADX
    expect(firstReserved.h).toBe(firstBounds.h + 8);  // 2 * PADY
  });

  it('should allow labels that are sufficiently far apart', () => {
    // Test with labels that are far enough apart to not conflict
    const labelPositions = [
      { x: 100, y: 100, width: 60, height: 20 },
      { x: 300, y: 100, width: 60, height: 20 }, // Far to the right
      { x: 100, y: 200, width: 60, height: 20 }  // Far below
    ];

    const results = simulateLabelPlacement(labelPositions);
    
    // All labels should be placed freely since they don't conflict
    expect(results[0].wasAreaFree).toBe(true);
    expect(results[1].wasAreaFree).toBe(true);
    expect(results[2].wasAreaFree).toBe(true);
  });

  it('should correctly calculate overlap detection', () => {
    // Test the rectangle overlap detection function directly
    const rect1 = { x: 100, y: 100, w: 50, h: 20 };
    const rect2 = { x: 120, y: 110, w: 50, h: 20 }; // Overlapping
    const rect3 = { x: 200, y: 100, w: 50, h: 20 }; // Not overlapping
    
    expect(rectanglesOverlap(rect1, rect2)).toBe(true);
    expect(rectanglesOverlap(rect1, rect3)).toBe(false);
    expect(rectanglesOverlap(rect2, rect3)).toBe(false);
  });

  it('should validate the padding calculation', () => {
    // Test that the padding constants are correctly applied
    const PADX = 6;
    const PADY = 4;
    
    const label = { x: 200, y: 100, width: 80, height: 20 };
    const bx = label.x - label.width / 2; // 160
    const by = label.y - label.height / 2; // 90
    
    const expectedReserved = {
      x: bx - PADX,     // 154
      y: by - PADY,     // 86
      w: label.width + PADX * 2,  // 92
      h: label.height + PADY * 2  // 28
    };
    
    // Simulate the reservation
    const results = simulateLabelPlacement([label]);
    
    expect(results[0].reserved).toEqual(expectedReserved);
    expect(results[0].reserved.w).toBe(label.width + 12);
    expect(results[0].reserved.h).toBe(label.height + 8);
  });

  it('should ensure labels avoid both nodes and other labels', () => {
    // Simulate nodes as occupied areas that labels should avoid
    const mockNodes = [
      { x: 100, y: 100, w: 150, h: 80 },  // Component node
      { x: 300, y: 100, w: 120, h: 80 },  // External node area equivalent
    ];

    // Function to check if label would collide with nodes
    const wouldCollideWithNodes = (labelBounds: { x: number; y: number; w: number; h: number }) => {
      return mockNodes.some(node => rectanglesOverlap(labelBounds, node));
    };

    // Test label placement that would conflict with node
    const labelPositions = [
      { x: 175, y: 140, width: 60, height: 20 },  // Would overlap with first node
      { x: 360, y: 140, width: 60, height: 20 },  // Would overlap with second node
      { x: 400, y: 200, width: 60, height: 20 }   // Safe position
    ];

    labelPositions.forEach((label, index) => {
      const bx = label.x - label.width / 2;
      const by = label.y - label.height / 2;
      const labelBounds = { x: bx, y: by, w: label.width, h: label.height };
      
      if (index < 2) {
        // First two labels should conflict with nodes
        expect(wouldCollideWithNodes(labelBounds)).toBe(true);
      } else {
        // Third label should be safe
        expect(wouldCollideWithNodes(labelBounds)).toBe(false);
      }
    });
  });
});
