# CKAN Open Data Explorer

**Versione**: 1.0
**Data**: 25 luglio 2024

---

## 1. Introduzione

"CKAN Open Data Explorer" è un'applicazione web frontend progettata per facilitare l'interazione con portali Open Data basati su CKAN, sfruttando un'interfaccia di chat in linguaggio naturale potenziata dall'API Gemini. L'obiettivo principale è rendere l'esplorazione dei dataset e delle risorse Open Data più accessibile e intuitiva per gli utenti, eliminando la necessità di navigare direttamente le interfacce complesse dei portali CKAN o di formulare query API specifiche.

---

## 2. Obiettivi del Prodotto

- **Semplificare l'accesso ai dati**: Permettere agli utenti di trovare e comprendere i dataset Open Data utilizzando domande e comandi in linguaggio naturale
- **Migliorare l'esperienza utente**: Fornire un'interfaccia conversazionale fluida e reattiva che guida l'utente attraverso il processo di ricerca dati
- **Abilitare l'interazione tool-driven**: Utilizzare il modello Gemini per orchestrare chiamate a un server MCP (Microservice Controller Proxy) che a sua volta interagisce con i portali CKAN
- **Gestire errori comuni**: Fornire feedback chiari e gestibili per errori di connessione al server MCP o problemi di quota dell'API Gemini
- **Configurabilità**: Consentire agli utenti di configurare l'endpoint del server MCP per adattarsi a diversi ambienti o istanze

---

## 3. Utenti Target / Personas

- **Ricercatori e Analisti Dati (Principianti)**: Cercano dati specifici ma non hanno familiarità con le API CKAN o la navigazione approfondita dei portali
- **Giornalisti o Cittadini Curiosi**: Vogliono esplorare i dati pubblici per storie o interessi personali senza barriere tecniche
- **Sviluppatori (per testing)**: Potrebbero usarlo per testare il funzionamento del server MCP o per esplorare la capacità di Gemini di interpretare le richieste utente e tradurle in chiamate a tool

---

## 4. Funzionalità

### 4.1 Interfaccia di Chat in Linguaggio Naturale

**Input Messaggi**:
- Campo di testo per l'utente per digitare domande e comandi
- Supporta l'invio tramite tasto Invio o un pulsante dedicato

**Display Messaggi**:
- Messaggi dell'utente visualizzati con sfondo grigio chiaro e testo nero
- Messaggi dell'assistente visualizzati con sfondo bianco
- Supporto per il rendering Markdown (tramite react-markdown e remark-gfm)
- Icone chiare (User, Bot) per distinguere il mittente

**Comportamenti**:
- Scroll automatico verso il basso per mostrare l'ultimo messaggio
- Messaggio di benvenuto iniziale per guidare l'utente
- Suggerimenti di query iniziali per aiutare gli utenti a iniziare

### 4.2 Integrazione con Gemini API per NLU e Tool Calling

- **Orchestrazione Gemini**: L'API Gemini (gemini-3-pro-preview) viene utilizzata per comprendere le intenzioni dell'utente e decidere quali tool dell'MCP chiamare
- **System Instruction**: Istruzione di sistema personalizzata che guida Gemini a comportarsi come "esperto assistente Open Data specializzato in portali CKAN" con regole rigide per l'utilizzo dei tool e la gestione degli errori CKAN
- **Tool Calling**: Gemini identifica e formatta le chiamate ai tool (search_datasets, get_dataset) basandosi sul inputSchema fornito dal server MCP
- **Ciclo di Tool Execution**: L'applicazione gestisce un ciclo di esecuzione dei tool, inviando le risposte dei tool a Gemini per ulteriori elaborazioni e generazioni di risposte in linguaggio naturale
- **Visualizzazione Tool in Uso**: Durante l'esecuzione di un tool, viene visualizzato un messaggio "Utilizzo tool: [nome_tool]" con icona di caricamento e parametri JSON della chiamata tool (con break-all per adattamento a tutti i dispositivi)

### 4.3 Integrazione con MCP (Microservice Controller Proxy)

- **Endpoint Configurable**: L'URL del server MCP è configurabile tramite interfaccia utente dedicata (sezione "Impostazioni")
- **Salute del Server**: Indicatore di stato che mostra se il server MCP è online, offline o in fase di verifica (CheckCircle2, XCircle, RefreshCw)
- **Fallback Tool Definitions**: Se il server MCP non è raggiungibile, l'applicazione usa definizioni di tool di fallback per mantenere funzionalità minima
- **Chiamate JSON-RPC**: Il servizio mcp.ts gestisce le chiamate JSON-RPC per listare i tool (tools/list) e chiamare i tool specifici (tools/call)
- **Gestione CORS**: Include logica di fallback utilizzando proxy corsproxy.io se la richiesta diretta fallisce
- **Output Tool**: L'output JSON dei tool viene parsato e visualizzato nella chat, con rendering specifico per DatasetCard

### 4.4 Visualizzazione Dati (DatasetCard)

- **Card Dettagli Dataset**: Quando Gemini restituisce risultati di dataset, questi vengono visualizzati come DatasetCard con informazioni chiave: titolo, descrizione, data di creazione, autore, licenza, tag e elenco di risorse (con link esterni)
- **Formattazione**: Date formattate in modo leggibile, link alle risorse chiaramente distinguibili
- **Troncamento**: Viene mostrato un numero limitato di risorse con messaggio "Mostrati i primi X risultati" se ce ne sono di più

### 4.5 Gestione Errori e Feedback Utente

**Errori Gemini API**:
- Gestione specifica degli errori di quota (RESOURCE_EXHAUSTED, codice 429)
- Banner di avviso (AlertTriangle) in caso di quota esaurita
- Istruzione per selezionare chiave API da progetto a pagamento con link alla documentazione di fatturazione
- Pulsante per aprire il selettore di chiavi API (se window.aistudio.openSelectKey disponibile)

**Errori MCP**:
- Messaggi di errore chiari se il server MCP non è raggiungibile o se una chiamata tool fallisce (es. Status 404)
- Incoraggiamento a controllare l'URL dell'MCP nelle impostazioni

**Stati di Caricamento**:
- Indicatore "Gemini sta elaborando..." al centro dello schermo quando l'API Gemini è attiva ma non sta chiamando un tool
- Indicatore "Utilizzo tool: [nome_tool]" quando un tool MCP è in esecuzione
- Pulsante di invio disabilitato durante il caricamento, se l'input è vuoto, o se l'MCP è offline

### 4.6 Configurabilità

- **Sezione Impostazioni**: Icona Settings apre un pannello dove l'utente può visualizzare e modificare l'endpoint del server MCP e la propria API key di Gemini
- **Salvataggio Endpoint**: Pulsante Applica salva il nuovo endpoint e verifica immediatamente la connettività MCP
- **Gestione API Key**: L'utente inserisce la propria API key di Gemini tramite interfaccia dedicata (campo di input protetto). La chiave viene salvata nel browser storage (localStorage) e rimane disponibile per le sessioni successive

---

## 5. Requisiti Tecnici

### Frontend

- **Framework**: React 19 (tramite react/)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS (con plugin typography) per design moderno e responsivo
- **Icone**: Lucide React (lucide-react) per interfaccia visivamente accattivante
- **Rendering Markdown**: react-markdown con remark-gfm per rendering robusto del testo generato da Gemini
- **Gestione Moduli**: Utilizzo di importmap in index.html per caricamento diretto dei moduli ES6

### Backend (Implicito)

- **Gemini API**: Comunicazione con gemini-3-pro-preview tramite @google/genai SDK
- **MCP Server**: Interazione con un server MCP (es. ckan-mcp-server.andy-pr.workers.dev/mcp) che espone API JSON-RPC
- **API Key Management**: L'API key di Gemini è inserita dall'utente tramite l'interfaccia di impostazioni. La chiave viene salvata in localStorage e recuperata in ogni sessione. Supporta anche process.env.API_KEY come fallback per ambienti di sviluppo. Include meccanismo per interagire con window.aistudio.openSelectKey() per selezione di chiave API a pagamento
- **Error Handling**: Gestione robusta di errori HTTP, errori JSON-RPC e errori specifici dell'API Gemini

---

## 6. Requisiti Non Funzionali

### Performance

- Caricamento rapido dell'interfaccia utente
- Risposte della chat ottimizzate per la velocità, minimizzando la latenza delle chiamate API
- Scroll fluido della chat, anche con molti messaggi

### Usabilità (UX)

- Interfaccia intuitiva e facile da usare per utenti di tutti i livelli tecnici
- Feedback visivo chiaro per stati di caricamento, errori e successo delle operazioni
- Messaggi di errore comprensibili e azioni suggerite

### Reattività

L'applicazione deve essere completamente responsiva e funzionare bene su desktop, tablet e dispositivi mobili

### Accessibilità (A11Y)

- Utilizzo di elementi HTML semantici
- Contrasto colori adeguato
- Navigazione da tastiera e supporto per lettori di schermo (da verificare e migliorare)

### Compatibilità Cross-browser

Funzionalità e aspetto devono essere coerenti sui principali browser moderni (Chrome, Firefox, Safari, Edge)

### Sicurezza

- La chiave API di Gemini è gestita tramite variabili d'ambiente e non esposta nel codice sorgente lato client
- Il CORS proxy è usato come fallback, ma si raccomanda che il server MCP gestisca il CORS direttamente per maggiore sicurezza

### Internazionalizzazione

Attualmente l'interfaccia è interamente in italiano

### Offline Functionality

L'applicazione richiede una connessione internet attiva sia per l'API Gemini che per il server MCP, quindi non supporta la funzionalità offline
