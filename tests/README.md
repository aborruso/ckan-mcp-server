# Tests Guide

This directory contains automated tests for the CKAN MCP Server project.

## Directory Structure

```
tests/
├── unit/              # Unit tests for utility functions
│   ├── formatting.test.ts
│   └── http.test.ts
├── integration/       # Integration tests for MCP tools
│   ├── status.test.ts
│   ├── package.test.ts
│   ├── organization.test.ts
│   └── datastore.test.ts
└── fixtures/          # Mock CKAN API responses
    ├── responses/    # Success scenarios
    │   ├── status-success.json
    │   ├── package-search-success.json
    │   ├── package-show-success.json
    │   ├── organization-list-success.json
    │   ├── organization-show-success.json
    │   ├── organization-search-success.json
    │   └── datastore-search-success.json
    └── errors/        # Error scenarios
        ├── timeout.json
        ├── not-found.json
        └── server-error.json
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage Target

- **Overall coverage**: 80%
- **Utility functions**: 100%
- **Tool implementations**: 75%+

## Writing Tests

### Naming Convention

Use descriptive names that explain what is being tested and the expected outcome:

```typescript
// Good: Clear and specific
test('truncateText limits text to 50000 characters', () => { ... });

// Bad: Too vague
test('truncateText works', () => { ... });
```

### AAA Pattern

Follow the Arrange-Act-Assert pattern:

```typescript
test('formatBytes converts bytes to KB', () => {
  // Arrange - Set up test data
  const bytes = 1500;

  // Act - Execute the function being tested
  const result = formatBytes(bytes);

  // Assert - Verify the result
  expect(result).toBe('1.46 KB');
});
```

### Mocking CKAN API

When writing integration tests, use the fixture files to mock CKAN API responses:

```typescript
import { vi } from 'vitest';
import axios from 'axios';
import statusFixture from '../fixtures/responses/status-success.json';

vi.mock('axios');

test('ckan_status_show returns server information', async () => {
  vi.mocked(axios.get).mockResolvedValue({ data: statusFixture });

  const result = await ckan_status_show({ serverUrl: 'http://demo.ckan.org' });

  expect(result.content[0].text).toContain('CKAN Version');
});
```

### Testing Error Scenarios

Test both success and error scenarios:

```typescript
test('ckan_package_show handles 404 error', async () => {
  vi.mocked(axios.get).mockRejectedValue({
    response: { status: 404, data: notFoundFixture }
  });

  const result = await ckan_package_show({
    serverUrl: 'http://demo.ckan.org',
    packageId: 'non-existent'
  });

  expect(result.isError).toBe(true);
  expect(result.content[0].text).toContain('Not found');
});
```

## Fixture Structure

### Success Response

```json
{
  "help": "URL to API documentation",
  "success": true,
  "result": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "__type": "Error Type",
    "message": "Error message",
    "status": 404
  }
}
```

## Test Categories

### Unit Tests

- **Target**: Utility functions in `src/utils/`
- **Characteristics**: Fast, isolated, test single functions
- **Examples**: formatDate, formatBytes, truncateText, makeCkanRequest

### Integration Tests

- **Target**: MCP tools in `src/tools/`
- **Characteristics**: Test tool behavior with mocked API, medium speed
- **Examples**: ckan_status_show, ckan_package_search, ckan_organization_list

## Guidelines

- Keep tests focused and readable
- Use one assertion per test when possible
- Group related tests with `describe` blocks
- Remove `test.only` before committing
- Use descriptive test names
- Test error scenarios as well as success cases
- Maintain realistic fixture data based on CKAN API documentation
