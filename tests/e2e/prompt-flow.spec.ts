import { test, expect } from '@playwright/test';

test('prompt flow smoke test - light mode', async ({ page }) => {
  // Navigate to the playground
  await page.goto('/playground');

  // Wait for the diagram to load
  await page.waitForSelector('svg');

  // Verify diagram has nodes (indicating successful generation)
  const nodes = page.locator('svg rect, svg circle, svg ellipse');
  const nodeCount = await nodes.count();
  expect(nodeCount).toBeGreaterThan(0); // Any nodes is fine

  // Find and interact with the prompt textarea
  const textarea = page.locator('textarea');
  await expect(textarea).toBeVisible();
  await expect(textarea).toBeEnabled();

  // Type a prompt
  await textarea.fill('Create a simple web application');

  // Submit the form
  await textarea.press('Enter');

  // Wait for the diagram to update (should show loading state briefly)
  await page.waitForTimeout(1000);

  // Verify the diagram still has nodes after submission
  const updatedNodeCount = await nodes.count();
  expect(updatedNodeCount).toBeGreaterThan(0);
});

test('prompt flow smoke test - dark mode', async ({ page }) => {
  // Navigate to the playground
  await page.goto('/playground');

  // Wait for the diagram to load
  await page.waitForSelector('svg');

  // Toggle dark mode
  const darkModeButton = page.locator('button[aria-label="Toggle dark mode"]');
  await expect(darkModeButton).toBeVisible();
  await darkModeButton.click();

  // Wait a moment for dark mode to be applied
  await page.waitForTimeout(500);

  // Verify the prompt bar is present
  const textarea = page.locator('textarea');
  await expect(textarea).toBeVisible();

  // Type a prompt in dark mode
  await textarea.fill('Create a microservices architecture');

  // Submit the form
  await textarea.press('Enter');

  // Wait for the diagram to update
  await page.waitForTimeout(1000);

  // Verify the diagram still has nodes after submission
  const nodes = page.locator('svg rect, svg circle, svg ellipse');
  const nodeCount = await nodes.count();
  expect(nodeCount).toBeGreaterThan(0);
}); 