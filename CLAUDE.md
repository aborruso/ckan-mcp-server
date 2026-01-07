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

## Project Overview

CKAN MCP Server - MCP (Model Context Protocol) server per interagire con portali di dati aperti basati su CKAN (dati.gov.it, data.gov, demo.ckan.org, etc.).

Il server espone strumenti MCP per:
- Ricerca avanzata dataset con sintassi Solr
- Query DataStore per analisi dati tabulari
- Esplorazione organizzazioni e gruppi
- Accesso a metadati completi

## Build e Sviluppo

### Comandi Principali

```bash
# Build del progetto (usa esbuild - veloce e leggero)
npm run build

# Avvio server in modalità stdio (default per integrazione locale)
npm start

# Avvio server in modalità HTTP (per accesso remoto)
TRANSPORT=http PORT=3000 npm start

# Watch mode per sviluppo
npm run watch

# Build + run
npm run dev
```

### Build System

Il progetto usa **esbuild** per la compilazione invece di tsc per garantire:
- Build ultra-veloce (millisecondi invece di minuti)
- Utilizzo minimo di memoria (importante in ambienti WSL)
- Bundling automatico con tree-shaking

Lo script `build:tsc` è disponibile come fallback ma può causare problemi di memoria in alcuni ambienti (particolarmente WSL). Usa sempre `npm run build` che utilizza esbuild.

Il build esbuild esegue il bundle di tutti i moduli interni ma mantiene le dipendenze esterne (`@modelcontextprotocol/sdk`, `axios`, `express`, `zod`) come external, quindi devono essere presenti in `node_modules`.

## Architettura

### Struttura del Codice

Il server è implementato come file TypeScript singolo (`src/index.ts`) che:

1. **Configurazione Server MCP**
   - Registra 6 tool MCP per interagire con API CKAN
   - Supporta due modalità di trasporto: stdio (default) e HTTP

2. **Tool Registrati**
   - `ckan_package_search` - Ricerca dataset con query Solr
   - `ckan_package_show` - Dettagli completi di un dataset
   - `ckan_package_list` - Lista tutti i dataset
   - `ckan_organization_list` - Lista organizzazioni
   - `ckan_organization_show` - Dettagli organizzazione
   - `ckan_datastore_search` - Query dati tabulari
   - `ckan_status_show` - Verifica stato server

3. **Utility Functions**
   - `makeCkanRequest<T>()` - Gestisce tutte le chiamate HTTP alle API CKAN v3
   - `truncateText()` - Limita output a 50000 caratteri
   - `formatDate()` - Formattazione date in locale italiano
   - `formatBytes()` - Conversione dimensioni file in formato leggibile

4. **Schema di Validazione**
   - Utilizza Zod per validare tutti gli input dei tool
   - Ogni tool ha uno schema strict che rifiuta parametri extra

5. **Output Formatting**
   - Tutti i tool supportano due formati: `markdown` (default) e `json`
   - Formato markdown ottimizzato per leggibilità umana
   - Formato JSON per elaborazione programmatica

### Modalità di Trasporto

Il server seleziona automaticamente la modalità di trasporto basandosi sulla variabile d'ambiente `TRANSPORT`:

- **stdio** (default): per integrazione con Claude Desktop e altri client MCP locali
- **http**: espone endpoint POST `/mcp` su porta configurabile (default 3000)

### CKAN API Integration

Il server utilizza le CKAN API v3 disponibili su qualsiasi portale CKAN. Tutte le richieste:

- Usano `axios` con timeout di 30 secondi
- Inviano User-Agent `CKAN-MCP-Server/1.0`
- Gestiscono errori HTTP, timeout e server non trovati
- Normalizzano l'URL del server (rimuovono trailing slash)
- Validano che `response.success === true`

### Query Solr

CKAN usa Apache Solr per la ricerca. Il tool `ckan_package_search` supporta:

- **q** (query): sintassi completa Solr (campo:valore, AND/OR/NOT, wildcard, range)
- **fq** (filter query): filtri aggiuntivi senza influenzare lo score
- **facet_field**: aggregazioni per analisi statistiche
- **sort**: ordinamento risultati
- **start/rows**: paginazione

Esempi comuni di query sono documentati in `EXAMPLES.md`.

## TypeScript Configuration

Il progetto usa ES2022 come target e module system.

**Nota**: `tsconfig.json` è presente principalmente per editor support (IDE, LSP). La compilazione effettiva usa esbuild che ignora la maggior parte delle opzioni TypeScript per massimizzare la velocità.

Configurazione TypeScript (per IDE):
- Output in `dist/` directory
- Strict mode abilitato
- Type checking rigoroso con noUnusedLocals, noUnusedParameters, noImplicitReturns
- Skip lib check per ridurre overhead
- Declaration e source map disabilitati

## Dependencies

**Runtime**:
- `@modelcontextprotocol/sdk` - SDK MCP ufficiale
- `axios` - HTTP client per CKAN API
- `zod` - Schema validation
- `express` - Server HTTP (solo per modalità http)

**Dev**:
- `esbuild` - Build tool (bundler e compiler)
- `typescript` - Solo per type checking e editor support
- `@types/node`, `@types/express` - Type definitions

## Portali CKAN Supportati

Il server può connettersi a qualsiasi istanza CKAN. Alcuni portali principali:

- 🇮🇹 https://dati.gov.it (Italia)
- 🇺🇸 https://catalog.data.gov (Stati Uniti)
- 🇨🇦 https://open.canada.ca/data (Canada)
- 🇬🇧 https://data.gov.uk (Regno Unito)
- 🇪🇺 https://data.europa.eu (Unione Europea)
- 🌍 https://demo.ckan.org (Demo ufficiale CKAN)

Ogni portale può avere configurazioni diverse per:
- DataStore availability
- Campi custom nei dataset
- Organizzazioni e tag disponibili
- Formati risorse supportati

## Testing

Il progetto non ha test automatizzati. Per testare manualmente:

```bash
# Build del progetto
npm run build

# Test stdio mode
npm start
# (Il server rimarrà in attesa di comandi MCP su stdin)

# Test HTTP mode in un terminale
TRANSPORT=http PORT=3000 npm start

# In un altro terminale, test con curl
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

Per testare con Claude Desktop, aggiungere al config file la configurazione MCP.

## Note di Sviluppo

- Non ci sono test automatizzati - considerare di aggiungerli per tool critici
- Il limite di 50000 caratteri per l'output è hardcoded - potrebbe essere configurabile
- Formato date usa locale 'it-IT' - potrebbe essere parametrizzato
- Il server supporta solo lettura (tutti i tool sono read-only, non modificano dati su CKAN)
- Non c'è caching - ogni richiesta fa una chiamata HTTP fresca alle API CKAN
- Non c'è autenticazione - usa solo endpoint pubblici CKAN
