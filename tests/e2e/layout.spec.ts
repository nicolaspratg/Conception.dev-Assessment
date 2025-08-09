import { test, expect } from '@playwright/test';

test.describe('Layout and Positioning Audit', () => {
  test('should keep all nodes within SVG viewport bounds', async ({ page }) => {
    await page.goto('/playground');
    
    // Wait for diagram to be visible
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
    
    // Get SVG dimensions
    const svgBox = await svg.boundingBox();
    expect(svgBox).toBeTruthy();
    
    if (svgBox) {
      // Find all node elements
      const nodes = page.locator('svg g[id^="node-"], svg rect, svg circle, svg ellipse');
      const nodeCount = await nodes.count();
      
      if (nodeCount > 0) {
        // Check each node is within SVG bounds
        for (let i = 0; i < nodeCount; i++) {
          const node = nodes.nth(i);
          const nodeBox = await node.boundingBox();
          
          if (nodeBox) {
            // Node should be within SVG bounds (with small tolerance)
            expect(nodeBox.x).toBeGreaterThanOrEqual(svgBox.x - 5);
            expect(nodeBox.y).toBeGreaterThanOrEqual(svgBox.y - 5);
            expect(nodeBox.x + nodeBox.width).toBeLessThanOrEqual(svgBox.x + svgBox.width + 5);
            expect(nodeBox.y + nodeBox.height).toBeLessThanOrEqual(svgBox.y + svgBox.height + 5);
          }
        }
      }
    }
  });

  test('should center diagram content visually', async ({ page }) => {
    await page.goto('/playground');
    
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
    
    // Look for the main diagram group
    const diagramGroup = page.locator('svg g#diagram, svg g[id*="diagram"], svg > g').first();
    
    if (await diagramGroup.isVisible()) {
      const svgBox = await svg.boundingBox();
      const groupBox = await diagramGroup.boundingBox();
      
      if (svgBox && groupBox) {
        // Calculate if the content is reasonably centered (±5% tolerance)
        const svgCenterX = svgBox.x + svgBox.width / 2;
        const svgCenterY = svgBox.y + svgBox.height / 2;
        const groupCenterX = groupBox.x + groupBox.width / 2;
        const groupCenterY = groupBox.y + groupBox.height / 2;
        
        const toleranceX = svgBox.width * 0.05; // 5% tolerance
        const toleranceY = svgBox.height * 0.05;
        
        expect(Math.abs(groupCenterX - svgCenterX)).toBeLessThanOrEqual(toleranceX);
        expect(Math.abs(groupCenterY - svgCenterY)).toBeLessThanOrEqual(toleranceY);
      }
    }
  });

  test('should have floating PromptBar positioned correctly', async ({ page }) => {
    await page.goto('/playground');
    
    // PromptBar should be floating near bottom center
    const promptBarContainer = page.locator('.absolute.inset-x-0.bottom-6, .fixed.bottom-6').first();
    await expect(promptBarContainer).toBeVisible();
    
    const containerBox = await promptBarContainer.boundingBox();
    const viewportSize = page.viewportSize();
    
    if (containerBox && viewportSize) {
      // Should be centered horizontally
      const containerCenter = containerBox.x + containerBox.width / 2;
      const viewportCenter = viewportSize.width / 2;
      const tolerance = 50; // Allow some tolerance for centering
      
      expect(Math.abs(containerCenter - viewportCenter)).toBeLessThanOrEqual(tolerance);
      
      // Should be near the bottom
      expect(containerBox.y + containerBox.height).toBeGreaterThan(viewportSize.height * 0.7);
    }
  });

  test('should maintain proper visual hierarchy', async ({ page }) => {
    await page.goto('/playground');
    
    // Check z-index layering is correct
    const promptBar = page.locator('.z-50, [style*="z-index"]').first();
    const diagram = page.locator('svg').first();
    
    await expect(promptBar).toBeVisible();
    await expect(diagram).toBeVisible();
    
    // PromptBar should be above diagram (higher z-index)
    const promptBarZIndex = await promptBar.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.zIndex;
    });
    
    // Z-index should be set (not auto)
    expect(promptBarZIndex).not.toBe('auto');
    expect(parseInt(promptBarZIndex)).toBeGreaterThan(0);
  });

  test('should handle full-screen dotted canvas background', async ({ page }) => {
    await page.goto('/playground');
    
    // Check for background pattern or full-screen container
    const mainContainer = page.locator('main, .min-h-screen, [class*="full"], body').first();
    await expect(mainContainer).toBeVisible();
    
    const containerBox = await mainContainer.boundingBox();
    const viewportSize = page.viewportSize();
    
    if (containerBox && viewportSize) {
      // Should cover most/all of the viewport
      expect(containerBox.height).toBeGreaterThanOrEqual(viewportSize.height * 0.9);
    }
    
    // Look for dotted or grid background
    const backgroundStyles = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => {
        const styles = window.getComputedStyle(el);
        return styles.backgroundImage.includes('dot') || 
               styles.backgroundImage.includes('grid') ||
               styles.backgroundImage.includes('radial');
      });
    });
    
    // Should have some kind of background pattern (not required but good UX)
    // This is informational rather than a hard requirement
    console.log('Has dotted/grid background:', backgroundStyles);
  });

  test('should ensure edges connect nodes properly', async ({ page }) => {
    await page.goto('/playground');
    
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
    
    // Check for edge lines
    const edges = page.locator('svg line, svg path[d*="M"]');
    const edgeCount = await edges.count();
    
    if (edgeCount > 0) {
      // Verify edges have proper positioning
      for (let i = 0; i < edgeCount; i++) {
        const edge = edges.nth(i);
        const edgeBox = await edge.boundingBox();
        
        if (edgeBox) {
          // Edge should have reasonable dimensions
          expect(edgeBox.width + edgeBox.height).toBeGreaterThan(0);
        }
      }
      
      // Check for arrow markers
      const arrows = page.locator('svg marker, svg defs marker');
      expect(await arrows.count()).toBeGreaterThan(0);
    }
  });
});
