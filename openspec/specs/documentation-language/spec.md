# documentation-language Specification

## Purpose
TBD - created by archiving change translate-project-to-english. Update Purpose after archive.
## Requirements
### Requirement: Project documentation in English

The project SHALL provide all user-facing documentation in English to ensure accessibility for the international open data community.

#### Scenario: English documentation
Given a CKAN MCP Server project
When a user reads the documentation
Then the documentation is in English
And code examples are in English
And technical terms follow CKAN API terminology

### Requirement: Preserve multilingual examples

The project SHALL preserve non-English portal names, organization titles, or data values in their original language to accurately reflect real-world CKAN portals.

#### Scenario: Italian portal example
Given an example using dati.gov.it
When the example references Italian organizations
Then organization names remain in Italian (e.g., "Regione Siciliana")
And descriptions are in English

#### Scenario: Non-English data values
Given an example query with data filters
When the data contains non-English values
Then those values are preserved in their original language
And the surrounding documentation explains the context in English

