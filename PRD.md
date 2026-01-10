# Product Requirements Document (PRD)

## CKAN MCP Server

**Version**: 1.0.0  
**Last Updated**: 2026-01-08  
**Author**: onData  
**Status**: Implemented

---

## 1. Executive Summary

CKAN MCP Server è un server Model Context Protocol (MCP) che permette a AI agent (come Claude Desktop) di interagire con oltre 500 portali di dati aperti basati su CKAN in tutto il mondo. Il server espone strumenti MCP per ricercare dataset, esplorare organizzazioni, interrogare dati tabulari e accedere a metadati completi.

### 1.1 Problem Statement

Gli AI agent non hanno un modo nativo per:
- Scoprire e cercare dataset negli open data portal
- Interrogare metadati strutturati di dataset governativi
- Eseguire query su dati tabulari pubblicati su portali CKAN
- Esplorare organizzazioni pubbliche e la loro produzione di dati aperti

### 1.2 Solution

Un server MCP che espone tool per interagire con le API CKAN v3, permettendo agli AI agent di:
- Cercare dataset con query Solr avanzate
- Ottenere metadati completi di dataset e risorse
- Esplorare organizzazioni e gruppi
- Interrogare il DataStore con filtri e sorting
- Analizzare statistiche tramite faceting

**Distribution Strategy**: Pubblicazione su npm registry per installazione semplice e universale (come PyPI per Python), permettendo a chiunque di installare il server con un singolo comando senza bisogno di clonare repository o compilare codice.

---

## 2. Target Audience

### 2.1 Primary Users

- **Data Scientist & Analyst**: Ricerca e analisi di dataset pubblici
- **Civic Hacker & Developer**: Sviluppo applicazioni su dati aperti
- **Researcher & Journalist**: Investigazione e analisi dati governativi
- **Public Administration**: Esplorazione cataloghi dati aperti

### 2.2 AI Agent Use Cases

- **Claude Desktop**: Integrazione nativa tramite configurazione MCP
- **Altri client MCP**: Qualsiasi client compatibile con MCP protocol
- **Automazioni**: Script e workflow che necessitano accesso a CKAN

---

## 3. Core Requirements

### 3.1 Functional Requirements

#### FR-1: Dataset Search
- **Priority**: High
- **Description**: Cercare dataset su qualsiasi server CKAN usando sintassi Solr
- **Acceptance Criteria**:
  - Supporto query full-text (q parameter)
  - Filtri avanzati (fq parameter)
  - Faceting per statistiche (organization, tags, formats)
  - Paginazione (start/rows)
  - Ordinamento (sort parameter)
  - Output in formato Markdown o JSON
- **Implementation Status**: ✅ Implemented (`ckan_package_search`)

#### FR-2: Dataset Details
- **Priority**: High
- **Description**: Ottenere metadati completi di un dataset specifico
- **Acceptance Criteria**:
  - Ricerca per ID o name
  - Metadati base (title, description, author, license)
  - Lista risorse con dettagli (format, size, URL, DataStore status)
  - Organizzazione e tag
  - Campi extra custom
  - Tracking statistics opzionale
- **Implementation Status**: ✅ Implemented (`ckan_package_show`)

#### FR-3: Organization Discovery
- **Priority**: Medium
- **Description**: Esplorare organizzazioni che pubblicano dataset
- **Acceptance Criteria**:
  - Lista tutte le organizzazioni (con/senza dettagli completi)
  - Ricerca per pattern nel nome
  - Ordinamento e paginazione
  - Conteggio dataset per organizzazione
  - Dettagli completi organizzazione con lista dataset
- **Implementation Status**: ✅ Implemented (`ckan_organization_list`, `ckan_organization_show`, `ckan_organization_search`)

#### FR-4: DataStore Query
- **Priority**: Medium
- **Description**: Interrogare dati tabulari nel CKAN DataStore
- **Acceptance Criteria**:
  - Query per resource_id
  - Filtri chiave-valore
  - Full-text search (q parameter)
  - Ordinamento
  - Selezione campi specifici
  - Paginazione (limit/offset)
  - Valori distinct
- **Implementation Status**: ✅ Implemented (`ckan_datastore_search`)

#### FR-5: Server Status Check
- **Priority**: Low
- **Description**: Verificare disponibilità e versione di un server CKAN
- **Acceptance Criteria**:
  - Verifica connessione server
  - Informazioni versione CKAN
  - Site title e URL
- **Implementation Status**: ✅ Implemented (`ckan_status_show`)

#### FR-6: Package List
- **Priority**: Low
- **Description**: Lista semplice di tutti i dataset (solo nomi)
- **Acceptance Criteria**:
  - Lista nomi dataset
  - Paginazione
- **Implementation Status**: ❌ Not implemented (menzionato nel README ma non presente nel codice)

### 3.2 Non-Functional Requirements

#### NFR-1: Performance
- **Response Time**: Timeout HTTP a 30 secondi
- **Throughput**: Limitato dalle API CKAN del server remoto
- **Scalability**: Stateless, può gestire richieste multiple in parallelo

#### NFR-2: Reliability
- **Error Handling**: 
  - Gestione errori HTTP (404, 500, timeout)
  - Validazione input con Zod strict schemas
  - Messaggi errore descrittivi
- **Availability**: Dipende dalla disponibilità dei server CKAN remoti

#### NFR-3: Usability
- **Output Format**: 
  - Markdown per leggibilità umana (default)
  - JSON per elaborazione programmatica
- **Character Limit**: Troncamento automatico a 50.000 caratteri
- **Documentation**: README completo con esempi

#### NFR-4: Compatibility
- **CKAN Versions**: API v3 (compatibile con CKAN 2.x e 3.x)
- **Node.js**: Richiede Node.js >= 18.0.0
- **Transport Modes**: 
  - stdio (default) per integrazione locale
  - HTTP per accesso remoto

#### NFR-5: Security
- **Authentication**: Non supportata (solo endpoint pubblici)
- **Read-Only**: Tutti i tool sono read-only, nessuna modifica ai dati
- **Input Validation**: Strict schema validation con Zod

---

## 4. Technical Architecture

### 4.1 Technology Stack

**Runtime**:
- Node.js >= 18.0.0
- TypeScript (ES2022)

**Dependencies**:
- `@modelcontextprotocol/sdk@^1.0.4` - MCP protocol implementation
- `axios@^1.7.2` - HTTP client
- `zod@^3.23.8` - Schema validation
- `express@^4.19.2` - HTTP server (modalità HTTP)

**Build Tools**:
- `esbuild@^0.27.2` - Bundler ultra-veloce (~4ms)
- `typescript@^5.4.5` - Type checking e editor support

### 4.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  MCP Client                         │
│              (Claude Desktop, etc.)                 │
└─────────────┬───────────────────────────────────────┘
              │
              │ MCP Protocol (stdio or HTTP)
              │
┌─────────────▼───────────────────────────────────────┐
│              CKAN MCP Server                        │
│  ┌───────────────────────────────────────────────┐  │
│  │  MCP Tool Registry                            │  │
│  │  - ckan_package_search                        │  │
│  │  - ckan_package_show                          │  │
│  │  - ckan_organization_list/show/search         │  │
│  │  - ckan_datastore_search                      │  │
│  │  - ckan_status_show                           │  │
│  └───────────┬───────────────────────────────────┘  │
│              │                                       │
│  ┌───────────▼───────────────────────────────────┐  │
│  │  HTTP Client (axios)                          │  │
│  │  - Timeout: 30s                               │  │
│  │  - User-Agent: CKAN-MCP-Server/1.0            │  │
│  └───────────┬───────────────────────────────────┘  │
└──────────────┼───────────────────────────────────────┘
               │
               │ HTTPS
               │
┌──────────────▼───────────────────────────────────────┐
│           CKAN Servers (worldwide)                   │
│  - dati.gov.it (IT)                                  │
│  - data.gov (US)                                     │
│  - open.canada.ca (CA)                               │
│  - data.gov.uk (UK)                                  │
│  - data.europa.eu (EU)                               │
│  - 500+ altri portali CKAN                           │
└──────────────────────────────────────────────────────┘
```

### 4.3 Component Description

#### MCP Tool Registry
Registra i tool MCP disponibili con:
- Input schema (Zod validation)
- Output format (Markdown/JSON)
- MCP annotations (readonly, idempotent, etc.)
- Handler function

#### HTTP Client Layer
- Normalizza URL server (rimuove trailing slash)
- Costruisce endpoint API: `{server_url}/api/3/action/{action}`
- Gestisce timeout e errori
- Valida response (`success: true`)

#### Output Formatter
- Markdown: Tabelle, sezioni, formatting per leggibilità
- JSON: Structured output con `structuredContent`
- Truncation: Limita output a CHARACTER_LIMIT (50000)

---

## 5. MCP Tools Specification

### 5.1 ckan_package_search

**Purpose**: Ricerca dataset con query Solr avanzate

**Input Parameters**:
```typescript
{
  server_url: string (required)      // Base URL server CKAN
  q: string (default: "*:*")         // Query Solr
  fq?: string                         // Filter query
  rows: number (default: 10)          // Risultati per pagina (max 1000)
  start: number (default: 0)          // Offset paginazione
  sort?: string                       // Es: "metadata_modified desc"
  facet_field?: string[]              // Campi per faceting
  facet_limit: number (default: 50)   // Max valori per facet
  include_drafts: boolean (default: false)
  response_format: "markdown" | "json" (default: "markdown")
}
```

**Output**:
- Conteggio totale risultati
- Array di dataset con metadati base
- Facets (se richiesti)
- Link paginazione

**Solr Query Examples**:
- `q: "popolazione"` - Full-text search
- `q: "title:covid"` - Search in field
- `q: "tags:sanità"` - Tag filter
- `fq: "organization:comune-palermo"` - Organization filter
- `fq: "res_format:CSV"` - Resource format filter

### 5.2 ckan_package_show

**Purpose**: Dettagli completi di un dataset

**Input Parameters**:
```typescript
{
  server_url: string (required)
  id: string (required)               // Dataset ID o name
  include_tracking: boolean (default: false)
  response_format: "markdown" | "json"
}
```

**Output**:
- Metadati completi (title, description, author, license)
- Organizzazione
- Tags e gruppi
- Lista risorse con dettagli (format, size, URL, DataStore status)
- Extra fields custom

### 5.3 ckan_organization_list

**Purpose**: Lista organizzazioni

**Input Parameters**:
```typescript
{
  server_url: string (required)
  all_fields: boolean (default: false)
  sort: string (default: "name asc")
  limit: number (default: 100)        // 0 per solo count
  offset: number (default: 0)
  response_format: "markdown" | "json"
}
```

**Output**:
- Array di organizzazioni (nomi o oggetti completi)
- Se `limit=0`: conteggio organizzazioni con dataset

### 5.4 ckan_organization_show

**Purpose**: Dettagli organizzazione specifica

**Input Parameters**:
```typescript
{
  server_url: string (required)
  id: string (required)               // Organization ID o name
  include_datasets: boolean (default: true)
  include_users: boolean (default: false)
  response_format: "markdown" | "json"
}
```

**Output**:
- Dettagli organizzazione
- Lista dataset (opzionale)
- Lista utenti con ruoli (opzionale)

### 5.5 ckan_organization_search

**Purpose**: Ricerca organizzazioni per pattern

**Input Parameters**:
```typescript
{
  server_url: string (required)
  pattern: string (required)          // Pattern (wildcards automatici)
  response_format: "markdown" | "json"
}
```

**Output**:
- Lista organizzazioni matchanti
- Conteggio dataset per organizzazione
- Totale dataset

**Implementation**: Usa `package_search` con `organization:*{pattern}*` e faceting

### 5.6 ckan_datastore_search

**Purpose**: Query dati tabulari nel DataStore

**Input Parameters**:
```typescript
{
  server_url: string (required)
  resource_id: string (required)
  q?: string                          // Full-text search
  filters?: Record<string, any>       // Filtri chiave-valore
  limit: number (default: 100)        // Max 32000
  offset: number (default: 0)
  fields?: string[]                   // Campi da restituire
  sort?: string                       // Es: "anno desc"
  distinct: boolean (default: false)
  response_format: "markdown" | "json"
}
```

**Output**:
- Total records count
- Fields metadata (type, id)
- Records (max 50 in markdown per leggibilità)
- Paginazione info

**Limitations**:
- Non tutte le risorse hanno DataStore attivo
- Max 32000 record per query

### 5.7 ckan_status_show

**Purpose**: Verifica stato server CKAN

**Input Parameters**:
```typescript
{
  server_url: string (required)
}
```

**Output**:
- Online status
- CKAN version
- Site title
- Site URL

---

## 6. Supported CKAN Portals

Il server può connettersi a **qualsiasi server CKAN pubblico**. Principali portali:

| Country | Portal | URL |
|---------|--------|-----|
| 🇮🇹 Italia | Portale Nazionale Dati Aperti | https://www.dati.gov.it/opendata |
| 🇺🇸 USA | Data.gov | https://catalog.data.gov |
| 🇨🇦 Canada | Open Government | https://open.canada.ca/data |
| 🇬🇧 UK | Data.gov.uk | https://data.gov.uk |
| 🇪🇺 EU | European Data Portal | https://data.europa.eu |
| 🌍 Demo | CKAN Official Demo | https://demo.ckan.org |

**Compatibilità**:
- CKAN API v3 (CKAN 2.x e 3.x)
- Oltre 500 portali nel mondo

---

## 7. Installation & Deployment

### 7.1 Prerequisites

- Node.js >= 18.0.0
- npm o yarn

### 7.2 Installation

#### Option 1: npm Package (Recommended - PLANNED)

**Global Installation**:
```bash
npm install -g ckan-mcp-server
```

**Local Installation**:
```bash
npm install ckan-mcp-server
```

**npx (No Installation)**:
```bash
npx ckan-mcp-server
```

> **Note**: La pubblicazione su npm registry è pianificata per permettere installazione semplice come PyPI in Python. Attualmente richiede installazione da repository.

#### Option 2: From Source (Current)

```bash
git clone https://github.com/ondata/ckan-mcp-server
cd ckan-mcp-server
npm install
npm run build
```

### 7.3 Usage Modes

#### stdio Mode (Default)
Per integrazione con Claude Desktop e altri client MCP locali:

```bash
npm start
```

**Claude Desktop Configuration** (`claude_desktop_config.json`):

*After npm publication*:
```json
{
  "mcpServers": {
    "ckan": {
      "command": "npx",
      "args": ["ckan-mcp-server"]
    }
  }
}
```

*Current (from source)*:
```json
{
  "mcpServers": {
    "ckan": {
      "command": "node",
      "args": ["/path/to/ckan-mcp-server/dist/index.js"]
    }
  }
}
```

#### HTTP Mode
Per accesso remoto via HTTP:

```bash
TRANSPORT=http PORT=3000 npm start
```

Server disponibile su: `http://localhost:3000/mcp`

**Test HTTP endpoint**:
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### 7.4 Build System

Il progetto usa **esbuild** (non tsc) per:
- Build ultra-veloce (~4ms vs minuti con tsc)
- Minimo utilizzo memoria (importante in WSL)
- Bundle automatico con tree-shaking

```bash
npm run build        # Build con esbuild
npm run watch        # Watch mode
npm run dev          # Build + run
```

---

## 8. Use Cases & Examples

### 8.1 Use Case 1: Dataset Discovery

**Scenario**: Un data scientist cerca dataset su popolazione italiana

```typescript
// Step 1: Cerca dataset
ckan_package_search({
  server_url: "https://www.dati.gov.it/opendata",
  q: "popolazione",
  rows: 20,
  sort: "metadata_modified desc"
})

// Step 2: Ottieni dettagli dataset interessante
ckan_package_show({
  server_url: "https://www.dati.gov.it/opendata",
  id: "popolazione-residente-2023"
})
```

### 8.2 Use Case 2: Organization Analysis

**Scenario**: Analizzare la produzione di dati aperti regionali

```typescript
// Step 1: Cerca organizzazioni regionali
ckan_organization_search({
  server_url: "https://www.dati.gov.it/opendata",
  pattern: "regione"
})

// Step 2: Analizza dataset di una regione
ckan_organization_show({
  server_url: "https://www.dati.gov.it/opendata",
  id: "regione-siciliana",
  include_datasets: true
})

// Step 3: Cerca dataset specifici dell'organizzazione
ckan_package_search({
  server_url: "https://www.dati.gov.it/opendata",
  fq: "organization:regione-siciliana",
  facet_field: ["tags", "res_format"],
  rows: 50
})
```

### 8.3 Use Case 3: Data Analysis with DataStore

**Scenario**: Analizzare dati tabulari COVID-19

```typescript
// Step 1: Cerca dataset COVID
ckan_package_search({
  server_url: "https://www.dati.gov.it/opendata",
  q: "covid",
  fq: "res_format:CSV"
})

// Step 2: Ottieni dettagli e resource_id
ckan_package_show({
  server_url: "https://www.dati.gov.it/opendata",
  id: "covid-19-italia"
})

// Step 3: Query DataStore
ckan_datastore_search({
  server_url: "https://www.dati.gov.it/opendata",
  resource_id: "abc-123-def",
  filters: { "regione": "Sicilia" },
  sort: "data desc",
  limit: 100
})
```

### 8.4 Use Case 4: Statistical Analysis with Faceting

**Scenario**: Analizzare distribuzione dataset per formato e organizzazione

```typescript
// Statistiche formati
ckan_package_search({
  server_url: "https://www.dati.gov.it/opendata",
  facet_field: ["res_format"],
  facet_limit: 100,
  rows: 0  // Solo facets, no results
})

// Statistiche organizzazioni
ckan_package_search({
  server_url: "https://www.dati.gov.it/opendata",
  facet_field: ["organization"],
  facet_limit: 50,
  rows: 0
})

// Distribuzione tag
ckan_package_search({
  server_url: "https://www.dati.gov.it/opendata",
  facet_field: ["tags"],
  facet_limit: 50,
  rows: 0
})
```

---

## 9. Limitations & Constraints

### 9.1 Current Limitations

1. **Read-Only**: 
   - Non supporta creazione/modifica dataset
   - Solo endpoint pubblici (no autenticazione)

2. **Character Limit**:
   - Output troncato a 50.000 caratteri
   - Hardcoded, non configurabile

3. **No Caching**:
   - Ogni richiesta fa chiamata HTTP fresca
   - Nessuna cache locale

4. **DataStore Limitations**:
   - Non tutte le risorse hanno DataStore attivo
   - Max 32.000 record per query
   - Dipende dalla configurazione del server CKAN

5. **No SQL Support**:
   - Tool `ckan_datastore_search_sql` menzionato come "in sviluppo"
   - Non implementato nel codice attuale

6. **Timeout**:
   - 30 secondi fissi per HTTP request
   - Non configurabile

7. **Locale**:
   - Date formattate in ISO `YYYY-MM-DD`
   - Non parametrizzato

### 9.2 External Dependencies

- **Network**: Richiede connessione internet
- **CKAN Server Availability**: Dipende dalla disponibilità dei server remoti
- **CKAN API Compatibility**: Richiede CKAN API v3

### 9.3 Known Issues

- Tool `ckan_package_list` documentato nel README ma non implementato
- Nessun test automatizzato
- Error messages potrebbero essere più specifici

---

## 10. Future Enhancements

### 10.1 Planned Features

#### High Priority

- [ ] **npm Package Publication**
  - Pubblicare su npm registry pubblico
  - Installazione globale/locale senza build
  - CLI eseguibile: `ckan-mcp-server`
  - npx support per uso senza installazione
  - **Goal**: Semplicità di installazione come `pip install` in Python

- [ ] **Authentication Support**
  - API key per endpoint privati
  - OAuth per portali che lo supportano
  
- [ ] **SQL Query Support**
  - Implementare `ckan_datastore_search_sql`
  - Supporto query SQL complete

- [ ] **Caching Layer**
  - Cache risultati frequenti
  - TTL configurabile
  - Invalidation strategy

#### Medium Priority

- [ ] **Advanced DataStore Features**
  - Support for aggregations
  - JOIN tra risorse
  - Computed fields

- [ ] **Batch Operations**
  - Query multiple in parallelo
  - Bulk export

- [ ] **Configuration**
  - Timeout configurabile
  - Character limit configurabile
  - Locale configurabile

#### Low Priority

- [ ] **Write Operations** (se richiesto)
  - Create/update dataset
  - Upload risorse
  - Requires authentication

- [ ] **Advanced Filtering**
  - Spatial filters (geo queries)
  - Temporal filters (date ranges)

- [ ] **Export Formats**
  - CSV export
  - Excel export
  - Graph visualization data

### 10.2 Distribution & Installation

- [ ] **npm Package Publication**
  - Pubblicare su npm registry (come PyPI per Python)
  - Installazione globale: `npm install -g ckan-mcp-server`
  - Installazione locale: `npm install ckan-mcp-server`
  - Versioning semantico (semver)
  - Changelog automatico
  - Pre-built binaries per evitare build locale

- [ ] **Executable CLI**
  - Comando globale: `ckan-mcp-server`
  - npx support: `npx ckan-mcp-server`
  - Configurazione via flags o file

- [ ] **Distribution Channels**
  - npm registry (principale)
  - GitHub Releases con assets
  - Docker image (opzionale)

### 10.3 Testing & Quality

- [ ] Unit tests per utility functions
- [ ] Integration tests per tool handlers
- [ ] E2E tests con server CKAN demo
- [ ] Performance benchmarks
- [ ] Error scenario coverage

### 10.4 Documentation

- [ ] OpenAPI/Swagger spec per HTTP mode
- [ ] Video tutorial
- [ ] More real-world examples
- [ ] Best practices guide

---

## 11. Success Metrics

### 11.1 Technical Metrics

- **Build Time**: < 5ms (esbuild)
- **Bundle Size**: < 500KB
- **Memory Usage**: < 100MB runtime
- **Response Time**: < 30s (CKAN API timeout)

### 11.2 Distribution Metrics

- **npm Downloads**: Weekly/monthly downloads from npm registry
- **Installation Success Rate**: % of successful installations
- **Installation Time**: < 2 minutes from `npm install` to running
- **Global vs Local**: Ratio di installazioni globali vs locali
- **npx Usage**: Utilizzo via npx senza installazione

### 11.3 Usage Metrics

- Number of MCP tool calls per session
- Most used tools
- Average results per search
- Error rate by tool
- Server coverage (unique CKAN servers used)

### 11.4 Quality Metrics

- Zero known security vulnerabilities
- Error messages clarity
- Documentation completeness
- User satisfaction (GitHub issues/feedback)

---

## 12. References

### 12.1 Documentation

- [CKAN API Documentation](https://docs.ckan.org/en/latest/api/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Apache Solr Query Syntax](https://solr.apache.org/guide/solr/latest/query-guide/standard-query-parser.html)

### 12.2 Related Resources

- [CKAN Official Site](https://ckan.org/)
- [onData Community](https://www.ondata.it/)
- [dati.gov.it](https://www.dati.gov.it/opendata/)

### 12.3 Code Repository

- **GitHub**: https://github.com/ondata/ckan-mcp-server (presumed)
- **License**: MIT License
- **Contact**: onData community

---

## 13. Appendix

### 13.1 Glossary

- **CKAN**: Comprehensive Knowledge Archive Network - piattaforma open source per portali dati aperti
- **MCP**: Model Context Protocol - protocollo per integrare AI agent con strumenti esterni
- **Solr**: Apache Solr - motore di ricerca full-text usato da CKAN
- **DataStore**: Feature CKAN per query SQL-like su dati tabulari
- **Faceting**: Aggregazioni statistiche per analisi distributiva
- **Package**: Termine CKAN per "dataset"
- **Resource**: File o API endpoint associato a un dataset

### 13.2 Solr Query Syntax Quick Reference

```
# Full-text search
q: "popolazione"

# Field search
q: "title:covid"
q: "notes:sanità"

# Boolean operators
q: "popolazione AND sicilia"
q: "popolazione OR abitanti"
q: "popolazione NOT censimento"

# Wildcard
q: "popola*"
q: "*salute*"

# Filter query (no score impact)
fq: "organization:comune-palermo"
fq: "res_format:CSV"

# Date range
fq: "metadata_modified:[2023-01-01T00:00:00Z TO *]"
fq: "metadata_created:[NOW-7DAYS TO NOW]"
```

### 13.3 Response Format Examples

**Markdown Output** (human-readable):
```markdown
# CKAN Package Search Results

**Server**: https://www.dati.gov.it/opendata
**Query**: popolazione
**Total Results**: 1234

## Datasets

### Popolazione Residente 2023
- **ID**: `abc-123-def`
- **Organization**: ISTAT
- **Tags**: popolazione, demografia, censimento
...
```

**JSON Output** (machine-readable):
```json
{
  "count": 1234,
  "results": [
    {
      "id": "abc-123-def",
      "name": "popolazione-residente-2023",
      "title": "Popolazione Residente 2023",
      "organization": { "name": "istat", "title": "ISTAT" }
    }
  ]
}
```

---

**Document Version**: 1.0.0  
**Created**: 2026-01-08  
**Status**: Approved  
**Next Review**: 2026-04-08
