# Proposal: Translate Project to English

**Status:** Completed
**Created:** 2026-01-08
**Author:** OpenCode
**Archived:** 2026-01-08 (as expand-test-coverage-specs)

## Summary

Translate the CKAN MCP Server project documentation from Italian to English to improve accessibility and align with international open data standards.

## Motivation

The CKAN MCP Server project is currently documented in Italian, which limits its accessibility to the global open data community. Since:
- CKAN is an international platform used by 500+ portals worldwide
- The MCP protocol and most technical documentation are in English
- The target audience (data scientists, developers, researchers) is primarily English-speaking
- The source code comments are already in English

Translating the documentation will:
- Lower adoption barriers for international users
- Improve discoverability through search engines
- Align with CKAN's global community
- Maintain consistency with the already-English codebase

## Scope

### Included
- **README.md**: Main project documentation (285 lines)
- **EXAMPLES.md**: Usage examples and workflows (427 lines)

### Excluded
- Source code files (already in English)
- SKILL.md (English skill documentation)
- AGENTS.md, LOG.md, other internal docs
- Package metadata (package.json, package-lock.json)
- API/tool names (already English)
- User-facing tool outputs (already English)

## Proposed Changes

### Files to Translate

1. **README.md**
   - Project description and features
   - Installation and usage instructions
   - Tool descriptions and examples
   - Troubleshooting guide
   - Links and support section

2. **EXAMPLES.md**
   - Connection tests
   - Italy-specific examples (dati.gov.it)
   - USA examples (data.gov)
   - Demo CKAN examples
   - DataStore queries
   - Advanced Solr queries
   - Complete workflows

### Translation Approach

- Direct translation maintaining technical accuracy
- Preserve all code examples (already in English)
- Keep Italian portal names, organization titles, and data values in Italian (e.g., "Regione Siciliana")
- Maintain structure and formatting
- Use official CKAN terminology (DataStore, faceting, Solr)
- Use ISO format for dates
- Keep current examples (Italy, USA, demo.ckan.org)

## Alternatives Considered

1. **Bilingual documentation**: Keep Italian and add English sections
   - *Rejected*: Increases maintenance burden, creates version drift issues

2. **Auto-translation tools only**: Use machine translation without review
   - *Rejected*: Quality concerns, potential technical errors

3. **No translation**: Keep Italian only
   - *Rejected*: Limits project adoption and community growth

## Impact Assessment

### Benefits
- + Improved accessibility for international users
- + Better alignment with CKAN global community
- + Consistent language across code and documentation
- + Easier onboarding for new contributors

### Risks
- - Loss of Italy-specific context in translation
- - Possible translation errors in technical terms
- - Need to maintain English for future updates

### Mitigation
- Review all technical translations against CKAN API documentation
- Keep Italian portal names and organization titles in Italian
- Use official CKAN terminology for technical terms

## Open Questions

None - clarified with project owner.

## Dependencies

None - this is a documentation-only change with no code modifications.

## Success Criteria

- [ ] README.md fully translated to English
- [ ] EXAMPLES.md fully translated to English
- [ ] All technical terms accurate and consistent with CKAN API docs
- [ ] Code examples unchanged
- [ ] Markdown formatting preserved
- [ ] No broken links or references
- [ ] Validation: `openspec validate translate-project-to-english --strict` passes
