# API Structure

This project uses a clear separation between API endpoints and client code.

## Directory Structure

```
src/
├── lib/
│   └── api/
│       ├── client/           # API client code
│       │   └── diagramApi.ts # Centralized API client
│       └── README.md         # This documentation
└── routes/
    └── api/                  # SvelteKit API endpoints
        ├── generate/         # OpenAI integration
        │   └── +server.ts
        └── mock-generate/    # Mock data endpoint
            └── +server.ts
```

## API Client (`src/lib/api/client/`)

### `diagramApi.ts`
Centralized API client that provides:
- **Type Safety**: Strongly typed request/response interfaces
- **Error Handling**: Consistent error handling across all API calls
- **Abstraction**: Hides implementation details from components

### Usage Example
```typescript
import { diagramApi } from '$lib/api/client/diagramApi.js';

// Generate a diagram
const result = await diagramApi.generateDiagram({ prompt: "Create a web app" });

// Generate mock data
const mockResult = await diagramApi.generateMockDiagram({ prompt: "Test prompt" });
```

## API Endpoints (`src/routes/api/`)

### `/api/generate`
- **Purpose**: Generate diagrams using OpenAI
- **Method**: POST
- **Request**: `{ prompt: string }`
- **Response**: `{ nodes: Node[], edges: Edge[] }`

### `/api/mock-generate`
- **Purpose**: Return mock diagram data for testing
- **Method**: POST
- **Request**: `{ prompt: string }`
- **Response**: `{ nodes: Node[], edges: Edge[] }`

## Benefits of This Structure

1. **Clear Separation**: Client code vs server endpoints
2. **Type Safety**: Full TypeScript support
3. **Testability**: Easy to mock and test
4. **Maintainability**: Centralized API logic
5. **Reusability**: Client can be used anywhere in the app

## Best Practices

1. **Use the API Client**: Don't call endpoints directly from components
2. **Handle Errors**: Always handle API errors gracefully
3. **Type Everything**: Use TypeScript interfaces for all API contracts
4. **Test API Calls**: Write tests for both client and endpoints
