import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('generate API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('should return valid diagram JSON from OpenAI', async () => {
    const mockOpenAIResponse = {
      choices: [{
        message: {
          content: `{
            "nodes": [
              {
                "id": "1",
                "type": "component",
                "label": "React Frontend",
                "x": 100,
                "y": 100,
                "width": 150,
                "height": 80
              },
              {
                "id": "2",
                "type": "external",
                "label": "OpenAI API",
                "x": 300,
                "y": 100,
                "radius": 50
              }
            ],
            "edges": [
              {
                "id": "e1",
                "source": "1",
                "target": "2",
                "label": "API calls"
              }
            ]
          }`
        }
      }]
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOpenAIResponse
    });

    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'A React app with OpenAI integration' })
    });

    // Import the POST handler
    const { POST } = await import('../../routes/api/generate/+server');
    const response = await POST({ request } as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.nodes).toBeDefined();
    expect(data.edges).toBeDefined();
    expect(data.nodes.length).toBe(2);
    expect(data.edges.length).toBe(1);
    expect(data.nodes[0].type).toBe('component');
    expect(data.nodes[1].type).toBe('external');
  });

  it('should handle missing API key', async () => {
    delete process.env.OPENAI_API_KEY;

    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'test' })
    });

    const { POST } = await import('../../routes/api/generate/+server');
    const response = await POST({ request } as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('OpenAI API key not configured');
  });

  it('should handle invalid prompt', async () => {
    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '' })
    });

    const { POST } = await import('../../routes/api/generate/+server');
    const response = await POST({ request } as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid prompt');
  });

  it('should handle OpenAI API errors', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    });

    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'test prompt' })
    });

    const { POST } = await import('../../routes/api/generate/+server');
    const response = await POST({ request } as any);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe('Failed to generate diagram');
  });
}); 