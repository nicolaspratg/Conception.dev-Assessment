import { test, expect } from '@playwright/test';

test.describe('Application Flow Audit', () => {
  test('should complete full prompt-to-diagram flow', async ({ page }) => {
    // Visit playground
    await page.goto('/playground');
    
    // Find the prompt textarea
    const promptBar = page.getByPlaceholder('Describe your application architecture…');
    await expect(promptBar).toBeVisible();
    
    // Type a prompt
    await promptBar.fill('a simple web application with database and API');
    
    // Press Enter to submit
    await promptBar.press('Enter');
    
    // Check that spinner appears (loading state)
    const generateButton = page.getByLabel('Generate');
    await expect(generateButton).toBeDisabled();
    
    // Wait for diagram to appear and spinner to disappear
    await expect(generateButton).toBeEnabled({ timeout: 10000 });
    
    // Check that success toast appears
    const toast = page.getByText('Diagram generated successfully!');
    await expect(toast).toBeVisible();
    
    // Check that toast auto-dismisses (within 5 seconds)
    await expect(toast).not.toBeVisible({ timeout: 5000 });
    
    // Check that diagram has nodes
    const diagramSvg = page.locator('svg').first();
    await expect(diagramSvg).toBeVisible();
    
    // Count nodes (should be > 0)
    const nodes = page.locator('svg g[id^="node-"]');
    const nodeCount = await nodes.count();
    expect(nodeCount).toBeGreaterThan(0);
    
    // Check that prompt was cleared after successful generation
    await expect(promptBar).toHaveValue('');
  });

  test('should handle empty prompt gracefully', async ({ page }) => {
    await page.goto('/playground');
    
    const promptBar = page.getByPlaceholder('Describe your application architecture…');
    const generateButton = page.getByLabel('Generate');
    
    // Try to submit empty prompt
    await generateButton.click();
    
    // Should not show loading state for empty prompt
    await expect(generateButton).not.toBeDisabled();
    
    // Should not show success toast
    await expect(page.getByText('Diagram generated successfully!')).not.toBeVisible();
  });

  test('should support Shift+Enter for multiline input', async ({ page }) => {
    await page.goto('/playground');
    
    const promptBar = page.getByPlaceholder('Describe your application architecture…');
    
    // Type first line
    await promptBar.fill('line 1');
    
    // Press Shift+Enter to add new line
    await promptBar.press('Shift+Enter');
    
    // Type second line
    await promptBar.type('line 2');
    
    // Verify textarea contains both lines
    const value = await promptBar.inputValue();
    expect(value).toContain('line 1\nline 2');
  });
});
