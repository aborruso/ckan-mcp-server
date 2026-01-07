# CKAN MCP Server

MCP (Model Context Protocol) server per interagire con portali di dati aperti basati su CKAN.

## Caratteristiche

- ✅ Supporto per qualsiasi server CKAN (dati.gov.it, data.gov, demo.ckan.org, etc.)
- 🔍 Ricerca avanzata con sintassi Solr
- 📊 Query DataStore per analisi dati tabulari
- 🏢 Esplorazione organizzazioni e gruppi
- 📦 Metadati completi di dataset e risorse
- 🎨 Output in formato Markdown o JSON
- ⚡ Supporto paginazione e faceting

## Installazione

```bash
# Clona o copia il progetto
cd ckan-mcp-server

# Installa le dipendenze
npm install

# Compila con esbuild (veloce, ~4ms)
npm run build
```

## Utilizzo

### Avvio con stdio (per integrazione locale)

```bash
npm start
```

### Avvio con HTTP (per accesso remoto)

```bash
TRANSPORT=http PORT=3000 npm start
```

Il server sarà disponibile su `http://localhost:3000/mcp`

## Configurazione in Claude Desktop

Aggiungi al file di configurazione di Claude Desktop (`claude_desktop_config.json`):

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

Su macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
Su Windows: `%APPDATA%\Claude\claude_desktop_config.json`
Su Linux: `~/.config/Claude/claude_desktop_config.json`

## Tool Disponibili

### Ricerca e Scoperta

- **ckan_package_search**: Cerca dataset con query Solr
- **ckan_package_show**: Dettagli completi di un dataset
- **ckan_package_list**: Lista tutti i dataset

### Organizzazioni

- **ckan_organization_list**: Lista tutte le organizzazioni
- **ckan_organization_show**: Dettagli di un'organizzazione

### DataStore

- **ckan_datastore_search**: Query su dati tabulari
- **ckan_datastore_search_sql**: Query SQL (in sviluppo)

### Utilità

- **ckan_status_show**: Verifica stato del server

## Esempi d'Uso

### Cercare dataset su dati.gov.it

```typescript
ckan_package_search({
  server_url: "https://www.dati.gov.it/opendata",
  q: "popolazione",
  rows: 20
})
```

### Filtrare per organizzazione

```typescript
ckan_package_search({
  server_url: "https://www.dati.gov.it/opendata",
  fq: "organization:regione-siciliana",
  sort: "metadata_modified desc"
})
```

### Ottenere statistiche con faceting

```typescript
ckan_package_search({
  server_url: "https://www.dati.gov.it/opendata",
  facet_field: ["organization", "tags", "res_format"],
  rows: 0
})
```

### Query DataStore

```typescript
ckan_datastore_search({
  server_url: "https://www.dati.gov.it/opendata",
  resource_id: "abc-123-def",
  filters: { "regione": "Sicilia", "anno": 2023 },
  sort: "popolazione desc",
  limit: 50
})
```

## Portali CKAN Supportati

Alcuni dei principali portali compatibili:

- 🇮🇹 **www.dati.gov.it/opendata** - Italia
- 🇺🇸 **data.gov** - Stati Uniti
- 🇨🇦 **open.canada.ca/data** - Canada
- 🇬🇧 **data.gov.uk** - Regno Unito
- 🇪🇺 **data.europa.eu** - Unione Europea
- 🌍 **demo.ckan.org** - Demo CKAN
- E oltre 500+ portali in tutto il mondo

## Query Solr Avanzate

CKAN usa Apache Solr per la ricerca. Esempi:

```
# Ricerca base
q: "popolazione"

# Ricerca per campo
q: "title:popolazione"
q: "notes:sanità"

# Operatori booleani
q: "popolazione AND sicilia"
q: "popolazione OR abitanti"
q: "popolazione NOT censimento"

# Filtri (fq)
fq: "organization:comune-palermo"
fq: "tags:sanità"
fq: "res_format:CSV"

# Wildcard
q: "popolaz*"

# Range date
fq: "metadata_modified:[2023-01-01T00:00:00Z TO *]"
```

## Struttura del Progetto

```
ckan-mcp-server/
├── src/
│   └── index.ts          # Implementazione server MCP
├── dist/                 # File compilati (generati)
├── package.json          # Dipendenze npm
├── tsconfig.json         # Configurazione TypeScript
├── README.md             # Questo file
└── SKILL.md             # Documentazione dettagliata skill
```

## Sviluppo

### Build

Il progetto usa **esbuild** per una compilazione ultra-veloce (~4ms):

```bash
# Build con esbuild (default)
npm run build

# Watch mode per sviluppo
npm run watch
```

### Test Manuale

```bash
# Avvia server in modalità HTTP
TRANSPORT=http PORT=3000 npm start

# In un altro terminale, testa i tool disponibili
curl -X POST http://localhost:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

## Troubleshooting

### URL dati.gov.it

**Importante**: L'URL corretto per il portale italiano è `https://www.dati.gov.it/opendata` (non `https://dati.gov.it`).

### Errore di connessione

```
Error: Server not found: https://esempio.gov.it
```

**Soluzione**: Verifica che l'URL sia corretto e che il server sia online. Usa `ckan_status_show` per verificare.

### Nessun risultato

```typescript
// Usa query più generica
ckan_package_search({
  server_url: "https://www.dati.gov.it/opendata",
  q: "*:*"
})

// Verifica contenuti con faceting
ckan_package_search({
  server_url: "https://www.dati.gov.it/opendata",
  facet_field: ["tags", "organization"],
  rows: 0
})
```

## Contribuire

Contribuzioni benvenute! Per favore:

1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## Licenza

MIT License - Vedere il file SKILL.md per dettagli completi.

## Link Utili

- **CKAN**: https://ckan.org/
- **Documentazione API CKAN**: https://docs.ckan.org/en/latest/api/
- **MCP Protocol**: https://modelcontextprotocol.io/
- **onData**: https://www.ondata.it/
- **dati.gov.it**: https://www.dati.gov.it/opendata/

## Supporto

Per problemi o domande:
- Apri una issue su GitHub
- Contatta onData: https://www.ondata.it/

---

Creato con ❤️ da onData per la comunità dell'open data
