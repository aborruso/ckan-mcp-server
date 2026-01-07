# LOG

## 2026-01-07

- Initial release
- MCP server for CKAN open data portals
- 6 tools: package_search, package_show, organization_list, organization_show, datastore_search, status_show
- Build system: esbuild (ultra-fast, 4ms build)
- Fixed TypeScript memory issues by switching from tsc to esbuild
- Corrected dati.gov.it URL to https://www.dati.gov.it/opendata
- Created CLAUDE.md for repository guidance
- Tested successfully with dati.gov.it (4178 datasets on "popolazione" query)
