<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Important**: This project uses **English** as its primary language. All documentation, code comments, and commit messages should be in English.

## Project Overview

CKAN MCP Server - MCP (Model Context Protocol) server for interacting with CKAN-based open data portals (dati.gov.it, data.gov, demo.ckan.org, etc.).

The server exposes MCP tools for:
- Advanced dataset search with Solr syntax
- DataStore queries for tabular data analysis
- Organization and group exploration
- Complete metadata access

## Build and Development

### Main Commands

```bash
# Build project (uses esbuild - fast and lightweight)
npm run build

# Start server in stdio mode (default for local integration)
npm start

# Start server in HTTP mode (for remote access)
TRANSPORT=http PORT=3000 npm start

# Watch mode for development
npm run watch

# Build + run
npm run dev
```

### Build System

The project uses **esbuild** for compilation instead of tsc to ensure:
- Ultra-fast builds (milliseconds instead of minutes)
- Minimal memory usage (important in WSL environments)
- Automatic bundling with tree-shaking

The `build:tsc` script is available as a fallback but can cause memory issues in some environments (particularly WSL). Always use `npm run build` which uses esbuild.

The esbuild build bundles all internal modules but keeps external dependencies (`@modelcontextprotocol/sdk`, `axios`, `express`, `zod`) as external, so they must be present in `node_modules`.

## Architecture

### Code Structure

The server is implemented with a modular structure to improve maintainability and testability:

```
src/
├── index.ts              # Entry point (39 lines)
├── server.ts             # MCP server setup (12 lines)
├── types.ts              # Types & schemas (16 lines)
├── utils/
│   ├── http.ts           # CKAN API client (51 lines)
│   └── formatting.ts     # Output formatting (37 lines)
├── tools/
│   ├── package.ts        # Package tools (350 lines)
│   ├── organization.ts   # Organization tools (341 lines)
│   ├── datastore.ts      # DataStore tools (146 lines)
│   └── status.ts         # Status tools (66 lines)
└── transport/
    ├── stdio.ts          # Stdio transport (12 lines)
    └── http.ts           # HTTP transport (27 lines)
```

**Total**: 1097 lines (modularized from single file of 1021 lines)

The server (`src/index.ts`):

1. **Entry Point** (`index.ts`)
   - Imports and registers all tools
   - Chooses transport (stdio/http) from environment variable
   - Handles startup and error handling

2. **Registered Tools** (in separate modules)
   - `tools/package.ts`: `ckan_package_search`, `ckan_package_show`
   - `tools/organization.ts`: `ckan_organization_list`, `ckan_organization_show`, `ckan_organization_search`
   - `tools/datastore.ts`: `ckan_datastore_search`
   - `tools/status.ts`: `ckan_status_show`

3. **Utility Functions** (`utils/`)
   - `http.ts`: `makeCkanRequest<T>()` - HTTP client for CKAN API v3
   - `formatting.ts`: `truncateText()`, `formatDate()`, `formatBytes()`

4. **Type Definitions** (`types.ts`)
   - `ResponseFormat` enum (MARKDOWN, JSON)
   - `ResponseFormatSchema` Zod validator
   - `CHARACTER_LIMIT` constant

5. **Transport Layer** (`transport/`)
   - `stdio.ts`: Standard input/output (Claude Desktop)
   - `http.ts`: HTTP server (remote access)

6. **Validation Schema**
   - Uses Zod to validate all tool inputs
   - Each tool has a strict schema that rejects extra parameters

7. **Output Formatting**
   - All tools support two formats: `markdown` (default) and `json`
   - Markdown format optimized for human readability
   - JSON format for programmatic processing

### Transport Modes

The server automatically selects the transport mode based on the `TRANSPORT` environment variable:

- **stdio** (default): for integration with Claude Desktop and other local MCP clients
- **http**: exposes POST `/mcp` endpoint on configurable port (default 3000)

### CKAN API Integration

The server uses CKAN API v3 available on any CKAN portal. All requests:

- Use `axios` with 30 second timeout
- Send User-Agent `CKAN-MCP-Server/1.0`
- Handle HTTP errors, timeouts, and server not found
- Normalize server URL (removing trailing slash)
- Validate that `response.success === true`

### Solr Queries

CKAN uses Apache Solr for search. The `ckan_package_search` tool supports:

- **q** (query): complete Solr syntax (field:value, AND/OR/NOT, wildcard, range)
- **fq** (filter query): additional filters without affecting score
- **facet_field**: aggregations for statistical analysis
- **sort**: result ordering
- **start/rows**: pagination

Common query examples are documented in `EXAMPLES.md`.

## TypeScript Configuration

The project uses ES2022 as target and module system.

**Note**: `tsconfig.json` is present mainly for editor support (IDE, LSP). The actual compilation uses esbuild which ignores most TypeScript options to maximize speed.

TypeScript configuration (for IDE):
- Output in `dist/` directory
- Strict mode enabled
- Strict type checking with noUnusedLocals, noUnusedParameters, noImplicitReturns
- Skip lib check to reduce overhead
- Declaration and source map disabled

## Dependencies

**Runtime**:
- `@modelcontextprotocol/sdk` - Official MCP SDK
- `axios` - HTTP client for CKAN API
- `zod` - Schema validation
- `express` - HTTP server (only for http mode)

**Dev**:
- `esbuild` - Build tool (bundler and compiler)
- `typescript` - Only for type checking and editor support
- `@types/node`, `@types/express` - Type definitions

## Supported CKAN Portals

The server can connect to any CKAN instance. Some main portals:

- 🇮🇹 https://dati.gov.it (Italy)
- 🇺🇸 https://catalog.data.gov (United States)
- 🇨🇦 https://open.canada.ca/data (Canada)
- 🇬🇧 https://data.gov.uk (United Kingdom)
- 🇪🇺 https://data.europa.eu (European Union)
- 🌍 https://demo.ckan.org (Official CKAN Demo)

Each portal may have different configurations for:
- DataStore availability
- Custom dataset fields
- Available organizations and tags
- Supported resource formats


The project uses **Vitest** for automated testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Test coverage target is 80%. Current test suite includes:
- Unit tests for utility functions (formatting, HTTP)
- Integration tests for MCP tools with mocked CKAN API responses
- Mock fixtures for CKAN API success and error scenarios

See `tests/README.md` for detailed testing guidelines and fixture structure.

### Manual Testing

For manual testing:

```bash
# Build project
npm run build

# Test stdio mode
npm start
# (Server will wait for MCP commands on stdin)

# Test HTTP mode in a terminal
TRANSPORT=http PORT=3000 npm start

# In another terminal, test with curl
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d {"jsonrpc":"2.0","method":"tools/list","id":1}
```

To test with Claude Desktop, add MCP configuration to config file.
To test with Claude Desktop, add the MCP configuration to the config file.

## Note di Sviluppo

### Refactoring 2026-01-08
Il codebase è stato refactorizzato da un singolo file di 1021 righe a 11 moduli. Vedi `REFACTORING.md` per dettagli.

**Vantaggi**:
- File più piccoli (max 350 righe)
- Modifiche localizzate e sicure
- Testing isolato possibile
- Manutenzione semplificata
- Zero breaking changes

### To Do
- Non ci sono test automatizzati - considerare di aggiungerli per tool critici
- Il limite di 50000 caratteri per l'output è hardcoded in `types.ts` - potrebbe essere configurabile
- Formato date usa locale 'it-IT' in `utils/formatting.ts` - potrebbe essere parametrizzato
- Il server supporta solo lettura (tutti i tool sono read-only, non modificano dati su CKAN)
- Non c'è caching - ogni richiesta fa una chiamata HTTP fresca alle API CKAN
- Non c'è autenticazione - usa solo endpoint pubblici CKAN

### Adding New Tools
1. Crea nuovo file in `src/tools/`
2. Esporta `registerXxxTools(server: McpServer)`
3. Importa e chiama in `src/index.ts`
4. Build e test
