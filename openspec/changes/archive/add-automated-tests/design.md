# Design: Automated Testing Strategy

This document explains the testing architecture, patterns, and trade-offs for the CKAN MCP Server automated tests.

## Architecture Overview

```
tests/
├── unit/              # Test individual functions in isolation
│   ├── formatting.test.ts
│   └── http.test.ts
├── integration/       # Test tool behavior with mocked API
│   ├── status.test.ts
│   ├── package.test.ts
│   ├── organization.test.ts
│   └── datastore.test.ts
├── fixtures/          # Mock CKAN API responses
│   ├── responses/      # Success scenarios
│   │   ├── status-success.json
│   │   ├── package-search-success.json
│   │   └── ...
│   └── errors/        # Error scenarios
│       ├── timeout.json
│       ├── not-found.json
│       └── server-error.json
└── README.md          # Test writing guide
```

## Testing Pyramid

```
          E2e Tests
          (0% - excluded)
             ▲
             │
    Integration Tests
       (30% - tools)
             ▲
             │
      Unit Tests
      (70% - utils)
             ▲
```

### Rationale

- **Unit tests (70%)**: Fast, stable, cover utility functions completely
- **Integration tests (30%)**: Medium speed, test tool behavior with mocked API
- **E2e tests (0%)**: Excluded - too slow, depends on external servers

## Mock Strategy

### Why Mock CKAN API?

**Benefits:**
- Fast execution (no network I/O)
- Deterministic results (same every time)
- Test error scenarios easily (404, timeout, 500)
- No dependency on external servers
- Offline development possible

**Drawbacks:**
- Mocks may diverge from real API
- Doesn't catch API integration bugs
- Maintenance overhead when API changes

**Mitigation:**
- Use real CKAN API documentation for fixtures
- Periodically validate fixtures against demo.ckan.org
- Keep mocks focused on API contract, not implementation

### Mock Implementation

Use Vitest's built-in `vi.fn()` to mock axios:

```typescript
import { vi } from 'vitest';
import axios from 'axios';

// Mock axios at module level
vi.mock('axios');

// In test, set return value
(axios.get as Mock).mockResolvedValue(fixtureResponse);
```

### Fixture Structure

Fixtures represent realistic CKAN API v3 responses:

**Success Response Structure:**
```json
{
  "success": true,
  "result": { ... }
}
```

**Error Response Structure:**
```json
{
  "success": false,
  "error": { ... }
}
```

## Test Categories

### Unit Tests

**Target:** Utility functions in `src/utils/`

**Characteristics:**
- Test single function in isolation
- Mock external dependencies (axios, formatting libs)
- Focus on inputs/outputs
- Fast execution (< 1ms each)

**Example:**
```typescript
test('formatDate formats ISO date correctly', () => {
  const result = formatDate('2024-01-15T10:30:00Z');
  expect(result).toBe('15/01/2024');
});
```

### Integration Tests

**Target:** MCP tools in `src/tools/`

**Characteristics:**
- Test tool end-to-end with mocked API
- Mock CKAN API responses
- Validate output format (markdown/json)
- Test error handling
- Medium execution speed (~10-50ms each)

**Example:**
```typescript
test('ckan_package_search returns markdown format', async () => {
  vi.mocked(axios.get).mockResolvedValue(fixture);
  const result = await ckan_package_search({...});
  expect(result.content[0].type).toBe('text');
  expect(result.content[0].text).toContain('# Search Results');
});
```

## Coverage Strategy

### Target: 80%

**Breakdown:**
- Utility functions: 100% (essential, easy to test)
- Tool implementations: 75%+ (focus on critical paths)
- Edge cases: 60% (lower priority, add incrementally)

### What NOT to Test

- External library code (axios, express, zod)
- MCP SDK internals
- Simple getters/setters
- Type definitions
- Configuration constants

### When to Stop Testing

When tests provide diminishing returns:
- Error handling code already tested elsewhere
- Simple boolean logic
- One-line functions with clear behavior
- Delegation to tested functions

## Test Writing Guidelines

### Naming Convention

```typescript
// Good: Describes what and expected outcome
test('truncateText limits text to 50000 characters', () => { ... });

// Bad: Vague
test('truncateText works', () => { ... });
```

### AAA Pattern

Arrange, Act, Assert:

```typescript
test('formatBytes converts bytes to KB', () => {
  // Arrange
  const bytes = 1500;

  // Act
  const result = formatBytes(bytes);

  // Assert
  expect(result).toBe('1.46 KB');
});
```

### One Assertion Per Test

```typescript
// Good: One test, one assertion
test('formatDate returns formatted date', () => {
  const result = formatDate('2024-01-15');
  expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
});

// Bad: Multiple assertions, harder to debug
test('formatDate works', () => {
  const result = formatDate('2024-01-15');
  expect(result).toBeDefined();
  expect(typeof result).toBe('string');
  expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
});
```

### Testing Error Scenarios

```typescript
test('ckan_package_show handles 404 error', async () => {
  vi.mocked(axios.get).mockRejectedValue(new Error('404 Not Found'));

  const result = await ckan_package_show({...});

  expect(result.isError).toBe(true);
  expect(result.content[0].text).toContain('Not found');
});
```

## CI/CD Integration

If CI/CD exists (GitHub Actions, GitLab CI, etc.):

```yaml
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  run: # Upload to coverage service (optional)
```

## Trade-offs

### Vitest vs Jest

**Chosen: Vitest**

**Why Vitest:**
- 10x faster than Jest
- Native ESM support
- Built-in TypeScript support
- Modern, actively maintained
- API compatible with Jest

**Trade-off:**
- Newer ecosystem than Jest
- Fewer community examples

### Mocking Real API

**Chosen: Mock fixtures**

**Why Mock:**
- Fast and reliable
- Test error scenarios
- No external dependencies

**Trade-off:**
- Doesn't catch API integration bugs
- Mocks may become outdated

**Mitigation:**
- Validate fixtures periodically against demo.ckan.org
- Document fixture structure
- Keep tests focused on API contract

### Coverage Target 80%

**Why 80%:**
- High enough to catch most bugs
- Not so high to be wasteful
- Industry standard for first iteration

**Trade-off:**
- 20% of code untested
- Edge cases may slip through

**Mitigation:**
- Focus testing on critical paths
- Add tests for bugs found in production
- Incrementally improve coverage over time

## Future Enhancements

### Short Term
- Add performance benchmarks
- Test output formatting edge cases
- Add more error scenario tests

### Medium Term
- Increase coverage to 90%
- Add contract tests for CKAN API
- Visual regression tests for markdown output

### Long Term
- Fuzz testing for input validation
- Chaos testing for error handling
- Integration with external testing services

## Conclusion

This testing strategy balances:
- **Speed**: Unit tests + mocked integration tests
- **Reliability**: Deterministic mocks, no external dependencies
- **Maintainability**: Clear patterns, simple fixtures
- **Effectiveness**: 80% coverage, focus on critical paths

The incremental approach ensures we get value from tests early while keeping the investment manageable.
