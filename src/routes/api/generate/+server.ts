import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { env } from '$env/dynamic/private';
import exampleDiagramData from '$lib/diagram/example-diagram.json' with { type: "json" };

// Simple rate limiting (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 2; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Test-only: fake rate limit for long prompts
const MAX_PROMPT = 500;

// Zod schema for diagram validation
const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['component', 'external', 'datastore', 'custom']),
  label: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  shape: z.enum(['rectangle', 'circle', 'cylinder', 'hexagon', 'diamond', 'triangle']).optional(),
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

    // Test-only: fake 429 for long prompts
    if (env.FAKE_RATE_LIMIT === '1' && typeof prompt === 'string' && prompt.length > MAX_PROMPT) {
      return new Response(JSON.stringify({ error: 'Prompt too long' }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const OPENAI_API_KEY = env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, returning mock data');
      return json(exampleDiagramData);
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
      "type": "component|external|datastore|custom",
      "label": "Human readable name",
      "x": number,
      "y": number,
      "width": number (optional, for rectangles),
      "height": number (optional, for rectangles),
      "radius": number (optional, for circles),
      "shape": "rectangle|circle|cylinder|hexagon|diamond|triangle" (optional, for custom shapes)
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

Guidelines (not strict rules):
- Use "component" for internal services/apps (typically rectangles)
- Use "external" for APIs/third-party services (typically circles)
- Use "datastore" for databases/storage (typically cylinders)
- Use "custom" with "shape" property for special cases (hexagons for load balancers, diamonds for decision points, etc.)
- Position nodes logically (x: 100-500, y: 100-400)
- Create meaningful connections between related components
- Keep it simple: 3-8 nodes maximum
- Ensure all JSON is properly formatted with no trailing commas`;

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
        temperature: 0.1, // Lower temperature for more consistent JSON
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
      
      // Fallback to mock data on OpenAI failure
      console.warn('OpenAI failed, returning mock data');
      return json(exampleDiagramData);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.warn('No content from OpenAI, returning mock data');
      return json(exampleDiagramData);
    }

    // Extract JSON from the response (remove any markdown formatting)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', content);
      console.warn('Returning mock data as fallback');
      return json(exampleDiagramData);
    }

    let diagramData;
    try {
      // Clean the JSON string before parsing
      const jsonString = jsonMatch[0]
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        .replace(/\n/g, '') // Remove newlines
        .replace(/\r/g, ''); // Remove carriage returns
      
      diagramData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', content);
      console.error('Extracted JSON:', jsonMatch[0]);
      console.warn('Returning mock data as fallback');
      return json(exampleDiagramData);
    }
    
    // Validate with Zod schema
    try {
      const validatedData = DiagramSchema.parse(diagramData);
      return json(validatedData);
    } catch (validationError) {
      console.error('Zod validation error:', validationError);
      console.error('Diagram data:', diagramData);
      console.warn('Returning mock data as fallback');
      return json(exampleDiagramData);
    }
  } catch (error) {
    console.error('Generate API error:', error);
    
    if (error instanceof z.ZodError) {
      console.warn('Zod error, returning mock data as fallback');
      return json(exampleDiagramData);
    }
    
    console.warn('Unexpected error, returning mock data as fallback');
    return json(exampleDiagramData);
  }
}; 