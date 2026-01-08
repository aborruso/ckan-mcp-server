# Spec: Automated Testing

Defines requirements for automated testing infrastructure and test coverage.

## ADDED Requirements

### Requirement: Automated test suite

The project SHALL have an automated test suite using Vitest that runs unit tests for utility functions and integration tests for MCP tools.

#### Scenario: Run test suite
Given the project has tests configured
When a developer runs `npm test`
Then all tests pass
And the test run completes in under 10 seconds
And the output shows pass/fail status for each test

#### Scenario: Run tests in watch mode
Given a developer is actively writing code
When they run `npm run test:watch`
Then Vitest starts in watch mode
And tests re-run automatically when files change
And the developer receives immediate feedback

### Requirement: Test coverage reporting

The project SHALL provide code coverage reporting with a minimum threshold of 80% for tested code.

#### Scenario: Generate coverage report
Given the project has tests configured
When a developer runs `npm run test:coverage`
Then a coverage report is generated
And the report shows line-by-line coverage
And coverage meets 80% threshold
And the report is saved in coverage/ directory

#### Scenario: Coverage below threshold
Given new code is added without tests
When coverage is checked
Then the coverage report shows below 80%
And the report highlights untested lines
And developer knows which files need tests

### Requirement: Unit tests for utilities

The project SHALL have unit tests for all utility functions in `src/utils/` directory.

#### Scenario: Unit test for formatting function
Given a utility function exists (e.g., formatDate)
When a unit test is written for it
Then the test covers all branches
And the test provides realistic inputs
And the test validates expected output

#### Scenario: Unit test for HTTP client
Given the makeCkanRequest function
When a unit test is written for it
Then axios is mocked
And the test validates successful responses
And the test validates error scenarios (404, 500, timeout)
And the test validates URL normalization

### Requirement: Integration tests for tools

The project SHALL have integration tests for MCP tools that validate tool behavior with mocked CKAN API responses.

#### Scenario: Integration test for search tool
Given the ckan_package_search tool
When an integration test is written for it
Then CKAN API responses are mocked
And the test validates output format (markdown/json)
And the test validates successful search
And the test validates error handling

#### Scenario: Integration test for DataStore tool
Given the ckan_datastore_search tool
When an integration test is written for it
Then DataStore API responses are mocked
And the test validates query processing
And the test validates output formatting
And the test validates filter and sort parameters

### Requirement: Mock fixtures for API responses

The project SHALL provide mock fixtures that represent realistic CKAN API v3 responses for both success and error scenarios.

#### Scenario: Success response fixture
Given a CKAN API success response is needed
When a fixture is created
Then the fixture follows CKAN API v3 format
And the fixture includes "success": true
And the fixture includes realistic "result" data

#### Scenario: Error response fixture
Given an error scenario is tested
When an error fixture is created
Then the fixture follows CKAN API v3 format
And the fixture includes "success": false
And the fixture includes error details

#### Scenario: Timeout error fixture
Given timeout scenarios are tested
When a timeout fixture is used
Then axios is mocked to throw timeout error
And the tool handles the error gracefully
And the tool returns user-friendly error message

### Requirement: Test documentation

The project SHALL provide documentation for running and writing tests to help developers understand testing practices.

#### Scenario: Running tests
Given a new developer joins the project
When they read test documentation
Then they know how to run tests
Then they know how to run tests in watch mode
Then they know how to generate coverage reports

#### Scenario: Writing tests
Given a developer needs to write a new test
When they read test documentation
Then they see examples of unit tests
Then they see examples of integration tests
Then they understand the mocking strategy
Then they follow naming conventions

### Requirement: Incremental test development

The project SHALL allow incremental development of tests, starting with critical tools and expanding over time.

#### Scenario: Initial test coverage
Given the first iteration of tests
When tests are implemented
Then at least 2 tools have tests
Then all utility functions have tests
And coverage meets 80% threshold for tested code

#### Scenario: Expanding test coverage
Given new tools are added to the project
When a developer adds tests for the new tool
Then the tests follow existing patterns
And the tests are added incrementally
And the project maintains overall quality
