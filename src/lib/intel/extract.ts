import { z } from 'zod';
import type { ExtractSpec } from './types';
import { env } from '$env/dynamic/private';

export const ExtractSchema = z.object({
  domain: z.array(z.string()).default([]),
  functional: z.array(z.string()).default([]),
  nonFunctional: z.array(z.string()).default([]),
  traffic: z.object({
    eventsPerSec: z.number().int().positive().optional(),
    burstiness: z.enum(['low','medium','high']).optional(),
    usersConcurrent: z.number().int().positive().optional(),
  }).partial().optional(),
  constraints: z.object({
    cloud: z.enum(['aws','gcp','azure','any']).optional(),
    language: z.string().optional(),
    persistence: z.enum(['sql','nosql','any']).optional(),
  }).partial().optional(),
  security: z.array(z.string()).optional(),
  analytics: z.array(z.string()).optional(),
});

const SYSTEM_PROMPT = `You are a requirements classifier. 
Extract ONLY a compact JSON object describing capabilities and NFRs from the user's text.
Do NOT include technology product names (no Kafka, Redis, etc.). 
Prefer canonical tags from these lists:
- domain: saas, ecommerce, ab_testing, analytics, content_platform, social, iot
- functional: event_ingest, api, web_app, metrics, reporting, data_processing, auth, payments
- nonFunctional: scalability, resilience, low_latency, throughput, cost_efficiency, observability, fault_tolerance
- security: auth, rbac, encryption_at_rest, encryption_in_transit, pii
- analytics: warehouse, dashboards, time_series
Optionally estimate traffic and constraints. 
Return ONLY valid JSON matching the schema.`;

export async function extractSpec(userText: string): Promise<ExtractSpec> {
  const OPENAI_API_KEY = env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText }
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content from OpenAI');
  }

  const json = JSON.parse(content);
  return ExtractSchema.parse(json);
}
