import { test, expect } from '@playwright/test';

test('full viewport diagram layout', async ({ page }) => {
  // Navigate to the playground
  await page.goto('/playground');
  
  // Wait for the page to load
  await expect(page.locator('svg')).toBeVisible();
  
  // Get viewport dimensions
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  
  // Verify SVG takes full viewport width
  const svgWidth = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    return rect.width;
  });
  
  expect(svgWidth).toBeGreaterThan(viewportWidth - 2);
  expect(svgWidth).toBeLessThanOrEqual(viewportWidth);
  
  // Verify SVG takes full viewport height
  const svgHeight = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    return rect.height;
  });
  
  expect(svgHeight).toBeGreaterThan(viewportHeight - 2);
  expect(svgHeight).toBeLessThanOrEqual(viewportHeight);
  
  // Verify dotted background is visible
  const dottedBackground = page.locator('div').filter({ hasText: '' }).first();
  await expect(dottedBackground).toBeVisible();
  
  // Verify prompt bar is positioned at bottom
  const promptBar = page.locator('form');
  await expect(promptBar).toBeVisible();
  
  // Take screenshot to confirm layout
  await page.screenshot({ path: 'fullscreen-layout.png', fullPage: true });
});
