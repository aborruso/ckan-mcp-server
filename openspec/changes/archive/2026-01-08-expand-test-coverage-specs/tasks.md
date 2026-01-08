# Tasks: Expand Test Coverage to Remaining Tools

Ordered list of work items to add integration tests for package, organization, and datastore tools.

## Phase 1: Package Tools

### ckan_package_search Tests

- [x] Create `tests/integration/package.test.ts`
- [x] Write test for basic search with query parameter
- [x] Write test for search returning empty results
- [x] Write test for search with pagination (start, rows)
- [x] Write test for search with sorting (sort parameter)
- [x] Write test for search with filter query (fq parameter)
- [x] Write test for search with multiple filter queries
- [x] Write test for search with complex query (q + fq + facets)
- [x] Write test validating markdown output format
- [x] Write test handling 404 error for invalid query
- [x] Write test handling server error
- [x] Write test for faceting with facet_field
- [x] Run package tool tests and verify all pass

### ckan_package_show Tests

- [x] Write test for showing package with valid ID
- [x] Write test for package with multiple resources
- [x] Write test for package with tags
- [x] Write test for package with organization
- [x] Write test for package without resources
- [x] Write test handling 404 error for invalid package ID
- [x] Write test handling server error when fetching package
- [x] Write test validating JSON output format
- [x] Run package tool tests and verify all pass

## Phase 2: Organization Tools

### ckan_organization_list Tests

- [x] Create `tests/integration/organization.test.ts`
- [x] Write test for listing all organizations (default)
- [x] Write test for returning list of organizations
- [x] Write test for listing with empty results
- [x] Run organization tool tests and verify all pass

### ckan_organization_show Tests

- [x] Write test for showing organization with valid ID
- [x] Write test for organization with users
- [x] Write test for organization with packages
- [x] Write test handling 404 error for invalid organization ID
- [x] Write test handling server error when fetching organization
- [x] Run organization tool tests and verify all pass

### ckan_organization_search Tests

- [x] Write test for searching organizations by pattern
- [x] Write test for search returning empty results
- [x] Write test handling server error when searching organizations
- [x] Run organization tool tests and verify all pass

## Phase 3: DataStore Tool

### ckan_datastore_search Tests

- [x] Create `tests/integration/datastore.test.ts`
- [x] Write test for basic query with resource_id
- [x] Write test for query with filters
- [x] Write test for query with sorting
- [x] Write test for query with pagination (limit, offset)
- [x] Write test for query with field list (fields parameter)
- [x] Write test handling 404 error for invalid resource_id
- [x] Write test handling server error when querying DataStore
- [x] Write test handling timeout when querying DataStore
- [x] Write test validating JSON output format
- [x] Write test for empty query results
- [x] Write test for maximum limit (32000)
- [x] Write test handling large result sets (50000+ records)
- [x] Run datastore tool tests and verify all pass

## Phase 4: Additional Fixtures

- [x] Create error fixtures if needed for tool-specific scenarios

## Phase 5: Validation

- [x] Run `npm test` and verify all tests pass
- [x] Verify package tools coverage meets target
- [x] Verify organization tools coverage meets target
- [x] Verify datastore tool coverage meets target
- [x] Verify overall coverage meets 80% threshold
- [ ] Run `npm run test:coverage` and check coverage report
- [ ] Check that all tests follow established patterns

## Phase 6: Documentation

- [ ] Update tests/README.md with new test files
- [ ] Add examples from new test files to documentation
- [ ] Update CLAUDE.md if needed with testing notes
- [ ] Update proposal status to completed

## Dependencies

- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phase 3
- Phase 4 can be done in parallel with Phases 1-3 as needed
- Phase 5 depends on completion of Phases 1, 2, 3
- Phase 6 depends on Phase 5 completion

## Notes

- Reuse existing fixtures where possible
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names
- Test both success and error scenarios
- Validate both markdown and JSON output formats
- Keep tests simple and focused
- Run tests in watch mode during development: `npm run test:watch`
- Generate coverage report: `npm run test:coverage`
- Check existing tests (`tests/integration/status.test.ts`) for reference

## Test File Creation Template

When creating new test files:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { makeCkanRequest } from '../../src/utils/http';
import { ckan_package_search, ckan_package_show } from '../../src/tools/package';
import relevantFixture from '../fixtures/responses/relevant-fixture.json';

vi.mock('axios');

describe('ckan_package_search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('descriptive test name', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: relevantFixture });

    const result = await ckan_package_search({
      server_url: 'http://demo.ckan.org',
      q: 'test'
    });

    // Assertions
    expect(result).toBeDefined();
    expect(result.content[0].text).toContain('...');
  });
});
```

## Expected Outcomes

After completing all phases:
- ~78 new tests added (29 package + 24 organization + 18 datastore + 2 status + 6 unit = 79)
- Overall coverage increased from ~68% to 80%+
- All tool categories have integration tests
- Tests follow established patterns
- Tests documented in README
- CI passes (if configured)
