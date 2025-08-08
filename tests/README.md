# Testing Structure

This project uses a well-organized testing structure to ensure code quality and maintainability.

## Directory Structure

```
tests/
├── unit/           # Unit tests for components and utilities
│   ├── Diagram.test.ts
│   ├── diagramStore.test.ts
│   ├── layout.test.ts
│   └── edge-label.test.ts
├── api/            # API-specific tests
│   ├── generate.test.ts
│   └── mock-generate.test.ts
└── e2e/            # End-to-end tests
    ├── prompt-flow.spec.ts
    └── fullscreen-layout.spec.ts
```

## Test Types

### Unit Tests (`tests/unit/`)
- **Purpose**: Test individual functions and components in isolation
- **Framework**: Vitest
- **Examples**: 
  - Component rendering tests
  - Store behavior tests
  - Utility function tests

### API Tests (`tests/api/`)
- **Purpose**: Test API endpoints and client functionality
- **Framework**: Vitest
- **Examples**:
  - API response validation
  - Error handling tests
  - Schema validation tests

### E2E Tests (`tests/e2e/`)
- **Purpose**: Test complete user workflows
- **Framework**: Playwright
- **Examples**:
  - User interaction flows
  - Layout and styling tests
  - Cross-browser compatibility

## Running Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm test tests/unit/

# Run only API tests
npm test tests/api/

# Run only E2E tests
npm run test:e2e
```

## Best Practices

1. **Test Location**: Place tests close to the code they test
2. **Naming**: Use descriptive test names that explain the behavior
3. **Isolation**: Each test should be independent and not rely on other tests
4. **Coverage**: Aim for high test coverage, especially for critical business logic
