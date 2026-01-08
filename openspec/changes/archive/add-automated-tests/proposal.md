# Proposal: Add Automated Testing

**Status:** Draft
**Created:** 2026-01-08
**Author:** OpenCode

## Summary

Add automated tests to the CKAN MCP Server project using Vitest framework, focusing on unit tests for utilities and integration tests for tools with mocked CKAN API responses.

## Motivation

The project currently has no automated tests (mentioned in CLAUDE.md), which creates several risks:
- No regression detection when modifying code
- Difficult to refactor confidently
- No validation of tool behavior against CKAN API specifications
- Harder for new contributors to understand expected behavior
- No safety net for future changes

Adding automated tests will:
- Catch bugs early before deployment
- Enable confident refactoring
- Document expected behavior through tests
- Improve code quality and maintainability
- Lower barrier for contributions

## Scope

### Included
- **Unit tests** for utility functions (`src/utils/formatting.ts`, `src/utils/http.ts`)
- **Integration tests** for MCP tools with mocked CKAN API responses
- Test setup and configuration (Vitest)
- Mock fixtures for CKAN API responses
- Test scripts in package.json
- CI/CD integration for running tests (if CI exists)
- Documentation for running and writing tests

### Excluded
- E2e tests with real CKAN servers (too slow/unstable)
- Performance/benchmark tests (future enhancement)
- UI/interaction tests (no UI in this project)
- Manual testing procedures (already documented in CLAUDE.md)

## Proposed Changes

### Technology Stack

**Framework**: Vitest
- Fast and modern test runner
- Native TypeScript support
- Jest-compatible API (easy to learn)
- Built-in mocking and spying
- Excellent watch mode for development

**Mock Library**: Built-in Vitest vi.fn()
- No additional dependencies
- Simple and powerful mocking
- Easy to mock CKAN API responses

**Coverage**: c8 (Vitest's built-in coverage tool)
- Generates coverage reports
- Integrates with Vitest

### Test Strategy

#### Phase 1: Foundation (Priority: High)
- Configure Vitest with TypeScript support
- Create test directory structure
- Add test scripts to package.json
- Set up coverage reporting

#### Phase 2: Unit Tests (Priority: High)
- `src/utils/formatting.ts`: truncateText, formatDate, formatBytes
- `src/utils/http.ts`: makeCkanRequest (with mocked axios)

#### Phase 3: Integration Tests (Priority: Medium)
- `tools/status.ts`: ckan_status_show
- `tools/package.ts`: ckan_package_search, ckan_package_show
- `tools/organization.ts`: ckan_organization_list, ckan_organization_show, ckan_organization_search
- `tools/datastore.ts`: ckan_datastore_search

### Mock Strategy

Create fixture files with realistic CKAN API responses:
- `fixtures/responses/status-success.json`
- `fixtures/responses/package-search-success.json`
- `fixtures/responses/organization-list-success.json`
- `fixtures/responses/datastore-search-success.json`
- Error scenarios: timeouts, 404, 500 errors

Mock `axios` to return fixture data without making real HTTP requests.

### Coverage Target

**Initial goal**: 80% code coverage
- All utility functions: 100%
- Tool implementations: 75%+
- Focus on critical paths, not edge cases

**Future goal**: 90%+ (incremental improvement)

### Incremental Approach

Start small and iterate:
1. Test 1-2 tools + all utils
2. Validate approach works
3. Add tests for remaining tools
4. Improve coverage over time
5. Add more edge case tests as needed

## Alternatives Considered

1. **Jest** as test framework
   - *Rejected*: Vitest is faster, has better TypeScript support, and is more modern

2. **E2e tests with real CKAN servers**
   - *Rejected*: Too slow (network calls), unstable (depends on external servers), non-deterministic

3. **No mocking - test with demo.ckan.org**
   - *Rejected*: Requires network, slow, test results vary, can't test error scenarios easily

4. **100% coverage from start**
   - *Rejected*: Too much effort, diminishing returns, 80% is reasonable for first iteration

5. **Testing framework with separate dependencies** (supertest, nock)
   - *Rejected*: Vitest has built-in mocking sufficient for this project

## Impact Assessment

### Benefits
- + Early bug detection
- + Safer refactoring
- + Behavior documentation through tests
- + Improved code quality
- + Easier onboarding for new contributors
- + Faster development cycle (tests catch issues early)

### Risks
- - Initial time investment for writing first tests
- - Test maintenance overhead as code evolves
- - Possible brittle tests if mocking not done well
- - False sense of security if tests don't cover real scenarios

### Mitigation
- Start with critical paths only (incremental approach)
- Keep mocks simple and focused on API contracts
- Review tests in code review
- Update tests when CKAN API changes
- Regular test maintenance in future development

## Open Questions

None - clarified with project owner.

## Dependencies

None - this is a new capability that doesn't depend on other changes.

## Success Criteria

- [ ] Vitest configured and running
- [ ] Test scripts in package.json work
- [ ] Unit tests for utils passing
- [ ] Integration tests for at least 2 tools passing
- [ ] Coverage at least 80% for tested code
- [ ] Tests documented in README or test files
- [ ] Validation: `openspec validate add-automated-tests --strict` passes
