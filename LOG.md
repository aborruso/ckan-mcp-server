# LOG

## 2026-01-08

### Version 0.2.0 🎉
- **Test Suite**: Added comprehensive automated testing infrastructure
  - **79 tests total**: 100% passing
  - **Unit tests** (25): formatting utilities, HTTP client
  - **Integration tests** (54): all 7 CKAN API tools
  - **Coverage**: vitest with v8 coverage support
  - Test fixtures for all CKAN endpoints + error scenarios
  - Scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`
- **Documentation**: Translated to English
  - README.md: comprehensive project overview
  - EXAMPLES.md: detailed usage patterns
  - CLAUDE.md: AI assistant instructions
- **OpenSpec**: Added change proposals
  - Test suite implementation proposal
  - Documentation translation spec

## 2026-01-08 (earlier)

### Code Refactoring ✨
- **Major refactoring**: Ristrutturato codebase da file monolitico a struttura modulare
  - **Before**: 1 file (`src/index.ts`) - 1021 righe
  - **After**: 11 moduli organizzati - 1097 righe totali
  - **Structure**:
    ```
    src/
    ├── index.ts (39)         # Entry point
    ├── server.ts (12)        # MCP server config
    ├── types.ts (16)         # Types & schemas
    ├── utils/                # Utilities (88 lines)
    │   ├── http.ts           # CKAN API client
    │   └── formatting.ts     # Output formatting
    ├── tools/                # Tool handlers (903 lines)
    │   ├── package.ts        # 2 tools
    │   ├── organization.ts   # 3 tools
    │   ├── datastore.ts      # 1 tool
    │   └── status.ts         # 1 tool
    └── transport/            # Transports (39 lines)
        ├── stdio.ts
        └── http.ts
    ```
  - **Benefits**:
    - File più piccoli (max 350 righe vs 1021)
    - Modifiche localizzate e sicure
    - Testing isolato possibile
    - Manutenzione semplificata
    - Zero breaking changes
  - **Performance**: Build time 16ms, bundle 33KB (invariato)
  - **Testing**: ✅ Tutti i 7 tool funzionanti

### Documentation Updates 📚
- Created `REFACTORING.md` - Documentazione completa del refactoring
- Updated `CLAUDE.md` - Aggiornato con nuova struttura modulare
- Updated `PRD.md` - Aggiunto requisito npm publication
  - Goal: Installazione semplice come PyPI in Python
  - `npm install -g ckan-mcp-server`
  - `npx ckan-mcp-server`

### Testing 🧪
- **Comprehensive testing** su https://www.dati.gov.it/opendata
  - ✅ Server status: CKAN 2.10.3, 66,937 datasets
  - ✅ COVID search: 90 datasets trovati
  - ✅ Organization search: Regione Toscana (10,988 datasets)
  - ✅ Faceting statistics: Top orgs, formats, tags
  - ✅ Dataset details: Vaccini COVID-19 2024 (Puglia)
  - Response times: 3-5 secondi (network + CKAN API)
  - All 7 tools working perfectly

### Status: Production Ready 🚀
- Code refactored and modular
- Fully tested and functional
- Documentation complete
- Ready for npm publication

## 2026-01-07

- **Nuovo tool**: `ckan_organization_search` - ricerca organizzazioni per pattern nome
  - Input semplice: solo `pattern` (wildcard automatici)
  - Output: solo organizzazioni matchate (zero dataset scaricati)
  - Efficiente: filtraggio lato server, risparmio token
  - Esempio: pattern "toscana" → 2 org, 11K dataset totali
- Initial release
- MCP server for CKAN open data portals
- 7 tools: package_search, package_show, organization_list, organization_show, organization_search, datastore_search, status_show
- Build system: esbuild (ultra-fast, 47ms build)
- Fixed TypeScript memory issues by switching from tsc to esbuild
- Corrected dati.gov.it URL to https://www.dati.gov.it/opendata
- Created CLAUDE.md for repository guidance
- Tested successfully with dati.gov.it (4178 datasets on "popolazione" query)
