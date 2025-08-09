import { test, expect } from '@playwright/test';

test.describe('Responsive Design Audit', () => {
  test('should be responsive at 375px width with no horizontal scroll', async ({ page }) => {
    // Set viewport to iPhone SE size (375x667)
    await page.setViewportSize({ width: 375, height: 740 });
    
    await page.goto('/playground');
    
    // Check that page loads without horizontal scroll
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(pageWidth).toBeLessThanOrEqual(375);
    
    // Verify no horizontal scrollbar
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should keep PromptBar visible and clickable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 });
    await page.goto('/playground');
    
    // PromptBar should be visible
    const promptBar = page.getByPlaceholder('Describe your application architecture…');
    await expect(promptBar).toBeVisible();
    
    // Should be clickable and focusable
    await promptBar.click();
    await expect(promptBar).toBeFocused();
    
    // Generate button should be visible and clickable
    const generateButton = page.getByLabel('Generate');
    await expect(generateButton).toBeVisible();
    
    // Check that PromptBar doesn't overflow
    const promptBarBox = await promptBar.boundingBox();
    expect(promptBarBox).toBeTruthy();
    if (promptBarBox) {
      expect(promptBarBox.x + promptBarBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('should maintain layout integrity on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 });
    await page.goto('/playground');
    
    // Check that header is fixed and visible
    const header = page.locator('header, .header, h1').first();
    if (await header.isVisible()) {
      const headerBox = await header.boundingBox();
      expect(headerBox?.x).toBeGreaterThanOrEqual(0);
      expect(headerBox?.width).toBeLessThanOrEqual(375);
    }
    
    // Verify SVG canvas is contained within viewport
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
    
    const svgBox = await svg.boundingBox();
    if (svgBox) {
      expect(svgBox.x + svgBox.width).toBeLessThanOrEqual(375);
    }
    
    // Check that all interactive elements are accessible
    const interactiveElements = page.locator('button, input, textarea, [role="button"]');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i);
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box) {
          expect(box.x + box.width).toBeLessThanOrEqual(375);
        }
      }
    }
  });

  test('should handle mobile viewport orientation changes', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/playground');
    
    const promptBar = page.getByPlaceholder('Describe your application architecture…');
    await expect(promptBar).toBeVisible();
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    
    // PromptBar should still be visible and functional
    await expect(promptBar).toBeVisible();
    await promptBar.click();
    await expect(promptBar).toBeFocused();
    
    // No horizontal scroll in landscape either
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(pageWidth).toBeLessThanOrEqual(667);
  });
});
