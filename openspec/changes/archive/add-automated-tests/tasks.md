# Tasks: Add Automated Testing

Ordered list of work items to add automated tests to the project.

## Phase 1: Foundation

- [x] Install Vitest and related dependencies
- [x] Create vitest.config.ts with TypeScript support
- [x] Create test directory structure: `tests/unit/`, `tests/integration/`, `tests/fixtures/`
- [x] Add test scripts to package.json (test, test:watch, test:coverage)
- [x] Create .gitignore entry for coverage directory
- [x] Configure coverage settings (threshold: 80%)

## Phase 2: Create Mock Fixtures

- [x] Create `tests/fixtures/responses/status-success.json`
- [x] Create `tests/fixtures/responses/package-search-success.json`
- [x] Create `tests/fixtures/responses/package-show-success.json`
- [x] Create `tests/fixtures/responses/organization-list-success.json`
- [x] Create `tests/fixtures/responses/organization-show-success.json`
- [x] Create `tests/fixtures/responses/organization-search-success.json`
- [x] Create `tests/fixtures/responses/datastore-search-success.json`
- [x] Create `tests/fixtures/errors/timeout.json`
- [x] Create `tests/fixtures/errors/not-found.json`
- [x] Create `tests/fixtures/errors/server-error.json`
- [x] Document fixture structure in tests/README.md

## Phase 3: Unit Tests for Utils

- [x] Create `tests/unit/formatting.test.ts`
- [x] Write test for truncateText() with normal text
- [x] Write test for truncateText() with empty string
- [x] Write test for truncateText() with text under limit
- [x] Write test for truncateText() with text over limit
- [x] Write test for formatDate() with ISO date string
- [x] Write test for formatDate() with null/undefined
- [x] Write test for formatBytes() with bytes
- [x] Write test for formatBytes() with kilobytes
- [x] Write test for formatBytes() with megabytes
- [x] Write test for formatBytes() with gigabytes
- [x] Run tests and verify all pass

- [x] Create `tests/unit/http.test.ts`
- [x] Write test for makeCkanRequest() successful response
- [x] Write test for makeCkanRequest() with error (404)
- [x] Write test for makeCkanRequest() with error (500)
- [x] Write test for makeCkanRequest() with timeout
- [x] Write test for makeCkanRequest() URL normalization (trailing slash)
- [x] Write test for makeCkanRequest() User-Agent header
- [x] Run tests and verify all pass

## Phase 4: Integration Tests for Tools

### Status Tool
- [x] Create `tests/integration/status.test.ts`
- [x] Write test for ckan_status_show with valid server URL
- [x] Write test for ckan_status_show with invalid URL
- [ ] Write test for ckan_status_show with server error
- [ ] Write test for markdown output format
- [ ] Write test for JSON output format
- [x] Run tests and verify all pass

### Package Tools
- [ ] Create `tests/integration/package.test.ts`
- [ ] Write test for ckan_package_search with basic query
- [ ] Write test for ckan_package_search with facets
- [ ] Write test for ckan_package_search with pagination
- [ ] Write test for ckan_package_search with sorting
- [ ] Write test for ckan_package_search with filter query
- [ ] Write test for ckan_package_show with valid package ID
- [ ] Write test for ckan_package_show with invalid package ID
- [ ] Write test for markdown output format
- [ ] Write test for JSON output format
- [ ] Run tests and verify all pass

### Organization Tools
- [ ] Create `tests/integration/organization.test.ts`
- [ ] Write test for ckan_organization_list
- [ ] Write test for ckan_organization_list with sorting
- [ ] Write test for ckan_organization_show
- [ ] Write test for ckan_organization_search
- [ ] Write test for markdown output format
- [ ] Write test for JSON output format
- [ ] Run tests and verify all pass

### DataStore Tool
- [ ] Create `tests/integration/datastore.test.ts`
- [ ] Write test for ckan_datastore_search with basic query
- [ ] Write test for ckan_datastore_search with filters
- [ ] Write test for ckan_datastore_search with sorting
- [ ] Write test for ckan_datastore_search with pagination
- [ ] Write test for markdown output format
- [ ] Write test for JSON output format
- [ ] Run tests and verify all pass

## Phase 5: Validation and Documentation

- [x] Run `npm test` and verify all tests pass
- [x] Run `npm run test:coverage` and check coverage report
- [ ] Verify coverage meets 80% threshold
- [ ] Update CLAUDE.md with testing instructions
- [ ] Update README.md with test section
- [x] Create test writing guide in tests/README.md
- [ ] Add example test in test writing guide

## Phase 6: Continuous Integration

- [ ] Check if CI/CD exists (GitHub Actions, etc.)
- [ ] Add test step to CI pipeline if exists
- [ ] Add coverage reporting to CI if exists
- [ ] Verify tests run in CI environment
- [ ] Configure coverage upload to service (optional)

## Dependencies

- Phase 1 must complete before Phase 2, 3, 4
- Phase 2 must complete before Phase 4 (fixtures needed)
- Phase 3 and Phase 4 can be done in parallel after Phase 2
- Phase 5 depends on completion of Phase 3 and Phase 4
- Phase 6 is optional and depends on CI infrastructure

## Notes

- Use vi.fn() for mocking axios
- Keep tests focused and readable
- Mock realistic CKAN API responses from actual documentation
- One assertion per test when possible
- Describe expected behavior clearly in test names
- Use describe blocks for grouping related tests
- Use test.only sparingly and remove before committing
- Run tests in watch mode during development: `npm run test:watch`
- Generate coverage report: `npm run test:coverage`
