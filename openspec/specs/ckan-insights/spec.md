# ckan-insights Specification

## Purpose
Describe dataset insight tools (relevance, freshness, structure) once implemented.
## Requirements
### Requirement: Insights capability reserved
The system SHALL maintain this specification to document dataset insight tools when they are added.

#### Scenario: Insight tools documented
- **WHEN** new insight tools are implemented
- **THEN** their requirements are captured in this specification

### Requirement: Find relevant datasets
The system SHALL provide a `ckan_find_relevant_datasets` tool that accepts `server_url`, `query`, `limit`, and optional weights for title, notes, tags, and organization, and returns the top N datasets ranked by score with a per-field score breakdown.

#### Scenario: Ranked results returned
- **WHEN** the tool is invoked with a query and limit
- **THEN** the system uses `package_search` results to return the top N datasets with numeric scores and field contributions

