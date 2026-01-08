# Design: Expand Test Coverage for Remaining Tools

This document explains the testing approach for expanding coverage to package, organization, and datastore tools, following patterns established in the initial testing implementation.

## Testing Approach

### Pattern Reuse

We follow the successful pattern from the initial testing proposal:

```typescript
// 1. Mock axios
vi.mock('axios');

// 2. Import fixtures
import packageSearchFixture from '../fixtures/responses/package-search-success.json';

// 3. Setup test
it('returns expected structure', async () => {
  vi.mocked(axios.get).mockResolvedValue({ data: packageSearchFixture });

  const result = await ckan_package_search({...});

  // 4. Validate result
  expect(result).toBeDefined();
  expect(result.content[0].text).toContain('...');
});
```

### Test Structure

Each tool category gets its own test file:
- `tests/integration/package.test.ts`
- `tests/integration/organization.test.ts`
- `tests/integration/datastore.test.ts`

## Test Scenarios by Tool Category

### Package Tools

#### ckan_package_search Tests

**Happy Paths:**
1. Basic search with query parameter
2. Search with facets (facet_field, facet_limit)
3. Search with pagination (start, rows)
4. Search with sorting (sort)
5. Search with filter query (fq)
6. Empty results (q returns no matches)

**Edge Cases:**
7. Very large results (rows > 1000)
8. Multiple facet fields
9. Complex query (q + fq + facets)
10. Markdown output format validation
11. JSON output format validation

**Error Scenarios:**
12. Invalid query syntax (if applicable)
13. Server error during search
14. Timeout during search

#### ckan_package_show Tests

**Happy Paths:**
1. Show package with valid ID
2. Package with multiple resources
3. Package with tags
4. Package with organization
5. Package without resources

**Edge Cases:**
6. Package with very long description (test truncation)
7. Package with many resources (>10)

**Error Scenarios:**
8. Invalid package ID (404)
9. Server error during fetch
10. Timeout during fetch

### Organization Tools

#### ckan_organization_list Tests

**Happy Paths:**
1. List all organizations (default)
2. List with limit parameter
3. List with offset parameter
4. List with sort parameter
5. Empty result (no organizations)

**Edge Cases:**
6. Very large list (all organizations)
7. Sorting by different fields (name, title, package_count)

**Error Scenarios:**
8. Server error during list
9. Timeout during list

#### ckan_organization_show Tests

**Happy Paths:**
1. Show organization with valid ID
2. Organization with users
3. Organization with package_count
4. Organization with extras (custom fields)

**Edge Cases:**
5. Organization with very long description

**Error Scenarios:**
6. Invalid organization ID (404)
7. Server error during fetch
8. Timeout during fetch

#### ckan_organization_search Tests

**Happy Paths:**
1. Search with query
2. Search with wildcard (*)
3. Search with facets
4. Search with pagination

**Edge Cases:**
5. Search returning many results
6. Search returning no results

**Error Scenarios:**
7. Invalid query
8. Server error during search
9. Timeout during search

### DataStore Tools

#### ckan_datastore_search Tests

**Happy Paths:**
1. Basic query with resource_id
2. Query with filters
3. Query with sorting
4. Query with pagination (limit, offset)
5. Query with multiple filters
6. Query with field list (fields parameter)

**Edge Cases:**
7. Large result set (test truncation)
8. Complex filters (AND/OR logic)
9. Empty result (no records)

**Error Scenarios:**
10. Invalid resource_id
11. Invalid filter syntax
12. Server error during query
13. Timeout during query
14. DataStore not enabled for resource

## Output Format Validation

All tools support both markdown and JSON output. Tests should validate:

### Markdown Format
```typescript
test('returns markdown format', async () => {
  vi.mocked(axios.get).mockResolvedValue({ data: fixture });

  const result = await ckan_package_search({ format: 'markdown', ... });

  expect(result.content[0].type).toBe('text');
  expect(result.content[0].text).toMatch(/^# /); // Markdown heading
});
```

### JSON Format
```typescript
test('returns JSON format', async () => {
  vi.mocked(axios.get).mockResolvedValue({ data: fixture });

  const result = await ckan_package_search({ format: 'json', ... });

  expect(result.content[0].type).toBe('resource');
  expect(result.structuredContent).toBeDefined();
});
```

## Error Handling Tests

All tools should handle errors gracefully:

```typescript
test('handles 404 error', async () => {
  vi.mocked(axios.get).mockRejectedValue({
    isAxiosError: true,
    response: { status: 404, data: notFoundFixture }
  });

  const result = await ckan_package_show({ package_id: 'invalid' });

  expect(result.isError).toBe(true);
  expect(result.content[0].text).toContain('Not found');
});
```

## Fixture Strategy

### Existing Fixtures

Reuse fixtures from initial proposal:
- `package-search-success.json` - already exists
- `package-show-success.json` - already exists
- `organization-list-success.json` - already exists
- `organization-show-success.json` - already exists
- `organization-search-success.json` - already exists
- `datastore-search-success.json` - already exists

### Additional Fixtures Needed

May need to create:
- `package-empty-results.json` - for empty search results
- `organization-empty-results.json` - for empty org list
- `datastore-empty-results.json` - for empty data queries
- Error fixtures specific to each tool if needed

### Creating New Fixtures

Follow existing structure:

**Success fixture:**
```json
{
  "help": "API help URL",
  "success": true,
  "result": { ... }
}
```

**Error fixture:**
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

## Coverage Goals

### Target Metrics

| Component | Current Coverage | Target Coverage | Tests Needed |
|-----------|------------------|-----------------|---------------|
| Utils | 100% | 100% | ✅ Done |
| Status Tool | ~50% | 75-85% | ✅ Done |
| Package Tools | 0% | 75-85% | ~16 tests |
| Organization Tools | 0% | 75-85% | ~18 tests |
| DataStore Tool | 0% | 75-85% | ~14 tests |
| **Overall** | **~68%** | **80%+** | **~48 tests** |

### Verification

After each tool category is tested, run:
```bash
npm run test:coverage
```

Ensure coverage increases and meets targets.

## Test Writing Guidelines

### Naming Convention
```typescript
// Good
test('ckan_package_search with facets returns aggregated data', () => { ... });

// Bad
test('search works', () => { ... });
```

### AAA Pattern
```typescript
test('search with pagination', async () => {
  // Arrange
  const params = { q: 'test', start: 10, rows: 20 };

  // Act
  const result = await ckan_package_search(params);

  // Assert
  expect(result.content[0].text).toContain('Showing 10-20 of');
});
```

### One Assertion Per Test
```typescript
// Good
test('truncates long descriptions', async () => {
  const result = await ckan_package_show({ package_id: 'long-desc' });
  expect(result.content[0].text).toContain('[Response truncated]');
});

// Bad
test('package_show works', async () => {
  const result = await ckan_package_show({ package_id: 'pkg' });
  expect(result).toBeDefined();
  expect(result.content).toBeDefined();
  expect(result.content[0]).toBeDefined();
  expect(result.content[0].text).toBeDefined();
});
```

## Implementation Order

1. **Package Tools** (highest priority)
   - Most complex
   - Most used
   - Largest code block (~350 lines)

2. **Organization Tools** (medium priority)
   - Medium complexity
   - Medium code block (~341 lines)

3. **DataStore Tool** (lower priority)
   - Simpler logic
   - Smaller code block (~146 lines)
   - May have platform-specific behavior

## Future Enhancements

### Short Term
- Contract tests for CKAN API responses
- Visual regression tests for markdown output
- Performance benchmarks for queries

### Medium Term
- Increase coverage to 90%+
- Add contract tests for all tool schemas
- Add integration with real test CKAN instance (optional)

### Long Term
- Fuzz testing for input validation
- Chaos testing for error handling
- Property-based testing

## Conclusion

This test expansion follows the proven patterns from the initial testing proposal, focusing on:

- **Consistency**: Same structure, fixtures, and patterns
- **Completeness**: Cover all tool categories
- **Quality**: Test both happy paths and error scenarios
- **Maintainability**: Simple, focused, well-documented tests

The incremental implementation ensures we achieve 80%+ coverage while keeping the work manageable and debuggable.
