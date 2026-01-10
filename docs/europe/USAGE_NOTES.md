# Usage Notes - data.europa.eu Hub Search

These notes summarize practical findings when using the EU Hub Search API
endpoints under https://data.europa.eu/api/hub/search/.

## Endpoints

- /search
  - Primary endpoint for the portal. Supports facets, date filters, and
    multilingual search across indexed metadata.
- /ckan/package_search
  - CKAN-like endpoint. Useful for Solr-like query syntax and CKAN-style
    response format, but not all CKAN fields are searchable as in standard CKAN.

## /search (recommended for portal search)

Key parameters tested:
- q: free text query (supports boolean AND/OR/NOT and simple wildcards)
- filters: dataset (recommended for dataset-only searches)
- facets: JSON object for filtering (e.g. {"country":["it"]})
- minDate/maxDate + dateType: date range filters (e.g. modified)
- countOnly: true to return just the count
- autocomplete: true switches to title-focused type-ahead output (no count)

Notes:
- fields=title did NOT work as expected for "search only in title".
- autocomplete=true changes the response shape and ignores countOnly.

## /ckan/package_search (CKAN-like)

What works (tested):
- boolean queries: "popolazione AND sicilia"
- range queries: num_resources:[5 TO 50]
- date math: metadata_modified:[NOW-1MONTH TO NOW]
- fuzzy on a field that is actually indexed (example: title:environment~2)

What does NOT work as expected:
- title:popolazione (0 results)
- notes:istat (0 results)
- organization:* (0 results)
- boosting and proximity on title/notes (0 results)
- querying translation.* fields (timeouts or 0 results)

Important: the dataset object includes a "translation" field (multilingual
metadata), but it does not appear to be searchable with dot-notation queries.

## Recommended usage

- Use /search for portal-wide search and multilingual metadata.
- Use /ckan/package_search only for CKAN-style compatibility and when you
  need Solr-like range/date math across generic fields.
- For "search in title" across languages, use /search with q and then filter
  client-side on the returned title map.

## Example commands

Count datasets with keywords (portal search):

curl -s --get 'https://data.europa.eu/api/hub/search/search' \
  --data-urlencode 'q=popolazione AND sicilia' \
  --data-urlencode 'filters=dataset' \
  --data-urlencode 'countOnly=true'

Count datasets modified in 2024 (portal search):

curl -s --get 'https://data.europa.eu/api/hub/search/search' \
  --data-urlencode 'q=*' \
  --data-urlencode 'filters=dataset' \
  --data-urlencode 'minDate=2024-01-01T00:00:00Z' \
  --data-urlencode 'maxDate=2024-12-31T23:59:59Z' \
  --data-urlencode 'dateType=modified' \
  --data-urlencode 'countOnly=true'

CKAN-like query (package_search):

curl -s --get 'https://data.europa.eu/api/hub/search/ckan/package_search' \
  --data-urlencode 'q=metadata_modified:[NOW-1MONTH TO NOW]' \
  --data-urlencode 'rows=0'

## Tested examples and counts (2026-01-09)

All counts below use countOnly=true (or rows=0 for CKAN) and may change over time.

Portal search (/search):

- all -> 2019161
  q=*
- covid_or_coronavirus -> 5653
  q=covid OR coronavirus
- popolazione_and_sicilia -> 10
  q=popolazione AND sicilia
- sanita_or_salute_or_health -> 51032
  q=sanita OR salute OR health
- dati_not_personali -> 702933
  q=dati NOT personali
- climate_change_phrase -> 4316
  q="climate change"
- climate_change_unquoted -> 194063
  q=climate change
- popola_wildcard -> 124899
  q=popola*
- pnrr_all -> 214
  q=PNRR
- pnrr_italy -> 84
  q=PNRR, facets={"country":["it"]}
- modified_2024 -> 258980
  minDate=2024-01-01T00:00:00Z, maxDate=2024-12-31T23:59:59Z, dateType=modified
- modified_2023 -> 141000
  minDate=2023-01-01T00:00:00Z, maxDate=2023-12-31T23:59:59Z, dateType=modified
- catalog_dati_gov_it -> 62855
  facets={"catalog":["dati-gov-it"]}
- catalog_rndt -> 26488
  facets={"catalog":["rndt"]}
- format_csv -> 327308
  facets={"format":["CSV"]}
- format_json -> 86205
  facets={"format":["JSON"]}
- country_it -> 89343
  facets={"country":["it"]}
- language_it -> 67272
  facets={"language":["it"]}

CKAN-like (/ckan/package_search):

- ckan_modified_last_month -> 708467
  q=metadata_modified:[NOW-1MONTH TO NOW]
- ckan_num_resources_5_50 -> 841639
  q=num_resources:[5 TO 50]

## Not supported or unreliable (observed)

The following CKAN-style fielded queries returned 0 results or timed out
on /ckan/package_search:

- title:popolazione
- notes:istat
- organization:*
- title:"climate change"~5
- title:climate^2 OR notes:climate
- translation.en.title:population
- translation.it.title:popolazione
- translation.*.title:PNRR (timeout)

## Advanced usage patterns

Facet filtering (country, catalog, format):

curl -s --get 'https://data.europa.eu/api/hub/search/search' \
  --data-urlencode 'q=*' \
  --data-urlencode 'filters=dataset' \
  --data-urlencode 'facets={"country":["it"],"catalog":["dati-gov-it"],"format":["CSV"]}' \
  --data-urlencode 'countOnly=true'

Date range with sorting (first page of results):

curl -s --get 'https://data.europa.eu/api/hub/search/search' \
  --data-urlencode 'q=*' \
  --data-urlencode 'filters=dataset' \
  --data-urlencode 'minDate=2024-01-01T00:00:00Z' \
  --data-urlencode 'maxDate=2024-12-31T23:59:59Z' \
  --data-urlencode 'dateType=modified' \
  --data-urlencode 'sort=modified+desc' \
  --data-urlencode 'limit=10'

Client-side "title contains" for multilingual titles (example: PNRR):

curl -s --get 'https://data.europa.eu/api/hub/search/search' \
  --data-urlencode 'q=PNRR' \
  --data-urlencode 'filters=dataset' \
  --data-urlencode 'limit=1000' \
| jq '[.result.results[]
      | (.title // {})
      | ([to_entries[].value] | any(test("PNRR";"i")))
      ] | map(select(.)) | length'
