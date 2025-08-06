import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

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

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return json({ error: 'Invalid prompt' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return json({ error: 'OpenAI API key not configured' }, { status: 500 });
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
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return json({ error: 'Failed to generate diagram' }, { status: 502 });
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