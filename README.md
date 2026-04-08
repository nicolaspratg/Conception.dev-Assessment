# Visual Mockup Generator

A prompt-driven architecture diagram tool. Type a description of a system, get an interactive diagram back.

Built with SvelteKit, TypeScript, and Tailwind CSS. Powered by OpenAI.

---

## What it does

- Takes a natural language prompt (e.g. "a SaaS app with event ingestion and analytics")
- Generates a diagram of nodes and edges representing the architecture
- Renders an interactive canvas with pan, zoom, and drag support
- Falls back to mock data if no OpenAI key is configured

## Tech stack

| Layer | Tech |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 |
| Styling | Tailwind CSS 3 |
| Language | TypeScript |
| Diagram rendering | Custom SVG canvas + `@panzoom/panzoom` |
| Layout engine | `dagre` |
| Validation | Zod |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright |

## Project structure

```
src/
├── routes/
│   ├── +page.svelte              # Redirects to /playground
│   ├── playground/+page.svelte   # Main app
│   └── api/
│       ├── generate/             # OpenAI-backed endpoint
│       └── mock-generate/        # Mock endpoint for testing
└── lib/
    ├── diagram/                  # Canvas, nodes, edges, toolbar
    ├── intel/                    # Spec extractor + diagram planner
    ├── stores/                   # Svelte stores (diagram, mode, viewport…)
    ├── api/client/               # Typed API client
    └── components/               # UI primitives
```

## Intel Planner

When `INTEL_PLANNER=true`, the generate endpoint activates a smarter pipeline:

1. **Extract** — parses the prompt into a structured spec (domain, functional requirements, traffic, constraints)
2. **Plan** — maps the spec to a diagram at one of three complexity levels: `starter`, `standard`, or `scale`

Falls back to the legacy OpenAI path if the planner fails.

## API

### `POST /api/generate`

```json
{ "prompt": "string", "preferMulti": false }
```

Returns `{ nodes, edges }` — or `{ diagrams, meta }` when Intel Planner is active with `preferMulti: true`.

### `POST /api/mock-generate`

Same interface, returns static fixture data. Useful for UI development and testing.

## Node types

| Type | Shape | Use |
|---|---|---|
| `component` | Rectangle | Internal services / apps |
| `external` | Circle | Third-party APIs |
| `datastore` | Cylinder | Databases / storage |
| `custom` | Configurable | Load balancers, special roles |

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | — | Required for real generation |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model to use |
| `OPENAI_MAX_TOKENS` | `1500` | Token budget per request |
| `OPENAI_MAX_TOKENS_CAP` | `3000` | Retry token cap |
| `INTEL_PLANNER` | `false` | Enable the spec-based planner |
| `FAKE_RATE_LIMIT` | `0` | Set to `1` to simulate 429s in tests |

## Running locally

```bash
npm install
cp .env.example .env   # add your OPENAI_API_KEY
npm run dev
```

## Tests

```bash
npm test              # unit tests (Vitest)
npm run test:e2e      # end-to-end tests (Playwright)
npm run audit         # build + unit + e2e audit suite
```
