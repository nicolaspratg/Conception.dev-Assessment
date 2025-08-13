import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { env } from '$env/dynamic/private';
import exampleDiagramData from '$lib/diagram/example-diagram.json' with { type: "json" };
import { extractSpec, plan, planAllLevels } from '$lib/intel';

// --- Configuration ---
const MODEL = env.OPENAI_MODEL ?? 'gpt-4o-mini'; // keep 'gpt-3.5-turbo' if you must
const MAX_TOKENS_DEFAULT = Number(env.OPENAI_MAX_TOKENS ?? 1500);
const MAX_TOKENS_RETRY_CAP = Number(env.OPENAI_MAX_TOKENS_CAP ?? 3000);

// small helper to call OpenAI and parse JSON
async function callOpenAIJson(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  max_tokens: number;
}) {
  const { model, systemPrompt, userPrompt, max_tokens } = params;

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      // keep JSON tight/consistent but still allow some variety
      temperature: 0.2,
      max_tokens,
      // json mode helps produce clean JSON with 4o/4o-mini; harmless if ignored
      response_format: { type: 'json_object' }
    })
  });

  const data = await resp.json().catch(() => ({}));
  const choice = data?.choices?.[0];
  const content: string | undefined = choice?.message?.content;
  const finish: string | undefined = choice?.finish_reason;
  const usage = data?.usage;

  console.log('[openai]', { model, max_tokens, finish, usage });

  // try to parse JSON (either exact JSON or extracted with regex fallback)
  let parsed: any | null = null;
  let parse_error = false;

  if (content) {
    let jsonString = content.trim();
    if (!jsonString.startsWith('{')) {
      const m = content.match(/\{[\s\S]*\}$/);
      if (m) jsonString = m[0];
    }
    try {
      // minor cleanup in case of trailing commas/newlines
      const cleaned = jsonString
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/\r?\n/g, '');
      parsed = JSON.parse(cleaned);
    } catch (e) {
      parse_error = true;
    }
  }

  return {
    ok: resp.ok,
    status: resp.status,
    text: typeof data === 'string' ? data : undefined,
    content,
    parsed,
    finish,
    usage,
    parse_error
  };
}

// Rate limiting removed - OpenAI handles their own rate limits

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
    const { prompt, preferMulti } = await request.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return json({ error: 'Invalid prompt' }, { status: 400 });
    }

    const useIntel = env.INTEL_PLANNER === 'true';
    if (!useIntel) {
      // Legacy path - use existing logic
      return await legacyGenerate(request, getClientAddress, prompt);
    }

    // Intel planner path
    try {
      const spec = await extractSpec(prompt);
      const out = preferMulti ? planAllLevels(spec) : [plan(spec)];
      
      // Return first option's diagram (or all, if you want)
      return json({ 
        diagrams: out.map(o => o.data), 
        meta: out.map(({level,rationale}) => ({level,rationale})) 
      });
    } catch (err) {
      // Graceful fallback to legacy on parse/LLM failure
      console.error('intel-planner failed, falling back to legacy:', err);
      return await legacyGenerate(request, getClientAddress, prompt);
    }

    // Legacy generate function (extracted from original logic)
    async function legacyGenerate(request: Request, getClientAddress: () => string, prompt: string) {
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

      // Rate limiting removed - OpenAI handles their own rate limits

      const systemPrompt = `You are a UI-schema generator that creates architecture diagrams.
Output ONLY valid JSON in the format below (no prose, no markdown):
{
  "nodes": [
    {
      "id": "unique_id",
      "type": "component|external|datastore|custom",
      "label": "Human readable name",
      "x": number,
      "y": number,
      "width": number (optional, rectangles),
      "height": number (optional, rectangles),
      "radius": number (optional, circles),
      "shape": "rectangle|circle|cylinder|hexagon|diamond|triangle" (optional, for custom)
    }
  ],
  "edges": [
    { "id": "edge_id", "source": "node_id", "target": "node_id", "label": "Connection description" }
  ]
}

Guidelines:
- Use "component" for internal services/apps (rectangles), "external" for 3rd-party APIs (circles),
  "datastore" for databases/storage (cylinders), and "custom" + "shape" for special roles (load balancer=hexagon).
- **Node budget**: If the prompt mentions multiple features/subsystems, prefer 6–10 nodes; otherwise 3–6. Never exceed 12.
- Position nodes roughly within x:[100..900], y:[80..520] to form a left-to-right flow; edges should make sense.
- Label edges meaningfully (e.g., "API", "CRUD", "Metrics", "HTTPS").
- Return well-formed JSON only (no comments, no trailing commas).`;

      const first = await callOpenAIJson({
        model: MODEL,
        systemPrompt,
        userPrompt: prompt,
        max_tokens: MAX_TOKENS_DEFAULT
      });

      // early error cases (rate limit, etc.)
      if (!first.ok && first.status === 429) {
        return json({ error: 'OpenAI rate limit exceeded. Please wait a few minutes and try again.' }, { status: 429 });
      }
      if (!first.ok) {
        console.error('OpenAI API error:', first.status, first.text ?? first.content);
        console.warn('OpenAI failed, returning mock data');
        return json(exampleDiagramData);
      }

      // if we got truncated or failed to parse → one retry with more budget
      let result = first;
      if (result.finish === 'length' || result.parse_error || !result.parsed) {
        const retryTokens = Math.min(MAX_TOKENS_DEFAULT * 2, MAX_TOKENS_RETRY_CAP);
        console.log('[openai] retry with larger max_tokens=', retryTokens);

        const retry = await callOpenAIJson({
          model: MODEL,
          systemPrompt,
          userPrompt: prompt,
          max_tokens: retryTokens
        });

        if (retry.ok && retry.parsed) {
          result = retry;
        }
      }

      // still nothing parseable → fallback
      if (!result.parsed) {
        console.warn('No parseable JSON after retry; returning mock data');
        return json(exampleDiagramData);
      }

      // Validate with Zod schema (unchanged)
      try {
        const validatedData = DiagramSchema.parse(result.parsed);
        return json(validatedData);
      } catch (validationError) {
        console.error('Zod validation error:', validationError);
        console.warn('Returning mock data as fallback');
        return json(exampleDiagramData);
      }
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