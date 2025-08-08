import { test, expect } from '@playwright/test';

test('full viewport diagram layout', async ({ page }) => {
  // Navigate to the playground
  await page.goto('/playground');

  // Wait for the diagram to load
  await page.waitForSelector('svg');

  // Get viewport dimensions
  const viewportWidth = page.viewportSize()!.width;
  const viewportHeight = page.viewportSize()!.height;

  // Get SVG dimensions
  const svg = page.locator('svg');
  const svgWidth = await svg.evaluate(el => el.clientWidth);
  const svgHeight = await svg.evaluate(el => el.clientHeight);

  // Verify SVG takes up most of the viewport (accounting for header)
  const headerHeight = 48; // h-12 = 48px
  const expectedHeight = viewportHeight - headerHeight;
  
  expect(svgWidth).toBeGreaterThan(viewportWidth - 2);
  expect(svgHeight).toBeGreaterThan(expectedHeight - 2);
  expect(svgHeight).toBeLessThanOrEqual(expectedHeight);

  // Verify the prompt bar is present and positioned correctly
  const promptBar = page.locator('textarea');
  await expect(promptBar).toBeVisible();
  
  // Verify prompt bar is positioned at bottom
  const promptBarBox = await promptBar.boundingBox();
  expect(promptBarBox!.y).toBeGreaterThan(viewportHeight - 200); // Should be near bottom
});
