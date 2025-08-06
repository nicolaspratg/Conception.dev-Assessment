import { test, expect } from '@playwright/test';

test('prompt flow smoke test', async ({ page }) => {
  // Navigate to the playground
  await page.goto('/playground');
  
  // Wait for the page to load
  await expect(page.locator('h1')).toContainText('Diagram Playground');
  
  // Verify the form elements are present
  const textarea = page.locator('textarea[id="prompt"]');
  await expect(textarea).toBeVisible();
  
  const generateButton = page.locator('button[type="submit"]');
  await expect(generateButton).toBeVisible();
  
  // Verify the diagram SVG is present
  await expect(page.locator('svg')).toBeVisible();
  
  // Fill and submit the form
  await textarea.fill('A React frontend with Node.js API and PostgreSQL database');
  await generateButton.click();
  
  // Wait for the button to show loading state briefly
  await expect(generateButton).toBeDisabled();
}); 