# Proposal: Expand Test Coverage to Remaining Tools

**Status:** Completed
**Created:** 2026-01-08
**Author:** OpenCode
**Related:** Archived proposal "add-automated-tests"

## Summary

Add integration tests for the remaining MCP tools (package, organization, datastore) to achieve 80%+ code coverage and improve test reliability.

## Motivation

The initial automated testing implementation successfully established the testing foundation but only covered:
- Utility functions (100% coverage)
- Status tool (partial coverage)
- Overall coverage: ~68%

To meet the 80% coverage target and ensure reliability, we need to test the remaining three tool categories that represent the majority of the codebase:
- Package tools: ~350 lines
- Organization tools: ~341 lines
- DataStore tools: ~146 lines

Adding these tests will:
- Increase overall coverage to 80%+
- Catch bugs in tool implementations
- Document expected behavior through tests
- Enable confident refactoring of tool code
- Provide safety net for future changes

## Scope

### Included
- **Integration tests** for package tools (ckan_package_search, ckan_package_show)
- **Integration tests** for organization tools (ckan_organization_list, ckan_organization_show, ckan_organization_search)
- **Integration tests** for datastore tool (ckan_datastore_search)
- Additional fixtures for error scenarios if needed
- Tests for both markdown and JSON output formats
- Tests for edge cases (empty results, pagination, filters)

### Excluded
- E2e tests with real CKAN servers (already excluded)
- Performance/benchmark tests (future enhancement)
- UI/interaction tests (no UI in this project)
- Testing MCP SDK internals (out of scope)
- Testing external libraries (axios, zod, express)

## Proposed Changes

### Test Strategy

Following the same pattern established in the first proposal:
1. Use Vitest with mocked axios
2. Reuse existing fixtures from `tests/fixtures/`
3. Create new fixtures only if needed
4. Test success and error scenarios
5. Test both markdown and JSON output formats

### Test Coverage Breakdown

#### Package Tools (~6 tests)
- Basic search with query
- Search with facets
- Search with pagination
- Search with sorting
- Search with filter query
- Show package details

#### Organization Tools (~8 tests)
- List organizations
- List with sorting
- Show organization details
- Search organizations
- Error scenarios (404, invalid ID)

#### DataStore Tool (~6 tests)
- Basic query
- Query with filters
- Query with sorting
- Query with pagination
- Error scenarios
- Output format validation

### Coverage Target

**Goal**: Increase from ~68% to 80%+

**Expected breakdown after completion**:
- Utils: 100% (already achieved)
- Status tool: 75-85%
- Package tools: 75-85%
- Organization tools: 75-85%
- DataStore tool: 75-85%
- **Overall**: 80%+

### Incremental Approach

1. Start with package tools (largest, most complex)
2. Add organization tests
3. Add datastore tests
4. Validate coverage after each batch
5. Adjust if needed

## Alternatives Considered

1. **Test all tools at once**
   - *Rejected*: Too large, hard to debug, follow incremental pattern

2. **Skip integration tests, only unit tests**
   - *Rejected*: Would miss tool behavior and CKAN API interactions

3. **Use real CKAN servers for testing**
   - *Rejected*: Already excluded in original proposal (slow, unreliable)

4. **Test only happy paths, ignore errors**
   - *Rejected*: Error handling is critical for robust tools

## Impact Assessment

### Benefits
- + Increased coverage from 68% to 80%+
- + Better bug detection in tool code
- + Safer refactoring of tool implementations
- + Documented expected behavior for all tools
- + Higher confidence in code quality

### Risks
- - Initial time investment for writing ~20 more tests
- - Test maintenance overhead as tool code evolves
- - Possible need for additional fixtures

### Mitigation
- Reuse existing fixtures where possible
- Follow established test patterns
- Write tests incrementally, validate after each batch
- Keep tests simple and focused

## Open Questions

None - reusing established patterns from first proposal.

## Dependencies

Depends on:
- Proposal "add-automated-tests" (archived) - provides test infrastructure and fixtures
- Existing fixtures in `tests/fixtures/` - may need additions

## Success Criteria

- [ ] All package tools have integration tests
- [ ] All organization tools have integration tests
- [ ] DataStore tool has integration tests
- [ ] Tests pass (green CI if exists)
- [ ] Overall coverage meets 80% threshold
- [ ] Tests follow established patterns from first proposal
- [ ] Documentation updated if needed
- [ ] Validation: `openspec validate expand-test-coverage --strict` passes

## Notes

This proposal is a direct continuation of the "add-automated-tests" proposal. All testing infrastructure (Vitest, fixtures, patterns) is already in place, so the focus is purely on writing the actual test files for the remaining tools.
