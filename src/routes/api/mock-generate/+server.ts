import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import diagramData from '$lib/diagram/example-diagram.json';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt } = await request.json();
    
    // For now, always return the same example data regardless of prompt
    // This proves the NL→JSON→render pipeline without LLM costs
    return json(diagramData);
  } catch (error) {
    return json({ error: 'Invalid request' }, { status: 400 });
  }
}; 