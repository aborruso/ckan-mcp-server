# Tasks: Translate Project to English

Ordered list of work items to translate the project documentation to English.

## Phase 1: Preparation

- [x] Create backup copies of README.md and EXAMPLES.md
- [x] Review CKAN API documentation for standard English terminology
- [x] Identify technical terms requiring precise translation (e.g., "DataStore", "facet", "Solr")
- [x] Note any Italy-specific context to preserve (e.g., portal names, organization titles)

## Phase 2: Translate README.md

- [x] Translate header and project description (lines 1-4)
- [x] Translate features section (lines 5-13)
- [x] Translate installation instructions (lines 15-26)
- [x] Translate usage section (lines 28-42)
- [x] Translate Claude Desktop configuration (lines 44-61)
- [x] Translate available tools section (lines 63-83)
- [x] Translate usage examples (lines 85-140)
- [x] Translate supported CKAN portals section (lines 142-152)
- [x] Translate advanced Solr queries section (lines 154-181)
- [x] Translate project structure section (lines 183-194)
- [x] Translate development section (lines 196-221)
- [x] Translate troubleshooting section (lines 223-252)
- [x] Translate contributing section (lines 254-262)
- [x] Translate license and useful links sections (lines 264-274)
- [x] Translate support section and footer (lines 276-285)
- [x] Verify all links remain functional
- [x] Check markdown formatting consistency

## Phase 3: Translate EXAMPLES.md

- [x] Translate header and introduction (lines 1-4)
- [x] Translate connection tests section (lines 5-21)
- [x] Translate Italy examples header (line 23)
- [x] Translate recent datasets example (lines 25-33)
- [x] Translate COVID-19 datasets example (lines 35-42)
- [x] Translate Regione Siciliana datasets example (lines 44-52)
- [x] Translate organization search examples (lines 54-73)
- [x] Translate wildcard organization search example (lines 75-85)
- [x] Translate organization statistics examples (lines 87-95)
- [x] Translate format statistics example (lines 97-105)
- [x] Translate organization list example (lines 107-115)
- [x] Translate organization details example (lines 117-124)
- [x] Translate CSV datasets example (lines 126-133)
- [x] Translate USA examples header (line 135)
- [x] Translate government datasets example (lines 137-144)
- [x] Translate tag-based datasets example (lines 146-153)
- [x] Translate demo CKAN examples (lines 155-178)
- [x] Translate DataStore queries header (line 180)
- [x] Translate basic DataStore query example (lines 182-189)
- [x] Translate filtered DataStore query example (lines 191-201)
- [x] Translate sorted DataStore query example (lines 203-211)
- [x] Translate advanced Solr queries header (line 213)
- [x] Translate AND combination example (lines 215-222)
- [x] Translate OR combination example (lines 224-231)
- [x] Translate NOT exclusion example (lines 233-240)
- [x] Translate title search example (lines 242-249)
- [x] Translate description search example (lines 251-258)
- [x] Translate wildcard search example (lines 260-267)
- [x] Translate date range filter example (lines 269-276)
- [x] Translate recent datasets example (lines 278-286)
- [x] Translate complete workflows header (line 288)
- [x] Translate workflow 1: regional dataset analysis (lines 290-314)
- [x] Translate workflow 2: monitoring new publications (lines 316-334)
- [x] Translate workflow 3: data coverage analysis (lines 336-370)
- [x] Translate workflow 4: thematic search (lines 372-401)
- [x] Translate output formats section (lines 403-418)
- [x] Translate notes section (lines 420-427)
- [x] Verify all code examples unchanged
- [x] Check markdown formatting consistency

## Phase 4: Review and Validation

- [x] Proofread README.md for English grammar and flow
- [x] Proofread EXAMPLES.md for English grammar and flow
- [x] Verify technical terminology matches CKAN API docs
- [x] Check all tool names are consistent with code
- [x] Ensure all URLs remain correct
- [x] Validate markdown syntax using a linter or manual check
- [x] Test all code examples for syntax errors
- [x] Confirm no Italian text remains in translated sections
- [x] Verify formatting, spacing, and indentation preserved
- [x] Check section headings follow markdown conventions

## Phase 5: Documentation Updates

- [x] Update README.md to reflect English-only documentation
- [x] Update any references to Italian docs in project files
- [x] Update project.md if it references language conventions
- [x] Verify package.json metadata remains accurate
- [x] Add note about translation history if appropriate

## Phase 6: Final Verification

- [x] Run `openspec validate translate-project-to-english --strict`
- [x] Resolve all validation errors
- [x] Final review of translated files
- [x] Prepare commit message (concise, following project conventions)

## Dependencies

- All tasks in Phase 2 and Phase 3 can be done in parallel after Phase 1
- Phase 4 depends on completion of Phase 2 and Phase 3
- Phase 5 depends on completion of Phase 4
- Phase 6 is final verification, depends on all previous phases

## Notes

- Preserve all Italian proper nouns (Regione Siciliana, Autorità Idrica Toscana, etc.)
- Keep all code examples and function names in English
- Maintain existing markdown structure and formatting
- Use standard English technical documentation style
- Refer to CKAN API docs (https://docs.ckan.org/en/latest/api/) for terminology
