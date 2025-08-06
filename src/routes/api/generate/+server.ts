import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { OPENAI_API_KEY } from '$env/static/private';

// Simple rate limiting (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 2; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Zod schema for diagram validation
const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['component', 'external', 'datastore']),
  label: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
});

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string(),
});

const DiagramSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return json({ error: 'Invalid prompt' }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Rate limiting
    const clientId = getClientAddress();
    const now = Date.now();
    const clientData = requestCounts.get(clientId);
    
    if (clientData && now < clientData.resetTime) {
      if (clientData.count >= RATE_LIMIT) {
        return json({ 
          error: 'Rate limit exceeded. Please wait a minute before trying again.' 
        }, { status: 429 });
      }
      clientData.count++;
    } else {
      requestCounts.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    const systemPrompt = `You are a UI-schema generator that creates architecture diagrams. 
Output ONLY valid JSON in the following format, with no additional text or formatting:

{
  "nodes": [
    {
      "id": "unique_id",
      "type": "component|external|datastore",
      "label": "Human readable name",
      "x": number,
      "y": number,
      "width": number (optional, for rectangles),
      "height": number (optional, for rectangles),
      "radius": number (optional, for circles)
    }
  ],
  "edges": [
    {
      "id": "edge_id",
      "source": "node_id",
      "target": "node_id", 
      "label": "Connection description"
    }
  ]
}

Rules:
- Use "component" for internal services/apps (rectangles)
- Use "external" for APIs/third-party services (circles)
- Use "datastore" for databases/storage (cylinders)
- Position nodes logically (x: 100-500, y: 100-400)
- Create meaningful connections between related components
- Keep it simple: 3-6 nodes maximum`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, response.statusText, errorText);
      
      if (response.status === 429) {
        return json({ 
          error: 'OpenAI rate limit exceeded. Please wait a few minutes and try again.' 
        }, { status: 429 });
      }
      
      return json({ error: `Failed to generate diagram: ${response.status} ${response.statusText}` }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return json({ error: 'No response from OpenAI' }, { status: 502 });
    }

    // Extract JSON from the response (remove any markdown formatting)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', content);
      return json({ error: 'Invalid response format' }, { status: 502 });
    }

    const diagramData = JSON.parse(jsonMatch[0]);
    
    // Validate with Zod schema
    const validatedData = DiagramSchema.parse(diagramData);
    
    return json(validatedData);
  } catch (error) {
    console.error('Generate API error:', error);
    
    if (error instanceof z.ZodError) {
      return json({ error: 'Invalid diagram schema' }, { status: 502 });
    }
    
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 