import { test, expect } from '@playwright/test';

test('prompt flow smoke test - light mode', async ({ page }) => {
  // Navigate to the playground
  await page.goto('/playground');
  
  // Wait for the page to load
  await expect(page.locator('h1')).toContainText('Conception.dev Mock-up Generator');
  
  // Verify the prompt bar is present
  const textarea = page.locator('textarea');
  await expect(textarea).toBeVisible();
  
  const generateButton = page.locator('button[type="submit"]');
  await expect(generateButton).toBeVisible();
  
  // Verify the diagram SVG is present
  await expect(page.locator('svg')).toBeVisible();
  
  // Verify diagram has nodes (indicating successful generation)
  const nodes = page.locator('svg rect, svg circle, svg ellipse');
  const nodeCount = await nodes.count();
  expect(nodeCount).toBeGreaterThan(0);
});

test('prompt flow smoke test - dark mode', async ({ page }) => {
  // Set dark mode
  await page.emulateMedia({ colorScheme: 'dark' });
  
  // Navigate to the playground
  await page.goto('/playground');
  
  // Wait for the page to load
  await expect(page.locator('h1')).toContainText('Conception.dev Mock-up Generator');
  
  // Verify dark mode is applied to diagram container
  const diagramContainer = page.locator('main .bg-white.dark\\:bg-\\[\\#343541\\]');
  await expect(diagramContainer).toBeVisible();
  
  // Verify the prompt bar is present
  const textarea = page.locator('textarea');
  await expect(textarea).toBeVisible();
  
  const generateButton = page.locator('button[type="submit"]');
  await expect(generateButton).toBeVisible();
  
  // Verify the diagram SVG is present
  await expect(page.locator('svg')).toBeVisible();
  
  // Verify diagram has nodes (indicating successful generation)
  const nodes = page.locator('svg rect, svg circle, svg ellipse');
  const nodeCount = await nodes.count();
  expect(nodeCount).toBeGreaterThan(0);
}); 