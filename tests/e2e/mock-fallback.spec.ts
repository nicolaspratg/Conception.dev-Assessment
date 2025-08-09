import { test, expect } from '@playwright/test';

test.describe('Mock Fallback Audit', () => {
  test('should use mock API when OPENAI_API_KEY is unset', async ({ page }) => {
    // This test verifies the app works without OpenAI API key
    // The app should fall back to mock data
    
    await page.goto('/playground');
    
    const promptBar = page.getByPlaceholder('Describe your application architecture…');
    await expect(promptBar).toBeVisible();
    
    // Type a prompt
    await promptBar.fill('test application with database');
    
    // Submit the form
    await promptBar.press('Enter');
    
    // Should still work and show loading state
    const generateButton = page.getByLabel('Generate');
    await expect(generateButton).toBeDisabled();
    
    // Wait for response (should be fast since it's mock data)
    await expect(generateButton).toBeEnabled({ timeout: 5000 });
    
    // Should show success toast
    const toast = page.getByText('Diagram generated successfully!');
    await expect(toast).toBeVisible();
    
    // Should render diagram with nodes
    const nodes = page.locator('svg g[id^="node-"]');
    const nodeCount = await nodes.count();
    expect(nodeCount).toBeGreaterThan(0);
    
    // Verify it's using mock data by checking for known example nodes
    const labels = await page.locator('svg text').allTextContents();
    const hasExampleContent = labels.some(label => 
      label.includes('SvelteKit') || 
      label.includes('OpenAI') || 
      label.includes('PostgreSQL') ||
      label.includes('Edge Function')
    );
    expect(hasExampleContent).toBe(true);
  });

  test('should handle API endpoint gracefully', async ({ page }) => {
    // Test the mock-generate endpoint directly
    const response = await page.request.post('/api/mock-generate', {
      data: { prompt: 'test prompt' }
    });
    
    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    expect(data).toHaveProperty('nodes');
    expect(data).toHaveProperty('edges');
    expect(Array.isArray(data.nodes)).toBe(true);
    expect(Array.isArray(data.edges)).toBe(true);
    expect(data.nodes.length).toBeGreaterThan(0);
  });

  test('should handle generate endpoint with fallback', async ({ page }) => {
    // Test the main generate endpoint (should fall back to mock)
    const response = await page.request.post('/api/generate', {
      data: { prompt: 'test application' }
    });
    
    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    expect(data).toHaveProperty('nodes');
    expect(data).toHaveProperty('edges');
    expect(Array.isArray(data.nodes)).toBe(true);
    expect(Array.isArray(data.edges)).toBe(true);
  });

  test('should validate API response structure', async ({ page }) => {
    const response = await page.request.post('/api/generate', {
      data: { prompt: 'web app with database' }
    });
    
    const data = await response.json();
    
    // Validate node structure
    if (data.nodes && data.nodes.length > 0) {
      const node = data.nodes[0];
      expect(node).toHaveProperty('id');
      expect(node).toHaveProperty('type');
      expect(node).toHaveProperty('label');
      expect(node).toHaveProperty('x');
      expect(node).toHaveProperty('y');
      
      // Type should be one of the valid types
      expect(['component', 'external', 'datastore', 'custom']).toContain(node.type);
    }
    
    // Validate edge structure
    if (data.edges && data.edges.length > 0) {
      const edge = data.edges[0];
      expect(edge).toHaveProperty('id');
      expect(edge).toHaveProperty('source');
      expect(edge).toHaveProperty('target');
      expect(edge).toHaveProperty('label');
    }
  });

  test('should handle invalid prompts gracefully', async ({ page }) => {
    // Test with empty prompt
    const emptyResponse = await page.request.post('/api/generate', {
      data: { prompt: '' }
    });
    
    expect([200, 400]).toContain(emptyResponse.status());
    
    // Test with null prompt
    const nullResponse = await page.request.post('/api/generate', {
      data: { prompt: null }
    });
    
    expect([200, 400]).toContain(nullResponse.status());
    
    // Test with very long prompt (should trigger fake rate limit)
    const longPrompt = 'a'.repeat(10000);
    const longResponse = await page.request.post('/api/generate', {
      data: { prompt: longPrompt }
    });
    
    expect(longResponse.status()).toBe(429);
  });
});
