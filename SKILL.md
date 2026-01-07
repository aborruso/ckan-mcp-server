---
name: ckan-mcp
description: MCP server per interagire con portali di dati aperti basati su CKAN. Permette di cercare dataset, organizzazioni, risorse e altri oggetti su qualsiasi server CKAN (come dati.gov.it, data.gov, demo.ckan.org) utilizzando l'URL del server come parametro.
version: 1.0.0
author: onData
license: MIT
---

# CKAN MCP Server

MCP server per esplorare e interrogare portali di dati aperti basati su CKAN. CKAN (Comprehensive Knowledge Archive Network) è la piattaforma open source più utilizzata al mondo per i portali di open data governativi e istituzionali.

## Descrizione

Questo server MCP consente di:
- Cercare dataset su qualsiasi portale CKAN
- Ottenere metadati completi di dataset e risorse
- Esplorare organizzazioni e gruppi
- Interrogare il DataStore (se abilitato sul server)
- Listare tag, licenze e altri metadati
- Accedere alle API di qualsiasi istanza CKAN specificando l'URL

## Portali CKAN Supportati

Il server può connettersi a qualsiasi istanza CKAN, inclusi:
- **dati.gov.it** - Portale nazionale italiano dei dati aperti
- **data.gov** - Portale USA dei dati aperti federali
- **demo.ckan.org** - Istanza demo di CKAN
- **data.europa.eu** - Portale europeo dei dati aperti
- **open.canada.ca/data** - Portale canadese
- Qualsiasi altro portale basato su CKAN (oltre 500+ nel mondo)

## Architettura CKAN

CKAN organizza i dati in:
- **Packages (Dataset)**: Collezioni di risorse con metadati
- **Resources**: File o link effettivi ai dati
- **Organizations**: Enti che pubblicano i dataset
- **Groups**: Raggruppamenti tematici di dataset
- **Tags**: Parole chiave per categorizzare i dataset
- **DataStore**: Database SQL per query dirette sui dati tabulari

## Tool Disponibili

### Ricerca e Scoperta

#### `ckan_package_search`
Cerca dataset su un server CKAN usando query in stile Solr.

**Parametri:**
- `server_url` (string, required): URL del server CKAN (es. "https://dati.gov.it")
- `q` (string, optional): Query di ricerca (default: "*:*" per tutti i dataset)
- `fq` (string, optional): Filtri Solr (es. "organization:comune-palermo")
- `rows` (number, optional): Numero di risultati (default: 10, max: 1000)
- `start` (number, optional): Offset per paginazione (default: 0)
- `sort` (string, optional): Campo di ordinamento (es. "metadata_modified desc")
- `facet_field` (array, optional): Campi per faceting (es. ["organization", "tags"])
- `facet_limit` (number, optional): Numero massimo di valori per facet (default: 50)
- `include_drafts` (boolean, optional): Includere dataset bozza (default: false)
- `response_format` (enum, optional): "json" | "markdown" (default: "markdown")

**Esempi:**
```typescript
// Cercare tutti i dataset su dati.gov.it
ckan_package_search({ server_url: "https://dati.gov.it", q: "*:*", rows: 20 })

// Cercare dataset con tag "sanità" su demo.ckan.org
ckan_package_search({ 
  server_url: "https://demo.ckan.org",
  q: "tags:sanità",
  rows: 10
})

// Filtrare per organizzazione specifica
ckan_package_search({
  server_url: "https://dati.gov.it",
  fq: "organization:regione-siciliana",
  sort: "metadata_modified desc"
})

// Ottenere facets per analizzare le organizzazioni
ckan_package_search({
  server_url: "https://dati.gov.it",
  facet_field: ["organization", "tags", "res_format"],
  rows: 0
})
```

#### `ckan_package_show`
Ottiene i metadati completi di un dataset specifico.

**Parametri:**
- `server_url` (string, required): URL del server CKAN
- `id` (string, required): ID o nome del dataset
- `include_tracking` (boolean, optional): Includere statistiche di accesso (default: false)
- `response_format` (enum, optional): "json" | "markdown" (default: "markdown")

**Esempio:**
```typescript
ckan_package_show({ 
  server_url: "https://dati.gov.it",
  id: "dataset-esempio-123"
})
```

#### `ckan_package_list`
Ottiene la lista di tutti i nomi dei dataset su un server.

**Parametri:**
- `server_url` (string, required): URL del server CKAN
- `limit` (number, optional): Numero massimo di risultati (default: 100)
- `offset` (number, optional): Offset per paginazione (default: 0)

### Organizzazioni e Gruppi

#### `ckan_organization_list`
Lista tutte le organizzazioni su un server CKAN.

**Parametri:**
- `server_url` (string, required): URL del server CKAN
- `all_fields` (boolean, optional): Restituire oggetti completi (default: false)
- `sort` (string, optional): Campo di ordinamento (default: "name asc")
- `limit` (number, optional): Numero massimo di risultati (default: 100)
- `offset` (number, optional): Offset per paginazione (default: 0)

#### `ckan_organization_show`
Ottiene i dettagli di un'organizzazione specifica.

**Parametri:**
- `server_url` (string, required): URL del server CKAN
- `id` (string, required): ID o nome dell'organizzazione
- `include_datasets` (boolean, optional): Includere lista dataset (default: true)
- `include_users` (boolean, optional): Includere lista utenti (default: false)

#### `ckan_group_list`
Lista tutti i gruppi tematici.

**Parametri:**
- `server_url` (string, required): URL del server CKAN
- `all_fields` (boolean, optional): Restituire oggetti completi (default: false)
- `sort` (string, optional): Campo di ordinamento

#### `ckan_group_show`
Ottiene i dettagli di un gruppo specifico.

**Parametri:**
- `server_url` (string, required): URL del server CKAN
- `id` (string, required): ID o nome del gruppo
- `include_datasets` (boolean, optional): Includere lista dataset (default: true)

### Risorse

#### `ckan_resource_show`
Ottiene i metadati di una risorsa specifica.

**Parametri:**
- `server_url` (string, required): URL del server CKAN
- `id` (string, required): ID della risorsa

#### `ckan_resource_search`
Cerca risorse per nome o altro campo.

**Parametri:**
- `server_url` (string, required): URL del server CKAN
- `query` (string, required): Query di ricerca (es. "name:CSV" o "format:PDF")
- `limit` (number, optional): Numero massimo di risultati (default: 10)
- `offset` (number, optional): Offset per paginazione (default: 0)

### Metadati di Sistema

#### `ckan_tag_list`
Ottiene la lista di tutti i tag usati nei dataset.

**Parametri:**
- `server_url` (string, required): URL del server CKAN
- `vocabulary_id` (string, optional): ID del vocabolario (default: tag liberi)
- `all_fields` (boolean, optional): Restituire oggetti completi (default: false)

#### `ckan_license_list`
Ottiene la lista delle licenze disponibili.

**Parametri:**
- `server_url` (string, required): URL del server CKAN

#### `ckan_status_show`
Verifica lo stato e la versione del server CKAN.

**Parametri:**
- `server_url` (string, required): URL del server CKAN

### DataStore (Query Avanzate)

#### `ckan_datastore_search`
Esegue query SQL sul DataStore di una risorsa.

**Parametri:**
- `server_url` (string, required): URL del server CKAN
- `resource_id` (string, required): ID della risorsa nel DataStore
- `q` (string, optional): Query full-text
- `filters` (object, optional): Filtri chiave-valore (es. { "anno": 2023 })
- `limit` (number, optional): Numero massimo di righe (default: 100, max: 32000)
- `offset` (number, optional): Offset per paginazione
- `fields` (array, optional): Campi da restituire
- `sort` (string, optional): Campo di ordinamento (es. "anno desc")
- `distinct` (boolean, optional): Valori distinti (default: false)

**Esempio:**
```typescript
// Query su una risorsa del DataStore
ckan_datastore_search({
  server_url: "https://dati.gov.it",
  resource_id: "abc-123",
  filters: { "regione": "Sicilia", "anno": 2023 },
  sort: "popolazione desc",
  limit: 50
})
```

#### `ckan_datastore_search_sql`
Esegue query SQL arbitrarie sul DataStore (READ-ONLY).

**Parametri:**
- `server_url` (string, required): URL del server CKAN
- `sql` (string, required): Query SQL (solo SELECT)

**Esempio:**
```typescript
ckan_datastore_search_sql({
  server_url: "https://dati.gov.it",
  sql: "SELECT regione, COUNT(*) as totale FROM \"abc-123\" GROUP BY regione ORDER BY totale DESC"
})
```

## Query Solr Avanzate

CKAN usa Solr per la ricerca. Esempi di query:

### Ricerca Base
```
q: "popolazione"                    # Cerca "popolazione" in tutti i campi
q: "title:popolazione"              # Cerca solo nel titolo
q: "notes:sanità"                   # Cerca nella descrizione
```

### Operatori Booleani
```
q: "popolazione AND sicilia"        # Entrambi i termini
q: "popolazione OR abitanti"        # Uno dei due termini
q: "popolazione NOT censimento"     # Esclude "censimento"
```

### Ricerca per Campi
```
fq: "organization:comune-palermo"   # Filtra per organizzazione
fq: "tags:sanità"                   # Filtra per tag
fq: "res_format:CSV"                # Filtra per formato risorse
fq: "license_id:cc-by"              # Filtra per licenza
```

### Range e Wildcard
```
q: "popolaz*"                       # Wildcard
fq: "metadata_modified:[2023-01-01T00:00:00Z TO *]"  # Modificati dal 2023
```

### Combinazioni
```
q: "popolazione"
fq: "organization:regione-siciliana AND tags:istat"
sort: "metadata_modified desc"
```

## Formati di Output

Tutti i tool supportano due formati:

### Markdown (Default)
Output formattato per leggibilità umana, con:
- Tabelle per liste di risultati
- Sezioni strutturate per dettagli
- Link diretti al portale CKAN
- Evidenziazione dei campi principali

### JSON
Output strutturato per elaborazione programmatica, contenente:
- Tutti i campi disponibili dall'API
- Struttura gerarchica completa
- Metadati di paginazione
- ID e riferimenti per chiamate successive

## Best Practices

### 1. Scoperta Iniziale
Quando esplori un nuovo portale CKAN:
```typescript
// 1. Verifica che il server sia disponibile
ckan_status_show({ server_url: "https://esempio.gov.it" })

// 2. Esplora le organizzazioni
ckan_organization_list({ 
  server_url: "https://esempio.gov.it",
  all_fields: true
})

// 3. Cerca con faceting per capire i contenuti
ckan_package_search({
  server_url: "https://esempio.gov.it",
  facet_field: ["organization", "tags", "res_format", "license_id"],
  rows: 0
})
```

### 2. Ricerca Efficiente
```typescript
// Usa filtri invece di query generiche
// MEGLIO:
ckan_package_search({
  q: "*:*",
  fq: "organization:comune-palermo AND tags:bilancio"
})

// MENO EFFICIENTE:
ckan_package_search({
  q: "comune palermo bilancio"
})
```

### 3. Paginazione
```typescript
// Per dataset numerosi, pagina i risultati
for (let start = 0; start < 1000; start += 100) {
  ckan_package_search({
    server_url: "https://dati.gov.it",
    q: "*:*",
    rows: 100,
    start: start
  })
}
```

### 4. DataStore vs Download
```typescript
// Se disponibile, usa il DataStore per analisi
// invece di scaricare file interi
ckan_datastore_search({
  resource_id: "abc-123",
  filters: { anno: 2023 },
  limit: 100
})

// Usa datastore_search_sql per aggregazioni
ckan_datastore_search_sql({
  sql: "SELECT categoria, AVG(valore) FROM \"abc-123\" GROUP BY categoria"
})
```

### 5. Verifica Formati
```typescript
// Prima di analizzare, controlla i formati disponibili
ckan_package_search({
  q: "*:*",
  facet_field: ["res_format"],
  rows: 0
})

// Poi filtra per formato desiderato
ckan_package_search({
  fq: "res_format:CSV",
  rows: 20
})
```

## Esempi di Workflow Completi

### Workflow 1: Analisi Dataset Regionali
```typescript
// 1. Lista organizzazioni regionali
const orgs = ckan_organization_list({
  server_url: "https://dati.gov.it",
  all_fields: true
})

// 2. Cerca dataset di una regione specifica
const datasets = ckan_package_search({
  server_url: "https://dati.gov.it",
  fq: "organization:regione-siciliana",
  sort: "metadata_modified desc",
  rows: 50
})

// 3. Ottieni dettagli completi di un dataset interessante
const details = ckan_package_show({
  server_url: "https://dati.gov.it",
  id: "dataset-id-trovato"
})

// 4. Se ha risorse DataStore, interrogale
const data = ckan_datastore_search({
  server_url: "https://dati.gov.it",
  resource_id: "resource-id-del-dataset",
  limit: 100
})
```

### Workflow 2: Monitoraggio Pubblicazioni
```typescript
// 1. Cerca dataset pubblicati di recente
const recent = ckan_package_search({
  server_url: "https://dati.gov.it",
  q: "*:*",
  sort: "metadata_created desc",
  rows: 20
})

// 2. Filtra per tag specifico
const tagged = ckan_package_search({
  server_url: "https://dati.gov.it",
  q: "tags:covid-19",
  sort: "metadata_modified desc"
})
```

### Workflow 3: Analisi Formati e Licenze
```typescript
// 1. Ottieni statistiche su formati
const formats = ckan_package_search({
  server_url: "https://dati.gov.it",
  facet_field: ["res_format"],
  facet_limit: 100,
  rows: 0
})

// 2. Ottieni statistiche su licenze
const licenses = ckan_package_search({
  server_url: "https://dati.gov.it",
  facet_field: ["license_id"],
  rows: 0
})

// 3. Lista tutte le licenze disponibili
const all_licenses = ckan_license_list({
  server_url: "https://dati.gov.it"
})
```

## Limitazioni e Considerazioni

### Rate Limiting
- La maggior parte dei server CKAN ha rate limiting
- Implementa pause tra richieste multiple
- Considera di cachare risultati per query ripetute

### Dimensioni Risposta
- `package_search` default: 10 risultati (max: 1000)
- `datastore_search` default: 100 righe (max: 32000)
- Per dataset molto grandi, usa paginazione

### Autenticazione
- Questo server supporta solo endpoint pubblici (non richiede API key)
- Per operazioni di scrittura, serve autenticazione (non implementata)

### DataStore
- Non tutti i dataset hanno risorse nel DataStore
- Controlla `"datastore_active": true` nei metadati della risorsa
- Alcuni server CKAN non hanno il DataStore abilitato

### CORS e Proxy
- Alcuni server CKAN potrebbero avere restrizioni CORS
- In caso di problemi, considera l'uso di un proxy

## Metadati CKAN Standard

### Dataset (Package)
- `id`: ID univoco
- `name`: Nome machine-readable (slug)
- `title`: Titolo leggibile
- `notes`: Descrizione
- `author`: Autore/Creatore
- `maintainer`: Manutentore
- `license_id`: ID licenza
- `tags`: Array di tag
- `organization`: Organizzazione proprietaria
- `groups`: Gruppi di appartenenza
- `resources`: Array di risorse
- `metadata_created`: Data creazione
- `metadata_modified`: Data ultima modifica
- `extras`: Campi personalizzati chiave-valore

### Resource
- `id`: ID univoco risorsa
- `name`: Nome
- `description`: Descrizione
- `url`: URL della risorsa
- `format`: Formato file (CSV, JSON, PDF, etc.)
- `mimetype`: MIME type
- `size`: Dimensione in bytes
- `created`: Data creazione
- `last_modified`: Data ultima modifica
- `datastore_active`: Disponibile nel DataStore
- `hash`: Checksum della risorsa

### Organization
- `id`: ID univoco
- `name`: Nome machine-readable
- `title`: Titolo leggibile
- `description`: Descrizione
- `image_url`: URL logo
- `created`: Data creazione
- `package_count`: Numero dataset
- `is_organization`: true per org, false per group

## Link Utili

- **Documentazione CKAN API**: https://docs.ckan.org/en/latest/api/
- **Demo CKAN**: https://demo.ckan.org/
- **dati.gov.it**: https://dati.gov.it/
- **GitHub CKAN**: https://github.com/ckan/ckan
- **CKAN API Client (Python)**: https://github.com/ckan/ckanapi

## Troubleshooting

### Server Non Risponde
```typescript
// Verifica lo stato del server
ckan_status_show({ server_url: "https://esempio.gov.it" })

// Controlla che l'URL sia corretto (con https://)
```

### Nessun Risultato
```typescript
// Usa query più generica
ckan_package_search({ server_url: "...", q: "*:*" })

// Verifica facets per capire i contenuti
ckan_package_search({ 
  server_url: "...",
  facet_field: ["tags", "organization"],
  rows: 0
})
```

### Errore DataStore
```typescript
// Verifica che la risorsa sia nel DataStore
const resource = ckan_resource_show({
  server_url: "...",
  id: "resource-id"
})
// Controlla resource.datastore_active === true
```

### Troppi Risultati
```typescript
// Usa filtri più specifici
ckan_package_search({
  q: "*:*",
  fq: "organization:specifica AND tags:specifico",
  rows: 10
})
```

## Note Implementative

Questo server MCP:
- Usa TypeScript con SDK MCP ufficiale
- Supporta trasporto HTTP streamable (stateless)
- Implementa validazione input con Zod
- Gestisce errori con messaggi chiari e actionable
- Include support per response_format (markdown/json)
- Implementa paginazione su tutte le liste
- Usa timeout appropriati per richieste HTTP
- Cache non implementata (ogni richiesta è fresh)

## License

MIT License - Vedere LICENSE.txt per dettagli completi.
