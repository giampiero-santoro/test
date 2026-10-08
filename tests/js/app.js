(function(){
  const STORAGE_KEY = 'mc_ricettario_v1';
  const WEEK_KEY = 'mc_ricettario_settimana_v1';
  const MEALTYPES_KEY = 'mc_ricettario_pasti_v1';
  const PANTRY_KEY = 'mc_ricettario_dispensa_v1';
  const PANTRY_LIMIT_KEY = 'mc_ricettario_dispensa_limit_v1';
  const PLAN_SERVINGS_KEY = 'mc_ricettario_porzioni_piano_v1';
  const LAST_BACKUP_KEY = 'mc_ricettario_ultimo_backup_v1';
  const PREV_WEEK_KEY = 'mc_ricettario_settimana_precedente_v1';
  const DISPENSA_ITEMS_KEY = 'mc_ricettario_dispensa_prodotti_v1';
  const SHOPPING_EXTRA_KEY = 'mc_ricettario_spesa_extra_v1';
  const WEEK_NOTES_KEY = 'mc_ricettario_note_settimana_v1';
  const SHOPPING_CHECKED_KEY = 'mc_ricettario_spesa_spuntate_v1';
  const PANTRY_CATEGORY_COLORS = {
    'Frutta': '#d17b3f', 'Verdura': '#5c8a3a', 'Uova': '#d9a94a', 'Salumi': '#a13d3d',
    'Latticini e pronti': '#c9a227', 'Surgelati': '#4f7f8b', 'Pasta, riso e cereali': '#8a6642',
    'Legumi': '#6b5b3a', 'Farine, zucchero e lieviti': '#a68a5b', 'Conserve e scatolame': '#7a5230',
    'Spezie e condimenti': '#9c4b1f', 'Oli, aceti e grassi': '#8a7a2e', 'Bevande': '#3f6e9c',
    'Snack e dolciumi': '#b83a6b', 'Altro': '#3f6e79'
  };
  // Mappa (euristica) dalle 19 categorie del dataset CREA alle 15 categorie
  // di Dispensa: solo un default suggerito, resta modificabile come qualsiasi
  // altro campo del prodotto. Le categorie CREA senza un corrispondente
  // sensato in Dispensa (Alimenti Etnici, Frattaglie, Prodotti della pesca,
  // Fast-food a base di carne, Ricette Italiane) restano volutamente fuori
  // da questa mappa: cadono su "Altro" invece di un abbinamento forzato.
  const CREA_TO_PANTRY_CATEGORY = {
    'Frutta': 'Frutta', 'Verdure e ortaggi': 'Verdura', 'Uova': 'Uova',
    'Carni fresche': 'Salumi', 'Carni trasformate e conservate': 'Salumi',
    'Formaggi e latticini': 'Latticini e pronti', 'Latte e yogurt': 'Latticini e pronti',
    'Cereali e derivati': 'Pasta, riso e cereali',
    'Legumi': 'Legumi', 'Frutta secca a guscio e semi oleaginosi': 'Snack e dolciumi',
    'Oli e grassi': 'Oli, aceti e grassi', 'Dolci': 'Snack e dolciumi',
    'Bevande alcoliche': 'Bevande', 'Prodotti vari': 'Altro',
  };
  function mappaCategoriaCreaDispensa(categoriaCrea) {
    return CREA_TO_PANTRY_CATEGORY[categoriaCrea] || 'Altro';
  }
  // Ordine di percorrenza "da supermercato" usato per raggruppare la lista della spesa per reparto
  // (stesse 15 categorie della Dispensa, così la lista spesa e la Dispensa restano coerenti).
  const REPARTO_ORDINE = [
    'Frutta', 'Verdura', 'Pasta, riso e cereali', 'Legumi', 'Farine, zucchero e lieviti',
    'Conserve e scatolame', 'Spezie e condimenti', 'Oli, aceti e grassi', 'Uova',
    'Latticini e pronti', 'Salumi', 'Surgelati', 'Bevande', 'Snack e dolciumi', 'Altro'
  ];
  // Regole euristiche per indovinare il reparto di un ingrediente che non è (ancora) in Dispensa:
  // usate solo come riserva, perché se il prodotto è già in Dispensa si usa direttamente la sua
  // categoria (vedi repartoIngrediente).
  const REPARTO_KEYWORDS = [
    [/mela|pera|banana|arancia|limone|fragola|uva\b|pesca|albicocca|kiwi|ananas|anguria|melone|mandarino|frutt/, 'Frutta'],
    [/pomodor|insalata|lattuga|zucchin|melanzan|peperon|carot|cipoll|aglio|patata|spinaci|broccol|cavolo|finocchi|sedano|zucca|verdur|ortaggi/, 'Verdura'],
    [/pasta|riso|farro|orzo|cous\s?cous|spaghett|penne|fusilli|tagliatelle|gnocch|cereal|pane\b|grissini|cracker/, 'Pasta, riso e cereali'],
    [/fagiol|cecio|ceci\b|lenticch|piselli|legum/, 'Legumi'],
    [/farina|zucchero|lievito|miele|vanillina|amido/, 'Farine, zucchero e lieviti'],
    [/passata|pelati|conserva|scatolame|tonno in scatola|sott'?olio|sott'?aceto|marmellata|confettura/, 'Conserve e scatolame'],
    [/sale\b|pepe\b|spezi|origano|basilico|rosmarino|prezzemolo|peperoncino|curry|paprika|condiment|aceto balsamico/, 'Spezie e condimenti'],
    [/olio|aceto|burro|margarina|strutto|grass/, 'Oli, aceti e grassi'],
    [/uov[ao]/, 'Uova'],
    [/latte|yogurt|formaggio|mozzarella|parmigiano|ricotta|burrata|stracchino|latticin/, 'Latticini e pronti'],
    [/prosciutto|salame|salsiccia|pancetta|wurstel|mortadella|bresaola|speck|salum|carne|pollo|manzo|maiale|tacchino|pesce|salmone|gamber/, 'Salumi'],
    [/surgelat|congelat/, 'Surgelati'],
    [/acqua|vino|birra|succo|bevand|caffè|caffe\b|tè\b|the\b/, 'Bevande'],
    [/cioccolat|biscott|dolce|caramell|patatine|snack|merendin|gelato/, 'Snack e dolciumi'],
  ];
  // Determina il reparto di un ingrediente: se corrisponde a un prodotto già in Dispensa usa la
  // sua categoria (più affidabile, perché scelta esplicitamente dall'utente), altrimenti prova a
  // indovinarlo dal nome; "Altro" come ultima risorsa.
  function repartoIngrediente(nomeIngrediente){
    const { match } = findDispensaMatch(nomeIngrediente);
    if(match && match.category) return match.category;
    const n = normalize(nomeIngrediente);
    for(const [regola, reparto] of REPARTO_KEYWORDS){
      if(regola.test(n)) return reparto;
    }
    return 'Altro';
  }
  const DAYS = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
  const DEFAULT_MEALTYPES = ['Colazione','Pranzo','Spuntino','Cena'];
  const TAG_OPTIONS = ['Vegetariano','Vegano','Senza glutine','Senza lattosio','Piccante'];
  // I 14 allergeni "a dichiarazione obbligatoria" nell'UE (Reg. 1169/2011), usati qui per
  // segnalare cosa CONTIENE una ricetta — distinto dai tag dietetici sopra, che indicano
  // invece per chi è adatta (es. "Senza glutine" come scelta, non come elenco ingredienti).
  const ALLERGEN_OPTIONS = [
    'Glutine','Crostacei','Uova','Pesce','Arachidi','Soia','Latte','Frutta a guscio',
    'Sedano','Senape','Semi di sesamo','Anidride solforosa e solfiti','Lupini','Molluschi'
  ];

  let recipes = [];
  let weekPlan = {}; // { 'Lunedì': [ {id, recipeId, mealType, time}, ... ], ... }
  let mealTypes = [];
  let planServings = 4;
  let previousWeekPlan = null;
  let dispensaItems = [];
  let shoppingExtraItems = []; // ingredienti segnalati mancanti dalla dispensa, promemoria per la spesa: [{id, name, unit}]
  let weekNotes = {}; // { 'Lunedì': { 'Cena': 'nota libera', ... }, ... }
  // Stato "spuntato" della lista della spesa, tenuto per nome ingrediente normalizzato (non per
  // singola lista): così lo stesso ingrediente resta spuntato anche se compare in una lista
  // rigenerata in seguito (es. dopo aver cambiato la pianificazione).
  let shoppingCheckedItems = {};
  let editingDispensaId = null;
  let editingId = null;
  let formDirty = false; // true se il modulo ricetta o prodotto Dispensa aperto ha modifiche non salvate
  let currentViewId = null;
  let currentServings = 4;
  let pantryMode = false;
  // Quando l'utente parte dalla Dispensa per consumare i prodotti in scadenza,
  // questa lista serve solo a dare priorità alle ricette pertinenti. Le quantità
  // e la disponibilità continuano a essere valutate con tutta la Dispensa.
  let priorityPantryNames = [];
  let priorityPantryLabels = [];
  let sortMode = 'name-asc';
  let excludeItems = [];
  let activeTagFilters = new Set();
  let activeAllergenExclusions = new Set();
  let favoritesOnly = false;
  let pressureOnly = false;
  let robotOnly = false;
  let traditionalOnly = false;
  let dispensaLowStockOnly = false;
  let showArchivedOnly = false;

  // cooking mode state
  let cookRecipe = null;
  let cookStepIndex = 0;
  let cookTimerInterval = null;
  let cookReleaseTimerInterval = null;
  let cookTimerRemaining = 0;

  const CATEGORY_COLORS = {
    'Primi': '#c1440e', 'Secondi': '#8b2635', 'Zuppe & Vellutate': '#5c7a3a',
    'Impasti & Pane': '#b8892c', 'Salse & Sughi': '#a64b2a', 'Dolci': '#b83a6b',
    'Infusi & Tisane': '#8a6642', 'Altro': '#3f6e79'
  };

  // ---------- Storage ----------
  function loadRecipes(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      recipes = raw ? JSON.parse(raw) : seedData();
      if(!raw) saveRecipes();
    }catch(e){ recipes = seedData(); }
    try{
      const rawWeek = localStorage.getItem(WEEK_KEY);
      weekPlan = rawWeek ? JSON.parse(rawWeek) : {};
    }catch(e){ weekPlan = {}; }
    try{
      const rawMeals = localStorage.getItem(MEALTYPES_KEY);
      mealTypes = rawMeals ? JSON.parse(rawMeals) : DEFAULT_MEALTYPES.slice();
      if(!Array.isArray(mealTypes) || !mealTypes.length) mealTypes = DEFAULT_MEALTYPES.slice();
    }catch(e){ mealTypes = DEFAULT_MEALTYPES.slice(); }
    try{
      const rawServ = localStorage.getItem(PLAN_SERVINGS_KEY);
      planServings = rawServ ? (parseInt(rawServ,10) || 4) : 4;
    }catch(e){ planServings = 4; }
    try{
      const rawPantry = localStorage.getItem(PANTRY_KEY);
      if(rawPantry) pantryInput.value = rawPantry;
    }catch(e){}
    try{
      const rawLimit = localStorage.getItem(PANTRY_LIMIT_KEY);
      if(rawLimit) pantryMissingLimitEl.value = rawLimit;
    }catch(e){}
    try{
      const rawPrev = localStorage.getItem(PREV_WEEK_KEY);
      previousWeekPlan = rawPrev ? JSON.parse(rawPrev) : null;
    }catch(e){ previousWeekPlan = null; }
    try{
      const rawDispensa = localStorage.getItem(DISPENSA_ITEMS_KEY);
      dispensaItems = rawDispensa ? JSON.parse(rawDispensa) : [];
      if(!Array.isArray(dispensaItems)) dispensaItems = [];
    }catch(e){ dispensaItems = []; }
    try{
      const rawShoppingExtra = localStorage.getItem(SHOPPING_EXTRA_KEY);
      shoppingExtraItems = rawShoppingExtra ? JSON.parse(rawShoppingExtra) : [];
      if(!Array.isArray(shoppingExtraItems)) shoppingExtraItems = [];
    }catch(e){ shoppingExtraItems = []; }
    try{
      const rawNotes = localStorage.getItem(WEEK_NOTES_KEY);
      weekNotes = rawNotes ? JSON.parse(rawNotes) : {};
      if(!weekNotes || typeof weekNotes !== 'object') weekNotes = {};
    }catch(e){ weekNotes = {}; }
    try{
      const rawChecked = localStorage.getItem(SHOPPING_CHECKED_KEY);
      shoppingCheckedItems = rawChecked ? JSON.parse(rawChecked) : {};
      if(!shoppingCheckedItems || typeof shoppingCheckedItems !== 'object') shoppingCheckedItems = {};
    }catch(e){ shoppingCheckedItems = {}; }
  }
  function saveWeekNotes(){
    const ok = safeStorageSet(WEEK_NOTES_KEY, JSON.stringify(weekNotes));
    scriviSuFileCollegato();
    return ok;
  }
  function saveShoppingCheckedItems(){
    // Stato puramente locale di comodo (non va nel file collegato né nel backup): è normale che
    // si "pulisca" da solo nel tempo e non deve mischiarsi ai dati veri del ricettario.
    return safeStorageSet(SHOPPING_CHECKED_KEY, JSON.stringify(shoppingCheckedItems));
  }
  // Salva in localStorage intercettando l'errore di spazio esaurito nel browser: senza questo,
  // un salvataggio fallito passerebbe inosservato (la modifica resta visibile nell'interfaccia
  // ma sparisce alla riapertura). Avvisa una sola volta a sessione, per non intasare di avvisi
  // se lo spazio resta esaurito per più azioni di fila.
  let storageQuotaWarned = false;
  function safeStorageSet(key, value){
    try{
      localStorage.setItem(key, value);
      return true;
    }catch(err){
      if(!storageQuotaWarned){
        storageQuotaWarned = true;
        alert('Spazio di salvataggio esaurito nel browser: questa modifica (e probabilmente altre recenti) NON è stata salvata.\n\nPer liberare spazio: riduci il numero o la qualità delle foto nelle ricette, oppure esporta subito un backup per mettere al sicuro quello che hai già, poi ricarica la pagina.');
      }
      return false;
    }
  }
  function saveRecipes(){ const ok = safeStorageSet(STORAGE_KEY, JSON.stringify(recipes)); scriviSuFileCollegato(); return ok; }
  function saveWeek(){ const ok = safeStorageSet(WEEK_KEY, JSON.stringify(weekPlan)); scriviSuFileCollegato(); return ok; }
  function saveMealTypes(){ const ok = safeStorageSet(MEALTYPES_KEY, JSON.stringify(mealTypes)); scriviSuFileCollegato(); return ok; }
  function savePantry(text){ return safeStorageSet(PANTRY_KEY, text); }
  function savePlanServings(){ return safeStorageSet(PLAN_SERVINGS_KEY, String(planServings)); }
  function savePreviousWeek(plan){ return safeStorageSet(PREV_WEEK_KEY, JSON.stringify(plan)); }
  function saveDispensaItems(){ const ok = safeStorageSet(DISPENSA_ITEMS_KEY, JSON.stringify(dispensaItems)); scriviSuFileCollegato(); return ok; }
  function saveShoppingExtra(){ const ok = safeStorageSet(SHOPPING_EXTRA_KEY, JSON.stringify(shoppingExtraItems)); scriviSuFileCollegato(); return ok; }

  // ================================================================
  // Salvataggio su file collegato (File System Access API)
  // ----------------------------------------------------------------
  // In aggiunta (non al posto) della memoria del browser: se l'utente
  // sceglie di collegare un file sul proprio dispositivo, ogni modifica
  // a ricette/pianificazione/dispensa/lista spesa viene scritta anche
  // lì, con lo stesso formato del backup JSON già esistente. La memoria
  // del browser resta comunque sempre aggiornata come rete di sicurezza.
  //
  // Disponibile solo nei browser con la File System Access API
  // (Chrome, Edge e simili — non Firefox/Safari): dove non c'è, tutto
  // il codice qui sotto resta semplicemente inattivo.
  // ================================================================
  const STORAGE_CHOICE_DISMISSED_KEY = 'mc_ricettario_scelta_storage_saltata_v1';
  const FILE_HANDLE_DB_NAME = 'IlMioRicettarioFileHandleDB';
  const FILE_HANDLE_STORE = 'handles';
  const FILE_HANDLE_KEY = 'datiPrincipali';

  let fileCollegatoHandle = null;
  let fileCollegatoInAttesaDiPermesso = null; // handle trovato ma non ancora ri-autorizzato
  let scriviSuFileTimeoutId = null;

  function apriHandleDB(){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(FILE_HANDLE_DB_NAME, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore(FILE_HANDLE_STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function salvaHandleFileSalvato(handle){
    const db = await apriHandleDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILE_HANDLE_STORE, 'readwrite');
      tx.objectStore(FILE_HANDLE_STORE).put(handle, FILE_HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  async function leggiHandleFileSalvato(){
    const db = await apriHandleDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILE_HANDLE_STORE, 'readonly');
      const req = tx.objectStore(FILE_HANDLE_STORE).get(FILE_HANDLE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
  async function cancellaHandleFileSalvato(){
    const db = await apriHandleDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILE_HANDLE_STORE, 'readwrite');
      tx.objectStore(FILE_HANDLE_STORE).delete(FILE_HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function datiCompletiPerFile(){
    return { recipes, weekPlan, mealTypes, dispensaItems, shoppingExtraItems, weekNotes };
  }

  function aggiornaControlliMenuStorage(){
    const statusEl = document.getElementById('file-storage-status-text');
    const linkBtn = document.getElementById('file-storage-link-btn');
    const unlinkBtn = document.getElementById('file-storage-unlink-btn');
    if (fileCollegatoHandle) {
      statusEl.textContent = `Salvataggio: file "${fileCollegatoHandle.name}"`;
      linkBtn.textContent = '🗂️ Cambia file di salvataggio…';
      unlinkBtn.style.display = '';
    } else {
      statusEl.textContent = 'Salvataggio: solo in questo browser';
      linkBtn.textContent = '🗂️ Collega un file di salvataggio…';
      unlinkBtn.style.display = 'none';
    }
  }

  function scriviSuFileCollegato(){
    if (!fileCollegatoHandle) return;
    clearTimeout(scriviSuFileTimeoutId);
    scriviSuFileTimeoutId = setTimeout(async () => {
      try {
        const writable = await fileCollegatoHandle.createWritable();
        await writable.write(JSON.stringify(datiCompletiPerFile(), null, 2));
        await writable.close();
      } catch (err) {
        console.error('Errore scrivendo sul file di salvataggio collegato:', err);
        // Non blocca nulla: i dati restano comunque salvati nella memoria
        // del browser (safeStorageSet è già stato chiamato prima di questa).
      }
    }, 600); // debounce: raggruppa più modifiche ravvicinate in un solo salvataggio su disco
  }

  /** Applica il contenuto di un file collegato alle chiavi del browser
   * corrispondenti (stesso formato del backup JSON già esistente). */
  async function caricaDatiDaFileCollegato(handle){
    const file = await handle.getFile();
    const testo = await file.text();
    const dati = JSON.parse(testo);
    if (Array.isArray(dati.recipes)) safeStorageSet(STORAGE_KEY, JSON.stringify(dati.recipes));
    if (dati.weekPlan) safeStorageSet(WEEK_KEY, JSON.stringify(dati.weekPlan));
    if (Array.isArray(dati.mealTypes)) safeStorageSet(MEALTYPES_KEY, JSON.stringify(dati.mealTypes));
    if (Array.isArray(dati.dispensaItems)) safeStorageSet(DISPENSA_ITEMS_KEY, JSON.stringify(dati.dispensaItems));
    if (Array.isArray(dati.shoppingExtraItems)) safeStorageSet(SHOPPING_EXTRA_KEY, JSON.stringify(dati.shoppingExtraItems));
    if (dati.weekNotes && typeof dati.weekNotes === 'object') safeStorageSet(WEEK_NOTES_KEY, JSON.stringify(dati.weekNotes));
  }

  function mostraBannerRiconnessione(handle){
    fileCollegatoInAttesaDiPermesso = handle;
    document.getElementById('file-reconnect-text').textContent =
      `🔓 Il file "${handle.name}" ha bisogno di conferma per riconnettersi (i browser la richiedono a ogni sessione, per sicurezza). Intanto i dati restano salvati nel browser.`;
    document.getElementById('file-reconnect-banner').style.display = 'flex';
  }

  // "Non ora": nasconde il banner per questa sessione, il file resta collegato
  // e tornerà a proporsi alla prossima apertura.
  document.getElementById('file-reconnect-later-btn').addEventListener('click', () => {
    document.getElementById('file-reconnect-banner').style.display = 'none';
  });

  // "Non chiedere più": scollega davvero il file, così il banner non ricompare
  // più. I dati restano nella memoria del browser, come sempre.
  document.getElementById('file-reconnect-stop-btn').addEventListener('click', async () => {
    if (!confirm('Vuoi smettere di usare il file di salvataggio?\n\nI tuoi dati restano salvati nella memoria di questo browser e non perdi nulla. Potrai ricollegare un file quando vuoi da "📦 Backup e CSV".')) return;
    fileCollegatoInAttesaDiPermesso = null;
    fileCollegatoHandle = null;
    try { await cancellaHandleFileSalvato(); } catch (err) { console.error(err); }
    document.getElementById('file-reconnect-banner').style.display = 'none';
    aggiornaControlliMenuStorage();
  });

  document.getElementById('file-reconnect-btn').addEventListener('click', async () => {
    if (!fileCollegatoInAttesaDiPermesso) return;
    try {
      const permesso = await fileCollegatoInAttesaDiPermesso.requestPermission({ mode: 'readwrite' });
      if (permesso === 'granted') {
        await caricaDatiDaFileCollegato(fileCollegatoInAttesaDiPermesso);
        fileCollegatoHandle = fileCollegatoInAttesaDiPermesso;
        fileCollegatoInAttesaDiPermesso = null;
        document.getElementById('file-reconnect-banner').style.display = 'none';
        aggiornaControlliMenuStorage();
        location.reload(); // il modo più semplice e sicuro per rileggere tutto con i nuovi dati
      } else {
        alert('Permesso non concesso: il file resta scollegato per questa sessione. Puoi riprovare o collegarne un altro dal menu "📦 Backup e CSV".');
      }
    } catch (err) {
      console.error('Errore nel richiedere il permesso sul file collegato:', err);
      alert('Non è stato possibile riconnettersi al file. Puoi collegarne un altro dal menu "📦 Backup e CSV".');
    }
  });

  /** All'avvio: se un file era già stato collegato in precedenza, prova a
   * ricollegarlo automaticamente (senza bisogno di un nuovo clic, quando il
   * browser lo permette) e ne carica il contenuto PRIMA che l'app legga la
   * memoria del browser, così l'app parte già con i dati del file. */
  async function inizializzaStorageFileAllAvvio(){
    if (!('showSaveFilePicker' in window)) return;
    let handle;
    try {
      handle = await leggiHandleFileSalvato();
    } catch (err) {
      console.error('Impossibile leggere il file collegato salvato in precedenza:', err);
      return;
    }
    if (!handle) return;
    try {
      const permesso = await handle.queryPermission({ mode: 'readwrite' });
      if (permesso === 'granted') {
        await caricaDatiDaFileCollegato(handle);
        fileCollegatoHandle = handle;
      } else {
        mostraBannerRiconnessione(handle);
      }
    } catch (err) {
      console.error('Errore nel controllare il permesso sul file collegato:', err);
    }
  }

  /** Mostra la scelta iniziale "dove vuoi salvare i dati?" solo se: l'API è
   * disponibile, non c'è già un file collegato, e l'utente non l'ha già
   * saltata in precedenza. */
  function mostraSceltaStorageSeNecessario(){
    if (!('showSaveFilePicker' in window)) return;
    if (fileCollegatoHandle || fileCollegatoInAttesaDiPermesso) return;
    if (localStorage.getItem(STORAGE_CHOICE_DISMISSED_KEY)) return;
    document.getElementById('storage-choice-overlay').classList.add('active');
  }

  function chiudiSceltaStorage(){
    document.getElementById('storage-choice-overlay').classList.remove('active');
  }

  document.getElementById('storage-choice-close').addEventListener('click', () => {
    // Chiudere con la × equivale a "per ora niente": richiederà di nuovo al prossimo avvio,
    // a differenza del pulsante esplicito "Continua solo con la memoria del browser".
    chiudiSceltaStorage();
  });

  document.getElementById('storage-choice-skip-btn').addEventListener('click', () => {
    safeStorageSet(STORAGE_CHOICE_DISMISSED_KEY, '1');
    chiudiSceltaStorage();
  });

  /** Distingue, quando possibile, PERCHÉ showSaveFilePicker/showOpenFilePicker
   * hanno fallito, per dare un messaggio utile invece che uno generico. */
  function messaggioErroreFileSystem(err){
    if (!('showSaveFilePicker' in window) || err instanceof TypeError) {
      return 'Il tuo browser non supporta questa funzione: funziona solo su Chrome, Edge e browser basati su Chromium — non su Safari, Firefox, né su iOS (limite di quei browser). I tuoi dati restano comunque salvati normalmente nella memoria di questo browser.';
    }
    if (err && (err.name === 'SecurityError' || err.name === 'NotAllowedError')) {
      return 'Il browser ha bloccato l\'accesso ai file in questo contesto (es. aperto dentro un\'altra app, o come "app installata"): prova ad aprire il sito direttamente in una scheda del browser.';
    }
    return null; // nessuna causa specifica riconosciuta: il chiamante userà un messaggio generico
  }

  document.getElementById('storage-choice-new-btn').addEventListener('click', async () => {
    const statusEl = document.getElementById('storage-choice-status');
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'il-mio-ricettario-dati.json',
        types: [{ description: 'File dati Il Mio Ricettario', accept: { 'application/json': ['.json'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(datiCompletiPerFile(), null, 2));
      await writable.close();
      // Il file è già creato e scritto a questo punto: quello che segue
      // (ricordarlo per la prossima visita) è un extra, il cui eventuale
      // fallimento non deve annullare il collegamento appena riuscito.
      fileCollegatoHandle = handle;
      aggiornaControlliMenuStorage();
      safeStorageSet(STORAGE_CHOICE_DISMISSED_KEY, '1');
      chiudiSceltaStorage();
      try {
        await salvaHandleFileSalvato(handle);
      } catch (err) {
        console.error('File collegato correttamente, ma non è stato possibile ricordarlo per la prossima visita:', err);
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return; // l'utente ha annullato la finestra, nessun errore da mostrare
      console.error('Errore creando il file di salvataggio:', err);
      statusEl.textContent = messaggioErroreFileSystem(err) || 'Non è stato possibile creare il file: riprova, oppure continua con la memoria del browser.';
    }
  });

  document.getElementById('storage-choice-open-btn').addEventListener('click', async () => {
    const statusEl = document.getElementById('storage-choice-status');
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'File dati Il Mio Ricettario', accept: { 'application/json': ['.json'] } }]
      });
      const confermato = confirm('Aprire questo file sostituirà quello che vedi ora (ricette, dispensa, pianificazione) con il contenuto salvato nel file. Continuare?');
      if (!confermato) return;
      await caricaDatiDaFileCollegato(handle);
      safeStorageSet(STORAGE_CHOICE_DISMISSED_KEY, '1');
      try {
        await salvaHandleFileSalvato(handle);
      } catch (err) {
        console.error('File aperto correttamente, ma non è stato possibile ricordarlo per la prossima visita:', err);
      }
      location.reload();
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      console.error('Errore aprendo il file di salvataggio:', err);
      statusEl.textContent = messaggioErroreFileSystem(err) || 'Non è stato possibile aprire il file: verifica che sia un file dati valido di questo sito.';
    }
  });

  function mostraSceltaStorageNonSupportata(){
    document.getElementById('storage-choice-supportato').style.display = 'none';
    document.getElementById('storage-choice-non-supportato').style.display = 'block';
    document.getElementById('storage-choice-overlay').classList.add('active');
  }
  function mostraSceltaStorageSupportata(){
    document.getElementById('storage-choice-non-supportato').style.display = 'none';
    document.getElementById('storage-choice-supportato').style.display = 'block';
    document.getElementById('storage-choice-status').textContent = '';
    document.getElementById('storage-choice-overlay').classList.add('active');
  }

  document.getElementById('file-storage-link-btn').addEventListener('click', () => {
    if (!('showSaveFilePicker' in window)) {
      mostraSceltaStorageNonSupportata();
      return;
    }
    mostraSceltaStorageSupportata();
  });
  document.getElementById('storage-choice-fallback-export-btn').addEventListener('click', () => {
    chiudiSceltaStorage();
    document.getElementById('export-btn').click();
  });
  document.getElementById('storage-choice-fallback-close-btn').addEventListener('click', () => {
    chiudiSceltaStorage();
  });

  document.getElementById('file-storage-unlink-btn').addEventListener('click', async () => {
    if (!confirm('Scollegare il file? I dati restano comunque salvati nella memoria di questo browser, ma non verranno più scritti nel file.')) return;
    fileCollegatoHandle = null;
    try { await cancellaHandleFileSalvato(); } catch (err) { console.error(err); }
    aggiornaControlliMenuStorage();
  });

  // Le versioni precedenti salvavano una sola ricetta per giorno (stringa).
  // La convertiamo in una lista di voci { id, recipeId, mealType, time }.
  function migrateWeekPlan(){
    let changed = false;
    DAYS.forEach(day=>{
      const v = weekPlan[day];
      if(typeof v === 'string' && v){
        weekPlan[day] = [{ id: cryptoId(), recipeId: v, mealType: mealTypes[0], time: '' }];
        changed = true;
      }else if(!Array.isArray(v)){
        weekPlan[day] = [];
        changed = true;
      }
    });
    if(changed) saveWeek();
  }

  function seedData(){
    return [{
      id: cryptoId(), name: 'Carbonara risottata', category: 'Primi', servings: 3, time: 15,
      favorite:false, photo:'', lastMade:null, tags:[], allergens:['Glutine','Uova','Latte'], archived:false, freezable:false, timesMade:0, cookerType:'',
      ingredients: [
        {name:'Spaghetti', qty:300, unit:'g'}, {name:'Guanciale', qty:120, unit:'g'},
        {name:'Uova (tuorli)', qty:3, unit:''}, {name:'Pecorino grattugiato', qty:60, unit:'g'},
        {name:'Acqua', qty:600, unit:'g'}, {name:'Pepe nero', qty:1, unit:'pizzico'}
      ],
      steps: [
        {text:'Rosolare il guanciale a cubetti.', vel:2, temp:100, time:5, mode:'Normale'},
        {text:'Aggiungere pasta e acqua, cuocere mescolando dolcemente.', vel:1, temp:100, time:9, mode:'Reverse'},
        {text:'Fuori dal fuoco, mantecare con tuorli e pecorino mescolati.', vel:1, temp:0, time:1, mode:'Reverse'}
      ],
      stepsManual: [
        {text:'In una padella, rosola il guanciale a cubetti fino a renderlo croccante.'},
        {text:'Lessa gli spaghetti in acqua salata, scolali al dente conservando l\'acqua di cottura.'},
        {text:'Fuori dal fuoco, versa la pasta nella padella col guanciale e manteca velocemente con i tuorli e il pecorino già mescolati, aggiungendo poca acqua di cottura per legare.'}
      ],
      notes: 'Ricetta base — regola il sale con moderazione, il guanciale e il pecorino ne danno già molto.'
    }];
  }
  function cryptoId(){ return 'r_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8); }

  function migrateRecipe(r){
    if(r.favorite === undefined) r.favorite = false;
    if(r.photo === undefined) r.photo = '';
    if(r.lastMade === undefined) r.lastMade = null;
    if(!Array.isArray(r.tags)) r.tags = [];
    if(!Array.isArray(r.allergens)) r.allergens = [];
    if(r.archived === undefined) r.archived = false;
    if(r.freezable === undefined) r.freezable = false;
    if(r.timesMade === undefined) r.timesMade = r.lastMade ? 1 : 0;
    if(r.cookerType === undefined) r.cookerType = '';
    if(!Array.isArray(r.steps)) r.steps = [];
    // Le ricette dalla vecchia versione avevano un secondo elenco di passaggi
    // "senza robot" parallelo. Lo confluiamo nelle note, una sola volta, poi
    // rimuoviamo il campo così le versioni future non lo trovano più.
    if(Array.isArray(r.stepsManual)){
      if(r.stepsManual.length){
        const altText = r.stepsManual.map((s,i)=>`${i+1}. ${(s.text||'').trim()}`).filter(l=>l.trim().length>2).join('\n');
        if(altText){
          const header = 'Metodo alternativo (dalla versione precedente):';
          r.notes = (r.notes ? r.notes.trim() + '\n\n' : '') + header + '\n' + altText;
        }
      }
      delete r.stepsManual;
    }
    return r;
  }

  function escapeHtml(s){ const d=document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; }
  function escapeAttr(s){ return (s ?? '').toString().replace(/"/g,'&quot;'); }
  function normalize(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }

  // ---------- Avviso di conferma (al posto del confirm() nativo del browser, per le azioni
  // che non si possono annullare: pi\u00f9 leggibile su pi\u00f9 righe e visivamente pi\u00f9 "pesante"
  // quando danger \u00e8 true, invece di un avviso identico per qualunque tipo di conferma) ----------
  function confirmDialog(opts){
    const { title, message, confirmText, cancelText, danger } = (typeof opts === 'string') ? { message: opts } : opts;
    return new Promise(resolve=>{
      const overlay = document.getElementById('confirm-overlay');
      document.getElementById('confirm-title').textContent = title || (danger ? 'Conferma eliminazione' : 'Conferma');
      document.getElementById('confirm-message').textContent = message || '';
      const okBtn = document.getElementById('confirm-ok-btn');
      const cancelBtn = document.getElementById('confirm-cancel-btn');
      okBtn.textContent = confirmText || (danger ? 'Elimina' : 'Conferma');
      cancelBtn.textContent = cancelText || 'Annulla';
      okBtn.classList.toggle('btn-danger-action', !!danger);
      function cleanup(result){
        overlay.classList.remove('active');
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        overlay.removeEventListener('click', onBackdrop);
        document.removeEventListener('keydown', onKeydown);
        resolve(result);
      }
      function onOk(){ cleanup(true); }
      function onCancel(){ cleanup(false); }
      function onBackdrop(e){ if(e.target === overlay) cleanup(false); }
      function onKeydown(e){ if(e.key === 'Escape') cleanup(false); }
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      overlay.addEventListener('click', onBackdrop);
      document.addEventListener('keydown', onKeydown);
      overlay.classList.add('active');
      okBtn.focus();
    });
  }

  // ---------- List rendering ----------
  const listEl = document.getElementById('recipe-list');
  const searchEl = document.getElementById('search');
  const categoryFilterEl = document.getElementById('category-filter');
  const timeFilterEl = document.getElementById('time-filter');
  const sortSelectEl = document.getElementById('sort-select');
  const favoritesFilterBtn = document.getElementById('favorites-filter-btn');

  function sortRecipes(list){
    const arr = list.slice();
    switch(sortMode){
      case 'name-desc': return arr.sort((a,b)=> b.name.localeCompare(a.name));
      case 'recent': return arr.reverse(); // l'array recipes mantiene l'ordine di inserimento: invertirlo porta le più recenti in cima
      case 'last-made': return arr.sort((a,b)=>{
        if(a.lastMade && b.lastMade) return b.lastMade.localeCompare(a.lastMade);
        if(a.lastMade) return -1;
        if(b.lastMade) return 1;
        return a.name.localeCompare(b.name);
      });
      case 'most-made': return arr.sort((a,b)=> (b.timesMade||0) - (a.timesMade||0) || a.name.localeCompare(b.name));
      case 'name-asc':
      default: return arr.sort((a,b)=> a.name.localeCompare(b.name));
    }
  }

  function daysSince(dateStr){
    if(!dateStr) return null;
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    return diff;
  }
  function lastMadeLabel(dateStr){
    if(!dateStr) return '';
    const d = daysSince(dateStr);
    if(d === 0) return 'Preparata oggi';
    if(d === 1) return 'Preparata ieri';
    return `Preparata ${d} giorni fa`;
  }

  function ingredientCovered(recipeIngredientName, pantryList){
    const target = normalize(recipeIngredientName);
    return pantryList.some(p=> p && (target.includes(p) || p.includes(target)));
  }
  /**
   * Confronta una ricetta con quello che c'è a disposizione.
   * - `missing`: ingredienti che non risultano proprio disponibili
   * - `insufficienti`: ingredienti presenti in Dispensa ma in quantità
   *   inferiore a quella richiesta per le porzioni indicate. Il controllo
   *   si può fare solo quando sia la ricetta sia il prodotto in Dispensa
   *   hanno una quantità e un'unità confrontabile (g/kg, ml/l...): negli
   *   altri casi l'ingrediente è considerato semplicemente disponibile,
   *   invece di inventare un confronto non affidabile.
   */
  function computeMatch(recipe, pantryList, porzioniRichieste){
    const missing = recipe.ingredients.filter(ing=>!ingredientCovered(ing.name, pantryList)).map(i=>i.name);

    const insufficienti = [];
    const porzioni = parseFloat(porzioniRichieste);
    const base = parseFloat(recipe.servings) || 1;
    if(porzioni > 0){
      const fattore = porzioni / base;
      recipe.ingredients.forEach(ing=>{
        if(missing.includes(ing.name)) return;           // già segnalato come mancante
        const richiesta = parseFloat(ing.qty);
        if(!richiesta || !ing.unit) return;              // ricetta senza quantità: niente da confrontare
        const prodotto = trovaProdottoDispensaPerIngrediente(ing.name);
        if(!prodotto) return;                            // disponibile ma non dalla Dispensa (es. scritto a mano)
        const disponibile = parseFloat(prodotto.qty);
        if(!disponibile && disponibile !== 0) return;    // in Dispensa non è indicata una quantità
        const richiestaConvertita = convertQty(richiesta * fattore, ing.unit, prodotto.unit);
        if(richiestaConvertita === null) return;         // unità non confrontabili automaticamente
        if(disponibile < richiestaConvertita){
          insufficienti.push({
            nome: ing.name,
            serve: Math.round(richiestaConvertita * 100) / 100,
            hai: disponibile,
            unita: prodotto.unit || ''
          });
        }
      });
    }
    return { missing, insufficienti };
  }

  /** Cerca in Dispensa il prodotto che corrisponde a un ingrediente, prima
   * per nome identico e poi, se il candidato è uno solo, per nome simile
   * (stesso criterio prudente già usato altrove nel sito). */
  function trovaProdottoDispensaPerIngrediente(nomeIngrediente){
    const n = normalize(nomeIngrediente);
    if(!n) return null;
    const esatto = dispensaItems.find(it => normalize(it.name) === n);
    if(esatto) return esatto;
    const simili = dispensaItems.filter(it=>{
      const nome = normalize(it.name);
      return nome && (nome.includes(n) || n.includes(nome));
    });
    return simili.length === 1 ? simili[0] : null;
  }

  // Ingredienti di una ricetta non coperti da quello che c'è nella Dispensa (sezione "🥫 Dispensa")
  function missingFromDispensa(recipe){
    const dispensaNames = dispensaItems.map(it => normalize(it.name)).filter(Boolean);
    return (recipe.ingredients || []).filter(ing => ing.name && !ingredientCovered(ing.name, dispensaNames));
  }

  // Quando una ricetta viene aggiunta alla pianificazione, segnala gli ingredienti mancanti dalla
  // Dispensa e, con conferma, li aggiunge al promemoria della lista della spesa.
  function offerAddMissingToShoppingList(recipe){
    if(!recipe) return;
    const missing = missingFromDispensa(recipe);
    if(!missing.length) return;
    const elenco = missing.map(i => i.name).join(', ');
    const ok = confirm(`Questi ingredienti di "${recipe.name}" non risultano in Dispensa:\n${elenco}\n\nAggiungerli alla lista della spesa?`);
    if(!ok) return;
    let added = 0;
    missing.forEach(ing=>{
      const key = normalize(ing.name) + '|' + normalize(ing.unit);
      const already = shoppingExtraItems.some(x => (normalize(x.name) + '|' + normalize(x.unit)) === key);
      if(!already){
        shoppingExtraItems.push({ id: cryptoId(), name: ing.name, unit: ing.unit || '' });
        added++;
      }
    });
    if(added) saveShoppingExtra();
  }

  // Cerca in Dispensa un prodotto che corrisponda a un ingrediente per nome. Prova prima un nome
  // identico (il più affidabile per agire in automatico, es. sottrarre una quantità); se non c'è,
  // una corrispondenza più elastica come quella di "Cosa posso cucinare?" — ma solo se il candidato
  // possibile è unico, per non rischiare di agire per errore su un prodotto simile ma diverso (es.
  // "Farina 00" invece di "Farina di mais"). Restituisce { match, isApprox, ambiguous }: "match" è
  // il prodotto trovato (o null), "isApprox" indica se è una corrispondenza elastica e non per nome
  // esatto, "ambiguous" è l'eventuale elenco di più candidati quando non se ne può scegliere uno solo.
  function pantryIcon(category){
    const icons = {
      'Frutta':'🍎','Verdura':'🥬','Uova':'🥚','Salumi':'🥩','Latticini e pronti':'🥛',
      'Surgelati':'❄️','Pasta, riso e cereali':'🍝','Legumi':'🫘','Farine, zucchero e lieviti':'🌾',
      'Conserve e scatolame':'🥫','Spezie e condimenti':'🧂','Oli, aceti e grassi':'🫒','Bevande':'🥤',
      'Snack e dolciumi':'🍪','Altro':'📦'
    };
    return icons[category] || '📦';
  }

  function findDispensaMatch(ingredientName){
    const target = normalize(ingredientName);
    const exact = dispensaItems.find(it => normalize(it.name) === target);
    if(exact) return { match: exact, isApprox: false, ambiguous: [] };
    const fuzzy = dispensaItems.filter(it=>{
      const p = normalize(it.name);
      return p && (target.includes(p) || p.includes(target));
    });
    if(fuzzy.length === 1) return { match: fuzzy[0], isApprox: true, ambiguous: [] };
    if(fuzzy.length > 1) return { match: null, isApprox: false, ambiguous: fuzzy };
    return { match: null, isApprox: false, ambiguous: [] };
  }

  // Fattori di conversione verso un'unità di base (grammi per il peso, millilitri per il volume,
  // 1 per le unità "a conteggio"), per confrontare e somm are quantità anche quando le unità sono
  // scritte in modo diverso ma equivalenti (es. "g" e "grammi", oppure "cucchiaio" e "cucchiai",
  // singolare/plurale della stessa unità).
  const UNIT_BASE_FACTOR = {
    g:1, gr:1, grammo:1, grammi:1,
    kg:1000, kilo:1000, kili:1000, chilo:1000, chili:1000, chilogrammo:1000, chilogrammi:1000,
    mg:0.001, milligrammo:0.001, milligrammi:0.001,
    ml:1, millilitro:1, millilitri:1,
    cl:10, centilitro:10, centilitri:10,
    l:1000, lt:1000, litro:1000, litri:1000,
    // Unità "a conteggio": nessuna conversione numerica tra loro, solo singolare/plurale
    // (e qualche abbreviazione comune) della stessa unità, quindi fattore 1 su tutte.
    cucchiaio:1, cucchiai:1,
    cucchiaino:1, cucchiaini:1,
    pizzico:1, pizzichi:1,
    pezzo:1, pezzi:1, pz:1,
    tazza:1, tazze:1,
    fetta:1, fette:1,
    spicchio:1, spicchi:1,
    rametto:1, rametti:1,
    filetto:1, filetti:1,
    foglia:1, foglie:1,
  };
  const UNIT_DIMENSION = {
    g:'peso', gr:'peso', grammo:'peso', grammi:'peso', kg:'peso', kilo:'peso', kili:'peso',
    chilo:'peso', chili:'peso', chilogrammo:'peso', chilogrammi:'peso', mg:'peso', milligrammo:'peso', milligrammi:'peso',
    ml:'volume', millilitro:'volume', millilitri:'volume', cl:'volume', centilitro:'volume', centilitri:'volume',
    l:'volume', lt:'volume', litro:'volume', litri:'volume',
    // Ogni unità a conteggio è la sua stessa "dimensione": cucchiai e cucchiaini, per
    // esempio, non sono la stessa cosa e non vanno confusi, ma cucchiaio/cucchiai sì.
    cucchiaio:'cucchiaio', cucchiai:'cucchiaio',
    cucchiaino:'cucchiaino', cucchiaini:'cucchiaino',
    pizzico:'pizzico', pizzichi:'pizzico',
    pezzo:'pezzo', pezzi:'pezzo', pz:'pezzo',
    tazza:'tazza', tazze:'tazza',
    fetta:'fetta', fette:'fetta',
    spicchio:'spicchio', spicchi:'spicchio',
    rametto:'rametto', rametti:'rametto',
    filetto:'filetto', filetti:'filetto',
    foglia:'foglia', foglie:'foglia',
  };
  // Forma "da mostrare" di ogni unità riconosciuta, in base alla quantità (singolare per 1,
  // plurale altrimenti) — usata quando si somma una quantità in un'unità comune per la lista
  // della spesa, per scegliere un'etichetta leggibile invece di ripetere l'unità del primo
  // ingrediente trovato.
  // (peso e volume non hanno bisogno di voci qui: la scelta tra g/kg e ml/l è automatica,
  // vedi displayUnitForGroup)
  const UNIT_DISPLAY_FORMS = {
    cucchiaio: {1:'cucchiaio', many:'cucchiai'},
    cucchiaino: {1:'cucchiaino', many:'cucchiaini'},
    pizzico: {1:'pizzico', many:'pizzichi'},
    pezzo: {1:'pezzo', many:'pezzi'},
    tazza: {1:'tazza', many:'tazze'},
    fetta: {1:'fetta', many:'fette'},
    spicchio: {1:'spicchio', many:'spicchi'},
    rametto: {1:'rametto', many:'rametti'},
    filetto: {1:'filetto', many:'filetti'},
    foglia: {1:'foglia', many:'foglie'},
  };
  // Converte una quantità da un'unità nota a un'altra equivalente (stessa grandezza per peso/volume,
  // es. kg -> g, l -> ml; singolare/plurale per le unità a conteggio, es. cucchiaio -> cucchiai).
  // Restituisce null se le due unità non sono equivalenti o non sono tra quelle riconosciute:
  // in quel caso la conversione resta manuale, non essendo affidabile farla in automatico.
  function convertQty(qty, fromUnit, toUnit){
    const from = normalize(fromUnit), to = normalize(toUnit);
    if(from === to) return qty;
    const fromFactor = UNIT_BASE_FACTOR[from], toFactor = UNIT_BASE_FACTOR[to];
    if(fromFactor === undefined || toFactor === undefined) return null;
    if(UNIT_DIMENSION[from] !== UNIT_DIMENSION[to]) return null;
    return qty * fromFactor / toFactor;
  }
  // Gruppo "semantico" di un'unità (peso, volume, o il nome canonico di un'unità a conteggio),
  // usato per raggruppare/confrontare unità scritte in modo diverso ma equivalenti. Per un'unità
  // non riconosciuta (es. "confezione", "lattina"...) ritorna il testo normalizzato così com'è:
  // resta un gruppo a sé, senza inventare equivalenze non affidabili.
  function unitGroupKey(unit){
    const u = normalize(unit);
    return UNIT_DIMENSION[u] || u;
  }
  // Due unità sono "equivalenti" se convertibili l'una nell'altra (stessa grandezza per peso/volume,
  // o stessa unità a conteggio in singolare/plurale) — usata per confrontare un'unità scritta nella
  // ricetta/pianificazione con quella usata in Dispensa, che può differire solo nella forma.
  function unitsMatch(a, b){ return convertQty(1, a, b) !== null; }

  // Segna un pasto pianificato come consumato: se possibile, scala la quantità corrispondente
  // in Dispensa. Per i pasti "dalla dispensa" il collegamento è diretto ed esatto; per i pasti da
  // ricetta si cerca un prodotto Dispensa con nome simile e si scala solo se l'unità di misura
  // coincide esattamente — altrimenti quel prodotto non viene toccato.
  function markPlanEntryConsumed(entry){
    if(entry.dispensaItemId){
      const it = dispensaItems.find(x => x.id === entry.dispensaItemId);
      if(!it){ alert('Il prodotto collegato non è più in Dispensa.'); return; }
      const amount = parseFloat(entry.qty);
      const currentQty = parseFloat(it.qty);
      // Converte la quantità del pasto nell'unità usata in Dispensa, così "0,5 kg" nel pasto e
      // "g" in Dispensa (o "cucchiaio"/"cucchiai") vengono riconosciuti come la stessa unità.
      const amountInItUnit = !isNaN(amount) ? convertQty(amount, entry.unit, it.unit) : null;
      const canScale = entry.qty && !isNaN(amount) && amountInItUnit !== null && !isNaN(currentQty);
      let msg;
      if(canScale){
        const nextQty = Math.round(Math.max(0, currentQty - amountInItUnit) * 100) / 100;
        msg = `Segnare "${it.name}" come consumato e togliere ${roundNice(amount)} ${entry.unit || ''} dalla Dispensa? (restano ${roundNice(nextQty)} ${it.unit || ''})`;
      }else{
        const reason = !entry.qty ? 'non avevi indicato una quantità per questo pasto'
          : (amountInItUnit === null ? `l'unità del pasto ("${entry.unit || '—'}") non coincide con quella in Dispensa ("${it.unit || '—'}")`
          : 'in Dispensa non è indicata una quantità di partenza');
        msg = `Segnare "${it.name}" come consumato? La quantità in Dispensa non verrà modificata: ${reason}.`;
      }
      if(!confirm(msg)) return;
      if(canScale){
        const nextQty = Math.round(Math.max(0, currentQty - amountInItUnit) * 100) / 100;
        it.qty = String(nextQty);
        saveDispensaItems();
        renderDispensaList();
        entry.consumedUndo = [{ id: it.id, amount: amountInItUnit }];
      }else{
        entry.consumedUndo = [];
      }
      entry.consumed = true;
      saveWeek();
      renderPlanningDays();
      return;
    }

    const recipe = recipes.find(r => r.id === entry.recipeId);
    if(!recipe){ alert('La ricetta collegata non è più tra le tue ricette.'); return; }
    const scale = planServings / (recipe.servings || 1);
    const runningQty = new Map(); // prodotto Dispensa -> quantità via via aggiornata, per gestire più ingredienti che puntano allo stesso prodotto
    const toUpdate = [];
    const skipped = new Set();
    const ambiguousSkipped = [];
    (recipe.ingredients || []).forEach(ing=>{
      if(!ing.name) return;
      const { match, ambiguous } = findDispensaMatch(ing.name);
      if(ambiguous.length){
        ambiguousSkipped.push(`${ing.name} (potrebbe essere: ${ambiguous.map(x=>x.name).join(', ')})`);
        return;
      }
      if(!match) return;
      const amount = (parseFloat(ing.qty) || 0) * scale;
      if(!amount) return;
      // Converte la quantità dell'ingrediente nell'unità del prodotto in Dispensa, per
      // riconoscere come la stessa unità anche scritture diverse ma equivalenti (g/kg, l/ml,
      // cucchiaio/cucchiai...).
      const amountInMatchUnit = convertQty(amount, ing.unit, match.unit);
      if(amountInMatchUnit === null){
        skipped.add(match.name);
        return;
      }
      const currentQty = runningQty.has(match) ? runningQty.get(match) : parseFloat(match.qty);
      if(isNaN(currentQty)){
        skipped.add(match.name);
        return;
      }
      const nextQty = Math.round(Math.max(0, currentQty - amountInMatchUnit) * 100) / 100;
      runningQty.set(match, nextQty);
      toUpdate.push({ item: match, amount, amountConverted: amountInMatchUnit, unit: ing.unit, nextQty });
    });
    let msg = `Segnare "${recipe.name}" come consumata?`;
    if(toUpdate.length){
      msg += `\n\nVerranno tolti dalla Dispensa:\n` + toUpdate.map(u=>`- ${u.item.name}: -${formatQtyForUnit(u.amount, u.unit)} ${u.unit} (restano ${roundNice(u.nextQty)} ${u.item.unit})`).join('\n');
    }
    if(skipped.size){
      msg += `\n\nNon modificati (unità diverse o quantità non indicata in Dispensa): ${Array.from(skipped).join(', ')}.`;
    }
    if(ambiguousSkipped.length){
      msg += `\n\nNon modificati (più prodotti simili in Dispensa, verifica tu): ${ambiguousSkipped.join('; ')}.`;
    }
    if(!toUpdate.length && !skipped.size && !ambiguousSkipped.length){
      msg += `\n\nNessun ingrediente corrispondente trovato in Dispensa: nessuna modifica.`;
    }
    if(!confirm(msg)) return;
    if(toUpdate.length){
      toUpdate.forEach(u=>{ u.item.qty = String(u.nextQty); });
      saveDispensaItems();
      renderDispensaList();
    }
    entry.consumedUndo = toUpdate.map(u => ({ id: u.item.id, amount: u.amountConverted }));
    entry.consumed = true;
    saveWeek();
    renderPlanningDays();
  }

  // Annulla "pasto consumato": ripristina in Dispensa quanto era stato tolto (dove il prodotto
  // esiste ancora) e riporta il pasto pianificato allo stato "da consumare".
  function undoPlanEntryConsumed(entry){
    const changes = entry.consumedUndo || [];
    if(!confirm('Annullare "consumato" per questo pasto? Le quantità tolte dalla Dispensa (dove possibile) verranno ripristinate.')) return;
    let restored = 0;
    changes.forEach(c=>{
      const it = dispensaItems.find(x => x.id === c.id);
      if(it){
        const cur = parseFloat(it.qty) || 0;
        it.qty = String(Math.round((cur + c.amount) * 100) / 100);
        restored++;
      }
    });
    if(restored){ saveDispensaItems(); renderDispensaList(); }
    entry.consumed = false;
    delete entry.consumedUndo;
    saveWeek();
    renderPlanningDays();
  }

  function recipeHasPressure(r){
    return (r.steps || []).some(s => !!(s.pressure || s.minLiquid || s.pressureReleaseMin || (s.pressureRelease && s.pressureRelease !== 'Naturale')));
  }
  function recipeHasRobot(r){
    return (r.steps || []).some(s => !!(s.vel || s.temp || (s.mode && s.mode !== 'Normale')));
  }
  function recipeIsTraditional(r){
    return !recipeHasRobot(r) && !recipeHasPressure(r);
  }

  // ---------- Selezione multipla di ricette ----------
  let selectionMode = false;
  const ricetteSelezionate = new Set();

  function aggiornaBarraSelezione(){
    const n = ricetteSelezionate.size;
    document.getElementById('selection-count').textContent =
      n === 0 ? 'Nessuna ricetta selezionata' : `${n} ricett${n === 1 ? 'a selezionata' : 'e selezionate'}`;
    document.getElementById('selection-delete-btn').disabled = (n === 0);
  }

  function impostaModalitaSelezione(attiva){
    selectionMode = attiva;
    if(!attiva) ricetteSelezionate.clear();
    document.getElementById('selection-bar').style.display = attiva ? 'flex' : 'none';
    document.getElementById('select-mode-btn').classList.toggle('active', attiva);
    aggiornaBarraSelezione();
    renderList();
  }

  document.getElementById('select-mode-btn').addEventListener('click', ()=> impostaModalitaSelezione(!selectionMode));
  document.getElementById('selection-exit-btn').addEventListener('click', ()=> impostaModalitaSelezione(false));
  document.getElementById('selection-none-btn').addEventListener('click', ()=>{
    ricetteSelezionate.clear();
    aggiornaBarraSelezione();
    renderList();
  });
  document.getElementById('selection-all-btn').addEventListener('click', ()=>{
    // Seleziona solo le ricette attualmente visibili nell'elenco (cioè che
    // passano ricerca e filtri), non tutte quelle esistenti: è quello che
    // ci si aspetta guardando lo schermo.
    listEl.querySelectorAll('.card[data-recipe-id]').forEach(c => ricetteSelezionate.add(c.dataset.recipeId));
    aggiornaBarraSelezione();
    renderList();
  });
  document.getElementById('selection-delete-btn').addEventListener('click', async ()=>{
    const n = ricetteSelezionate.size;
    if(n === 0) return;
    const nomi = recipes.filter(r=>ricetteSelezionate.has(r.id)).map(r=>`• ${r.name}`).join('\n');
    const ok = await confirmDialog({
      title: `Eliminare ${n} ricett${n===1?'a':'e'}?`,
      message: `${nomi}\n\nL'operazione non si può annullare.`,
      confirmText: `Elimina ${n} ricett${n===1?'a':'e'}`,
      danger: true
    });
    if(!ok) return;
    recipes = recipes.filter(r => !ricetteSelezionate.has(r.id));
    // Toglie anche le voci pianificate che puntavano alle ricette eliminate,
    // per non lasciare "(ricetta eliminata)" nella settimana.
    DAYS.forEach(d=>{
      if(weekPlan[d]) weekPlan[d] = weekPlan[d].filter(e => !e.recipeId || !ricetteSelezionate.has(e.recipeId));
    });
    saveRecipes(); saveWeek();
    impostaModalitaSelezione(false);
    renderPlanningDays();
  });

  // Applica a tutte le ricette gli stessi filtri (ricerca, categoria, tempo, preferite, metodo di
  // cottura, tag, allergeni esclusi, ingredienti esclusi, archiviate) usati dall'elenco a schermo —
  // estratta a parte così anche l'esportazione PDF dell'intero ricettario può riutilizzarla ed
  // esportare esattamente le ricette che si vedono in quel momento, non sempre tutte.
  function getFilteredRecipes(){
    const q = searchEl.value.trim().toLowerCase();
    const cat = categoryFilterEl.value;
    const timeFilter = timeFilterEl.value;
    return recipes.filter(r=>{
      if(showArchivedOnly){ if(!r.archived) return false; }
      else { if(r.archived) return false; }
      if(favoritesOnly && !r.favorite) return false;
      if(pressureOnly && !recipeHasPressure(r)) return false;
      if(robotOnly && !recipeHasRobot(r)) return false;
      if(traditionalOnly && !recipeIsTraditional(r)) return false;
      const matchesCat = !cat || r.category === cat;
      if(!matchesCat) return false;
      if(timeFilter === 'has-time' && !r.time) return false;
      if(timeFilter && timeFilter !== 'has-time'){
        if(!r.time || r.time > parseInt(timeFilter, 10)) return false;
      }
      if(activeTagFilters.size > 0){
        const rTags = r.tags || [];
        for(const t of activeTagFilters){ if(!rTags.includes(t)) return false; }
      }
      if(activeAllergenExclusions.size > 0){
        const rAllergens = r.allergens || [];
        for(const a of activeAllergenExclusions){ if(rAllergens.includes(a)) return false; }
      }
      if(excludeItems.length > 0){
        const hasExcluded = r.ingredients.some(ing=>{
          const name = normalize(ing.name);
          return excludeItems.some(ex=> name.includes(ex));
        });
        if(hasExcluded) return false;
      }
      if(!q) return true;
      const inName = r.name.toLowerCase().includes(q);
      const inIngr = r.ingredients.some(i=>i.name.toLowerCase().includes(q));
      return inName || inIngr;
    });
  }

  function renderList(){
    let filtered = getFilteredRecipes();

    listEl.innerHTML = '';

    if(pantryMode){
      const limit = pantryMissingLimit();
      const porzioniRichieste = parseInt(document.getElementById('pantry-servings').value, 10) || 0;
      let scored = filtered.map(r=>({
        recipe:r,
        match: computeMatch(r, currentPantryMatchList(), porzioniRichieste),
        priorityMatches: priorityPantryNames.length
          ? r.ingredients.filter(ing=>ingredientCovered(ing.name, priorityPantryNames)).map(ing=>ing.name)
          : []
      }));
      if(priorityPantryNames.length) scored = scored.filter(({priorityMatches})=>priorityMatches.length > 0);
      scored = scored.filter(({match}) => match.missing.length <= limit);
      scored.sort((a,b)=> (b.priorityMatches.length - a.priorityMatches.length)
        || (a.match.missing.length - b.match.missing.length)
        || (a.match.insufficienti.length - b.match.insufficienti.length));
      if(scored.length === 0){
        const messaggio = priorityPantryNames.length
          ? 'Nessuna ricetta usa i prodotti che scadono a breve con i filtri attuali. Prova a rimuovere filtri o ad aggiungere una ricetta che li utilizzi.'
          : `Nessuna ricetta${limit === Infinity ? '' : (limit === 0 ? ' già pronta con quello che hai' : ` con al massimo ${limit} ingredient${limit===1?'e':'i'} mancant${limit===1?'e':'i'}`)} in questa categoria/ricerca. Prova ad alzare la soglia di ingredienti mancanti, oppure aggiungi qualcosa in Dispensa.`;
        listEl.innerHTML = `<div class="empty-state">${messaggio}</div>`;
        return;
      }
      scored.forEach(({recipe:r, match, priorityMatches})=>{
        const card = document.createElement('div');
        card.className = 'card';
        card.style.setProperty('--cat-color', CATEGORY_COLORS[r.category] || '#8c6a2f');
        const ready = match.missing.length === 0;
        const scarso = match.insufficienti.length > 0;
        const badge = ready
          ? (scarso ? `<span class="match-badge scarso">⚠ Quantità scarse</span>`
                    : `<span class="match-badge ready">✓ Puoi farla</span>`)
          : `<span class="match-badge missing">Manca ${match.missing.length} ingr.</span>`;
        card.innerHTML = `
          ${badge}
          ${ready ? `<div class="pantry-caveat">Controllare le quantità effettive che hai a disposizione</div>` : ''}
          ${priorityMatches.length ? `<div class="match-badge ready" style="position:static;display:inline-block;margin:0 0 6px;">🍽 Usa prima: ${priorityMatches.map(escapeHtml).join(', ')}</div>` : ''}
          ${recipeHasPressure(r) ? '<span class="pressure-badge" title="Ha passaggi per pentola a pressione">🍲</span>' : ''}
          ${recipeHasRobot(r) ? '<span class="robot-badge" title="Ha passaggi con impostazioni robot da cucina">🤖</span>' : ''}
          ${recipeIsTraditional(r) ? '<span class="traditional-badge" title="Ricetta tradizionale, senza robot né pentola a pressione">🔥</span>' : ''}
          <h3>${escapeHtml(r.name)}</h3>
          <div class="meta"><span>${r.servings} porzioni base</span>${r.time?`<span>· ${r.time} min</span>`:''}</div>
          ${!ready?`<div class="missing-list"><b>Ti manca:</b> ${match.missing.map(escapeHtml).join(', ')}</div>`:''}
          ${scarso?`<div class="missing-list scarso"><b>Per ${porzioniRichieste} porzioni potrebbe non bastare:</b> ${
            match.insufficienti.map(i=>`${escapeHtml(i.nome)} (servono ${roundNice(i.serve)} ${escapeHtml(i.unita)}, hai ${roundNice(i.hai)})`).join(', ')
          }</div>`:''}
        `;
        card.addEventListener('click', ()=> openView(r.id));
        listEl.appendChild(card);
      });
      return;
    }

    if(filtered.length === 0){ listEl.innerHTML = '<div class="empty-state">Nessuna ricetta trovata. Prova a cercare altro, oppure aggiungine una nuova.</div>'; return; }

    filtered = sortRecipes(filtered);

    filtered.forEach(r=>{
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.recipeId = r.id;
      const selezionata = ricetteSelezionate.has(r.id);
      if(selectionMode && selezionata) card.classList.add('selezionata');
      card.style.setProperty('--cat-color', CATEGORY_COLORS[r.category] || '#8c6a2f');
      card.innerHTML = `
        ${selectionMode
          ? `<span class="card-select-box">${selezionata ? '☑️' : '⬜'}</span>`
          : `<button class="star ${r.favorite?'active':''}" data-id="${r.id}">★</button>`}
        ${r.photo ? `<img class="thumb" src="${r.photo}" alt="${escapeAttr(r.name)}">` : ''}
        <span class="cat-tag">${escapeHtml(r.category)}</span>
        ${recipeHasPressure(r) ? '<span class="pressure-badge" title="Ha passaggi per pentola a pressione">🍲</span>' : ''}
        ${recipeHasRobot(r) ? '<span class="robot-badge" title="Ha passaggi con impostazioni robot da cucina">🤖</span>' : ''}
        ${recipeIsTraditional(r) ? '<span class="traditional-badge" title="Ricetta tradizionale, senza robot né pentola a pressione">🔥</span>' : ''}
        <h3>${escapeHtml(r.name)}</h3>
        <div class="meta">
          <span>${r.servings} porzioni base</span>
          ${r.time ? `<span>· ${r.time} min</span>` : ''}
          <span>· ${r.ingredients.length} ingredienti</span>
        </div>
        ${r.lastMade ? `<div class="last-made">${lastMadeLabel(r.lastMade)}</div>` : ''}
      `;
      const star = card.querySelector('.star');
      if(star){
        star.addEventListener('click', (e)=>{
          e.stopPropagation();
          r.favorite = !r.favorite;
          saveRecipes();
          renderList();
        });
      }
      card.addEventListener('click', ()=>{
        if(selectionMode){
          if(ricetteSelezionate.has(r.id)) ricetteSelezionate.delete(r.id);
          else ricetteSelezionate.add(r.id);
          aggiornaBarraSelezione();
          renderList();
        } else {
          openView(r.id);
        }
      });
      listEl.appendChild(card);
    });
  }

  searchEl.addEventListener('input', renderList);
  categoryFilterEl.addEventListener('change', renderList);
  timeFilterEl.addEventListener('change', renderList);
  sortSelectEl.addEventListener('change', ()=>{
    sortMode = sortSelectEl.value;
    renderList();
  });
  favoritesFilterBtn.addEventListener('click', ()=>{
    favoritesOnly = !favoritesOnly;
    favoritesFilterBtn.classList.toggle('btn-gold', favoritesOnly);
    favoritesFilterBtn.classList.toggle('btn-ghost', !favoritesOnly);
    renderList();
  });
  const archivedFilterBtn = document.getElementById('archived-filter-btn');
  archivedFilterBtn.addEventListener('click', ()=>{
    showArchivedOnly = !showArchivedOnly;
    archivedFilterBtn.textContent = showArchivedOnly ? '📂 Mostra attive' : '📦 Mostra archiviate';
    archivedFilterBtn.classList.toggle('btn-gold', showArchivedOnly);
    archivedFilterBtn.classList.toggle('btn-ghost', !showArchivedOnly);
    renderList();
  });
  const pressureFilterBtn = document.getElementById('pressure-filter-btn');
  pressureFilterBtn.addEventListener('click', ()=>{
    pressureOnly = !pressureOnly;
    pressureFilterBtn.classList.toggle('active', pressureOnly);
    updateFiltersCount();
    renderList();
  });
  const robotFilterBtn = document.getElementById('robot-filter-btn');
  robotFilterBtn.addEventListener('click', ()=>{
    robotOnly = !robotOnly;
    robotFilterBtn.classList.toggle('active', robotOnly);
    updateFiltersCount();
    renderList();
  });
  const traditionalFilterBtn = document.getElementById('traditional-filter-btn');
  traditionalFilterBtn.addEventListener('click', ()=>{
    traditionalOnly = !traditionalOnly;
    traditionalFilterBtn.classList.toggle('active', traditionalOnly);
    updateFiltersCount();
    renderList();
  });

  // ---------- Pantry mode ----------
  const pantryInput = document.getElementById('pantry-input');
  const pantrySearchBtn = document.getElementById('pantry-search-btn');
  const pantryResetBtn = document.getElementById('pantry-reset-btn');
  const pantryMissingLimitEl = document.getElementById('pantry-missing-limit');
  function pantryMissingLimit(){
    const v = pantryMissingLimitEl.value;
    return v === 'any' ? Infinity : (parseInt(v, 10) || 0);
  }
  // selectedPantryItemIds === null  -> usa tutti i prodotti della Dispensa (comportamento predefinito)
  // selectedPantryItemIds === Set   -> usa solo i prodotti scelti dall'utente
  let selectedPantryItemIds = null;
  function currentPantryBaseItems(){
    return selectedPantryItemIds ? dispensaItems.filter(it => selectedPantryItemIds.has(it.id)) : dispensaItems;
  }
  function currentPantryMatchList(){
    const dispensaNames = currentPantryBaseItems().map(it => normalize(it.name)).filter(Boolean);
    const raw = pantryInput.value.trim();
    const extra = raw ? raw.split(',').map(s=>normalize(s)).filter(Boolean) : [];
    return Array.from(new Set([...dispensaNames, ...extra]));
  }
  function updatePantryPanelSub(){
    const sub = document.getElementById('pantry-panel-sub');
    if(priorityPantryNames.length){
      sub.textContent = `Ricette che usano prima: ${priorityPantryLabels.join(', ')}`;
      return;
    }
    const n = dispensaItems.length;
    if(selectedPantryItemIds){
      sub.textContent = `Usi solo ${selectedPantryItemIds.size} prodott${selectedPantryItemIds.size===1?'o':'i'} selezionat${selectedPantryItemIds.size===1?'o':'i'} dalla Dispensa — tocca "Scegli prodotti" per cambiare`;
      return;
    }
    sub.textContent = n
      ? `Usa automaticamente i ${n} prodotti della tua Dispensa — aggiungi altro qui se serve`
      : 'La tua Dispensa è vuota: aggiungi qualche prodotto in Dispensa, oppure scrivi qui gli ingredienti che hai';
  }

  // ---------- Scegli prodotti dispensa per "Cosa posso cucinare?" ----------
  const pantryPickBtn = document.getElementById('pantry-pick-btn');
  const pantryPickerOverlay = document.getElementById('pantry-picker-overlay');
  const pantryPickerSearch = document.getElementById('pantry-picker-search');
  const pantryPickerList = document.getElementById('pantry-picker-list');
  let pantryPickerDraft = null; // Set temporanea mentre l'overlay è aperto

  function renderPantryPickerList(query){
    const q = (query||'').trim().toLowerCase();
    const matches = dispensaItems.filter(it => !q || it.name.toLowerCase().includes(q))
      .sort((a,b) => a.name.localeCompare(b.name));
    pantryPickerList.innerHTML = matches.length ? matches.map(it => {
      const checked = pantryPickerDraft.has(it.id);
      return `
      <div class="recipe-picker-item" data-id="${it.id}">
        <span class="card-select-box">${checked ? '☑️' : '⬜'}</span>
        <span class="cat-dot" style="background:${PANTRY_CATEGORY_COLORS[it.category] || '#8c6a2f'}"></span>
        <span class="name">${escapeHtml(it.name)}</span>
        <span class="meta">${escapeHtml(it.category)}</span>
      </div>
    `;}).join('') : '<div class="recipe-picker-empty">Nessun prodotto in dispensa. Aggiungine uno dalla vista "🥫 Dispensa".</div>';
    pantryPickerList.querySelectorAll('.recipe-picker-item').forEach(item=>{
      item.addEventListener('click', ()=>{
        const id = item.dataset.id;
        if(pantryPickerDraft.has(id)) pantryPickerDraft.delete(id);
        else pantryPickerDraft.add(id);
        renderPantryPickerList(pantryPickerSearch.value);
      });
    });
  }

  function openPantryPicker(){
    // all'apertura, se non c'è ancora una selezione attiva parte con tutto selezionato
    pantryPickerDraft = new Set(selectedPantryItemIds ? selectedPantryItemIds : dispensaItems.map(it=>it.id));
    pantryPickerSearch.value = '';
    renderPantryPickerList('');
    pantryPickerOverlay.classList.add('active');
  }
  function closePantryPicker(){
    pantryPickerOverlay.classList.remove('active');
  }
  pantryPickBtn.addEventListener('click', openPantryPicker);
  document.getElementById('pantry-picker-close').addEventListener('click', closePantryPicker);
  pantryPickerSearch.addEventListener('input', ()=> renderPantryPickerList(pantryPickerSearch.value));
  document.getElementById('pantry-picker-all-btn').addEventListener('click', ()=>{
    dispensaItems.forEach(it=>pantryPickerDraft.add(it.id));
    renderPantryPickerList(pantryPickerSearch.value);
  });
  document.getElementById('pantry-picker-none-btn').addEventListener('click', ()=>{
    pantryPickerDraft.clear();
    renderPantryPickerList(pantryPickerSearch.value);
  });
  document.getElementById('pantry-picker-apply-btn').addEventListener('click', ()=>{
    // se sono selezionati tutti i prodotti, torna al comportamento predefinito (null = tutti, anche quelli futuri)
    selectedPantryItemIds = (pantryPickerDraft.size === dispensaItems.length) ? null : new Set(pantryPickerDraft);
    updatePantryPanelSub();
    closePantryPicker();
    if(pantryMode) renderList();
  });
  pantrySearchBtn.addEventListener('click', ()=>{
    if(!currentPantryMatchList().length){
      alert('La Dispensa è vuota: aggiungi qualche prodotto in Dispensa, oppure scrivi qui gli ingredienti che hai.');
      return;
    }
    // Una ricerca normale ripristina l'elenco completo: il filtro "usa prima"
    // è un aiuto temporaneo e non deve restare nascosto nelle ricerche successive.
    priorityPantryNames = [];
    priorityPantryLabels = [];
    pantryMode = true;
    pantryResetBtn.style.display = 'inline-block';
    savePantry(pantryInput.value);
    renderList();
  });
  pantryInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') pantrySearchBtn.click(); });
  pantryInput.addEventListener('input', ()=>{
    savePantry(pantryInput.value);
    if(pantryMode) renderList();
  });
  pantryResetBtn.addEventListener('click', ()=>{
    pantryMode = false;
    priorityPantryNames = [];
    priorityPantryLabels = [];
    pantryResetBtn.style.display = 'none';
    updatePantryPanelSub();
    renderList();
  });
  pantryMissingLimitEl.addEventListener('change', ()=>{
    safeStorageSet(PANTRY_LIMIT_KEY, pantryMissingLimitEl.value);
    if(pantryMode) renderList();
  });

  // ---------- Escludi ingredienti ----------
  const excludeInput = document.getElementById('exclude-input');
  const excludeApplyBtn = document.getElementById('exclude-apply-btn');
  const excludeClearBtn = document.getElementById('exclude-clear-btn');
  excludeApplyBtn.addEventListener('click', ()=>{
    const raw = excludeInput.value.trim();
    excludeItems = raw ? raw.split(',').map(s=>normalize(s)).filter(Boolean) : [];
    excludeClearBtn.style.display = excludeItems.length ? 'inline-block' : 'none';
    updateFiltersCount();
    renderList();
  });
  excludeInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') excludeApplyBtn.click(); });
  excludeClearBtn.addEventListener('click', ()=>{
    excludeInput.value = ''; excludeItems = [];
    excludeClearBtn.style.display = 'none';
    updateFiltersCount();
    renderList();
  });

  // ---------- Filtro per tag dietetici ----------
  const tagFilterRow = document.getElementById('tag-filter-row');
  tagFilterRow.innerHTML = TAG_OPTIONS.map(t=>`<button class="tag-filter-chip" data-tag="${escapeAttr(t)}">${escapeHtml(t)}</button>`).join('');
  tagFilterRow.querySelectorAll('.tag-filter-chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const t = btn.dataset.tag;
      if(activeTagFilters.has(t)) activeTagFilters.delete(t); else activeTagFilters.add(t);
      btn.classList.toggle('active', activeTagFilters.has(t));
      updateFiltersCount();
      renderList();
    });
  });

  // ---------- Filtro "escludi ricette con questi allergeni" ----------
  const allergenFilterRow = document.getElementById('allergen-filter-row');
  allergenFilterRow.innerHTML = ALLERGEN_OPTIONS.map(t=>`<button class="tag-filter-chip" data-allergen="${escapeAttr(t)}">${escapeHtml(t)}</button>`).join('');
  allergenFilterRow.querySelectorAll('.tag-filter-chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const a = btn.dataset.allergen;
      if(activeAllergenExclusions.has(a)) activeAllergenExclusions.delete(a); else activeAllergenExclusions.add(a);
      btn.classList.toggle('active', activeAllergenExclusions.has(a));
      updateFiltersCount();
      renderList();
    });
  });

  // ---------- Pannello "Filtri" richiudibile ----------
  const advFiltersToggle = document.getElementById('advanced-filters-toggle');
  const advFiltersPanel = document.getElementById('advanced-filters-panel');
  function updateFiltersCount(){
    const count = (pressureOnly?1:0) + (robotOnly?1:0) + (traditionalOnly?1:0) + activeTagFilters.size + activeAllergenExclusions.size + (excludeItems.length?1:0);
    advFiltersToggle.textContent = count ? `🔍 Filtri (${count}) ▾` : '🔍 Filtri ▾';
  }
  advFiltersToggle.addEventListener('click', ()=>{
    const opening = advFiltersPanel.style.display === 'none';
    advFiltersPanel.style.display = opening ? 'block' : 'none';
    advFiltersToggle.classList.toggle('active', opening);
  });

  // ---------- Menu "Importa ricetta" ----------
  const importMenuBtn = document.getElementById('import-menu-btn');
  const importMenuDropdown = document.getElementById('import-menu-dropdown');
  importMenuBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    importMenuDropdown.classList.toggle('open');
  });
  importMenuDropdown.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=> importMenuDropdown.classList.remove('open'));
  });
  document.addEventListener('click', (e)=>{
    if(importMenuDropdown.classList.contains('open') && !importMenuDropdown.contains(e.target) && e.target !== importMenuBtn){
      importMenuDropdown.classList.remove('open');
    }
  });

  const appearanceMenuBtn = document.getElementById('appearance-menu-btn');
  const appearanceMenuDropdown = document.getElementById('appearance-menu-dropdown');
  appearanceMenuBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    appearanceMenuDropdown.classList.toggle('open');
  });
  document.addEventListener('click', (e)=>{
    if(appearanceMenuDropdown.classList.contains('open') && !appearanceMenuDropdown.contains(e.target) && e.target !== appearanceMenuBtn){
      appearanceMenuDropdown.classList.remove('open');
    }
  });

  // ---------- Menu "Esporta" (scheda ricetta) ----------
  const viewExportMenuBtn = document.getElementById('view-export-menu-btn');
  const viewExportMenuDropdown = document.getElementById('view-export-menu-dropdown');
  viewExportMenuBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    viewExportMenuDropdown.classList.toggle('open');
  });
  viewExportMenuDropdown.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=> viewExportMenuDropdown.classList.remove('open'));
  });
  document.addEventListener('click', (e)=>{
    if(viewExportMenuDropdown.classList.contains('open') && !viewExportMenuDropdown.contains(e.target) && e.target !== viewExportMenuBtn){
      viewExportMenuDropdown.classList.remove('open');
    }
  });

  // ---------- Menu "Backup e CSV" ----------
  const dataMenuBtn = document.getElementById('data-menu-btn');
  const dataMenuDropdown = document.getElementById('data-menu-dropdown');
  const backupReminderText = document.getElementById('backup-reminder-text');
  function updateBackupReminder(){
    const raw = localStorage.getItem(LAST_BACKUP_KEY);
    if(!raw){
      backupReminderText.textContent = 'Nessun backup ancora eseguito';
      backupReminderText.classList.add('warning');
      return;
    }
    const days = Math.floor((Date.now() - new Date(raw).getTime()) / 86400000);
    backupReminderText.textContent = days <= 0 ? 'Ultimo backup: oggi' : days === 1 ? 'Ultimo backup: ieri' : `Ultimo backup: ${days} giorni fa`;
    backupReminderText.classList.toggle('warning', days > 14);
  }
  updateBackupReminder();

  // ---------- Tema grafico ----------
  const TEMA_STORAGE_KEY = 'mc_ricettario_tema_v1';
  // Solo i temi con font diversi da quelli già caricati in <head> (Cormorant
  // Garamond/Crimson Pro/Great Vibes) hanno bisogno di un link aggiuntivo:
  // "osteria" (originale) e "cantina" li riusano, quindi non compaiono qui.
  const TEMA_FONT_URLS = {
    mediterranea: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Karla:wght@400;500;600&display=swap',
    bosco: 'https://fonts.googleapis.com/css2?family=Bitter:wght@600;700&family=Mulish:wght@400;600&display=swap',
    trattoria: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap',
  };
  const temaSelect = document.getElementById('tema-select');

  function caricaFontTema(tema){
    const url = TEMA_FONT_URLS[tema];
    if(!url) return; // tema senza font aggiuntivi da caricare (osteria, cantina)
    if(document.querySelector(`link[data-tema-font="${tema}"]`)) return; // già caricato in precedenza
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.setAttribute('data-tema-font', tema);
    document.head.appendChild(link);
  }

  function applicaTema(tema, salvaScelta){
    if(tema === 'osteria') document.documentElement.removeAttribute('data-tema');
    else document.documentElement.setAttribute('data-tema', tema);
    caricaFontTema(tema);
    if(temaSelect) temaSelect.value = tema;
    if(salvaScelta) safeStorageSet(TEMA_STORAGE_KEY, tema);
  }

  if(temaSelect){
    temaSelect.addEventListener('change', () => applicaTema(temaSelect.value, true));
  }

  // Applica di nuovo (senza ri-salvare) il tema già impostato nello script
  // anti-lampo in <head>: qui serve solo per caricare il font giusto e
  // sincronizzare il <select> del menu, il colore è già quello corretto.
  applicaTema(localStorage.getItem(TEMA_STORAGE_KEY) || 'osteria', false);

  dataMenuBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    dataMenuDropdown.classList.toggle('open');
    if(dataMenuDropdown.classList.contains('open')) updateBackupReminder();
  });
  dataMenuDropdown.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=> dataMenuDropdown.classList.remove('open'));
  });
  document.addEventListener('click', (e)=>{
    if(dataMenuDropdown.classList.contains('open') && !dataMenuDropdown.contains(e.target) && e.target !== dataMenuBtn){
      dataMenuDropdown.classList.remove('open');
    }
  });

  // ---------- Edit modal ----------
  const editOverlay = document.getElementById('edit-overlay');
  const editTitle = document.getElementById('edit-title');
  const fName = document.getElementById('f-name');
  const fCategory = document.getElementById('f-category');
  const fServings = document.getElementById('f-servings');
  const fTime = document.getElementById('f-time');
  const fCookerType = document.getElementById('f-cooker-type');
  const fNotes = document.getElementById('f-notes');
  const fPhoto = document.getElementById('f-photo');
  const fPhotoPreview = document.getElementById('f-photo-preview');
  const ingredientsEditor = document.getElementById('ingredients-editor');
  const stepsEditor = document.getElementById('steps-editor');

  // Carica la banca dati nutrizionale CREA una sola volta all'avvio (file statico
  // in data/, ~200 KB). Se il fetch fallisce (es. file non ancora caricato sul
  // repository) l'app resta comunque utilizzabile: la ricerca CREA sarà solo
  // silenziosamente non disponibile finché il problema non viene risolto.
  if (typeof CreaDB !== 'undefined') {
    CreaDB.init('data/crea-alimenti.json', 'data/crea-meta.json')
      .catch(err => console.error('Banca dati CREA non disponibile:', err));
  }

  // Stima i grammi effettivi di un ingrediente dalla sua quantità+unità, per
  // poter scalare correttamente i valori CREA (definiti per 100 g). Riconosce
  // solo grammi e chilogrammi: per altre unità (ml, cucchiai, pezzi…) non è
  // possibile una conversione automatica affidabile.
  function stimaGrammiIngrediente(qty, unit) {
    const q = parseFloat(qty);
    if (!q || q <= 0) return null;
    const u = (unit || '').trim().toLowerCase();
    if (u === '' || u === 'g' || u === 'gr' || u === 'grammi' || u === 'grammo') return q;
    if (u === 'kg' || u === 'chilo' || u === 'chilogrammi') return q * 1000;
    return null;
  }

  // ---------- Scheda nutrizionale CREA completa (tutte le ~129 proprietà) ----------
  const creaSchedaOverlay = document.getElementById('crea-scheda-overlay');
  const creaSchedaContent = document.getElementById('crea-scheda-content');
  document.getElementById('crea-scheda-close').addEventListener('click', () => creaSchedaOverlay.classList.remove('active'));

  function apriSchedaCrea(codice) {
    creaSchedaOverlay.classList.add('active');
    creaSchedaContent.innerHTML = 'Caricamento…';
    if (typeof CreaDB === 'undefined') { creaSchedaContent.innerHTML = 'Banca dati CREA non disponibile.'; return; }
    CreaDB.initCompleto().then(() => {
      const record = CreaDB.getCompletoByCode(codice);
      creaSchedaContent.innerHTML = record ? CreaDB.renderSchedaCompletaHTML(record) : 'Scheda non trovata per questo alimento.';
    }).catch(err => {
      creaSchedaContent.innerHTML = 'Impossibile caricare la scheda completa: verifica che data/crea-alimenti-completo.json e data/crea-nutrienti-schema.json siano stati caricati sul sito.';
      console.error(err);
    });
  }

  // ---------- Importa ricette ufficiali CREA ----------
  const creaRicetteOverlay = document.getElementById('crea-ricette-overlay');
  const creaRicetteList = document.getElementById('crea-ricette-list');
  const creaRicetteSearch = document.getElementById('crea-ricette-search');
  const creaRicetteImportBtn = document.getElementById('crea-ricette-import-btn');
  const creaRicetteSelezionateCount = document.getElementById('crea-ricette-selezionate-count');
  let creaRicetteSelezionate = new Set();

  function renderCreaRicetteList(filtro) {
    const q = normalize(filtro || '');
    const elenco = CreaRicette.all().filter(r => !q || normalize(r.nome).includes(q));
    creaRicetteList.innerHTML = elenco.length ? elenco.map(r => `
      <label class="crea-ricetta-picker-item">
        <input type="checkbox" class="crea-ricetta-check" value="${escapeAttr(r.id)}" ${creaRicetteSelezionate.has(r.id) ? 'checked' : ''}>
        <span class="cat-dot" style="background:${CATEGORY_COLORS[r.categoria_suggerita] || '#8c6a2f'}"></span>
        <span class="name">${escapeHtml(r.nome)}</span>
        <span class="meta">${escapeHtml(r.categoria_suggerita)}</span>
      </label>
    `).join('') : '<div class="recipe-picker-empty">Nessuna ricetta trovata.</div>';

    creaRicetteList.querySelectorAll('.crea-ricetta-check').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) creaRicetteSelezionate.add(cb.value); else creaRicetteSelezionate.delete(cb.value);
        aggiornaContatoreCreaRicette();
      });
    });
  }

  function aggiornaContatoreCreaRicette() {
    const n = creaRicetteSelezionate.size;
    creaRicetteSelezionateCount.textContent = n === 0 ? 'Nessuna selezionata' : `${n} selezionata${n === 1 ? '' : 'e'}`;
  }

  document.getElementById('crea-ricette-open-btn').addEventListener('click', () => {
    creaRicetteOverlay.classList.add('active');
    creaRicetteList.innerHTML = 'Caricamento…';
    if (typeof CreaRicette === 'undefined') { creaRicetteList.innerHTML = 'Ricette CREA non disponibili.'; return; }
    CreaRicette.init().then(() => renderCreaRicetteList(creaRicetteSearch.value)).catch(err => {
      creaRicetteList.innerHTML = 'Impossibile caricare le ricette CREA: verifica che data/crea-ricette.json sia stato caricato sul sito.';
      console.error(err);
    });
  });
  document.getElementById('crea-ricette-close').addEventListener('click', () => creaRicetteOverlay.classList.remove('active'));
  creaRicetteSearch.addEventListener('input', () => renderCreaRicetteList(creaRicetteSearch.value));

  // Condivisa tra il picker "Importa ricette CREA" e il dettaglio di una
  // singola ricetta nella vista "CREA Menù": importa gli id passati,
  // saltando quelli già presenti nel Ricettario con lo stesso nome.
  function importaRicetteCreaPerId(ids){
    let importate = 0, saltate = 0;
    ids.forEach(id => {
      const ricettaCrea = CreaRicette.getById(id);
      if (!ricettaCrea) return;
      const nomeNormalizzato = normalize(ricettaCrea.nome);
      const giaEsistente = recipes.some(r => normalize(r.name) === nomeNormalizzato);
      if (giaEsistente) { saltate++; return; }
      recipes.push(CreaRicette.convertiInRicettaApp(ricettaCrea, cryptoId));
      importate++;
    });
    saveRecipes(); renderList(); renderPlanningDays();
    return { importate, saltate };
  }

  creaRicetteImportBtn.addEventListener('click', () => {
    if (creaRicetteSelezionate.size === 0) { alert('Seleziona almeno una ricetta da importare.'); return; }
    const { importate, saltate } = importaRicetteCreaPerId(Array.from(creaRicetteSelezionate));
    creaRicetteSelezionate.clear();
    aggiornaContatoreCreaRicette();
    creaRicetteOverlay.classList.remove('active');
    alert(`Importate ${importate} ricette.` + (saltate ? ` ${saltate} già presenti con lo stesso nome sono state saltate.` : ''));
  });

  // ---------- Ricerca CREA nel form "Nuovo prodotto" Dispensa ----------
  // A differenza degli ingredienti di una ricetta, qui i valori nutrizionali
  // sono un dato di riferimento del PRODOTTO (per 100 g), indipendente da
  // quanto ne hai in dispensa in questo momento: niente più scaling sulla
  // quantità, si prendono i valori CREA così come sono.
  const dCreaSearchInput = document.getElementById('d-crea-search');
  const dCreaSchedaBtn = document.getElementById('d-crea-scheda-btn');
  if (typeof attachCreaAutocomplete === 'function') {
    attachCreaAutocomplete(dCreaSearchInput, (alimento) => {
      if (typeof CreaDB === 'undefined' || !CreaDB.isReady()) return;
      dispensaCreaCodiceCorrente = alimento.codice;
      dCreaSchedaBtn.classList.add('visibile');
      const nomeInput = document.getElementById('d-name');
      if (!nomeInput.value.trim()) nomeInput.value = alimento.nome;
      document.getElementById('d-category').value = mappaCategoriaCreaDispensa(alimento.categoria || '');
      document.getElementById('d-kcal').value = alimento.kcal ?? '';
      document.getElementById('d-protein').value = alimento.proteine ?? '';
      document.getElementById('d-fat').value = alimento.grassi ?? '';
      document.getElementById('d-carbs').value = alimento.carboidrati ?? '';
      document.getElementById('d-fiber').value = alimento.fibre ?? '';
      document.getElementById('d-sugar').value = alimento.zuccheri ?? '';
      document.getElementById('d-salt').value = alimento.sale ?? '';
      document.getElementById('dispensa-nutrition-fields').style.display = 'flex';
      document.getElementById('dispensa-nutrition-toggle-btn').classList.add('active');
      formDirty = true;
    });
  }
  dCreaSchedaBtn.addEventListener('click', () => {
    if (dispensaCreaCodiceCorrente && typeof apriSchedaCrea === 'function') {
      apriSchedaCrea(dispensaCreaCodiceCorrente);
    }
  });

  // ---------- Open Food Facts: ricerca testo + barcode per il form Dispensa ----------
  // Stessa filosofia della ricerca CREA: un modo IN PIÙ per compilare la
  // stessa scheda prodotto già esistente. I valori nutrizionali di OFF sono
  // già per 100 g, come quelli CREA: si usano così come sono, senza scalare
  // su nessuna quantità.
  let dispensaOffBarcodeCorrente = '';
  let dispensaOffImmagineCorrente = '';
  let dispensaOffNutriscoreCorrente = '';

  const offTextSearch = document.getElementById('off-text-search');
  const offBarcodeInput = document.getElementById('off-barcode-input');
  const offBarcodeSearchBtn = document.getElementById('off-barcode-search-btn');
  const offStatus = document.getElementById('off-status');
  const offPreview = document.getElementById('off-preview');
  const offPreviewImg = document.getElementById('off-preview-img');
  const offPreviewNome = document.getElementById('off-preview-nome');
  const offPreviewMarca = document.getElementById('off-preview-marca');
  const offPreviewNutriscore = document.getElementById('off-preview-nutriscore');

  const NUTRISCORE_COLORI = { A: '#2e7d32', B: '#8bc34a', C: '#fbc02d', D: '#f57c00', E: '#c62828' };

  function applicaProdottoOff(prodotto){
    const nomeInput = document.getElementById('d-name');
    if (!nomeInput.value.trim()) nomeInput.value = prodotto.nome || '';
    if (prodotto.categoria) {
      document.getElementById('d-category').value = mappaCategoriaCreaDispensa(prodotto.categoria);
    }

    const qtyInput = document.getElementById('d-qty');
    const unitInput = document.getElementById('d-unit');
    if (!qtyInput.value.trim()) {
      const qta = OffIntegration.parseQuantita(prodotto.quantitaTesto);
      if (qta && qta.numero) {
        qtyInput.value = qta.numero;
        if (qta.unita && !unitInput.value.trim()) unitInput.value = qta.unita;
      }
    }

    // Valori per 100 g: presi così come sono da Open Food Facts, nessuno
    // scaling (coerente con il resto della Dispensa).
    document.getElementById('d-kcal').value = prodotto.kcal100 ?? '';
    document.getElementById('d-protein').value = prodotto.proteine100 ?? '';
    document.getElementById('d-fat').value = prodotto.grassi100 ?? '';
    document.getElementById('d-carbs').value = prodotto.carboidrati100 ?? '';
    document.getElementById('d-fiber').value = prodotto.fibre100 ?? '';
    document.getElementById('d-sugar').value = prodotto.zuccheri100 ?? '';
    document.getElementById('d-salt').value = prodotto.sale100 ?? '';
    document.getElementById('dispensa-nutrition-fields').style.display = 'flex';
    document.getElementById('dispensa-nutrition-toggle-btn').classList.add('active');

    dispensaOffBarcodeCorrente = prodotto.barcode || '';
    dispensaOffImmagineCorrente = prodotto.immagine || '';
    dispensaOffNutriscoreCorrente = prodotto.nutriscore || '';

    if (prodotto.nome || prodotto.immagine) {
      offPreviewImg.src = prodotto.immagine || '';
      offPreviewImg.style.display = prodotto.immagine ? '' : 'none';
      offPreviewNome.textContent = prodotto.nome || '(senza nome)';
      offPreviewMarca.textContent = prodotto.marca || '';
      if (prodotto.nutriscore && NUTRISCORE_COLORI[prodotto.nutriscore]) {
        offPreviewNutriscore.textContent = 'Nutri-Score ' + prodotto.nutriscore;
        offPreviewNutriscore.style.background = NUTRISCORE_COLORI[prodotto.nutriscore];
        offPreviewNutriscore.style.display = 'inline-block';
      } else {
        offPreviewNutriscore.style.display = 'none';
      }
      offPreview.style.display = 'flex';
    }
    formDirty = true;
  }

  if (typeof attachOffAutocomplete === 'function') {
    attachOffAutocomplete(offTextSearch, (prodotto) => {
      offStatus.textContent = '';
      applicaProdottoOff(prodotto);
    }, (err) => {
      offStatus.textContent = 'Errore nella ricerca su Open Food Facts (verifica la connessione).';
      console.error(err);
    });
  }

  function cercaOffPerBarcode(barcode){
    if (!barcode) return;
    offStatus.textContent = 'Ricerca in corso…';
    offBarcodeSearchBtn.disabled = true;
    OffIntegration.cercaDaBarcode(barcode)
      .then(prodotto => {
        if (!prodotto) {
          offStatus.textContent = `Nessun prodotto trovato su Open Food Facts per il codice ${barcode}: puoi compilare a mano.`;
          return;
        }
        applicaProdottoOff(prodotto);
        offStatus.textContent = 'Prodotto trovato ✅';
      })
      .catch(err => {
        offStatus.textContent = 'Errore nella ricerca su Open Food Facts (verifica la connessione).';
        console.error(err);
      })
      .finally(() => { offBarcodeSearchBtn.disabled = false; });
  }
  offBarcodeSearchBtn.addEventListener('click', () => cercaOffPerBarcode(offBarcodeInput.value.trim()));
  offBarcodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); cercaOffPerBarcode(offBarcodeInput.value.trim()); }
  });

  // ---------- Scanner da fotocamera (html5-qrcode, caricato solo se usato) ----------
  const offScannerOverlay = document.getElementById('off-scanner-overlay');
  const offScannerStatus = document.getElementById('off-scanner-status');
  let html5QrcodeCaricato = false;
  let html5QrcodeScannerAttivo = null;

  function caricaHtml5Qrcode(){
    if (html5QrcodeCaricato) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/html5-qrcode';
      script.onload = () => { html5QrcodeCaricato = true; resolve(); };
      script.onerror = () => reject(new Error('Impossibile caricare html5-qrcode (verifica la connessione)'));
      document.head.appendChild(script);
    });
  }

  function fermaScanner(){
    if (!html5QrcodeScannerAttivo) return;
    const scanner = html5QrcodeScannerAttivo;
    html5QrcodeScannerAttivo = null;
    // .stop() può sia rifiutare la Promise sia lanciare subito un errore
    // sincrono se la fotocamera non è mai partita (es. permesso negato):
    // in entrambi i casi non deve impedire la chiusura della finestra.
    try {
      Promise.resolve(scanner.stop()).catch(() => {}).finally(() => {
        try { scanner.clear(); } catch (e) { /* niente da pulire, va bene così */ }
      });
    } catch (e) {
      try { scanner.clear(); } catch (e2) { /* niente da pulire, va bene così */ }
    }
  }

  document.getElementById('off-scan-open-btn').addEventListener('click', () => {
    offScannerOverlay.classList.add('active');
    offScannerStatus.textContent = 'Caricamento dello scanner…';
    caricaHtml5Qrcode().then(() => {
      offScannerStatus.textContent = '';
      html5QrcodeScannerAttivo = new Html5Qrcode('off-scanner-reader');
      html5QrcodeScannerAttivo.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          offScannerOverlay.classList.remove('active');
          fermaScanner();
          offBarcodeInput.value = decodedText;
          cercaOffPerBarcode(decodedText);
        },
        () => { /* nessuna corrispondenza in questo frame: normale, si ignora */ }
      ).catch(err => {
        offScannerStatus.textContent = 'Fotocamera non disponibile o permesso negato: usa il campo codice a barre qui sotto.';
        console.error(err);
      });
    }).catch(err => {
      offScannerStatus.textContent = err.message;
      console.error(err);
    });
  });
  document.getElementById('off-scanner-close').addEventListener('click', () => {
    offScannerOverlay.classList.remove('active');
    fermaScanner();
  });

  // ---------- Vista "CREA Alimenti" (consultazione banca dati, tutti i 900) ----------
  const CREA_ALIMENTI_CATEGORIE = [
    'Alimenti Etnici', 'Bevande alcoliche', 'Carni fresche', 'Carni trasformate e conservate',
    'Cereali e derivati', 'Dolci', 'Fast-food a base di carne', 'Formaggi e latticini', 'Frattaglie',
    'Frutta', 'Frutta secca a guscio e semi oleaginosi', 'Latte e yogurt', 'Legumi', 'Oli e grassi',
    'Prodotti della pesca', 'Prodotti vari', 'Ricette Italiane', 'Uova', 'Verdure e ortaggi',
  ];
  const creaAlimentiSearch = document.getElementById('crea-alimenti-search');
  const creaAlimentiCategoryFilter = document.getElementById('crea-alimenti-category-filter');
  const creaAlimentiList = document.getElementById('crea-alimenti-list');
  const creaAlimentiHint = document.getElementById('crea-alimenti-hint');
  const CREA_ALIMENTI_LIMITE = 200;
  let creaAlimentiCategorieCaricate = false;

  function popolaFiltroCategorieCreaAlimenti(){
    if (creaAlimentiCategorieCaricate) return;
    CREA_ALIMENTI_CATEGORIE.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      creaAlimentiCategoryFilter.appendChild(opt);
    });
    creaAlimentiCategorieCaricate = true;
  }

  function renderCreaAlimentiList(){
    const q = normalize(creaAlimentiSearch.value || '');
    const categoria = creaAlimentiCategoryFilter.value;
    if (!q && !categoria){
      creaAlimentiList.innerHTML = '';
      creaAlimentiHint.style.display = '';
      return;
    }
    creaAlimentiHint.style.display = 'none';
    let match = CreaDB.tutti().filter(a =>
      (!q || a.chiave_ricerca.includes(q)) && (!categoria || a.categoria === categoria)
    );
    const totaleTrovati = match.length;
    match = match.slice(0, CREA_ALIMENTI_LIMITE);

    if (match.length === 0){
      creaAlimentiList.innerHTML = '<div class="crea-elenco-vuoto">Nessun alimento trovato.</div>';
      return;
    }
    creaAlimentiList.innerHTML = match.map(a => `
      <div class="crea-elenco-riga" data-codice="${escapeAttr(a.codice)}">
        <span class="nome">${escapeHtml(a.nome)}</span>
        <span class="meta">${escapeHtml(a.categoria)} · ${a.kcal ?? '–'} kcal/100g</span>
      </div>
    `).join('') + (totaleTrovati > CREA_ALIMENTI_LIMITE
      ? `<div class="crea-elenco-troncato">Mostrati i primi ${CREA_ALIMENTI_LIMITE} di ${totaleTrovati} risultati — affina la ricerca per vedere gli altri.</div>`
      : '');

    creaAlimentiList.querySelectorAll('.crea-elenco-riga').forEach(riga => {
      riga.addEventListener('click', () => apriSchedaCrea(riga.dataset.codice));
    });
  }

  function apriVistaCreaAlimenti(){
    popolaFiltroCategorieCreaAlimenti();
    if (typeof CreaDB === 'undefined') { creaAlimentiList.innerHTML = 'Banca dati CREA non disponibile.'; return; }
    if (CreaDB.isReady()) { renderCreaAlimentiList(); return; }
    creaAlimentiList.innerHTML = 'Caricamento…';
    CreaDB.init().then(renderCreaAlimentiList).catch(err => {
      creaAlimentiList.innerHTML = 'Impossibile caricare la banca dati CREA: verifica che data/crea-alimenti.json sia stato caricato sul sito.';
      console.error(err);
    });
  }
  creaAlimentiSearch.addEventListener('input', renderCreaAlimentiList);
  creaAlimentiCategoryFilter.addEventListener('change', renderCreaAlimentiList);

  // ---------- Vista "CREA Menù" (le 56 ricette ufficiali, sfogliabili) ----------
  const creaMenuSearch = document.getElementById('crea-menu-search');
  const creaMenuCategoryFilter = document.getElementById('crea-menu-category-filter');
  const creaMenuList = document.getElementById('crea-menu-list');

  function renderCreaMenuListView(){
    const q = normalize(creaMenuSearch.value || '');
    const categoria = creaMenuCategoryFilter.value;
    const match = CreaRicette.all().filter(r =>
      (!q || normalize(r.nome).includes(q)) && (!categoria || r.categoria_suggerita === categoria)
    );
    creaMenuList.innerHTML = match.length ? match.map(r => `
      <div class="crea-elenco-riga" data-id="${escapeAttr(r.id)}">
        <span class="cat-dot" style="background:${CATEGORY_COLORS[r.categoria_suggerita] || '#8c6a2f'}"></span>
        <span class="nome">${escapeHtml(r.nome)}</span>
        <span class="meta">${escapeHtml(r.categoria_suggerita)}</span>
      </div>
    `).join('') : '<div class="crea-elenco-vuoto">Nessuna ricetta trovata.</div>';

    creaMenuList.querySelectorAll('.crea-elenco-riga').forEach(riga => {
      riga.addEventListener('click', () => apriDettaglioCreaMenu(riga.dataset.id));
    });
  }

  function apriVistaCreaMenu(){
    if (typeof CreaRicette === 'undefined') { creaMenuList.innerHTML = 'Ricette CREA non disponibili.'; return; }
    if (CreaRicette.isReady()) { renderCreaMenuListView(); return; }
    creaMenuList.innerHTML = 'Caricamento…';
    CreaRicette.init().then(renderCreaMenuListView).catch(err => {
      creaMenuList.innerHTML = 'Impossibile caricare le ricette CREA: verifica che data/crea-ricette.json sia stato caricato sul sito.';
      console.error(err);
    });
  }
  creaMenuSearch.addEventListener('input', renderCreaMenuListView);
  creaMenuCategoryFilter.addEventListener('change', renderCreaMenuListView);

  // ---------- Dettaglio di una ricetta nella vista "CREA Menù" ----------
  const creaMenuDettaglioOverlay = document.getElementById('crea-menu-dettaglio-overlay');
  const creaMenuDettaglioContent = document.getElementById('crea-menu-dettaglio-content');
  document.getElementById('crea-menu-dettaglio-close').addEventListener('click', () => creaMenuDettaglioOverlay.classList.remove('active'));

  function apriDettaglioCreaMenu(id){
    const r = CreaRicette.getById(id);
    if (!r) return;
    const ingredientiHtml = r.ingredienti.map(i =>
      `<li>${escapeHtml(i.quantita_originale)} — ${escapeHtml(i.nome)}</li>`
    ).join('');
    const v = r.valori_nutrizionali_100g_piatto;
    const nutrizioneHtml = v ? `
      <table class="crea-scheda-tabella">
        <tr><td>Kcal</td><td>${v.kcal ?? '–'}</td></tr>
        <tr><td>Proteine</td><td>${v.proteine ?? '–'} g</td></tr>
        <tr><td>Grassi</td><td>${v.grassi ?? '–'} g</td></tr>
        <tr><td>Carboidrati</td><td>${v.carboidrati ?? '–'} g</td></tr>
        <tr><td>Fibre</td><td>${v.fibre ?? '–'} g</td></tr>
        <tr><td>Zuccheri</td><td>${v.zuccheri ?? '–'} g</td></tr>
        <tr><td>Sale</td><td>${v.sale ?? '–'} g</td></tr>
      </table>` : '<em>Valori non disponibili per questo piatto.</em>';

    creaMenuDettaglioContent.innerHTML = `
      <div class="crea-menu-dettaglio">
        <span class="cat-tag" style="background:${CATEGORY_COLORS[r.categoria_suggerita] || '#8c6a2f'};">${escapeHtml(r.categoria_suggerita)}</span>
        <h2>${escapeHtml(r.nome)}</h2>
        <div class="crea-menu-meta">${[
          r.porzioni_testo ? escapeHtml(r.porzioni_testo) : '',
          r.tempo_cottura ? 'Cottura: ' + escapeHtml(r.tempo_cottura) : '',
          r.tipo_cottura ? escapeHtml(r.tipo_cottura) : '',
        ].filter(Boolean).join(' · ')}</div>

        <h4>Ingredienti</h4>
        <ul>${ingredientiHtml}</ul>

        <h4>Preparazione</h4>
        <div class="crea-menu-prep">${escapeHtml(r.preparazione)}</div>

        <h4>Valori nutrizionali ufficiali CREA (per 100 g del piatto finito)</h4>
        ${nutrizioneHtml}

        <div class="crea-scheda-fonte">
          Fonte: <strong>CREA</strong> — Centro di ricerca Alimenti e Nutrizione, via
          <a href="https://www.alimentinutrizione.it" target="_blank" rel="noopener">alimentinutrizione.it</a>.
        </div>

        <div class="modal-actions">
          <span></span>
          <button type="button" class="btn-gold" id="crea-menu-dettaglio-importa-btn">+ Importa nel Ricettario</button>
        </div>
      </div>
    `;
    document.getElementById('crea-menu-dettaglio-importa-btn').addEventListener('click', () => {
      const { importate } = importaRicetteCreaPerId([id]);
      if (importate) {
        alert(`"${r.nome}" importata nel Ricettario.`);
        creaMenuDettaglioOverlay.classList.remove('active');
      } else {
        alert(`"${r.nome}" è già presente nel Ricettario con lo stesso nome: non importata di nuovo.`);
      }
    });
    creaMenuDettaglioOverlay.classList.add('active');
  }

  const deleteBtn = document.getElementById('delete-recipe-btn');
  const fTagsWrap = document.getElementById('f-tags-wrap');
  fTagsWrap.innerHTML = TAG_OPTIONS.map(t=>`<label><input type="checkbox" value="${escapeAttr(t)}"> ${escapeHtml(t)}</label>`).join('');
  const fAllergensWrap = document.getElementById('f-allergens-wrap');
  fAllergensWrap.innerHTML = ALLERGEN_OPTIONS.map(t=>`<label><input type="checkbox" value="${escapeAttr(t)}"> ${escapeHtml(t)}</label>`).join('');
  let currentPhotoData = '';

  /** Legge i 7 campi nutrizionali (per porzione) dal form ricetta. Ritorna
   * null se sono tutti vuoti (nessun dato inserito), altrimenti un oggetto
   * con i valori indicati e null per quelli lasciati vuoti. */
  function leggiNutrizioneUtenteForm(){
    const campi = {
      kcal: document.getElementById('f-nutri-kcal').value,
      proteine: document.getElementById('f-nutri-protein').value,
      grassi: document.getElementById('f-nutri-fat').value,
      carboidrati: document.getElementById('f-nutri-carbs').value,
      fibre: document.getElementById('f-nutri-fiber').value,
      zuccheri: document.getElementById('f-nutri-sugar').value,
      sale: document.getElementById('f-nutri-salt').value,
    };
    const risultato = {};
    let almenoUno = false;
    for (const [k, v] of Object.entries(campi)) {
      if (v !== '') { risultato[k] = parseFloat(v); almenoUno = true; }
      else { risultato[k] = null; }
    }
    return almenoUno ? risultato : null;
  }

  function openEdit(recipe, draft, titleOverride){
    // "recipe" apre in modifica una ricetta esistente. "draft" (usato per
    // l'importazione da testo o per duplicare una ricetta) precompila un modulo
    // di NUOVA ricetta senza che sia già salvata: editingId resta null.
    editingId = recipe ? recipe.id : null;
    const source = recipe || draft || null;
    editTitle.textContent = titleOverride || (recipe ? 'Modifica ricetta' : (draft ? 'Rivedi ricetta importata' : 'Nuova ricetta'));
    deleteBtn.style.display = recipe ? 'inline-block' : 'none';

    fName.value = source ? (source.name || '') : '';
    fCategory.value = source ? (source.category || 'Primi') : 'Primi';
    fServings.value = source ? (source.servings || 4) : 4;
    fTime.value = source ? (source.time || '') : '';
    fCookerType.value = source ? (source.cookerType || '') : '';
    fNotes.value = source ? (source.notes || '') : '';
    const sourceTags = source && source.tags ? source.tags : [];
    fTagsWrap.querySelectorAll('input[type="checkbox"]').forEach(cb=>{ cb.checked = sourceTags.includes(cb.value); });
    const sourceAllergens = source && source.allergens ? source.allergens : [];
    fAllergensWrap.querySelectorAll('input[type="checkbox"]').forEach(cb=>{ cb.checked = sourceAllergens.includes(cb.value); });
    document.getElementById('f-freezable').checked = !!(source && source.freezable);
    currentPhotoData = source ? (source.photo || '') : '';
    fPhoto.value = '';
    const fPhotoEditBtn = document.getElementById('f-photo-edit-btn');
    if(currentPhotoData){ fPhotoPreview.src = currentPhotoData; fPhotoPreview.style.display = 'block'; fPhotoEditBtn.style.display = 'inline-block'; }
    else{ fPhotoPreview.style.display = 'none'; fPhotoEditBtn.style.display = 'none'; }

    ingredientsEditor.innerHTML = '';
    const sourceIngredients = (source && source.ingredients && source.ingredients.length) ? source.ingredients : [{name:'',qty:'',unit:''}];
    sourceIngredients.forEach(i=>addIngredientRow(i));
    stepsEditor.innerHTML = '';
    (source && source.steps && source.steps.length ? source.steps : [{text:'',vel:'',temp:'',time:'',mode:'Normale'}]).forEach(s=>addStepRow(s));

    const nutrizioneUtente = (source && source.nutrizioneUtente) || null;
    document.getElementById('f-nutri-kcal').value = nutrizioneUtente && nutrizioneUtente.kcal != null ? nutrizioneUtente.kcal : '';
    document.getElementById('f-nutri-protein').value = nutrizioneUtente && nutrizioneUtente.proteine != null ? nutrizioneUtente.proteine : '';
    document.getElementById('f-nutri-fat').value = nutrizioneUtente && nutrizioneUtente.grassi != null ? nutrizioneUtente.grassi : '';
    document.getElementById('f-nutri-carbs').value = nutrizioneUtente && nutrizioneUtente.carboidrati != null ? nutrizioneUtente.carboidrati : '';
    document.getElementById('f-nutri-fiber').value = nutrizioneUtente && nutrizioneUtente.fibre != null ? nutrizioneUtente.fibre : '';
    document.getElementById('f-nutri-sugar').value = nutrizioneUtente && nutrizioneUtente.zuccheri != null ? nutrizioneUtente.zuccheri : '';
    document.getElementById('f-nutri-salt').value = nutrizioneUtente && nutrizioneUtente.sale != null ? nutrizioneUtente.sale : '';
    const recipeNutritionPanel = document.getElementById('recipe-nutrition-fields');
    const recipeNutritionBtn = document.getElementById('recipe-nutrition-toggle-btn');
    recipeNutritionPanel.style.display = nutrizioneUtente ? 'flex' : 'none';
    recipeNutritionBtn.classList.toggle('active', !!nutrizioneUtente);

    editOverlay.classList.add('active');
    formDirty = false;
  }

  // Ridimensiona un canvas già pronto (foto ritagliata/ruotata) se supera la dimensione massima,
  // e lo converte in JPEG. Le foto fatte con il cellulare sono spesso enormi rispetto a quanto
  // serve mostrarle nel ricettario, e lo spazio nel browser è limitato.
  function canvasToResizedDataUrl(canvas, maxDim, quality){
    const { width, height } = canvas;
    if(width <= maxDim && height <= maxDim) return canvas.toDataURL('image/jpeg', quality);
    const scale = maxDim / Math.max(width, height);
    const outCanvas = document.createElement('canvas');
    outCanvas.width = Math.round(width * scale);
    outCanvas.height = Math.round(height * scale);
    outCanvas.getContext('2d').drawImage(canvas, 0, 0, outCanvas.width, outCanvas.height);
    return outCanvas.toDataURL('image/jpeg', quality);
  }

  // ---------- Ritaglio e rotazione della foto ricetta ----------
  // Un piccolo editor fatto in casa (nessuna libreria esterna): un riquadro trascinabile e
  // ridimensionabile sopra l'immagine per scegliere l'area da mantenere, più un pulsante che
  // ruota l'immagine di 90° ad ogni tocco. "Applica" ritaglia alla risoluzione originale (non a
  // quella ridotta mostrata a schermo) e poi ridimensiona/comprime il risultato come prima.
  const photoCropOverlay = document.getElementById('photo-crop-overlay');
  const photoCropImg = document.getElementById('photo-crop-img');
  const photoCropBoxEl = document.getElementById('photo-crop-box');
  let cropOriginalSrc = '';   // immagine così com'era all'apertura di questa sessione di ritaglio, per "Reimposta"
  let cropBoxRect = null;     // riquadro di selezione, in pixel CSS relativi allo stage
  let imgDisplayRect = null;  // ingombro a schermo dell'immagine corrente, stessi riferimenti del riquadro
  let cropResolve = null;     // risolve la Promise di openPhotoCropOverlay quando si chiude il pannello

  function renderCropBox(){
    photoCropBoxEl.style.left = cropBoxRect.x + 'px';
    photoCropBoxEl.style.top = cropBoxRect.y + 'px';
    photoCropBoxEl.style.width = cropBoxRect.w + 'px';
    photoCropBoxEl.style.height = cropBoxRect.h + 'px';
  }
  function resetCropBoxToFull(){
    const stageRect = document.getElementById('photo-crop-stage').getBoundingClientRect();
    const imgRect = photoCropImg.getBoundingClientRect();
    imgDisplayRect = { x: imgRect.left - stageRect.left, y: imgRect.top - stageRect.top, w: imgRect.width, h: imgRect.height };
    cropBoxRect = { ...imgDisplayRect };
    renderCropBox();
  }
  function openPhotoCropOverlay(dataUrl){
    return new Promise(resolve=>{
      cropResolve = resolve;
      cropOriginalSrc = dataUrl;
      photoCropOverlay.classList.add('active');
      photoCropImg.onload = ()=> resetCropBoxToFull();
      photoCropImg.src = dataUrl;
    });
  }
  function closePhotoCropOverlay(result){
    photoCropOverlay.classList.remove('active');
    const resolve = cropResolve;
    cropResolve = null;
    if(resolve) resolve(result);
  }
  // Trascinare il riquadro (non su un angolo) lo sposta, restando dentro i bordi dell'immagine.
  photoCropBoxEl.addEventListener('pointerdown', (e)=>{
    if(e.target.classList.contains('photo-crop-handle')) return;
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY, start = { ...cropBoxRect };
    photoCropBoxEl.setPointerCapture(e.pointerId);
    function onMove(ev){
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      cropBoxRect.x = Math.max(imgDisplayRect.x, Math.min(start.x + dx, imgDisplayRect.x + imgDisplayRect.w - cropBoxRect.w));
      cropBoxRect.y = Math.max(imgDisplayRect.y, Math.min(start.y + dy, imgDisplayRect.y + imgDisplayRect.h - cropBoxRect.h));
      renderCropBox();
    }
    function onUp(){
      photoCropBoxEl.removeEventListener('pointermove', onMove);
      photoCropBoxEl.removeEventListener('pointerup', onUp);
    }
    photoCropBoxEl.addEventListener('pointermove', onMove);
    photoCropBoxEl.addEventListener('pointerup', onUp);
  });
  // Trascinare un angolo ridimensiona il riquadro da quel lato, con una dimensione minima e
  // restando dentro i bordi dell'immagine.
  const CROP_MIN_SIZE = 40;
  photoCropOverlay.querySelectorAll('.photo-crop-handle').forEach(handle=>{
    handle.addEventListener('pointerdown', (e)=>{
      e.preventDefault(); e.stopPropagation();
      const corner = handle.dataset.handle;
      const startX = e.clientX, startY = e.clientY, start = { ...cropBoxRect };
      handle.setPointerCapture(e.pointerId);
      function onMove(ev){
        const dx = ev.clientX - startX, dy = ev.clientY - startY;
        let { x, y, w, h } = start;
        if(corner === 'nw'){ x += dx; y += dy; w -= dx; h -= dy; }
        else if(corner === 'ne'){ y += dy; w += dx; h -= dy; }
        else if(corner === 'sw'){ x += dx; w -= dx; h += dy; }
        else { w += dx; h += dy; } // se
        w = Math.max(CROP_MIN_SIZE, w);
        h = Math.max(CROP_MIN_SIZE, h);
        x = Math.max(imgDisplayRect.x, Math.min(x, imgDisplayRect.x + imgDisplayRect.w - CROP_MIN_SIZE));
        y = Math.max(imgDisplayRect.y, Math.min(y, imgDisplayRect.y + imgDisplayRect.h - CROP_MIN_SIZE));
        w = Math.min(w, imgDisplayRect.x + imgDisplayRect.w - x);
        h = Math.min(h, imgDisplayRect.y + imgDisplayRect.h - y);
        cropBoxRect = { x, y, w, h };
        renderCropBox();
      }
      function onUp(){
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
      }
      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
    });
  });
  document.getElementById('photo-crop-rotate-btn').addEventListener('click', ()=>{
    const src = new Image();
    src.onload = ()=>{
      const canvas = document.createElement('canvas');
      canvas.width = src.height; canvas.height = src.width; // 90°: larghezza e altezza si scambiano
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(src, -src.width / 2, -src.height / 2);
      photoCropImg.onload = ()=> resetCropBoxToFull();
      photoCropImg.src = canvas.toDataURL('image/jpeg', 0.92);
    };
    src.src = photoCropImg.src;
  });
  document.getElementById('photo-crop-reset-btn').addEventListener('click', ()=>{
    photoCropImg.onload = ()=> resetCropBoxToFull();
    photoCropImg.src = cropOriginalSrc;
  });
  document.getElementById('photo-crop-cancel-btn').addEventListener('click', ()=> closePhotoCropOverlay(null));
  document.getElementById('photo-crop-apply-btn').addEventListener('click', ()=>{
    const scaleX = photoCropImg.naturalWidth / imgDisplayRect.w;
    const scaleY = photoCropImg.naturalHeight / imgDisplayRect.h;
    const sx = (cropBoxRect.x - imgDisplayRect.x) * scaleX;
    const sy = (cropBoxRect.y - imgDisplayRect.y) * scaleY;
    const sw = cropBoxRect.w * scaleX;
    const sh = cropBoxRect.h * scaleY;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sw));
    canvas.height = Math.max(1, Math.round(sh));
    canvas.getContext('2d').drawImage(photoCropImg, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    closePhotoCropOverlay(canvasToResizedDataUrl(canvas, 1400, 0.82));
  });

  fPhoto.addEventListener('change', ()=>{
    const file = fPhoto.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (e)=>{
      const result = await openPhotoCropOverlay(e.target.result);
      fPhoto.value = ''; // permette di riselezionare lo stesso file in seguito, se si annulla
      if(result){
        currentPhotoData = result;
        fPhotoPreview.src = currentPhotoData;
        fPhotoPreview.style.display = 'block';
        document.getElementById('f-photo-edit-btn').style.display = 'inline-block';
      }
      // Annullato: la foto precedente (se c'era) resta invariata.
    };
    reader.onerror = () => alert('Non è stato possibile leggere il file immagine scelto.');
    reader.readAsDataURL(file);
  });
  document.getElementById('f-photo-edit-btn').addEventListener('click', async ()=>{
    if(!currentPhotoData) return;
    const result = await openPhotoCropOverlay(currentPhotoData);
    if(result){
      currentPhotoData = result;
      fPhotoPreview.src = currentPhotoData;
      fPhotoPreview.style.display = 'block';
    }
  });

  function addIngredientRow(data){
    data = data || {name:'',qty:'',unit:''};
    const wrap = document.createElement('div');
    wrap.className = 'ingredient-block';
    wrap.innerHTML = `
      <div class="list-row">
        <input type="text" class="ing-name" placeholder="Ingrediente" value="${escapeAttr(data.name)}">
        <input type="number" class="qty ing-qty" placeholder="Qtà" value="${data.qty ?? ''}">
        <input type="text" class="unit ing-unit" placeholder="unità" value="${escapeAttr(data.unit)}" list="unit-suggestions">
        <button class="remove-row" title="Rimuovi">×</button>
      </div>
    `;
    wrap.querySelector('.remove-row').addEventListener('click', ()=> wrap.remove());
    ingredientsEditor.appendChild(wrap);
  }

  function addStepRow(data){
    data = data || {text:'',vel:'',temp:'',time:'',mode:'Normale',pressure:'',pressureUnit:'bar',pressureRelease:'Naturale',pressureReleaseMin:'',minLiquid:''};
    const hasRobotData = !!(data.vel || data.temp || (data.mode && data.mode !== 'Normale'));
    const hasPressureData = !!(data.pressure || data.minLiquid || data.pressureReleaseMin || (data.pressureRelease && data.pressureRelease !== 'Naturale'));
    const block = document.createElement('div');
    block.className = 'step-block';
    block.innerHTML = `
      <textarea class="step-text" placeholder="Descrivi il passaggio…" rows="2">${escapeHtml(data.text)}</textarea>
      <div class="step-row-bottom">
        <div class="mini">Durata (min)<input type="number" class="step-time" min="0" value="${data.time ?? ''}"></div>
        <button type="button" class="robot-toggle-btn ${hasRobotData?'active':''}">🤖 Impostazioni robot</button>
        <button type="button" class="pressure-toggle-btn ${hasPressureData?'active':''}">🍲 Impostazioni pentola a pressione</button>
        <div style="flex:1;"></div>
        <button class="remove-row" title="Rimuovi passaggio">×</button>
      </div>
      <div class="step-settings" style="display:${hasRobotData?'flex':'none'};">
        <div class="mini">Velocità<input type="number" class="step-vel" min="0" max="10" value="${data.vel ?? ''}"></div>
        <div class="mini">Temp. °C<input type="number" class="step-temp" min="0" max="130" value="${data.temp ?? ''}"></div>
        <div class="mini">Modalità
          <select class="step-mode">
            <option ${data.mode==='Normale'?'selected':''}>Normale</option>
            <option ${data.mode==='Reverse'?'selected':''}>Reverse</option>
            <option ${data.mode==='Turbo'?'selected':''}>Turbo</option>
            <option ${data.mode==='Vapore'?'selected':''}>Vapore</option>
          </select>
        </div>
      </div>
      <div class="step-settings pressure-settings" style="display:${hasPressureData?'flex':'none'};">
        <div class="mini">Pressione<input type="number" class="step-pressure" min="0" step="0.1" value="${data.pressure ?? ''}"></div>
        <div class="mini">Unità
          <select class="step-pressure-unit">
            <option value="bar" ${(!data.pressureUnit || data.pressureUnit==='bar')?'selected':''}>Bar</option>
            <option value="psi" ${data.pressureUnit==='psi'?'selected':''}>PSI</option>
            <option value="kpa" ${data.pressureUnit==='kpa'?'selected':''}>kPa</option>
          </select>
        </div>
        <div class="mini">Rilascio
          <select class="step-pressure-release">
            <option ${(!data.pressureRelease || data.pressureRelease==='Naturale')?'selected':''}>Naturale</option>
            <option ${data.pressureRelease==='Rapido'?'selected':''}>Rapido</option>
            <option ${data.pressureRelease==='Misto'?'selected':''}>Misto</option>
          </select>
        </div>
        <div class="mini step-release-min-wrap" style="display:${data.pressureRelease==='Rapido'?'none':'flex'};">Durata rilascio (min)<input type="number" class="step-pressure-release-min" min="0" value="${data.pressureReleaseMin ?? ''}"></div>
        <div class="mini">Liquido minimo (ml)<input type="number" class="step-min-liquid" min="0" value="${data.minLiquid ?? ''}"></div>
      </div>
    `;
    block.querySelector('.remove-row').addEventListener('click', ()=> block.remove());
    block.querySelector('.robot-toggle-btn').addEventListener('click', (e)=>{
      const panel = block.querySelector('.step-settings:not(.pressure-settings)');
      const showing = panel.style.display !== 'none';
      panel.style.display = showing ? 'none' : 'flex';
      e.currentTarget.classList.toggle('active', !showing);
    });
    block.querySelector('.pressure-toggle-btn').addEventListener('click', (e)=>{
      const panel = block.querySelector('.pressure-settings');
      const showing = panel.style.display !== 'none';
      panel.style.display = showing ? 'none' : 'flex';
      e.currentTarget.classList.toggle('active', !showing);
    });
    block.querySelector('.step-pressure-release').addEventListener('change', (e)=>{
      const wrap = block.querySelector('.step-release-min-wrap');
      wrap.style.display = e.target.value === 'Rapido' ? 'none' : 'flex';
    });
    stepsEditor.appendChild(block);
  }

  document.getElementById('new-recipe-btn').addEventListener('click', ()=> openEdit(null));
  document.getElementById('add-ingredient').addEventListener('click', ()=> addIngredientRow());
  document.getElementById('add-step').addEventListener('click', ()=> addStepRow());
  document.getElementById('edit-close').addEventListener('click', confirmCloseEdit);
  document.getElementById('cancel-edit').addEventListener('click', confirmCloseEdit);

  async function confirmCloseEdit(){
    if(formDirty && !(await confirmDialog({
      title: 'Modifiche non salvate',
      message: 'Hai modifiche non salvate a questa ricetta. Chiudere comunque? Le modifiche andranno perse.',
      confirmText: 'Chiudi senza salvare',
      danger: true
    }))) return;
    closeEdit();
  }
  function closeEdit(){ editOverlay.classList.remove('active'); editingId = null; formDirty = false; }
  // Segna il modulo come "sporco" a qualunque modifica dell'utente al suo interno (delega unica
  // invece di un listener per ogni campo, utile anche per gli ingredienti/passaggi aggiunti dopo).
  editOverlay.addEventListener('input', ()=>{ formDirty = true; });
  editOverlay.addEventListener('change', ()=>{ formDirty = true; });
  // Aggiungere o rimuovere una riga ingrediente/passaggio è un click, non un input/change: tracciato
  // a parte sui contenitori giusti (non su tutto editOverlay, altrimenti il click su "chiudi"/"annulla"
  // segnerebbe "sporco" il modulo subito dopo averlo appena chiuso e ripulito).
  [ingredientsEditor, stepsEditor, document.getElementById('add-ingredient'), document.getElementById('add-step')].forEach(el=>{
    el.addEventListener('click', ()=>{ formDirty = true; });
  });

  document.getElementById('save-recipe').addEventListener('click', ()=>{
    const name = fName.value.trim();
    if(!name){ alert('Serve almeno il nome della ricetta.'); return; }
    const ingredients = Array.from(ingredientsEditor.querySelectorAll('.ingredient-block')).map(block=>({
      name: block.querySelector('.ing-name').value.trim(),
      qty: parseFloat(block.querySelector('.ing-qty').value) || 0,
      unit: block.querySelector('.ing-unit').value.trim()
    })).filter(i=>i.name);

    // Segnala se lo stesso ingrediente (nome e unità) compare più volte nella ricetta — capita
    // facilmente scrivendo a mano — e offre di unirli in un'unica riga sommando le quantità.
    let finalIngredients = ingredients;
    const dupGroups = {};
    ingredients.forEach(ing=>{
      const key = normalize(ing.name) + '|' + normalize(ing.unit);
      (dupGroups[key] = dupGroups[key] || []).push(ing);
    });
    const dupNames = Object.values(dupGroups).filter(g => g.length > 1).map(g => g[0].name);
    if(dupNames.length){
      const merge = confirm(`Questo ingrediente compare più volte nella ricetta (stesso nome e unità di misura): ${dupNames.join(', ')}.\n\nVuoi unire le righe sommando le quantità? (Annulla per lasciarle separate)`);
      if(merge){
        const seen = new Set();
        finalIngredients = [];
        ingredients.forEach(ing=>{
          const key = normalize(ing.name) + '|' + normalize(ing.unit);
          if(seen.has(key)) return;
          seen.add(key);
          const group = dupGroups[key];
          finalIngredients.push(group.length === 1 ? ing : {
            name: ing.name, unit: ing.unit,
            qty: group.reduce((sum,g)=> sum + (parseFloat(g.qty)||0), 0)
          });
        });
      }
    }

    const steps = Array.from(stepsEditor.querySelectorAll('.step-block')).map(block=>({
      text: block.querySelector('.step-text').value.trim(),
      vel: block.querySelector('.step-vel').value,
      temp: block.querySelector('.step-temp').value,
      time: block.querySelector('.step-time').value,
      mode: block.querySelector('.step-mode').value,
      pressure: block.querySelector('.step-pressure').value,
      pressureUnit: block.querySelector('.step-pressure-unit').value,
      pressureRelease: block.querySelector('.step-pressure-release').value,
      pressureReleaseMin: block.querySelector('.step-pressure-release-min').value,
      minLiquid: block.querySelector('.step-min-liquid').value
    })).filter(s=>s.text);

    const tags = Array.from(fTagsWrap.querySelectorAll('input[type="checkbox"]:checked')).map(cb=>cb.value);
    const allergens = Array.from(fAllergensWrap.querySelectorAll('input[type="checkbox"]:checked')).map(cb=>cb.value);
    const freezable = document.getElementById('f-freezable').checked;

    let existingExtra = {favorite:false, lastMade:null, timesMade:0, nutrizioneCrea:null, archived:false};
    if(editingId){
      const prev = recipes.find(r=>r.id===editingId);
      if(prev){ existingExtra = {favorite:prev.favorite, lastMade:prev.lastMade, timesMade:prev.timesMade, nutrizioneCrea:prev.nutrizioneCrea||null, archived:!!prev.archived}; }
    }

    const nutrizioneUtente = leggiNutrizioneUtenteForm();

    const recipeData = {
      id: editingId || cryptoId(), name, category: fCategory.value,
      servings: parseInt(fServings.value) || 1, time: parseInt(fTime.value) || 0,
      cookerType: fCookerType.value,
      ingredients: finalIngredients, steps, tags, allergens, freezable, notes: fNotes.value.trim(),
      photo: currentPhotoData, favorite: existingExtra.favorite, lastMade: existingExtra.lastMade, timesMade: existingExtra.timesMade,
      nutrizioneCrea: existingExtra.nutrizioneCrea, nutrizioneUtente, archived: existingExtra.archived
    };

    if(editingId){
      const idx = recipes.findIndex(r=>r.id === editingId);
      if(idx > -1) recipes[idx] = recipeData;
    }else{
      recipes.push(recipeData);
    }
    saveRecipes(); renderList(); renderPlanningDays(); closeEdit();
  });

  deleteBtn.addEventListener('click', async ()=>{
    if(!editingId) return;
    const recipeName = (recipes.find(r=>r.id===editingId) || {}).name || 'questa ricetta';
    const ok = await confirmDialog({
      title: 'Eliminare la ricetta?',
      message: `"${recipeName}" verrà eliminata definitivamente, insieme a eventuali voci pianificate che la usano. L'operazione non si può annullare.`,
      confirmText: 'Elimina ricetta',
      danger: true
    });
    if(ok){
      recipes = recipes.filter(r=>r.id !== editingId);
      DAYS.forEach(day=>{ weekPlan[day] = (weekPlan[day]||[]).filter(e=>e.recipeId !== editingId); });
      saveRecipes(); saveWeek(); renderList(); renderPlanningDays(); closeEdit();
    }
  });

  // ---------- View modal ----------
  const viewOverlay = document.getElementById('view-overlay');
  const viewCategory = document.getElementById('view-category');
  const viewName = document.getElementById('view-name');
  const viewTime = document.getElementById('view-time');
  const viewTags = document.getElementById('view-tags');
  const viewPhoto = document.getElementById('view-photo');
  const viewFavoriteBtn = document.getElementById('view-favorite-btn');
  const viewLastMadeText = document.getElementById('view-last-made-text');
  const markMadeBtn = document.getElementById('mark-made-btn');
  const viewServingsCount = document.getElementById('view-servings-count');
  const viewIngredients = document.getElementById('view-ingredients');
  const viewSteps = document.getElementById('view-steps');
  const viewNotesBlock = document.getElementById('view-notes-block');
  const viewNotes = document.getElementById('view-notes');

  function openView(id){
    const r = recipes.find(x=>x.id === id);
    if(!r) return;
    currentViewId = id;
    currentServings = r.servings;
    renderView(r);
    viewOverlay.classList.add('active');
  }

  function roundNice(n){
    const rounded = Math.round(n * 10) / 10;
    return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
  }
  // Unità "a conteggio" (cucchiai, cucchiaini, pizzichi, pezzi...) per cui, sotto l'unità
  // intera, ha più senso una frazione da cucina (1/2, 1/4...) che un decimale.
  const COUNT_STYLE_UNITS = ['cucchiaio','cucchiai','cucchiaino','cucchiaini','pizzico','pizzichi','pezzo','pezzi','tazza','tazze','fetta','fette','spicchio','spicchi','rametto','rametti','filetto','filetti','foglia','foglie'];
  const NICE_FRACTIONS = [
    { value: 1/4, text: '1/4' },
    { value: 1/3, text: '1/3' },
    { value: 1/2, text: '1/2' },
    { value: 2/3, text: '2/3' },
    { value: 3/4, text: '3/4' }
  ];
  function isCountStyleUnit(unit){
    return COUNT_STYLE_UNITS.includes(String(unit||'').trim().toLowerCase());
  }
  // Formatta una quantità già scalata in base all'unità: per cucchiai/cucchiaini/pizzichi/
  // pezzi ecc. converte la parte frazionaria in una frazione da cucina quando corrisponde
  // a una comune (es. 0.5 -> "1/2", 1.75 -> "1 e 3/4"); altrimenti si comporta come roundNice.
  function formatQtyForUnit(value, unit){
    if(value === '' || value === null || value === undefined) return '';
    const n = parseFloat(value);
    if(isNaN(n)) return '';
    if(!isCountStyleUnit(unit)) return roundNice(n);
    const whole = Math.floor(n + 1e-9);
    const frac = n - whole;
    if(frac < 0.02) return String(whole);
    const match = NICE_FRACTIONS.find(f => Math.abs(frac - f.value) < 0.03);
    if(!match) return roundNice(n);
    return whole > 0 ? `${whole} e ${match.text}` : match.text;
  }
  function plural(n, one, many){ return n === 1 ? one : many; }

  // I valori nutrizionali per ricetta NON si calcolano sommando i singoli
  // ingredienti crudi: la cottura altera in modo non prevedibile acqua, grassi
  // e altri valori (es. la pasta assorbe acqua, un fritto assorbe olio). I dati
  // mostrati sono quindi solo quelli inseriti dall'utente per porzione o quelli
  // misurati da CREA sul piatto finito per 100 g; non sono calcolati da noi.
  const NUTRITION_FIELDS = [
    {key:'kcal', label:'Kcal', unit:''},
    {key:'proteine', label:'Proteine', unit:'g'},
    {key:'grassi', label:'Grassi', unit:'g'},
    {key:'carboidrati', label:'Carboidrati', unit:'g'},
    {key:'fibre', label:'Fibre', unit:'g'},
    {key:'zuccheri', label:'Zuccheri', unit:'g'},
    {key:'sale', label:'Sale', unit:'g'}
  ];
  /** Ritorna i valori ufficiali CREA del piatto (per 100 g), solo se la
   * ricetta è stata importata da CREA Menù; altrimenti null (niente da
   * mostrare — non si inventa un totale sommando gli ingredienti crudi). */
  function getNutrizioneCrea(r){
    return (r && r.nutrizioneCrea) || null;
  }

  function renderView(r){
    viewCategory.textContent = r.category;
    viewCategory.style.background = CATEGORY_COLORS[r.category] || '#8c6a2f';
    viewCategory.style.color = '#fff'; viewCategory.style.borderRadius = '20px';
    viewCategory.style.padding = '3px 10px'; viewCategory.style.fontWeight = '600';
    viewName.textContent = r.name;
    viewTime.textContent = r.time ? `Tempo totale: circa ${r.time} minuti` : '';
    const extraChips = [];
    if(recipeHasPressure(r)) extraChips.push('<span class="view-tag-chip">🍲 Pentola a pressione</span>');
    if(recipeHasRobot(r)) extraChips.push('<span class="view-tag-chip">🤖 Robot da cucina</span>');
    if(recipeIsTraditional(r)) extraChips.push('<span class="view-tag-chip">🔥 Tradizionale</span>');
    if(r.cookerType) extraChips.push(`<span class="view-tag-chip">${r.cookerType === 'Elettrica' ? '⚡' : '🔥'} ${escapeHtml(r.cookerType)}</span>`);
    viewTags.innerHTML = (r.tags || []).map(t=>`<span class="view-tag-chip">${escapeHtml(t)}</span>`).join('') + extraChips.join('');

    const viewAllergens = document.getElementById('view-allergens');
    if(r.allergens && r.allergens.length){
      viewAllergens.innerHTML = '<span style="font-size:var(--fs-xs);color:var(--ink-soft);margin-right:4px;">⚠ Contiene:</span>' +
        r.allergens.map(a=>`<span class="view-tag-chip allergen-chip">${escapeHtml(a)}</span>`).join('');
    } else {
      viewAllergens.innerHTML = '';
    }
    document.getElementById('view-archived-note').style.display = r.archived ? 'block' : 'none';
    const archiveToggleBtn = document.getElementById('archive-toggle-btn');
    if(archiveToggleBtn) archiveToggleBtn.textContent = r.archived ? '📂 Disarchivia' : '📦 Archivia';
    document.getElementById('freezable-suggestion').style.display = r.freezable ? 'flex' : 'none';

    if(r.photo){ viewPhoto.src = r.photo; viewPhoto.alt = r.name; viewPhoto.style.display = 'block'; }
    else{ viewPhoto.style.display = 'none'; }

    viewFavoriteBtn.classList.toggle('active', !!r.favorite);
    viewFavoriteBtn.style.color = r.favorite ? 'var(--gold-bright)' : 'var(--line)';

    viewLastMadeText.textContent = r.lastMade
      ? `${lastMadeLabel(r.lastMade)} (${new Date(r.lastMade).toLocaleDateString('it-IT')}) — preparata ${r.timesMade || 1} volt${(r.timesMade||1)===1?'a':'e'}`
      : 'Non ancora preparata';

    viewServingsCount.textContent = currentServings;
    const scale = currentServings / (r.servings || 1);
    viewIngredients.innerHTML = '';
    r.ingredients.forEach(i=>{
      const scaledQty = i.qty ? formatQtyForUnit(i.qty * scale, i.unit) : '';
      const li = document.createElement('li');
      li.innerHTML = `<span>${escapeHtml(i.name)}</span><span class="amt">${scaledQty} ${escapeHtml(i.unit)}</span>`;
      viewIngredients.appendChild(li);
    });

    const viewNutrition = document.getElementById('view-nutrition');
    const nutrizioneCrea = getNutrizioneCrea(r);
    const nutrizioneUtente = r.nutrizioneUtente || null;
    let nutritionHtml = '';
    if(nutrizioneUtente){
      const rows = NUTRITION_FIELDS
        .filter(f => nutrizioneUtente[f.key] !== null && nutrizioneUtente[f.key] !== undefined)
        .map(f => `<div>${f.label}: <b>${roundNice(nutrizioneUtente[f.key])}</b>${f.unit}</div>`).join('');
      nutritionHtml += `
        <div class="nutrition-summary">
          <h4>🍎 Valori nutrizionali (per porzione)</h4>
          <div class="nutrition-grid">${rows}</div>
          <div class="nutrition-note" style="opacity:.7;margin-top:6px;">Inseriti da te: verifica sempre la fonte da cui provengono.</div>
        </div>
      `;
    }
    if(nutrizioneCrea){
      const rows = NUTRITION_FIELDS
        .filter(f => nutrizioneCrea[f.key] !== null && nutrizioneCrea[f.key] !== undefined)
        .map(f => `<div>${f.label}: <b>${roundNice(nutrizioneCrea[f.key])}</b>${f.unit}</div>`).join('');
      nutritionHtml += `
        <div class="nutrition-summary">
          <h4>🍎 Valori nutrizionali (per 100 g del piatto)</h4>
          <div class="nutrition-grid">${rows}</div>
          <div class="nutrition-note" style="opacity:.7;margin-top:6px;">
            Valori ufficiali <a href="https://www.alimentinutrizione.it" target="_blank" rel="noopener" style="color:var(--gold-deep);">CREA</a>
            misurati sul piatto finito (non calcolati sugli ingredienti crudi, che la cottura altera).
          </div>
        </div>
      `;
    }
    if(nutritionHtml){
      viewNutrition.innerHTML = nutritionHtml;
      viewNutrition.style.display = 'block';
    }else{
      viewNutrition.innerHTML = '';
      viewNutrition.style.display = 'none';
    }

    viewSteps.innerHTML = '';
    r.steps.forEach((s, idx)=>{
      const hasRobot = !!(s.vel || s.temp || (s.mode && s.mode !== 'Normale'));
      const hasTime = !!s.time;
      const hasPressure = !!(s.pressure || s.minLiquid || s.pressureReleaseMin || (s.pressureRelease && s.pressureRelease !== 'Naturale'));
      const hasReleaseTimer = hasPressure && s.pressureRelease !== 'Rapido' && !!s.pressureReleaseMin;
      const unitLabel = {bar:'Bar', psi:'PSI', kpa:'kPa'}[s.pressureUnit] || 'Bar';
      const div = document.createElement('div');
      div.className = 'view-step';
      div.innerHTML = `
        <div class="num">${idx+1}</div>
        <div class="txt">
          <div>${escapeHtml(s.text)}</div>
          ${(hasRobot || hasTime) ? `<div class="step-meta">
            ${s.vel?`<span>Vel. <b>${escapeHtml(s.vel)}</b></span>`:''}
            ${s.temp?`<span>${escapeHtml(s.temp)}°C</span>`:''}
            ${s.mode && s.mode!=='Normale'?`<span>${escapeHtml(s.mode)}</span>`:''}
            ${hasTime?`<span><b>${escapeHtml(s.time)}</b> min</span><button class="step-timer-btn" data-minutes="${s.time}" data-display-key="${idx}-cook">▶ Timer</button><span class="step-timer-display" data-timer-display="${idx}-cook"></span>`:''}
          </div>` : ''}
          ${hasPressure ? `<div class="step-meta">
            ${s.pressure?`<span>🍲 <b>${escapeHtml(s.pressure)}</b> ${unitLabel}</span>`:''}
            ${s.pressureRelease?`<span>Rilascio: ${escapeHtml(s.pressureRelease)}</span>`:''}
            ${s.minLiquid?`<span>Liquido min. <b>${escapeHtml(s.minLiquid)}</b> ml</span>`:''}
            ${hasReleaseTimer?`<span><b>${escapeHtml(s.pressureReleaseMin)}</b> min rilascio</span><button class="step-timer-btn" data-minutes="${s.pressureReleaseMin}" data-display-key="${idx}-release">▶ Timer rilascio</button><span class="step-timer-display" data-timer-display="${idx}-release"></span>`:''}
          </div>` : ''}
        </div>
      `;
      viewSteps.appendChild(div);
    });
    viewSteps.querySelectorAll('.step-timer-btn').forEach(btn=>{
      btn.addEventListener('click', ()=> startInlineTimer(btn));
    });

    if(r.notes){ viewNotesBlock.style.display = 'block'; viewNotes.textContent = r.notes; }
    else{ viewNotesBlock.style.display = 'none'; }
  }

  function startInlineTimer(btn){
    const minutes = parseFloat(btn.dataset.minutes);
    const key = btn.dataset.displayKey;
    const display = document.querySelector(`[data-timer-display="${key}"]`);
    let remaining = Math.round(minutes * 60);
    btn.disabled = true;
    const interval = setInterval(()=>{
      remaining--;
      const mm = Math.floor(remaining/60).toString().padStart(2,'0');
      const ss = (remaining%60).toString().padStart(2,'0');
      display.textContent = ` ${mm}:${ss}`;
      if(remaining <= 0){
        clearInterval(interval);
        display.textContent = ' Fatto!';
        btn.disabled = false;
        try{ new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAAAAAA==').play(); }catch(e){}
      }
    }, 1000);
  }

  document.getElementById('servings-minus').addEventListener('click', ()=>{
    if(currentServings > 1) currentServings--;
    renderView(recipes.find(x=>x.id === currentViewId));
  });
  document.getElementById('servings-plus').addEventListener('click', ()=>{
    currentServings++;
    renderView(recipes.find(x=>x.id === currentViewId));
  });
  document.getElementById('double-servings-btn').addEventListener('click', ()=>{
    currentServings = currentServings * 2;
    renderView(recipes.find(x=>x.id === currentViewId));
  });

  document.getElementById('view-close').addEventListener('click', ()=>{
    viewOverlay.classList.remove('active'); currentViewId = null;
  });
  document.getElementById('view-edit-btn').addEventListener('click', ()=>{
    const r = recipes.find(x=>x.id === currentViewId);
    viewOverlay.classList.remove('active');
    openEdit(r);
  });
  document.getElementById('archive-toggle-btn').addEventListener('click', ()=>{
    const r = recipes.find(x=>x.id === currentViewId);
    if(!r) return;
    r.archived = !r.archived;
    saveRecipes();
    renderView(r);
    renderList();
  });
  document.getElementById('duplicate-recipe-btn').addEventListener('click', ()=>{
    const r = recipes.find(x=>x.id === currentViewId);
    if(!r) return;
    viewOverlay.classList.remove('active');
    openEdit(null, { ...r, name: `${r.name} (copia)` }, 'Duplica ricetta');
  });
  document.getElementById('recipe-shopping-btn').addEventListener('click', ()=>{
    const r = recipes.find(x=>x.id === currentViewId);
    if(!r) return;
    const scale = currentServings / (r.servings || 1);
    const items = buildAggregatedShoppingItems([{ recipe: r, scale }], false);
    openShoppingListOverlay(items, `Per ${currentServings} porzion${currentServings===1?'e':'i'} — ${r.name}`);
  });
  viewFavoriteBtn.addEventListener('click', ()=>{
    const r = recipes.find(x=>x.id === currentViewId);
    if(!r) return;
    r.favorite = !r.favorite;
    saveRecipes(); renderView(r); renderList();
  });
  markMadeBtn.addEventListener('click', ()=>{
    const r = recipes.find(x=>x.id === currentViewId);
    if(!r) return;
    r.lastMade = new Date().toISOString();
    r.timesMade = (r.timesMade || 0) + 1;
    saveRecipes(); renderView(r); renderList();
  });

  // ---------- Pianifica dalla scheda ricetta ----------
  const viewScheduleBtn = document.getElementById('view-schedule-btn');
  const viewScheduleDropdown = document.getElementById('view-schedule-dropdown');
  const scheduleDaySelect = document.getElementById('schedule-day-select');
  const scheduleMealtypeSelect = document.getElementById('schedule-mealtype-select');
  const scheduleTimeInput = document.getElementById('schedule-time-input');
  const scheduleStatus = document.getElementById('schedule-status');

  viewScheduleBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const opening = !viewScheduleDropdown.classList.contains('open');
    viewScheduleDropdown.classList.toggle('open');
    if(opening){
      scheduleMealtypeSelect.innerHTML = mealTypes.map(mt=>`<option>${escapeHtml(mt)}</option>`).join('');
      const jsDay = new Date().getDay(); // 0=domenica...6=sabato
      scheduleDaySelect.selectedIndex = jsDay === 0 ? 6 : jsDay - 1;
      scheduleTimeInput.value = '';
      scheduleStatus.style.display = 'none';
    }
  });
  document.addEventListener('click', (e)=>{
    if(viewScheduleDropdown.classList.contains('open') && !viewScheduleDropdown.contains(e.target) && e.target !== viewScheduleBtn){
      viewScheduleDropdown.classList.remove('open');
    }
  });
  document.getElementById('schedule-confirm-btn').addEventListener('click', ()=>{
    if(!currentViewId) return;
    const day = scheduleDaySelect.value;
    const mealType = scheduleMealtypeSelect.value;
    if(!mealType) return;
    weekPlan[day] = weekPlan[day] || [];
    weekPlan[day].push({ id: cryptoId(), recipeId: currentViewId, mealType, time: scheduleTimeInput.value || '' });
    saveWeek();
    scheduleStatus.textContent = `✓ Aggiunta a ${day}`;
    scheduleStatus.style.display = 'block';
    offerAddMissingToShoppingList(recipes.find(r=>r.id === currentViewId));
  });

  // Costruisce le sezioni PDF (titolo escluso: lo mette chi chiama, serve diverso per l'export
  // di una singola ricetta rispetto a quello dell'intero ricettario) per una ricetta, alle
  // porzioni indicate. Condivisa tra l'esportazione di una singola ricetta e quella di tutto
  // il ricettario, così il contenuto di ciascuna ricetta resta identico nei due casi.
  function recipePdfSections(r, servings){
    const scale = servings / (r.servings || 1);
    const metaLine = `${r.category} · ${servings} porzioni${r.time ? ' · circa ' + r.time + ' min' : ''}`;
    const sections = [{
      heading: null,
      lines: [metaLine, (r.tags && r.tags.length) ? 'Tag: ' + r.tags.join(', ') : null, (r.allergens && r.allergens.length) ? 'Allergeni: ' + r.allergens.join(', ') : null].filter(Boolean)
    }];
    sections.push({
      heading: 'Ingredienti',
      lines: r.ingredients.map(i=>{
        const qty = i.qty ? formatQtyForUnit(parseFloat(i.qty) * scale, i.unit) : '';
        return `- ${[qty, i.unit, i.name].filter(Boolean).join(' ')}`;
      })
    });
    const nutrizioneUtente = r.nutrizioneUtente || null;
    if(nutrizioneUtente){
      const nutritionLines = NUTRITION_FIELDS
        .filter(f => nutrizioneUtente[f.key] !== null && nutrizioneUtente[f.key] !== undefined)
        .map(f => `${f.label}: ${roundNice(nutrizioneUtente[f.key])}${f.unit}`);
      sections.push({ heading: 'Valori nutrizionali (per porzione)', lines: nutritionLines });
    }
    const nutrizioneCrea = getNutrizioneCrea(r);
    if(nutrizioneCrea){
      const nutritionLines = NUTRITION_FIELDS
        .filter(f => nutrizioneCrea[f.key] !== null && nutrizioneCrea[f.key] !== undefined)
        .map(f => `${f.label}: ${roundNice(nutrizioneCrea[f.key])}${f.unit}`);
      sections.push({ heading: 'Valori nutrizionali ufficiali CREA (per 100 g del piatto)', lines: nutritionLines });
    }
    sections.push({
      heading: 'Preparazione',
      lines: r.steps.map((s, idx) => `${idx+1}. ${stepToCsvText(s)}`)
    });
    if(r.notes){
      sections.push({ heading: 'Note', lines: r.notes.split('\n') });
    }
    return sections;
  }

  document.getElementById('export-recipe-pdf-btn').addEventListener('click', ()=>{
    const r = recipes.find(x=>x.id === currentViewId);
    if(!r) return;
    const pdfStr = buildPdfFromSections(r.name, recipePdfSections(r, currentServings));
    const safeName = r.name.replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g,'') || 'ricetta';
    downloadPdf(pdfStr, `${safeName}.pdf`);
  });

  // Esporta l'intero ricettario in un solo PDF: un indice con i nomi, poi una ricetta per pagina
  // (alle sue porzioni base, dato che non si sta guardando una scheda precisa con porzioni
  // scalate). Le ricette archiviate restano fuori, come dal resto del sito.
  document.getElementById('export-all-pdf-btn').addEventListener('click', ()=>{
    const active = sortRecipes(recipes.filter(r=>!r.archived));
    if(!active.length){
      alert('Non hai ancora nessuna ricetta da esportare (quelle archiviate restano escluse).');
      return;
    }
    const sections = [{
      heading: 'Indice',
      lines: active.map(r=>`- ${r.name}`)
    }];
    active.forEach(r=>{
      const recipeSections = recipePdfSections(r, r.servings || 1);
      recipeSections[0] = { ...recipeSections[0], heading: r.name, headingSize: 16, pageBreakBefore: true };
      sections.push(...recipeSections);
    });
    const pdfStr = buildPdfFromSections('Il Mio Ricettario', sections);
    downloadPdf(pdfStr, `ricettario-completo-${new Date().toISOString().slice(0,10)}.pdf`);
  });

  document.getElementById('export-recipe-json-btn').addEventListener('click', ()=>{
    const r = recipes.find(x=>x.id === currentViewId);
    if(!r) return;
    const blob = new Blob([JSON.stringify(r, null, 2)], {type:'application/json'});
    const safeName = r.name.replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g,'') || 'ricetta';
    saveFileSmart(blob, `${safeName}.json`, 'application/json', '.json', 'Ricetta (JSON)');
  });

  const importRecipeFileBtn = document.getElementById('import-recipe-file-btn');
  const importRecipeFileInput = document.getElementById('import-recipe-file-input');
  importRecipeFileBtn.addEventListener('click', ()=> importRecipeFileInput.click());
  importRecipeFileInput.addEventListener('change', ()=>{
    const file = importRecipeFileInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      try{
        const parsed = JSON.parse(e.target.result);
        if(Array.isArray(parsed.recipes)){
          alert('Questo sembra un file di backup completo, non una singola ricetta. Usa "Importa backup" nel menu "📦 Backup e CSV".');
          return;
        }
        if(!parsed || typeof parsed !== 'object' || !parsed.name || !Array.isArray(parsed.ingredients)){
          alert('Questo file non sembra contenere una ricetta valida.');
          return;
        }
        if(recipes.some(r => r.name.trim().toLowerCase() === String(parsed.name).trim().toLowerCase())){
          alert(`Hai già una ricetta chiamata "${parsed.name}". Rinominala prima di importarla di nuovo, per evitare doppioni.`);
          return;
        }
        const recipe = migrateRecipe({ ...parsed, id: cryptoId(), favorite: false, lastMade: null, timesMade: 0 });
        recipes.push(recipe);
        saveRecipes(); renderList(); renderPlanningDays();
        alert(`Importata la ricetta "${recipe.name}".`);
      }catch(err){
        alert('Non sono riuscito a leggere questo file. Controlla che sia un file di ricetta esportato da qui.');
      }
      importRecipeFileInput.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  });

  // ---------- Dati pianificazione condivisi (stampa, PDF, lista della spesa) ----------
  function planEntryName(e){
    if(e.dispensaItemId){
      const it = dispensaItems.find(x=>x.id === e.dispensaItemId);
      const base = it ? it.name : '(prodotto eliminato)';
      const qtyPart = e.qty ? ` (${roundNice(e.qty)}${e.unit ? ' ' + e.unit : ''})` : '';
      return base + qtyPart;
    }
    const r = recipes.find(x=>x.id === e.recipeId);
    return r ? r.name : '(ricetta eliminata)';
  }

  /** Valori nutrizionali di una voce pianificata, calcolati per la quantità
   * di quella voce: per un prodotto Dispensa, sui grammi/kg indicati
   * nell'entry (i suoi valori sono per 100 g); per una ricetta, sulle
   * porzioni pianificate per la settimana (i suoi valori, se inseriti,
   * sono per porzione). Ritorna null se non ci sono abbastanza dati per
   * calcolare qualcosa di sensato, invece di indovinare un valore.*/
  function nutrizionePerEntry(e){
    if(e.dispensaItemId){
      const it = dispensaItems.find(x=>x.id === e.dispensaItemId);
      if(!it) return null;
      const grammi = stimaGrammiIngrediente(e.qty, e.unit);
      if(grammi === null) return null;
      const fattore = grammi / 100;
      const mappa = { kcal:'kcal', proteine:'protein', grassi:'fat', carboidrati:'carbs', fibre:'fiber', zuccheri:'sugar', sale:'salt' };
      const risultato = {};
      let almenoUno = false;
      for(const [chiaveOut, chiaveIt] of Object.entries(mappa)){
        const v = it[chiaveIt];
        if(v !== '' && v !== null && v !== undefined){ risultato[chiaveOut] = parseFloat(v) * fattore; almenoUno = true; }
        else{ risultato[chiaveOut] = null; }
      }
      return almenoUno ? risultato : null;
    }
    const r = recipes.find(x=>x.id === e.recipeId);
    if(!r || !r.nutrizioneUtente) return null;
    const fattore = planServings; // quante porzioni si stanno pianificando questa settimana
    const risultato = {};
    let almenoUno = false;
    for(const [k, v] of Object.entries(r.nutrizioneUtente)){
      if(v !== null && v !== undefined){ risultato[k] = v * fattore; almenoUno = true; }
      else{ risultato[k] = null; }
    }
    return almenoUno ? risultato : null;
  }

  /** Somma una lista di oggetti nutrizionali (uscita di nutrizionePerEntry,
   * anche null per le voci senza dati): ogni campo ignora le voci senza
   * quel valore, invece di trattarle come zero — così "manca il dato per
   * un piatto" resta visibile nel confronto, non nasconde un possibile
   * sottostima. Ritorna null se non c'è proprio nulla da sommare. */
  function sommaNutrizione(listaValori){
    const campi = ['kcal','proteine','grassi','carboidrati','fibre','zuccheri','sale'];
    const totale = {};
    let almenoUnCampo = false;
    for(const campo of campi){
      let somma = 0, contribuito = false;
      for(const v of listaValori){
        if(v && v[campo] !== null && v[campo] !== undefined){ somma += v[campo]; contribuito = true; }
      }
      totale[campo] = contribuito ? somma : null;
      if(contribuito) almenoUnCampo = true;
    }
    return almenoUnCampo ? totale : null;
  }
  function formattaNutrizioneCompatta(nutrizione){
    if(!nutrizione) return '';
    return NUTRITION_FIELDS
      .filter(f => nutrizione[f.key] !== null && nutrizione[f.key] !== undefined)
      .map(f => `${f.label} ${roundNice(nutrizione[f.key])}${f.unit}`)
      .join(' · ');
  }
  function nutrizioneMealBlock(day, mealType){
    return sommaNutrizione((weekPlan[day]||[]).filter(e=>e.mealType===mealType).map(nutrizionePerEntry));
  }
  function nutrizioneGiorno(day){
    return sommaNutrizione((weekPlan[day]||[]).map(nutrizionePerEntry));
  }
  function nutrizioneSettimana(){
    return sommaNutrizione(DAYS.flatMap(d => weekPlan[d]||[]).map(nutrizionePerEntry));
  }
  // Aggrega gli ingredienti di un elenco di { recipe, scale } in un'unica lista per la spesa.
  // "includeExtras" (facoltativo, di base true) aggiunge anche i promemoria degli ingredienti
  // segnalati mancanti dalla Dispensa, quando non già coperti dagli ingredienti aggregati.
  // Converte una quantità nella sua unità "di base" per poterla sommare insieme ad altre scritte
  // in modo diverso ma equivalente (es. "500 g" e "0,5 kg" diventano entrambe 500 in base grammi).
  // Per un'unità non riconosciuta (o nessuna unità) ritorna la quantità invariata.
  function unitBaseQty(qty, unit){
    const factor = UNIT_BASE_FACTOR[normalize(unit)];
    return factor === undefined ? qty : qty * factor;
  }
  // Dato il gruppo di un'unità (vedi unitGroupKey) e una quantità già sommata nella relativa
  // unità di base, sceglie un'unità "leggibile" per mostrarla: g/kg o ml/l a seconda dell'ordine
  // di grandezza per peso/volume, singolare/plurale per le unità a conteggio, altrimenti l'unità
  // scritta nel primo ingrediente trovato (unità non riconosciuta: nessuna conversione automatica).
  function displayUnitForGroup(groupKey, qty, sampleUnit){
    if(groupKey === 'peso') return qty >= 1000 ? { qty: qty/1000, unit:'kg' } : { qty, unit:'g' };
    if(groupKey === 'volume') return qty >= 1000 ? { qty: qty/1000, unit:'l' } : { qty, unit:'ml' };
    const forms = UNIT_DISPLAY_FORMS[groupKey];
    if(forms) return { qty, unit: Math.abs(qty - 1) < 1e-9 ? forms[1] : forms.many };
    return { qty, unit: sampleUnit || '' };
  }
  function buildAggregatedShoppingItems(recipeScalePairs, includeExtras){
    if(includeExtras === undefined) includeExtras = true;
    const aggregated = {};
    recipeScalePairs.forEach(({recipe:r, scale})=>{
      r.ingredients.forEach(ing=>{
        // Raggruppa per nome e "famiglia" di unità (peso, volume, o l'unità a conteggio), non per
        // il testo esatto dell'unità: così "g" e "grammi", oppure "kg" e "g", oppure "cucchiaio" e
        // "cucchiai" finiscono nella stessa riga della lista della spesa invece di duplicarla.
        const groupKey = unitGroupKey(ing.unit);
        const key = normalize(ing.name) + '|' + groupKey;
        if(!aggregated[key]){ aggregated[key] = {name: ing.name, groupKey, sampleUnit: ing.unit, qty: 0}; }
        aggregated[key].qty += unitBaseQty((parseFloat(ing.qty) || 0) * scale, ing.unit);
      });
    });
    let items = Object.values(aggregated)
      .map(a=>{
        const disp = displayUnitForGroup(a.groupKey, a.qty, a.sampleUnit);
        return { name: a.name, unit: disp.unit, qty: disp.qty };
      })
      .sort((a,b)=>a.name.localeCompare(b.name));
    if(includeExtras){
      const aggregatedNames = new Set(items.map(i=>normalize(i.name)));
      // Promemoria: ingredienti segnalati mancanti dalla Dispensa quando una ricetta è stata pianificata,
      // aggiunti se non già coperti dagli ingredienti già aggregati dalle ricette di questa settimana.
      const extras = shoppingExtraItems
        .filter(x => !aggregatedNames.has(normalize(x.name)))
        .map(x => ({ name: x.name, unit: '', qty: 0, fromDispensaFlag: true, extraId: x.id }));
      items = items.concat(extras.sort((a,b)=>a.name.localeCompare(b.name)));
    }
    return items;
  }
  // Calcola la quantità realmente da acquistare, sottraendo automaticamente ciò che è già
  // disponibile in Dispensa. Non modifica la Dispensa: è solo un calcolo per la lista della spesa.
  function subtractPantryFromShoppingItems(items){
    return items.map(item=>{
      if(item.fromDispensaFlag || !item.qty) return item;
      const found = findDispensaMatch(item.name);
      const pantry = found && found.match;
      if(!pantry) return item;
      const pantryQty = parseFloat(pantry.qty) || 0;
      if(pantryQty <= 0) return item;
      const converted = convertQty(pantryQty, pantry.unit, item.unit);
      if(converted === null){
        return {...item, pantryNote:`Presente in Dispensa: ${formatQtyForUnit(pantryQty, pantry.unit)} ${pantry.unit||''}`.trim()};
      }
      const requested = parseFloat(item.qty) || 0;
      const remaining = Math.max(0, Math.round((requested - converted) * 100) / 100);
      return {...item, qty:remaining, pantryCovered:remaining===0, pantryUsedQty:Math.min(requested, converted), pantryUsedUnit:item.unit||pantry.unit||'', pantryMatchName:pantry.name, pantryApprox:!!found.isApprox};
    });
  }

  function computeWeekPlanData(){
    const days = DAYS.map(day=>{
      const entries = (weekPlan[day] || []).slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
      return { day, entries: entries.map(e=>({ time: e.time || '', mealType: e.mealType, name: planEntryName(e) })) };
    });
    const allEntries = DAYS.flatMap(day => weekPlan[day] || []);
    const plannedRecipes = allEntries.map(e=>recipes.find(r=>r.id===e.recipeId)).filter(Boolean);
    const pairs = plannedRecipes.map(r=>({ recipe: r, scale: planServings / (r.servings || 1) }));
    const shoppingItems = buildAggregatedShoppingItems(pairs);
    return { days, shoppingItems };
  }
  function shoppingItemLine(i){
    if(i.fromDispensaFlag) return `${i.name} (dalla dispensa)`;
    return `${i.name}${i.qty ? ' — ' + formatQtyForUnit(i.qty, i.unit) : ''}${i.unit ? ' ' + i.unit : ''}`;
  }

  // ---------- Generatore PDF minimale (solo testo, multipagina, nessuna libreria esterna) ----------
  function pdfSanitizeText(str){
    const map = {'’':"'", '‘':"'", '“':'"', '”':'"', '–':'-', '—':'-', '…':'...', '☐':'-'};
    let out = '';
    for(const ch of String(str)){
      const code = ch.codePointAt(0);
      if(code <= 255){ out += ch; }
      else if(map[ch] !== undefined){ out += map[ch]; }
      else{ out += '?'; }
    }
    return out.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
  }

  let pdfMeasureCtx = null;
  function pdfTextWidth(text, size){
    if(!pdfMeasureCtx){ pdfMeasureCtx = document.createElement('canvas').getContext('2d'); }
    pdfMeasureCtx.font = `${size}px Helvetica, Arial, sans-serif`;
    return pdfMeasureCtx.measureText(text).width;
  }

  // Spezza una riga di testo su più righe perché stia nella larghezza disponibile.
  // firstMaxWidth/restMaxWidth possono differire per gestire un rientro delle righe successive
  // (es. elenchi puntati o passaggi numerati, dove il testo continua allineato sotto il primo).
  function wrapPdfLineHanging(text, size, firstMaxWidth, restMaxWidth){
    const str = text == null ? '' : String(text);
    if(str.trim() === '') return [''];
    const words = str.split(' ').filter(w => w !== '');
    const lines = [];
    let line = '';
    let maxW = firstMaxWidth;
    words.forEach(word=>{
      const candidate = line ? `${line} ${word}` : word;
      if(pdfTextWidth(candidate, size) <= maxW){
        line = candidate;
        return;
      }
      if(line){ lines.push(line); maxW = restMaxWidth; }
      if(pdfTextWidth(word, size) <= maxW){
        line = word;
        return;
      }
      // parola singola troppo lunga per la riga: la spezza carattere per carattere
      let piece = '';
      for(const ch of word){
        const testPiece = piece + ch;
        if(pdfTextWidth(testPiece, size) <= maxW || piece === ''){
          piece = testPiece;
        }else{
          lines.push(piece);
          maxW = restMaxWidth;
          piece = ch;
        }
      }
      line = piece;
    });
    lines.push(line);
    return lines;
  }

  function buildPdfFromSections(title, sections){
    const PAGE_W = 595, PAGE_H = 842;
    const MARGIN_X = 50, TOP_Y = 792, BOTTOM_Y = 50;
    const MAX_WIDTH = PAGE_W - MARGIN_X * 2;
    const TITLE_SIZE = 18, HEAD_SIZE = 13, TEXT_SIZE = 10.5;
    const LINE_H = 15, HEAD_GAP = 20, TITLE_GAP = 30;

    const pages = [];
    let cmds = [];
    let y = TOP_Y;
    function ensureSpace(h){
      if(y - h < BOTTOM_Y){ pages.push(cmds); cmds = []; y = TOP_Y; }
    }
    function pushWrapped(size, lineHeight, text, indentAfterFirst){
      const indent = indentAfterFirst || 0;
      const wrapped = wrapPdfLineHanging(text, size, MAX_WIDTH, MAX_WIDTH - indent);
      wrapped.forEach((piece, idx)=>{
        ensureSpace(lineHeight);
        cmds.push({size, y, x: MARGIN_X + (idx > 0 ? indent : 0), text: piece || ' '});
        y -= lineHeight;
      });
    }

    if(title) pushWrapped(TITLE_SIZE, TITLE_GAP, title, 0);

    sections.forEach(sec=>{
      // Una sezione con "pageBreakBefore" inizia sempre su una pagina nuova (usata per separare
      // ogni ricetta in un'esportazione con più ricette insieme), non solo quando il contenuto
      // non entra più in quella corrente.
      if(sec.pageBreakBefore && cmds.length){ pages.push(cmds); cmds = []; y = TOP_Y; }
      if(sec.heading){
        pushWrapped(sec.headingSize || HEAD_SIZE, HEAD_GAP, sec.heading, 0);
      }
      (sec.lines && sec.lines.length ? sec.lines : []).forEach(line=>{
        const str = line || ' ';
        // rientro delle righe di continuazione allineato al testo dopo un trattino puntato o un numero di passaggio
        const bulletMatch = /^(-\s+)/.exec(str);
        const numberMatch = /^(\d+\.\s+)/.exec(str);
        const prefix = bulletMatch ? bulletMatch[1] : (numberMatch ? numberMatch[1] : '');
        const indent = prefix ? pdfTextWidth(prefix, TEXT_SIZE) : 0;
        pushWrapped(TEXT_SIZE, LINE_H, str, indent);
      });
      y -= 8;
    });
    pages.push(cmds);

    const fontObjId = 3, pagesObjId = 2, catalogObjId = 1;
    let objId = 4;
    const pageObjIds = [], contentObjIds = [];
    pages.forEach(()=>{ pageObjIds.push(objId++); contentObjIds.push(objId++); });

    const objects = [];
    objects[catalogObjId] = `<< /Type /Catalog /Pages ${pagesObjId} 0 R >>`;
    objects[pagesObjId] = `<< /Type /Pages /Kids [${pageObjIds.map(n=>n+' 0 R').join(' ')}] /Count ${pages.length} >>`;
    objects[fontObjId] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;

    pages.forEach((pageCmds, i)=>{
      const pageId = pageObjIds[i], contentId = contentObjIds[i];
      objects[pageId] = `<< /Type /Page /Parent ${pagesObjId} 0 R /Resources << /Font << /F1 ${fontObjId} 0 R >> >> /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R >>`;
      const streamLines = ['BT'];
      pageCmds.forEach(c=>{
        streamLines.push(`/F1 ${c.size} Tf`);
        streamLines.push(`1 0 0 1 ${(c.x !== undefined ? c.x : MARGIN_X).toFixed(2)} ${c.y.toFixed(2)} Tm`);
        streamLines.push(`(${pdfSanitizeText(c.text)}) Tj`);
      });
      streamLines.push('ET');
      objects[contentId] = { isStream:true, data: streamLines.join('\n') };
    });

    let out = '%PDF-1.4\n';
    const offsets = [0];
    const totalObjs = objId;
    for(let n = 1; n < totalObjs; n++){
      offsets[n] = out.length;
      const obj = objects[n];
      if(obj === undefined) continue;
      if(typeof obj === 'string'){
        out += `${n} 0 obj\n${obj}\nendobj\n`;
      }else if(obj.isStream){
        out += `${n} 0 obj\n<< /Length ${obj.data.length} >>\nstream\n${obj.data}\nendstream\nendobj\n`;
      }
    }
    const xrefStart = out.length;
    out += `xref\n0 ${totalObjs}\n0000000000 65535 f \n`;
    for(let n = 1; n < totalObjs; n++){
      const off = offsets[n] !== undefined ? offsets[n] : 0;
      out += `${String(off).padStart(10,'0')} 00000 n \n`;
    }
    out += `trailer\n<< /Size ${totalObjs} /Root ${catalogObjId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return out;
  }

  // ---------- Salvataggio file: finestra "Salva con nome" dove disponibile ----------
  const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  async function saveFileSmart(blob, filename, mimeType, extension, description){
    // Su cellulare (Android/iOS) prova prima il foglio di condivisione nativo: tra le sue
    // opzioni ci sono già "Salva su Drive"/"File" ecc., a seconda delle app installate.
    // La finestra "Salva con nome" (sotto) su Android è più recente e ha ancora dei difetti
    // noti (a volte non permette di creare un file nuovo, solo sovrascriverne uno esistente).
    if(isMobileDevice && navigator.canShare){
      try{
        const file = new File([blob], filename, { type: blob.type });
        if(navigator.canShare({ files: [file] })){
          await navigator.share({ files: [file] });
          return true;
        }
      }catch(err){
        if(err && err.name === 'AbortError') return false; // l'utente ha chiuso il foglio di condivisione
        // altro errore (es. tipo di file non condivisibile): prosegue con i metodi qui sotto
      }
    }
    if(window.showSaveFilePicker){
      try{
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description, accept: { [mimeType]: [extension] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      }catch(err){
        if(err && err.name === 'AbortError') return false; // l'utente ha annullato la finestra di salvataggio
        // altro errore: prosegue con il metodo di riserva qui sotto
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  function downloadPdf(pdfString, filename){
    const bytes = new Uint8Array(pdfString.length);
    for(let i=0;i<pdfString.length;i++){ bytes[i] = pdfString.charCodeAt(i) & 0xFF; }
    const blob = new Blob([bytes], {type:'application/pdf'});
    saveFileSmart(blob, filename, 'application/pdf', '.pdf', 'File PDF');
  }

  document.getElementById('export-week-pdf-btn').addEventListener('click', ()=>{
    const { days, shoppingItems } = computeWeekPlanData();
    const sections = [{ heading: `Per ${planServings} persone`, lines: [] }];
    days.forEach(({day, entries})=>{
      const lines = entries.length
        ? entries.map(e => `${e.time ? e.time + ' — ' : ''}${e.mealType}: ${e.name}`)
        : ['Nessuna ricetta'];
      sections.push({ heading: day, lines });
    });
    sections.push({
      heading: 'Lista della spesa',
      lines: shoppingItems.length ? shoppingItems.map(i => `- ${shoppingItemLine(i)}`) : ['Nessuna ricetta pianificata']
    });
    const pdfStr = buildPdfFromSections('Pianificazione settimanale', sections);
    downloadPdf(pdfStr, `pianificazione-settimanale-${new Date().toISOString().slice(0,10)}.pdf`);
  });

  // ---------- Export / Import backup ----------
  document.getElementById('export-btn').addEventListener('click', async ()=>{
    const data = JSON.stringify({ recipes, weekPlan, mealTypes, dispensaItems, shoppingExtraItems, weekNotes }, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const saved = await saveFileSmart(blob, `ricettario-backup-${new Date().toISOString().slice(0,10)}.json`, 'application/json', '.json', 'Backup JSON');
    if(!saved) return;
    safeStorageSet(LAST_BACKUP_KEY, new Date().toISOString());
    updateBackupReminder();
  });

  const importBtn = document.getElementById('import-btn');
  const importFileInput = document.getElementById('import-file-input');
  importBtn.addEventListener('click', ()=> importFileInput.click());
  importFileInput.addEventListener('change', ()=>{
    const file = importFileInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      try{
        const parsed = JSON.parse(e.target.result);
        const incoming = Array.isArray(parsed) ? parsed : (parsed.recipes || []);
        if(!Array.isArray(incoming)) throw new Error('Formato non valido');
        const incomingDispensa = Array.isArray(parsed.dispensaItems) ? parsed.dispensaItems : [];

        const existingRecipeIds = new Set(recipes.map(r=>r.id));
        const existingDispensaIds = new Set(dispensaItems.map(i=>i.id));
        const matchingRecipes = incoming.filter(r => r && existingRecipeIds.has(r.id));
        const matchingDispensa = incomingDispensa.filter(i => i && existingDispensaIds.has(i.id));

        // Se il backup contiene voci già presenti (stesso ID) chiede UNA volta se sostituirle con
        // la versione importata — utile per portare su un dispositivo le modifiche fatte su un
        // altro — oppure lasciarle come sono e aggiungere solo le novità.
        let overwrite = false;
        if(matchingRecipes.length || matchingDispensa.length){
          overwrite = confirm(`Il backup contiene ${matchingRecipes.length + matchingDispensa.length} vo${matchingRecipes.length + matchingDispensa.length === 1 ? 'ce' : 'ci'} già presente${matchingRecipes.length + matchingDispensa.length === 1 ? '' : 'i'} (stesso ID): ${matchingRecipes.length} ricett${plural(matchingRecipes.length,'a','e')} e ${matchingDispensa.length} prodott${plural(matchingDispensa.length,'o','i')} in Dispensa.\n\nVuoi sostituirle con la versione dal backup? (Annulla per lasciarle come sono e aggiungere solo le novità)`);
        }

        let addedRecipes = 0, updatedRecipes = 0;
        incoming.forEach(r=>{
          if(!r) return;
          if(existingRecipeIds.has(r.id)){
            if(overwrite){
              const i = recipes.findIndex(x=>x.id===r.id);
              if(i > -1){ recipes[i] = migrateRecipe(r); updatedRecipes++; }
            }
          }else{
            recipes.push(migrateRecipe(r)); addedRecipes++;
          }
        });

        if(Array.isArray(parsed.mealTypes)){
          parsed.mealTypes.forEach(mt=>{ if(mt && !mealTypes.includes(mt)) mealTypes.push(mt); });
          saveMealTypes();
        }
        if(parsed.weekPlan){ weekPlan = {...weekPlan, ...parsed.weekPlan}; migrateWeekPlan(); saveWeek(); }

        let addedDispensa = 0, updatedDispensa = 0;
        incomingDispensa.forEach(i=>{
          if(!i) return;
          if(existingDispensaIds.has(i.id)){
            if(overwrite){
              const idx = dispensaItems.findIndex(x=>x.id===i.id);
              if(idx > -1){ dispensaItems[idx] = i; updatedDispensa++; }
            }
          }else{
            dispensaItems.push(i); addedDispensa++;
          }
        });
        if(incomingDispensa.length) saveDispensaItems();

        if(Array.isArray(parsed.shoppingExtraItems)){
          const existingExtraIds = new Set(shoppingExtraItems.map(i=>i.id));
          parsed.shoppingExtraItems.forEach(i=>{ if(i && !existingExtraIds.has(i.id)) shoppingExtraItems.push(i); });
          saveShoppingExtra();
        }
        if(parsed.weekNotes && typeof parsed.weekNotes === 'object'){
          Object.keys(parsed.weekNotes).forEach(day=>{
            if(!weekNotes[day]) weekNotes[day] = {};
            Object.assign(weekNotes[day], parsed.weekNotes[day]);
          });
          saveWeekNotes();
        }
        saveRecipes(); renderList(); renderPlanningDays(); renderDispensaList();

        let msg = `Ricette: ${addedRecipes} ${plural(addedRecipes,'aggiunta','aggiunte')}, ${updatedRecipes} ${plural(updatedRecipes,'aggiornata','aggiornate')}`;
        if(matchingRecipes.length && !overwrite) msg += `, ${matchingRecipes.length} già ${plural(matchingRecipes.length,'presente','presenti')} (non modificat${plural(matchingRecipes.length,'a','e')})`;
        msg += '.';
        if(incomingDispensa.length){
          msg += `\nDispensa: ${addedDispensa} ${plural(addedDispensa,'aggiunto','aggiunti')}, ${updatedDispensa} ${plural(updatedDispensa,'aggiornato','aggiornati')}`;
          if(matchingDispensa.length && !overwrite) msg += `, ${matchingDispensa.length} già ${plural(matchingDispensa.length,'presente','presenti')} (non modificat${plural(matchingDispensa.length,'o','i')})`;
          msg += '.';
        }
        alert(msg);
      }catch(err){
        alert('File non valido. Assicurati di selezionare un backup esportato da questo ricettario.');
      }
      importFileInput.value = '';
    };
    reader.readAsText(file);
  });

  // ---------- Export / Import CSV ----------
  function csvEscape(val){
    const s = (val === null || val === undefined) ? '' : String(val);
    if(/[",\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
    return s;
  }
  function toCsvRow(fields){ return fields.map(csvEscape).join(','); }

  function parseCsv(text){
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for(let i=0;i<text.length;i++){
      const c = text[i];
      if(inQuotes){
        if(c === '"'){
          if(text[i+1] === '"'){ field += '"'; i++; }
          else inQuotes = false;
        }else{ field += c; }
      }else{
        if(c === '"'){ inQuotes = true; }
        else if(c === ','){ row.push(field); field = ''; }
        else if(c === '\n'){ row.push(field); rows.push(row); row = []; field = ''; }
        else if(c === '\r'){ /* ignorato, gestito da \n */ }
        else{ field += c; }
      }
    }
    if(field.length || row.length){ row.push(field); rows.push(row); }
    return rows;
  }

  function ingredientToCsvText(i){
    return [i.qty, i.unit, i.name].filter(v => v !== '' && v !== undefined && v !== null).join(' ').trim();
  }
  function stepToCsvText(s){
    const parts = [];
    if(s.time) parts.push(`${s.time} min`);
    if(s.vel) parts.push(`vel ${s.vel}`);
    if(s.temp) parts.push(`${s.temp}°C`);
    if(s.mode && s.mode !== 'Normale') parts.push(s.mode);
    return parts.length ? `${s.text} (${parts.join(', ')})` : s.text;
  }
  function csvStepTextToStep(raw){
    const m = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(raw.trim());
    let text = raw.trim(), timeVal = '', velVal = '', tempVal = '', modeVal = 'Normale';
    if(m){
      text = m[1].trim();
      const inner = m[2];
      const timeMatch = /([\d.,]+)\s*min/i.exec(inner);
      if(timeMatch) timeVal = timeMatch[1].replace(',','.');
      const velMatch = /vel\.?\s*([\d.,]+)/i.exec(inner);
      if(velMatch) velVal = velMatch[1].replace(',','.');
      const tempMatch = /([\d.,]+)\s*°?C/i.exec(inner);
      if(tempMatch) tempVal = tempMatch[1].replace(',','.');
      const modeMatch = /(Reverse|Turbo|Vapore|Normale)/i.exec(inner);
      if(modeMatch) modeVal = modeMatch[1][0].toUpperCase() + modeMatch[1].slice(1).toLowerCase();
    }
    return {text, vel:velVal, temp:tempVal, time:timeVal, mode:modeVal};
  }

  document.getElementById('export-csv-btn').addEventListener('click', ()=>{
    const header = ['Nome','Categoria','Porzioni','Tempo (min)','Tag','Allergeni','Ingredienti','Passaggi','Note'];
    const rows = [header];
    recipes.forEach(r=>{
      rows.push([
        r.name, r.category, r.servings, r.time,
        (r.tags || []).join(', '),
        (r.allergens || []).join(', '),
        r.ingredients.map(ingredientToCsvText).join(' | '),
        r.steps.map(stepToCsvText).join(' | '),
        r.notes || ''
      ]);
    });
    const csvContent = rows.map(toCsvRow).join('\r\n');
    const blob = new Blob(['\ufeff' + csvContent], {type:'text/csv;charset=utf-8;'});
    saveFileSmart(blob, `ricette-${new Date().toISOString().slice(0,10)}.csv`, 'text/csv', '.csv', 'File CSV');
  });

  const importCsvBtn = document.getElementById('import-csv-btn');
  const importCsvFileInput = document.getElementById('import-csv-file-input');
  importCsvBtn.addEventListener('click', ()=> importCsvFileInput.click());
  importCsvFileInput.addEventListener('change', ()=>{
    const file = importCsvFileInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      try{
        let text = e.target.result;
        if(text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
        const allRows = parseCsv(text).filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''));
        if(allRows.length < 2){ alert('Il file CSV sembra vuoto.'); importCsvFileInput.value = ''; return; }

        const header = allRows[0].map(h => h.trim().toLowerCase());
        const idx = {
          name: header.indexOf('nome'),
          category: header.indexOf('categoria'),
          servings: header.indexOf('porzioni'),
          time: header.findIndex(h => h.startsWith('tempo')),
          tags: header.indexOf('tag'),
          allergens: header.indexOf('allergeni'),
          ingredients: header.indexOf('ingredienti'),
          steps: header.indexOf('passaggi'),
          notes: header.indexOf('note')
        };
        if(idx.name < 0 || idx.ingredients < 0 || idx.steps < 0){
          alert('Il file CSV non ha le colonne attese (Nome, Ingredienti, Passaggi…). Usa "Esporta CSV" come riferimento per il formato.');
          importCsvFileInput.value = '';
          return;
        }

        const validCategories = Object.keys(CATEGORY_COLORS);
        const rows = allRows.slice(1).filter(row => (row[idx.name] || '').trim());
        const matchingRows = rows.filter(row => recipes.some(r => r.name.trim().toLowerCase() === (row[idx.name]||'').trim().toLowerCase()));

        // Se il CSV contiene ricette con un nome già presente chiede UNA volta se sostituirle con
        // la versione importata, oppure lasciarle come sono e importare solo le altre.
        let overwrite = false;
        if(matchingRows.length){
          overwrite = confirm(`Il file CSV contiene ${matchingRows.length} ricett${plural(matchingRows.length,'a','e')} con un nome già presente.\n\nVuoi sostituirle con la versione dal CSV? (Annulla per lasciarle come sono e importare solo le altre)`);
        }

        let added = 0, updated = 0, skipped = 0;

        rows.forEach(row=>{
          const name = (row[idx.name] || '').trim();
          const key = name.toLowerCase();
          const existing = recipes.find(r => r.name.trim().toLowerCase() === key);

          const ingredients = (idx.ingredients > -1 ? (row[idx.ingredients] || '') : '')
            .split('|').map(s=>s.trim()).filter(Boolean).map(line=>{
              const s = splitIngredientLine(line);
              return { name: s.name, qty: parseFloat(s.qty) || '', unit: s.unit };
            });
          const steps = (idx.steps > -1 ? (row[idx.steps] || '') : '')
            .split('|').map(s=>s.trim()).filter(Boolean).map(csvStepTextToStep);
          const tags = idx.tags > -1 ? (row[idx.tags] || '').split(',').map(s=>s.trim()).filter(Boolean) : [];
          const allergens = idx.allergens > -1 ? (row[idx.allergens] || '').split(',').map(s=>s.trim()).filter(Boolean) : [];
          const catRaw = idx.category > -1 ? (row[idx.category] || '').trim() : '';
          const category = validCategories.includes(catRaw) ? catRaw : 'Altro';
          const servings = idx.servings > -1 ? (parseInt(row[idx.servings],10) || 4) : 4;
          const time = idx.time > -1 ? (parseInt(row[idx.time],10) || 0) : 0;
          const notes = idx.notes > -1 ? (row[idx.notes] || '').trim() : '';

          if(existing){
            if(!overwrite){ skipped++; return; }
            // Il CSV non porta foto/preferita/cronologia: quelle del ricettario restano invariate.
            existing.category = category; existing.servings = servings; existing.time = time;
            existing.ingredients = ingredients.length ? ingredients : [{name:'',qty:'',unit:''}];
            existing.steps = steps.length ? steps : [{text:'',vel:'',temp:'',time:'',mode:'Normale'}];
            existing.tags = tags; existing.allergens = allergens; existing.notes = notes;
            updated++;
            return;
          }

          recipes.push(migrateRecipe({
            id: cryptoId(), name, category, servings, time,
            ingredients: ingredients.length ? ingredients : [{name:'',qty:'',unit:''}],
            steps: steps.length ? steps : [{text:'',vel:'',temp:'',time:'',mode:'Normale'}],
            tags, allergens, notes
          }));
          added++;
        });

        saveRecipes(); renderList(); renderPlanningDays();
        let msg = `Ricette: ${added} ${plural(added,'aggiunta','aggiunte')}, ${updated} ${plural(updated,'aggiornata','aggiornate')}`;
        if(skipped) msg += `, ${skipped} già ${plural(skipped,'presente','presenti')} (non modificat${plural(skipped,'a','e')})`;
        msg += '.';
        alert(msg);
      }catch(err){
        alert('Non sono riuscito a leggere questo file CSV. Controlla che il formato sia corretto.');
      }
      importCsvFileInput.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  });

  // ---------- Importa ricetta da testo (schema.org/JSON-LD + riconoscimento libero) ----------
  const pasteImportOverlay = document.getElementById('paste-import-overlay');
  const pasteImportText = document.getElementById('paste-import-text');

  function iso8601DurationToMinutes(s){
    if(!s || typeof s !== 'string') return '';
    const m = /^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(s.trim());
    if(!m) return '';
    const h = parseInt(m[1]||0,10), mi = parseInt(m[2]||0,10);
    const total = h*60+mi;
    return total || '';
  }

  function flattenInstructions(instr){
    if(!instr) return [];
    if(typeof instr === 'string') return instr.split(/\r?\n+/).map(s=>s.trim()).filter(Boolean);
    if(Array.isArray(instr)){
      let out = [];
      instr.forEach(item=>{
        if(typeof item === 'string') out.push(item.trim());
        else if(item && typeof item === 'object'){
          if(item.itemListElement) out = out.concat(flattenInstructions(item.itemListElement));
          else if(item.text) out.push(String(item.text).trim());
          else if(item.name) out.push(String(item.name).trim());
        }
      });
      return out.filter(Boolean);
    }
    return [];
  }

  function guessCategoryFromText(text){
    const t = normalize(text||'');
    if(/dolce|dessert|torta|biscott|crostata/.test(t)) return 'Dolci';
    if(/tisana|infuso|infusione|\bte\b|the\b|camomilla|karkade|tisane/.test(t)) return 'Infusi & Tisane';
    if(/zuppa|minestr|vellutat|crema di/.test(t)) return 'Zuppe & Vellutate';
    if(/pane|impasto|pizza|focaccia|lievit/.test(t)) return 'Impasti & Pane';
    if(/sugo|salsa|condiment/.test(t)) return 'Salse & Sughi';
    if(/risotto|pasta|gnocchi|primi/.test(t)) return 'Primi';
    if(/pollo|manzo|agnello|pesce|carne|secondi/.test(t)) return 'Secondi';
    return 'Altro';
  }

  function splitIngredientLine(line){
    line = line.replace(/^[-•*]\s*/, '').trim();
    // Nota: le unità sono elencate per forma esatta (singolare/plurale), non con scorciatoie
    // tipo "cucchiai?" — quelle scorciatoie intercettavano solo un prefisso di parole come
    // "cucchiaino"/"cucchiaio"/"tazza"/"spicchio", lasciando la lettera avanzata incollata al
    // nome (es. "cucchiaio di vaniglia" diventava nome "o di vaniglia"). Le forme che sono
    // prefisso di un'altra (es. "cucchiai" dentro "cucchiaio"/"cucchiaino"/"cucchiaini") vanno
    // elencate DOPO quelle più lunghe, altrimenti l'alternanza regex si ferma alla più corta.
    const UNIT = 'g|kg|ml|l|cl|cucchiaini|cucchiaino|cucchiaio|cucchiai|tazze|tazza|pizzichi|pizzico|spicchio|spicchi|fette|fetta|foglie|foglia|rametti|rametto|filetti|filetto';
    const m = new RegExp(`^([\\d]+(?:[.,]\\d+)?(?:\\s*\\/\\s*\\d+)?)\\s*(${UNIT})?\\s*(?:di\\s+)?(.+)$`, 'i').exec(line);
    if(m) return { qty: m[1].replace(',', '.'), unit: (m[2]||'').trim(), name: m[3].trim() };
    return { qty:'', unit:'', name: line };
  }
  // Converte una quantità testuale (anche frazionaria, es. "1/2") in numero decimale.
  // parseFloat() da solo si ferma al carattere "/" e restituirebbe 1 invece di 0.5.
  function parseQtyValue(str){
    if(str === undefined || str === null || str === '') return '';
    const frac = /^(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)$/.exec(String(str).trim());
    if(frac){
      const n = parseFloat(frac[1].replace(',', '.'));
      const d = parseFloat(frac[2].replace(',', '.'));
      return d ? Math.round((n / d) * 1000) / 1000 : '';
    }
    const n = parseFloat(str);
    return isNaN(n) ? '' : n;
  }

  function extractJsonLdRecipe(raw){
    const blocks = [];
    const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while((m = scriptRe.exec(raw)) !== null){ blocks.push(m[1]); }
    if(blocks.length === 0) blocks.push(raw); // magari l'utente ha incollato solo il JSON

    for(const block of blocks){
      try{
        const data = JSON.parse(block);
        const candidates = Array.isArray(data) ? data : (data['@graph'] || [data]);
        for(const c of candidates){
          const type = c && c['@type'];
          if(type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) return c;
        }
      }catch(e){ /* non era JSON valido, si prova il prossimo blocco */ }
    }
    return null;
  }

  function jsonLdToDraft(c){
    const ingredients = (c.recipeIngredient || c.ingredients || []).map(line=>{
      const s = splitIngredientLine(String(line));
      return { name: s.name, qty: parseFloat(s.qty)||'', unit: s.unit };
    });
    const stepsTexts = flattenInstructions(c.recipeInstructions);
    const steps = stepsTexts.map(t=>({text:t, vel:'', temp:'', time:'', mode:'Normale'}));
    const totalMin = iso8601DurationToMinutes(c.totalTime) || iso8601DurationToMinutes(c.cookTime) || iso8601DurationToMinutes(c.prepTime) || '';
    let servings = 4;
    if(c.recipeYield){
      const yStr = Array.isArray(c.recipeYield) ? c.recipeYield.join(' ') : String(c.recipeYield);
      const ym = /(\d+)/.exec(yStr);
      if(ym) servings = parseInt(ym[1],10);
    }
    return {
      name: c.name || 'Ricetta importata',
      category: guessCategoryFromText((c.recipeCategory||'') + ' ' + (c.name||'')),
      servings, time: totalMin,
      ingredients: ingredients.length ? ingredients : [{name:'',qty:'',unit:''}],
      steps: steps.length ? steps : [{text:'',vel:'',temp:'',time:'',mode:'Normale'}],
      notes: 'Importata automaticamente dai dati strutturati della pagina — controlla quantità, categoria e passaggi prima di salvare.'
    };
  }

  function heuristicTextToDraft(raw){
    const lines = raw.split(/\r?\n/).map(l=>l.trim());
    const nonEmpty = lines.filter(Boolean);
    const name = nonEmpty.length ? nonEmpty[0].replace(/^#+\s*/,'') : 'Ricetta importata';

    const ingHeaderIdx = lines.findIndex(l=>/^ingredienti\b/i.test(l));
    const stepHeaderIdx = lines.findIndex((l,i)=> (ingHeaderIdx<0 || i>ingHeaderIdx) && /^(preparazione|procedimento|istruzioni|passaggi|metodo|come si fa)\b/i.test(l));

    let ingredientLines = [], stepLines = [];
    if(ingHeaderIdx > -1){
      const end = stepHeaderIdx > -1 ? stepHeaderIdx : lines.length;
      ingredientLines = lines.slice(ingHeaderIdx+1, end).filter(Boolean);
    }
    if(stepHeaderIdx > -1){
      stepLines = lines.slice(stepHeaderIdx+1).filter(Boolean);
    }
    if(ingredientLines.length===0 && stepLines.length===0){
      stepLines = nonEmpty.slice(1); // ultima spiaggia: tutto dopo il titolo diventa passaggi
    }

    const ingredients = ingredientLines.map(l=>{
      const s = splitIngredientLine(l);
      return {name:s.name, qty: parseFloat(s.qty)||'', unit:s.unit};
    });
    const steps = stepLines
      .map(l=> l.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•*]\s*/,'').trim())
      .filter(Boolean)
      .map(t=>({text:t, vel:'', temp:'', time:'', mode:'Normale'}));

    return {
      name, category: guessCategoryFromText(name), servings: 4, time:'',
      ingredients: ingredients.length ? ingredients : [{name:'',qty:'',unit:''}],
      steps: steps.length ? steps : [{text:'',vel:'',temp:'',time:'',mode:'Normale'}],
      notes: 'Importata automaticamente da testo libero — controlla con attenzione tutti i campi prima di salvare.'
    };
  }

  function parseImportedText(raw){
    const ld = extractJsonLdRecipe(raw);
    return ld ? jsonLdToDraft(ld) : heuristicTextToDraft(raw);
  }

  document.getElementById('paste-import-btn').addEventListener('click', ()=>{
    pasteImportText.value = '';
    pasteImportOverlay.classList.add('active');
  });
  document.getElementById('paste-import-close').addEventListener('click', ()=> pasteImportOverlay.classList.remove('active'));
  document.getElementById('paste-import-cancel').addEventListener('click', ()=> pasteImportOverlay.classList.remove('active'));
  document.getElementById('paste-import-analyze').addEventListener('click', ()=>{
    const raw = pasteImportText.value;
    if(!raw || !raw.trim()){ alert('Incolla prima il testo o il sorgente della ricetta.'); return; }
    const draft = parseImportedText(raw);
    pasteImportOverlay.classList.remove('active');
    openEdit(null, draft);
    alert('Ho provato a riconoscere la ricetta automaticamente: controlla e correggi tutti i campi (in particolare quantità e categoria) prima di salvare — il riconoscimento non è perfetto.');
  });

  // ---------- Guided cooking mode ----------
  const cookOverlay = document.getElementById('cook-overlay');
  const cookProgress = document.getElementById('cook-progress');
  const cookStepText = document.getElementById('cook-step-text');
  const cookDial = document.getElementById('cook-dial');
  const cookTimerEl = document.getElementById('cook-timer');
  const cookTimerBtn = document.getElementById('cook-timer-btn');
  const cookReleaseRow = document.getElementById('cook-release-row');
  const cookReleaseTimerEl = document.getElementById('cook-release-timer');
  const cookReleaseTimerBtn = document.getElementById('cook-release-timer-btn');
  const cookPrevBtn = document.getElementById('cook-prev-btn');
  const cookNextBtn = document.getElementById('cook-next-btn');

  let cookSteps = [];

  // ---------- Blocco spegnimento schermo durante la modalità cucina ----------
  // Usa la Screen Wake Lock API (supportata dai principali browser Chromium e da Safari
  // recenti, non da tutti i browser meno comuni): se non è disponibile, il sito continua
  // a funzionare normalmente ma mostra un piccolo avviso, invece di fallire in silenzio
  // lasciando credere che lo schermo non si spegnerà.
  let cookWakeLock = null;
  async function requestCookWakeLock(){
    const noteEl = document.getElementById('cook-wakelock-note');
    if(!('wakeLock' in navigator)){
      noteEl.style.display = 'block';
      return;
    }
    try{
      cookWakeLock = await navigator.wakeLock.request('screen');
      noteEl.style.display = 'none';
      cookWakeLock.addEventListener('release', ()=>{ cookWakeLock = null; });
    }catch(err){
      // Può fallire se la scheda non è in primo piano, la batteria è molto scarica, ecc.:
      // non è un errore bloccante, il sito funziona comunque senza il blocco schermo.
      console.warn('Blocco schermo non attivabile:', err);
      noteEl.style.display = 'block';
    }
  }
  function releaseCookWakeLock(){
    if(cookWakeLock){
      cookWakeLock.release().catch(()=>{});
      cookWakeLock = null;
    }
  }
  // Il blocco si rilascia da solo quando la scheda perde il focus (es. cambi app sul
  // telefono): quando si torna sulla pagina, se la modalità cucina è ancora aperta, va
  // richiesto di nuovo.
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState === 'visible' && cookOverlay.classList.contains('active') && !cookWakeLock){
      requestCookWakeLock();
    }
  });

  document.getElementById('cook-mode-btn').addEventListener('click', ()=>{
    cookRecipe = recipes.find(x=>x.id === currentViewId);
    if(!cookRecipe) return;
    cookSteps = cookRecipe.steps || [];
    if(!cookSteps.length){
      alert('Questa ricetta non ha ancora passaggi.');
      return;
    }
    cookStepIndex = 0;
    viewOverlay.classList.remove('active');
    cookOverlay.classList.add('active');
    renderCookStep();
    requestCookWakeLock();
  });
  document.getElementById('cook-exit-btn').addEventListener('click', exitCookMode);

  function exitCookMode(){
    clearInterval(cookTimerInterval);
    cookTimerInterval = null;
    clearInterval(cookReleaseTimerInterval);
    cookReleaseTimerInterval = null;
    cookOverlay.classList.remove('active');
    cookRecipe = null;
    releaseCookWakeLock();
  }

  function renderCookStep(){
    clearInterval(cookTimerInterval); cookTimerInterval = null;
    clearInterval(cookReleaseTimerInterval); cookReleaseTimerInterval = null;
    cookTimerEl.style.display = 'none';
    cookReleaseRow.style.display = 'none';
    cookReleaseTimerEl.textContent = '';
    const s = cookSteps[cookStepIndex];
    cookProgress.textContent = `Passaggio ${cookStepIndex+1} di ${cookSteps.length} — ${cookRecipe.name}`;
    cookStepText.textContent = s.text;
    const hasRobot = s.vel || s.temp || (s.mode && s.mode !== 'Normale');
    const hasPressure = !!(s.pressure || s.minLiquid || s.pressureReleaseMin || (s.pressureRelease && s.pressureRelease !== 'Naturale'));
    const unitLabel = {bar:'Bar', psi:'PSI', kpa:'kPa'}[s.pressureUnit] || 'Bar';
    cookDial.innerHTML = (hasRobot || s.time || hasPressure) ? `
      ${s.vel?`<span>Velocità <b>${escapeHtml(s.vel)}</b></span>`:''}
      ${s.temp?`<span>${escapeHtml(s.temp)}°C</span>`:''}
      ${s.mode && s.mode!=='Normale'?`<span>${escapeHtml(s.mode)}</span>`:''}
      ${s.time?`<span><b>${escapeHtml(s.time)}</b> min</span>`:''}
      ${s.pressure?`<span>🍲 <b>${escapeHtml(s.pressure)}</b> ${unitLabel}</span>`:''}
      ${s.pressureRelease?`<span>Rilascio: ${escapeHtml(s.pressureRelease)}</span>`:''}
      ${s.minLiquid?`<span>Liquido min. <b>${escapeHtml(s.minLiquid)}</b> ml</span>`:''}
    ` : '';
    cookDial.style.display = (hasRobot || s.time || hasPressure) ? 'flex' : 'none';
    cookTimerBtn.style.display = s.time ? 'inline-block' : 'none';
    cookTimerBtn.textContent = 'Avvia timer';
    cookTimerBtn.disabled = false;

    const hasReleaseTimer = hasPressure && s.pressureRelease !== 'Rapido' && !!s.pressureReleaseMin;
    if(hasReleaseTimer){
      cookReleaseRow.style.display = 'flex';
      cookReleaseTimerBtn.textContent = `Avvia timer rilascio (${s.pressureReleaseMin} min)`;
      cookReleaseTimerBtn.disabled = false;
    }

    cookPrevBtn.disabled = cookStepIndex === 0;
    cookNextBtn.textContent = cookStepIndex === cookSteps.length - 1 ? 'Fine ✓' : 'Avanti →';
  }

  cookPrevBtn.addEventListener('click', ()=>{ if(cookStepIndex>0){ cookStepIndex--; renderCookStep(); }});
  cookNextBtn.addEventListener('click', ()=>{
    if(cookStepIndex < cookSteps.length - 1){ cookStepIndex++; renderCookStep(); }
    else{ exitCookMode(); }
  });
  cookTimerBtn.addEventListener('click', ()=>{
    const s = cookSteps[cookStepIndex];
    let remaining = Math.round(parseFloat(s.time) * 60);
    cookTimerEl.style.display = 'block';
    cookTimerBtn.disabled = true;
    cookTimerInterval = setInterval(()=>{
      remaining--;
      const mm = Math.floor(remaining/60).toString().padStart(2,'0');
      const ss = (remaining%60).toString().padStart(2,'0');
      cookTimerEl.textContent = `${mm}:${ss}`;
      if(remaining <= 0){
        clearInterval(cookTimerInterval);
        cookTimerEl.textContent = 'Fatto!';
        cookTimerBtn.disabled = false;
        try{ new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAAAAAA==').play(); }catch(e){}
      }
    }, 1000);
  });
  cookReleaseTimerBtn.addEventListener('click', ()=>{
    const s = cookSteps[cookStepIndex];
    let remaining = Math.round(parseFloat(s.pressureReleaseMin) * 60);
    cookReleaseTimerEl.style.display = 'block';
    cookReleaseTimerBtn.disabled = true;
    cookReleaseTimerInterval = setInterval(()=>{
      remaining--;
      const mm = Math.floor(remaining/60).toString().padStart(2,'0');
      const ss = (remaining%60).toString().padStart(2,'0');
      cookReleaseTimerEl.textContent = `${mm}:${ss}`;
      if(remaining <= 0){
        clearInterval(cookReleaseTimerInterval);
        cookReleaseTimerEl.textContent = 'Fatto!';
        cookReleaseTimerBtn.disabled = false;
        try{ new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAAAAAA==').play(); }catch(e){}
      }
    }, 1000);
  });

  // ---------- Vista: Ricettario / Pianificazione ----------
  function todayDayName(){
    const jsDay = new Date().getDay(); // 0=domenica...6=sabato
    return DAYS[jsDay === 0 ? 6 : jsDay - 1];
  }

  function renderToday(){
    const content = document.getElementById('today-content');
    if(!content) return;

    const day = todayDayName();
    const now = new Date();
    const today = now.toISOString().slice(0,10);
    const soonLimit = addDays(today, 3);
    const entries = (weekPlan[day] || []).slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
    const expiring = dispensaItems
      .filter(it => it.expiry && it.expiry >= today && it.expiry <= soonLimit)
      .sort((a,b)=>a.expiry.localeCompare(b.expiry));
    const expired = dispensaItems.filter(it => it.expiry && it.expiry < today);
    const lowStock = dispensaItems.filter(it => {
      const q = parseFloat(it.qty);
      return it.lowStock && q >= 0 ? q <= parseFloat(it.lowStock) : false;
    });
    const weekEntries = DAYS.flatMap(d=>weekPlan[d] || []);
    const plannedRecipes = weekEntries.map(e=>recipes.find(r=>r.id===e.recipeId)).filter(Boolean);
    const shoppingItems = buildAggregatedShoppingItems(
      plannedRecipes.map(r=>({recipe:r, scale:planServings / (r.servings || 1)}))
    );
    const shoppingCount = shoppingItems.length;
    const nutritionToday = nutrizioneGiorno(day);
    const dateLabel = now.toLocaleDateString('it-IT', {weekday:'long', day:'numeric', month:'long'});
    const greeting = now.getHours() < 12 ? 'Buongiorno!' : now.getHours() < 18 ? 'Buon pomeriggio!' : 'Buonasera!';

    const mealIcons = { 'Colazione':'☕', 'Pranzo':'🍝', 'Spuntino':'🍎', 'Cena':'🌙' };
    const mealColors = { 'Colazione':'morning', 'Pranzo':'lunch', 'Spuntino':'snack', 'Cena':'dinner' };

    const mealsHtml = entries.length ? entries.map(e=>{
      const recipe = e.recipeId ? recipes.find(r=>r.id===e.recipeId) : null;
      const name = planEntryName(e);
      const match = recipe ? computeMatch(recipe, dispensaItems.map(x=>normalize(x.name)), planServings) : null;
      const ready = match ? match.missing.length === 0 : true;
      const photo = recipe && recipe.photo ? `<img src="${escapeAttr(recipe.photo)}" alt="${escapeAttr(recipe.name)}">` : `<div class="today-meal-placeholder">${mealIcons[e.mealType] || '🍽️'}</div>`;
      const status = recipe
        ? (ready ? '<span class="today-status ready">✓ Ingredienti disponibili</span>' : `<span class="today-status missing">⚠ Mancano ${match.missing.length} ingredienti</span>`)
        : '<span class="today-status neutral">Pasto personalizzato</span>';
      return `<article class="today-meal-card ${mealColors[e.mealType] || 'dinner'}">
        <div class="today-meal-top"><span>${mealIcons[e.mealType] || '🍽️'} ${escapeHtml(e.mealType || 'Pasto')}</span><time>${escapeHtml(e.time || '—')}</time></div>
        <div class="today-meal-image">${photo}</div>
        <div class="today-meal-body"><h3>${escapeHtml(name)}</h3>${status}</div>
        <div class="today-card-actions">
          ${recipe ? `<button type="button" class="btn-primary today-open-recipe" data-recipe-id="${escapeAttr(recipe.id)}">${ready ? 'Cucina ora' : 'Vedi dettagli'} →</button>` : '<button type="button" class="btn-ghost today-meals-btn">Apri pianificazione</button>'}
        </div>
      </article>`;
    }).join('') : `<div class="today-empty-state"><div class="today-empty-icon">📅</div><div><strong>Nessun pasto pianificato per oggi</strong><p>Organizza la giornata dalla pianificazione oppure scegli una ricetta dalla dispensa.</p></div><button type="button" class="btn-primary today-plan-btn">Organizza la giornata →</button></div>`;

    const expiryHtml = expiring.length ? expiring.slice(0,5).map(it=>{
      const diff = Math.ceil((new Date(it.expiry+'T00:00:00') - new Date(today+'T00:00:00')) / 86400000);
      const label = diff === 0 ? 'Scade oggi' : diff === 1 ? 'Scade domani' : `Scade tra ${diff} giorni`;
      const statusClass = diff <= 1 ? 'urgent' : diff <= 3 ? 'soon' : 'ok';
      return `<li><span class="today-pantry-icon">${escapeHtml(pantryIcon(it.category))}</span><span class="today-pantry-name"><b>${escapeHtml(it.name)}</b><small>${escapeHtml(label)}</small></span><span class="today-pill ${statusClass}">${diff <= 1 ? 'In scadenza' : 'Da consumare'}</span></li>`;
    }).join('') : `<li class="today-no-items"><span>✓</span><span>Nessun prodotto in scadenza nei prossimi 3 giorni.</span></li>`;

    const pantryTotal = dispensaItems.length;
    const pantryGood = Math.max(0, pantryTotal - expiring.length - expired.length - lowStock.length);
    const pantryPriority = [...expiring].sort((a,b)=>String(a.expiry||'').localeCompare(String(b.expiry||''))).slice(0,4);
    const pantryQuickHtml = pantryPriority.length ? pantryPriority.map(it=>{
      const diff = Math.ceil((new Date(it.expiry+'T00:00:00') - new Date(today+'T00:00:00')) / 86400000);
      const label = diff <= 0 ? 'Scade oggi' : diff === 1 ? 'Scade domani' : `Tra ${diff} giorni`;
      return `<button type="button" class="today-pantry-priority" data-pantry-item="${escapeAttr(it.id)}"><span class="today-pantry-priority-icon">${escapeHtml(pantryIcon(it.category))}</span><span><b>${escapeHtml(it.name)}</b><small>${escapeHtml(label)}</small></span></button>`;
    }).join('') : '<div class="today-pantry-empty">✓ Nessun prodotto urgente</div>';

    const pantryNames = dispensaItems.map(x=>normalize(x.name));
    // Motore di suggerimento della dashboard: privilegia prima gli ingredienti realmente
    // disponibili, poi quelli prossimi alla scadenza e infine le ricette con pochi mancanti.
    const suggested = recipes.map(r=>{
      const m = computeMatch(r, pantryNames, planServings);
      const ingredients = (r.ingredients || []).filter(i => i && i.name);
      const total = Math.max(1, ingredients.length);
      const missingSet = new Set(m.missing.map(normalize));
      let available = 0;
      let expiringUsed = 0;
      let expiredUsed = 0;
      ingredients.forEach(ing=>{
        const product = trovaProdottoDispensaPerIngrediente(ing.name);
        if(!product) return;
        const pn = normalize(product.name);
        if(missingSet.has(normalize(ing.name))) return;
        available++;
        if(product.expiry){
          if(product.expiry < today) expiredUsed++;
          else if(product.expiry <= soonLimit) expiringUsed++;
        }
      });
      const missing = m.missing.length;
      const availability = Math.round((available / total) * 100);
      const missingPenalty = Math.min(40, missing * 12);
      const expiryBonus = Math.min(24, expiringUsed * 12);
      const favoriteBonus = r.favorite ? 4 : 0;
      const quickBonus = Number(r.time) > 0 && Number(r.time) <= 30 ? 2 : 0;
      // Una ricetta che richiede prodotti scaduti non viene proposta come scelta prioritaria.
      const expiredPenalty = expiredUsed * 25;
      const score = Math.max(0, availability + expiryBonus + favoriteBonus + quickBonus - missingPenalty - expiredPenalty);
      const reason = expiringUsed > 0
        ? `Usa ${expiringUsed} prodotto${expiringUsed===1?'':'i'} in scadenza`
        : missing === 0
          ? 'Puoi prepararla con quello che hai'
          : `Mancano ${missing} ingredient${missing===1?'e':'i'}`;
      return {r,m,score,availability,expiringUsed,reason,missing};
    }).filter(x=>!x.r.archived && x.availability > 0)
      .sort((a,b)=>b.score-a.score || b.expiringUsed-a.expiringUsed || a.missing-b.missing || a.r.name.localeCompare(b.r.name))
      .slice(0,4);

    const suggestionsHtml = suggested.length ? suggested.map(({r,score,availability,expiringUsed,reason})=>{
      const photo = r.photo ? `<img src="${escapeAttr(r.photo)}" alt="${escapeAttr(r.name)}">` : `<div class="today-suggestion-placeholder">🍴</div>`;
      const badgeClass = expiringUsed ? 'expiry' : availability >= 100 ? 'full' : availability >= 70 ? 'partial' : 'low';
      return `<article class="today-suggestion-card"><div class="today-suggestion-image">${photo}<button type="button" class="today-favorite" aria-label="Preferita">${r.favorite?'★':'☆'}</button></div><div class="today-suggestion-body"><h3>${escapeHtml(r.name)}</h3><div class="today-meta">⏱ ${escapeHtml(String(r.time || '—'))} min · ${escapeHtml(r.category || 'Ricetta')}</div><span class="today-availability ${badgeClass}">${expiringUsed ? '⚠ ' : ''}${availability}% disponibili</span><small class="today-suggestion-reason">${escapeHtml(reason)}</small><button type="button" class="btn-outline today-open-recipe" data-recipe-id="${escapeAttr(r.id)}">Vedi ricetta →</button></div></article>`;
    }).join('') : '<p class="today-muted">Aggiungi qualche prodotto alla Dispensa per ricevere suggerimenti personalizzati.</p>';

    const nutritionFields = nutritionToday ? [
      ['🔥','Calorie',nutritionToday.kcal,'kcal','today-nutri-kcal'],
      ['💪','Proteine',nutritionToday.proteine,'g','today-nutri-protein'],
      ['🌾','Carboidrati',nutritionToday.carboidrati,'g','today-nutri-carbs'],
      ['🥑','Grassi',nutritionToday.grassi,'g','today-nutri-fat']
    ].filter(x=>x[2] !== null && x[2] !== undefined) : [];
    const nutritionHtml = nutritionFields.length ? nutritionFields.map(([icon,label,val,unit,cls])=>`<div class="today-nutri-card ${cls}"><span>${icon}</span><div><small>${label}</small><strong>${escapeHtml(String(roundNice(val)))} ${unit}</strong></div></div>`).join('') : '<p class="today-muted">I valori nutrizionali compariranno qui quando saranno presenti nella pianificazione di oggi.</p>';

    content.innerHTML = `
      <div class="today-dashboard">
        <header class="today-hero">
          <div class="today-hero-copy"><span class="today-kicker">${escapeHtml(day)}</span><h1>${escapeHtml(greeting)}</h1><p>${escapeHtml(dateLabel.charAt(0).toUpperCase()+dateLabel.slice(1))}</p></div>
          <div class="today-hero-actions"><button type="button" class="btn-primary today-plan-btn">📅 Organizza la settimana</button><button type="button" class="btn-ghost today-cook-btn">🍳 Cosa posso cucinare?</button></div>
        </header>

        <section class="today-section today-main-section">
          <div class="today-section-head"><div><span class="today-section-kicker">PROGRAMMA DI OGGI</span><h2>🍽 I tuoi pasti</h2></div><button type="button" class="today-link today-plan-btn">Vedi settimana →</button></div>
          <div class="today-meals-grid">${mealsHtml}</div>
        </section>

        <div class="today-two-columns">
          <section class="today-section today-alert-section"><div class="today-section-head"><div><span class="today-section-kicker">ATTENZIONE</span><h2>⚠️ Da consumare prima</h2></div><button type="button" class="today-link today-expiry-btn">Vedi Dispensa →</button></div><ul class="today-expiry-list">${expiryHtml}</ul></section>
          <section class="today-section today-action-section"><div class="today-section-head"><div><span class="today-section-kicker">AZIONI RAPIDE</span><h2>✨ Cosa vuoi fare?</h2></div></div><div class="today-action-grid"><button class="today-action-card cook" type="button" id="today-cook-action"><span>👨‍🍳</span><b>Cosa posso cucinare?</b><small>Trova ricette con quello che hai</small></button><button class="today-action-card pantry" type="button" id="today-pantry-action"><span>🥫</span><b>La mia Dispensa</b><small>${pantryTotal} prodotti registrati</small></button><button class="today-action-card shopping" type="button" id="today-shopping-action"><span>🛒</span><b>Lista della spesa</b><small>${shoppingCount ? `${shoppingCount} voci dalla settimana` : 'Nessuna lista da preparare'}</small></button><button class="today-action-card planning" type="button" id="today-planning-action"><span>📅</span><b>Pianificazione</b><small>Organizza i prossimi pasti</small></button></div></section>
        </div>

        <section class="today-section"><div class="today-section-head"><div><span class="today-section-kicker">IN DISPENSA</span><h2>⭐ Ricette consigliate per te</h2></div><button type="button" class="today-link today-recipes-btn">Vedi tutte →</button></div><div class="today-suggestions-grid">${suggestionsHtml}</div></section>

        <div class="today-bottom-grid">
          <section class="today-section"><div class="today-section-head"><div><span class="today-section-kicker">RIEPILOGO</span><h2>🥫 La tua Dispensa</h2></div><div class="today-section-head-actions"><button type="button" class="today-link today-new-pantry-btn">+ Aggiungi</button><button type="button" class="today-link today-expiry-btn">Vedi tutto →</button></div></div><div class="today-pantry-summary"><div class="today-pantry-total"><strong>${pantryTotal}</strong><span>prodotti</span><small>${pantryGood} disponibili</small></div><div class="today-pantry-stats"><span><i class="dot good"></i> Disponibili <b>${pantryGood}</b></span><span><i class="dot warn"></i> In esaurimento <b>${lowStock.length}</b></span><span><i class="dot soon"></i> In scadenza <b>${expiring.length}</b></span><span><i class="dot bad"></i> Scaduti <b>${expired.length}</b></span></div></div><div class="today-pantry-priority-wrap"><div class="today-subhead"><b>Da consumare per primi</b><button type="button" class="today-link today-cook-btn">Trova ricette →</button></div><div class="today-pantry-priority-grid">${pantryQuickHtml}</div></div></section>
          <section class="today-section"><div class="today-section-head"><div><span class="today-section-kicker">OGGI</span><h2>📊 Valori nutrizionali</h2></div><button type="button" class="today-link today-planning-action">Vedi pianificazione →</button></div><div class="today-nutrition-grid">${nutritionHtml}</div></section>
        </div>

        <section class="today-tip"><div class="today-tip-icon">💡</div><div><strong>Un suggerimento per oggi</strong><p>${expiring.length ? `Hai ${expiring.length} prodotto${expiring.length===1?'':'i'} da consumare a breve. Prova a partire da quelli nella sezione “Da consumare prima”.` : pantryTotal ? 'La tua Dispensa è aggiornata. Prova “Cosa posso cucinare?” per trovare una ricetta usando ciò che hai già.' : 'Inizia aggiungendo qualche prodotto alla Dispensa: il Ricettario potrà suggerirti cosa cucinare e aiutarti con la spesa.'}</p></div><button type="button" class="btn-outline today-cook-btn">Vai a “Cosa posso cucinare?” →</button></section>
      </div>`;

    content.querySelectorAll('.today-new-pantry-btn').forEach(btn=>btn.addEventListener('click',()=>document.getElementById('new-dispensa-item-btn')?.click()));
    content.querySelectorAll('.today-pantry-priority').forEach(btn=>btn.addEventListener('click',()=>{ const target=document.querySelector(`[data-id=\"${CSS.escape(btn.dataset.pantryItem)}\"]`); if(target) target.scrollIntoView({behavior:'smooth',block:'center'}); switchView('dispensa'); }));
    content.querySelectorAll('.today-open-recipe').forEach(btn=>btn.addEventListener('click',()=>openView(btn.dataset.recipeId)));
    content.querySelectorAll('.today-plan-btn, .today-planning-action').forEach(btn=>btn.addEventListener('click',()=>switchView('planning')));
    content.querySelectorAll('.today-expiry-btn').forEach(btn=>btn.addEventListener('click',()=>switchView('dispensa')));
    content.querySelectorAll('.today-recipes-btn').forEach(btn=>btn.addEventListener('click',()=>switchView('recipes')));
    content.querySelectorAll('.today-cook-btn, #today-cook-action').forEach(btn=>btn.addEventListener('click',()=>{
      switchView('recipes');
      const search = document.getElementById('pantry-search-btn');
      if(search) search.click();
    }));
    const pantryAction = document.getElementById('today-pantry-action');
    if(pantryAction) pantryAction.addEventListener('click',()=>switchView('dispensa'));
    const shoppingAction = document.getElementById('today-shopping-action');
    if(shoppingAction) shoppingAction.addEventListener('click',()=>document.getElementById('generate-shopping-btn')?.click());
    const planningAction = document.getElementById('today-planning-action');
    if(planningAction) planningAction.addEventListener('click',()=>switchView('planning'));
    content.querySelectorAll('.today-meals-btn').forEach(btn=>btn.addEventListener('click',()=>switchView('planning')));
  }

  // Etichetta breve mostrata nella barra ☰ su schermo piccolo, per vista corrente.
  const NAV_LABELS = {
    today: '☀️ Oggi', recipes: '📖 Ricettario', planning: '📅 Pianificazione',
    dispensa: '🥫 Dispensa', 'crea-alimenti': '🌾 Valori Alimenti CREA',
    'crea-menu': '🇮🇹 Ricette CREA', info: 'ℹ️ Come funziona'
  };
  function switchView(view){
    document.getElementById('today-view').style.display = view === 'today' ? '' : 'none';
    document.getElementById('recipes-view').style.display = view === 'recipes' ? '' : 'none';
    document.getElementById('planning-view').style.display = view === 'planning' ? '' : 'none';
    document.getElementById('dispensa-view').style.display = view === 'dispensa' ? '' : 'none';
    document.getElementById('crea-alimenti-view').style.display = view === 'crea-alimenti' ? '' : 'none';
    document.getElementById('crea-menu-view').style.display = view === 'crea-menu' ? '' : 'none';
    document.getElementById('info-view').style.display = view === 'info' ? '' : 'none';
    document.getElementById('nav-today-btn').classList.toggle('active', view === 'today');
    document.getElementById('nav-recipes-btn').classList.toggle('active', view === 'recipes');
    document.getElementById('nav-planning-btn').classList.toggle('active', view === 'planning');
    document.getElementById('nav-dispensa-btn').classList.toggle('active', view === 'dispensa');
    document.getElementById('nav-crea-alimenti-btn').classList.toggle('active', view === 'crea-alimenti');
    document.getElementById('nav-crea-menu-btn').classList.toggle('active', view === 'crea-menu');
    document.getElementById('nav-info-btn').classList.toggle('active', view === 'info');
    if(view === 'today') renderToday();
    if(view === 'recipes') renderList();
    if(view === 'planning') renderPlanningDays();
    if(view === 'dispensa') renderDispensaList();
    if(view === 'crea-alimenti') apriVistaCreaAlimenti();
    if(view === 'crea-menu') apriVistaCreaMenu();
    const navCurrentLabel = document.getElementById('nav-current-label');
    if(navCurrentLabel) navCurrentLabel.textContent = NAV_LABELS[view] || '';
    closeMobileNav();
  }
  document.getElementById('nav-today-btn').addEventListener('click', ()=> switchView('today'));
  document.getElementById('nav-recipes-btn').addEventListener('click', ()=> switchView('recipes'));
  document.getElementById('nav-planning-btn').addEventListener('click', ()=> switchView('planning'));
  document.getElementById('nav-dispensa-btn').addEventListener('click', ()=> switchView('dispensa'));
  document.getElementById('nav-crea-alimenti-btn').addEventListener('click', ()=> switchView('crea-alimenti'));
  document.getElementById('nav-crea-menu-btn').addEventListener('click', ()=> switchView('crea-menu'));
  document.getElementById('nav-info-btn').addEventListener('click', ()=> switchView('info'));
  // Scorciatoie dirette tra Pianificazione e Dispensa, per non dover passare dal menu di
  // navigazione in alto quando si passa dall'una all'altra mentre si organizza la settimana.
  document.getElementById('planning-goto-dispensa-btn').addEventListener('click', ()=> switchView('dispensa'));
  document.getElementById('dispensa-goto-planning-btn').addEventListener('click', ()=> switchView('planning'));

  // ---------- Menu ☰ di navigazione su schermo piccolo ----------
  // Sotto i 760px la fila di pulsanti vista diventa un menu a tendina aperto/chiuso da
  // questo pulsante, invece di stare sempre visibile occupando spazio verticale.
  const viewNavEl = document.getElementById('view-nav');
  const navHamburgerBtn = document.getElementById('nav-hamburger-btn');
  function closeMobileNav(){
    viewNavEl.classList.remove('open');
    navHamburgerBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleMobileNav(){
    const opening = !viewNavEl.classList.contains('open');
    viewNavEl.classList.toggle('open', opening);
    navHamburgerBtn.setAttribute('aria-expanded', String(opening));
  }
  navHamburgerBtn.addEventListener('click', (e)=>{ e.stopPropagation(); toggleMobileNav(); });
  document.addEventListener('click', (e)=>{
    if(viewNavEl.classList.contains('open') && !viewNavEl.contains(e.target) && e.target !== navHamburgerBtn){
      closeMobileNav();
    }
  });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMobileNav(); });

  // ---------- Pianificazione settimanale ----------
  const planningDaysEl = document.getElementById('planning-days');
  let selectedPlanDay = null;

  // ---------- Finestra di selezione ricetta (per la pianificazione) ----------
  const recipePickerOverlay = document.getElementById('recipe-picker-overlay');
  const recipePickerSearch = document.getElementById('recipe-picker-search');
  const recipePickerList = document.getElementById('recipe-picker-list');
  let pickerTargetDay = null, pickerTargetMealType = null, pickerTargetTime = '';

  function renderRecipePickerList(query){
    const q = query.trim().toLowerCase();
    const matches = recipes.filter(r => !q || r.name.toLowerCase().includes(q) || r.ingredients.some(i => i.name.toLowerCase().includes(q)))
      .sort((a,b) => a.name.localeCompare(b.name));
    recipePickerList.innerHTML = matches.length ? matches.map(r => `
      <div class="recipe-picker-item" data-id="${r.id}">
        <span class="cat-dot" style="background:${CATEGORY_COLORS[r.category] || '#8c6a2f'}"></span>
        <span class="name">${escapeHtml(r.name)}</span>
        <span class="meta">${escapeHtml(r.category)}${r.time ? ` · ${r.time} min` : ''}${recipeHasPressure(r) ? ' · 🍲' : ''}</span>
      </div>
    `).join('') : '<div class="recipe-picker-empty">Nessuna ricetta trovata.</div>';
    recipePickerList.querySelectorAll('.recipe-picker-item').forEach(item=>{
      item.addEventListener('click', ()=>{
        const recipeId = item.dataset.id;
        weekPlan[pickerTargetDay] = weekPlan[pickerTargetDay] || [];
        weekPlan[pickerTargetDay].push({ id: cryptoId(), recipeId, mealType: pickerTargetMealType, time: pickerTargetTime || '' });
        saveWeek();
        recipePickerOverlay.classList.remove('active');
        renderPlanningDays();
        offerAddMissingToShoppingList(recipes.find(r=>r.id === recipeId));
      });
    });
  }

  function openRecipePicker(day, mealType, timeValue){
    pickerTargetDay = day;
    pickerTargetMealType = mealType;
    pickerTargetTime = timeValue || '';
    recipePickerSearch.value = '';
    renderRecipePickerList('');
    recipePickerOverlay.classList.add('active');
    recipePickerSearch.focus();
  }

  recipePickerSearch.addEventListener('input', ()=> renderRecipePickerList(recipePickerSearch.value));
  document.getElementById('recipe-picker-close').addEventListener('click', ()=> recipePickerOverlay.classList.remove('active'));

  // ---------- Finestra di selezione prodotto dispensa (per la pianificazione) ----------
  const dispensaPickerOverlay = document.getElementById('dispensa-picker-overlay');
  const dispensaPickerSearch = document.getElementById('dispensa-picker-search');
  const dispensaPickerList = document.getElementById('dispensa-picker-list');
  const dispensaPickerSearchStep = document.getElementById('dispensa-picker-search-step');
  const dispensaPickerQtyStep = document.getElementById('dispensa-picker-qty-step');
  const dispensaPickerQtyName = document.getElementById('dispensa-picker-qty-name');
  const dispensaPickerQtyInput = document.getElementById('dispensa-picker-qty');
  const dispensaPickerUnitInput = document.getElementById('dispensa-picker-unit');
  let pickerSelectedDispensaItem = null;

  function renderDispensaPickerList(query){
    const q = query.trim().toLowerCase();
    const matches = dispensaItems.filter(it => !q || it.name.toLowerCase().includes(q))
      .sort((a,b) => a.name.localeCompare(b.name));
    dispensaPickerList.innerHTML = matches.length ? matches.map(it => `
      <div class="recipe-picker-item" data-id="${it.id}">
        <span class="cat-dot" style="background:${PANTRY_CATEGORY_COLORS[it.category] || '#8c6a2f'}"></span>
        <span class="name">${escapeHtml(it.name)}</span>
        <span class="meta">${escapeHtml(it.category)}${(it.qty || it.unit) ? ` · ${it.qty ? roundNice(it.qty) : ''} ${escapeHtml(it.unit||'')}` : ''}</span>
      </div>
    `).join('') : '<div class="recipe-picker-empty">Nessun prodotto in dispensa. Aggiungine uno dalla vista "🥫 Dispensa".</div>';
    dispensaPickerList.querySelectorAll('.recipe-picker-item').forEach(item=>{
      item.addEventListener('click', ()=>{
        const it = dispensaItems.find(x=>x.id === item.dataset.id);
        if(!it) return;
        showDispensaPickerQtyStep(it);
      });
    });
  }

  function showDispensaPickerQtyStep(it){
    pickerSelectedDispensaItem = it;
    dispensaPickerQtyName.textContent = it.name;
    dispensaPickerQtyInput.value = it.qty || '';
    dispensaPickerUnitInput.value = it.unit || '';
    dispensaPickerSearchStep.style.display = 'none';
    dispensaPickerQtyStep.style.display = 'block';
    dispensaPickerQtyInput.focus();
  }

  function showDispensaPickerSearchStep(){
    pickerSelectedDispensaItem = null;
    dispensaPickerQtyStep.style.display = 'none';
    dispensaPickerSearchStep.style.display = 'block';
  }

  function openDispensaPicker(day, mealType, timeValue){
    pickerTargetDay = day;
    pickerTargetMealType = mealType;
    pickerTargetTime = timeValue || '';
    dispensaPickerSearch.value = '';
    renderDispensaPickerList('');
    showDispensaPickerSearchStep();
    dispensaPickerOverlay.classList.add('active');
    dispensaPickerSearch.focus();
  }

  dispensaPickerSearch.addEventListener('input', ()=> renderDispensaPickerList(dispensaPickerSearch.value));
  document.getElementById('dispensa-picker-back-btn').addEventListener('click', showDispensaPickerSearchStep);
  document.getElementById('dispensa-picker-confirm-btn').addEventListener('click', ()=>{
    if(!pickerSelectedDispensaItem) return;
    weekPlan[pickerTargetDay] = weekPlan[pickerTargetDay] || [];
    weekPlan[pickerTargetDay].push({
      id: cryptoId(),
      dispensaItemId: pickerSelectedDispensaItem.id,
      mealType: pickerTargetMealType,
      time: pickerTargetTime || '',
      qty: dispensaPickerQtyInput.value,
      unit: dispensaPickerUnitInput.value.trim()
    });
    saveWeek();
    dispensaPickerOverlay.classList.remove('active');
    renderPlanningDays();
  });
  document.getElementById('dispensa-picker-close').addEventListener('click', ()=> dispensaPickerOverlay.classList.remove('active'));

  const planServingsInput = document.getElementById('plan-servings-input');
  planServingsInput.addEventListener('change', ()=>{
    planServings = parseInt(planServingsInput.value, 10) || 4;
    planServingsInput.value = planServings;
    savePlanServings();
    // I totali nutrizionali per pasto/giorno e il conteggio da comprare dipendono da "per quante
    // persone", quindi vanno ricalcolati subito invece di restare fermi al valore precedente.
    renderPlanningDays();
  });

  function renderPlanEntry(e){
    const nameAttr = e.dispensaItemId
      ? `data-dispensa-id="${escapeAttr(e.dispensaItemId)}"`
      : `data-recipe-id="${escapeAttr(e.recipeId)}"`;
    const badge = e.dispensaItemId ? ' <span title="Dalla dispensa" style="font-size:12px;">🥫</span>' : '';
    const name = escapeHtml(planEntryName(e)) + badge;
    const consumeControl = e.consumed
      ? `<span class="plan-entry-consumed" title="Consumato: tolto dalla Dispensa dove possibile">✓</span><button class="icon-btn plan-entry-undo-consume" data-entry-id="${escapeAttr(e.id)}" title="Annulla: ripristina in Dispensa quanto tolto">↺</button>`
      : `<button class="icon-btn plan-entry-consume" data-entry-id="${escapeAttr(e.id)}" title="Segna come consumato e aggiorna la Dispensa">✓</button>`;
    const nutrizione = nutrizionePerEntry(e);
    const nutrizioneHtml = nutrizione ? `<div class="plan-entry-nutrition">${
      NUTRITION_FIELDS
        .filter(f => nutrizione[f.key] !== null && nutrizione[f.key] !== undefined)
        .map(f => `${f.label} ${roundNice(nutrizione[f.key])}${f.unit}`)
        .join(' · ')
    }</div>` : '';
    return `<div class="plan-entry">
      <div class="plan-entry-main">
        ${e.time ? `<span class="plan-entry-time">${escapeHtml(e.time)}</span>` : ''}
        <span class="plan-entry-name" ${nameAttr}>${name}</span>
        ${consumeControl}
        <button class="icon-btn plan-entry-remove" data-entry-id="${escapeAttr(e.id)}" title="Rimuovi">×</button>
      </div>
      ${nutrizioneHtml}
    </div>`;
  }

  // Genera e apre la lista della spesa per le sole ricette pianificate in un giorno specifico
  // (i pasti "dalla dispensa" sono esclusi, dato che non richiedono acquisti).
  function openDayShoppingList(day){
    const dayRecipes = (weekPlan[day] || [])
      .map(e => recipes.find(r => r.id === e.recipeId))
      .filter(Boolean);
    if(dayRecipes.length === 0){
      alert(`Nessuna ricetta pianificata per ${day}.`);
      return;
    }
    const pairs = dayRecipes.map(r => ({ recipe: r, scale: planServings / (r.servings || 1) }));
    const items = buildAggregatedShoppingItems(pairs, false);
    openShoppingListOverlay(items, `Per ${planServings} persone — ${day}: ${dayRecipes.map(r=>r.name).join(', ')}`);
  }

  function openWeekTotalsOverlay(){
    const giorniHtml = DAYS.map(day => {
      const t = nutrizioneGiorno(day);
      return `<div class="week-totals-day">
        <div class="week-totals-day-name">${escapeHtml(day)}</div>
        <div class="week-totals-day-values">${t ? formattaNutrizioneCompatta(t) : '<span style="opacity:.6;font-style:italic;">Nessun dato</span>'}</div>
      </div>`;
    }).join('');
    document.getElementById('week-totals-days').innerHTML = giorniHtml;

    const grand = nutrizioneSettimana();
    const grandEl = document.getElementById('week-totals-grand');
    if(grand){
      const rows = NUTRITION_FIELDS
        .filter(f => grand[f.key] !== null && grand[f.key] !== undefined)
        .map(f => `<div>${f.label}: <b>${roundNice(grand[f.key])}</b>${f.unit}</div>`).join('');
      grandEl.innerHTML = `<h4>Totale settimana</h4><div class="nutrition-grid">${rows}</div>`;
      grandEl.style.display = 'block';
    } else {
      grandEl.innerHTML = '';
      grandEl.style.display = 'none';
    }
    document.getElementById('week-totals-overlay').classList.add('active');
  }
  document.getElementById('week-totals-close').addEventListener('click', () => {
    document.getElementById('week-totals-overlay').classList.remove('active');
  });

  function planningMealIcon(mealType){
    const t = String(mealType || '').toLowerCase();
    if(t.includes('colaz')) return '☕';
    if(t.includes('pranz')) return '🍝';
    if(t.includes('cen')) return '🍽️';
    if(t.includes('spunt')) return '🍎';
    return '🥣';
  }

  function renderPlanningWeekOverview(){
    const grid = document.getElementById('planning-week-overview-grid');
    if(!grid) return;
    const todayIdx = new Date().getDay();
    const todayName = DAYS[todayIdx === 0 ? 6 : todayIdx - 1];
    grid.innerHTML = DAYS.map(day => {
      const entries = (weekPlan[day] || []).slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
      const active = day === selectedPlanDay;
      const isToday = day === todayName;
      const visible = mealTypes.slice(0,4).map(mt => {
        const e = entries.find(x => x.mealType === mt);
        if(!e) return '';
        return `<div class="planning-week-meal"><span class="planning-week-meal-icon">${planningMealIcon(mt)}</span><div class="planning-week-meal-text"><strong>${escapeHtml(mt)}</strong>${escapeHtml(planEntryName(e))}</div></div>`;
      }).filter(Boolean).join('');
      const extra = entries.length > 4 ? `<div class="planning-week-empty">+${entries.length-4} altri</div>` : '';
      const badge = entries.length ? `${entries.length} ${entries.length===1?'pasto':'pasti'}` : 'Da pianificare';
      return `<button type="button" class="planning-week-day ${active?'active':''} ${isToday?'today':''}" data-week-day="${escapeAttr(day)}">
        <div class="planning-week-day-top"><span class="planning-week-day-name">${escapeHtml(day.slice(0,3))}</span><span class="planning-week-day-badge ${entries.length?'':'empty'}">${badge}</span></div>
        ${visible || '<div class="planning-week-empty">Nessun pasto</div>'}${extra}
      </button>`;
    }).join('');
    grid.querySelectorAll('.planning-week-day').forEach(btn=>btn.addEventListener('click',()=>{
      selectedPlanDay = btn.dataset.weekDay;
      renderPlanningDays();
      document.getElementById('planning-days')?.scrollIntoView({behavior:'smooth',block:'start'});
    }));
  }

  function renderPlanningDays(){
    if(!planningDaysEl) return;
    if(!selectedPlanDay){
      const jsDay = new Date().getDay(); // 0=domenica...6=sabato
      selectedPlanDay = DAYS[jsDay === 0 ? 6 : jsDay - 1];
    }

    renderPlanningWeekOverview();

    const dayTabsEl = document.getElementById('plan-day-tabs');
    dayTabsEl.innerHTML = DAYS.map(day =>
      `<button type="button" class="plan-day-tab ${day === selectedPlanDay ? 'active' : ''}" data-day="${escapeAttr(day)}">${escapeHtml(day.slice(0,3))}</button>`
    ).join('');
    dayTabsEl.querySelectorAll('.plan-day-tab').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        selectedPlanDay = btn.dataset.day;
        renderPlanningDays();
      });
    });

    planningDaysEl.innerHTML = '';
    const day = selectedPlanDay;
    const dayEntries = weekPlan[day] || [];
    const card = document.createElement('div');
    card.className = 'plan-day-card';

    const blocksHtml = mealTypes.map(mt=>{
      const entries = dayEntries.filter(e=>e.mealType === mt)
        .slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
      const entriesHtml = entries.length ? entries.map(renderPlanEntry).join('') : `<div class="plan-entry-empty">Nessuna ricetta</div>`;
      const totaleMealHtml = entries.length ? (() => {
        const t = nutrizioneMealBlock(day, mt);
        return t ? `<div class="plan-meal-total">Totale ${escapeHtml(mt.toLowerCase())}: ${formattaNutrizioneCompatta(t)}</div>` : '';
      })() : '';
      return `<div class="plan-meal-block" data-day="${escapeAttr(day)}" data-mealtype="${escapeAttr(mt)}">
        <div class="plan-meal-header">
          <span class="plan-meal-name">${escapeHtml(mt)}</span>
          <span class="plan-meal-actions"><button class="icon-btn mealtype-remove-btn" data-mealtype="${escapeAttr(mt)}" title="Rimuovi questa fascia pasto">🗑</button></span>
        </div>
        <div class="plan-entry-list">${entriesHtml}</div>
        ${totaleMealHtml}
        <div class="plan-add-row">
          <input type="time" class="plan-add-time">
          <button class="btn-ghost btn-small plan-add-btn">🔍 Cerca ricetta…</button>
          <button class="btn-ghost btn-small plan-add-dispensa-btn">🥫 Dalla dispensa…</button>
        </div>
        <input type="text" class="plan-note-input" placeholder="Nota (es. cena fuori, avanzi, preparare il giorno prima…)" value="${escapeAttr((weekNotes[day] && weekNotes[day][mt]) || '')}">
      </div>`;
    }).join('');

    const orphaned = dayEntries.filter(e=>!mealTypes.includes(e.mealType));
    const orphanedHtml = orphaned.length ? `<div class="plan-meal-block">
      <div class="plan-meal-header"><span class="plan-meal-name">Altro</span></div>
      <div class="plan-entry-list">${orphaned.map(renderPlanEntry).join('')}</div>
    </div>` : '';

    const totaleGiorno = nutrizioneGiorno(day);
    const totaleGiornoHtml = totaleGiorno
      ? `<div class="plan-day-total">📊 Totale ${escapeHtml(day.toLowerCase())}: ${formattaNutrizioneCompatta(totaleGiorno)}</div>` : '';

    card.innerHTML = `<h3>${escapeHtml(day)}</h3>
      <div style="text-align:center;margin:-6px 0 14px;">
        <button type="button" class="btn-ghost btn-small plan-day-shopping-btn">🛒 Lista della spesa del giorno</button>
        <button type="button" class="btn-ghost btn-small plan-week-totals-btn">📊 Totali settimana</button>
      </div>
      ${totaleGiornoHtml}
      ${blocksHtml}${orphanedHtml || ''}`;
    planningDaysEl.appendChild(card);

    card.querySelectorAll('.plan-note-input').forEach(input=>{
      input.addEventListener('change', ()=>{
        const mt = input.closest('.plan-meal-block').dataset.mealtype;
        const testo = input.value.trim();
        if(!weekNotes[day]) weekNotes[day] = {};
        if(testo) weekNotes[day][mt] = testo;
        else delete weekNotes[day][mt];
        saveWeekNotes();
      });
    });

    const weekTotalsBtn = card.querySelector('.plan-week-totals-btn');
    if(weekTotalsBtn){
      weekTotalsBtn.addEventListener('click', openWeekTotalsOverlay);
    }

    const dayShoppingBtn = card.querySelector('.plan-day-shopping-btn');
    if(dayShoppingBtn){
      dayShoppingBtn.addEventListener('click', ()=> openDayShoppingList(day));
    }

    planningDaysEl.querySelectorAll('.plan-add-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const block = btn.closest('.plan-meal-block');
        const day = block.dataset.day, mealType = block.dataset.mealtype;
        const timeInput = block.querySelector('.plan-add-time');
        openRecipePicker(day, mealType, timeInput.value);
      });
    });
    planningDaysEl.querySelectorAll('.plan-add-dispensa-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const block = btn.closest('.plan-meal-block');
        const day = block.dataset.day, mealType = block.dataset.mealtype;
        const timeInput = block.querySelector('.plan-add-time');
        openDispensaPicker(day, mealType, timeInput.value);
      });
    });
    planningDaysEl.querySelectorAll('.plan-entry-consume').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const entryId = btn.dataset.entryId;
        let entry = null;
        for(const d of DAYS){
          const found = (weekPlan[d] || []).find(e=>e.id === entryId);
          if(found){ entry = found; break; }
        }
        if(!entry) return;
        markPlanEntryConsumed(entry);
      });
    });
    planningDaysEl.querySelectorAll('.plan-entry-undo-consume').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const entryId = btn.dataset.entryId;
        let entry = null;
        for(const d of DAYS){
          const found = (weekPlan[d] || []).find(e=>e.id === entryId);
          if(found){ entry = found; break; }
        }
        if(!entry) return;
        undoPlanEntryConsumed(entry);
      });
    });
    planningDaysEl.querySelectorAll('.plan-entry-remove').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const entryId = btn.dataset.entryId;
        let entry = null;
        for(const d of DAYS){
          const found = (weekPlan[d] || []).find(e=>e.id === entryId);
          if(found){ entry = found; break; }
        }
        const label = entry ? planEntryName(entry) : 'questo pasto';
        const ok = await confirmDialog({
          title: 'Rimuovere dalla pianificazione?',
          message: `"${label}" verrà tolto dalla pianificazione di questa settimana.`,
          confirmText: 'Rimuovi',
          danger: true
        });
        if(!ok) return;
        DAYS.forEach(d=>{ weekPlan[d] = (weekPlan[d]||[]).filter(e=>e.id !== entryId); });
        saveWeek();
        renderPlanningDays();
      });
    });
    planningDaysEl.querySelectorAll('.plan-entry-name').forEach(el=>{
      el.addEventListener('click', ()=>{
        if(el.dataset.dispensaId){
          const it = dispensaItems.find(x=>x.id === el.dataset.dispensaId);
          if(!it) return;
          switchView('dispensa');
          openDispensaEdit(it);
          return;
        }
        const recipeId = el.dataset.recipeId;
        if(!recipes.find(r=>r.id === recipeId)) return;
        switchView('recipes');
        openView(recipeId);
      });
    });
    planningDaysEl.querySelectorAll('.mealtype-remove-btn').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const mt = btn.dataset.mealtype;
        const ok = await confirmDialog({
          title: 'Rimuovere questa fascia pasto?',
          message: `La fascia "${mt}" verrà rimossa. Le ricette già assegnate resteranno visibili sotto "Altro", non vengono eliminate.`,
          confirmText: 'Rimuovi fascia',
          danger: true
        });
        if(!ok) return;
        mealTypes = mealTypes.filter(x=>x!==mt);
        saveMealTypes();
        renderPlanningDays();
      });
    });
    updatePlanningShoppingCount();
  }

  // Mostra accanto a "🛒 Lista della spesa (settimana)" quante voci ci sarebbero già da comprare,
  // così non serve aprire la lista solo per scoprire se c'è qualcosa da segnare: somma gli
  // ingredienti delle ricette pianificate (come farebbe il pulsante) più i promemoria dalla Dispensa.
  function updatePlanningShoppingCount(){
    const badge = document.getElementById('planning-shopping-count');
    if(!badge) return;
    const allEntries = DAYS.flatMap(d => weekPlan[d] || []);
    const plannedRecipes = allEntries.map(e=>recipes.find(r=>r.id===e.recipeId)).filter(Boolean);
    const pairs = plannedRecipes.map(r=>({ recipe: r, scale: planServings / (r.servings || 1) }));
    const count = buildAggregatedShoppingItems(pairs).length;
    if(count > 0){ badge.textContent = ` · ${count}`; badge.style.display = 'inline'; }
    else { badge.textContent = ''; badge.style.display = 'none'; }
  }

  document.getElementById('planning-today-btn')?.addEventListener('click', ()=>{
    const jsDay = new Date().getDay();
    selectedPlanDay = DAYS[jsDay === 0 ? 6 : jsDay - 1];
    renderPlanningDays();
  });

  document.getElementById('plan-day-prev').addEventListener('click', ()=>{
    const idx = DAYS.indexOf(selectedPlanDay);
    selectedPlanDay = DAYS[(idx - 1 + DAYS.length) % DAYS.length];
    renderPlanningDays();
  });
  document.getElementById('plan-day-next').addEventListener('click', ()=>{
    const idx = DAYS.indexOf(selectedPlanDay);
    selectedPlanDay = DAYS[(idx + 1) % DAYS.length];
    renderPlanningDays();
  });

  // ---------- Dispensa ----------
  function addDays(dateStr, days){
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0,10);
  }

  function renderDispensaList(){
    updatePantryPanelSub();
    const listEl = document.getElementById('dispensa-list');
    const q = document.getElementById('dispensa-search').value.trim().toLowerCase();
    const cat = document.getElementById('dispensa-category-filter').value;
    const today = new Date().toISOString().slice(0,10);
    const soonLimit = addDays(today, 3);
    const expiringBtn = document.getElementById('expiring-recipes-btn');
    const lowStockBtn = document.getElementById('dispensa-low-stock-filter-btn');
    const hasExpiring = dispensaItems.some(it => it.expiry && it.expiry >= today && it.expiry <= soonLimit);
    expiringBtn.disabled = !hasExpiring;
    expiringBtn.title = hasExpiring
      ? 'Mostra le ricette che usano prodotti in scadenza entro 3 giorni'
      : 'Non ci sono prodotti in scadenza entro 3 giorni';
    lowStockBtn.classList.toggle('btn-gold', dispensaLowStockOnly);
    lowStockBtn.classList.toggle('btn-ghost', !dispensaLowStockOnly);

    const isLowStock = it => {
      const qty = parseFloat(it.qty);
      const minQty = parseFloat(it.minQty);
      return !isNaN(qty) && !isNaN(minQty) && qty <= minQty;
    };

    const filtered = dispensaItems.filter(it=>{
      if(cat && it.category !== cat) return false;
      if(q && !it.name.toLowerCase().includes(q)) return false;
      if(dispensaLowStockOnly && !isLowStock(it)) return false;
      return true;
    }).sort((a,b)=>{
      const aLow = isLowStock(a), bLow = isLowStock(b);
      if(aLow !== bLow) return aLow ? -1 : 1;
      if(a.expiry && b.expiry) return a.expiry.localeCompare(b.expiry);
      if(a.expiry) return -1;
      if(b.expiry) return 1;
      return a.name.localeCompare(b.name);
    });

    if(!filtered.length){
      listEl.innerHTML = '<div class="empty-state">Nessun prodotto trovato. Premi "+ Nuovo prodotto" per aggiungerne uno.</div>';
      return;
    }

    listEl.innerHTML = '';
    filtered.forEach(it=>{
      const card = document.createElement('div');
      card.className = 'card';
      card.style.setProperty('--cat-color', PANTRY_CATEGORY_COLORS[it.category] || '#8c6a2f');

      let expiryHtml = '';
      if(it.expiry){
        const isExpired = it.expiry < today;
        const isSoon = !isExpired && it.expiry <= soonLimit;
        const cls = isExpired ? 'expired' : isSoon ? 'soon' : '';
        const label = isExpired ? '⚠️ Scaduto il ' : isSoon ? '⏰ Scade il ' : 'Scade il ';
        expiryHtml = `<div class="dispensa-expiry ${cls}">${label}${new Date(it.expiry + 'T00:00:00').toLocaleDateString('it-IT')}</div>`;
      }

      const qtyKcalParts = [];
      if(it.qty || it.unit) qtyKcalParts.push(`${it.qty ? roundNice(it.qty) : ''} ${escapeHtml(it.unit||'')}`.trim());
      const qtyKcalHtml = qtyKcalParts.length ? `<div class="dispensa-qty">${qtyKcalParts.join(' · ')}</div>` : '';
      const lowStockHtml = isLowStock(it)
        ? `<div class="dispensa-low-stock">⚠ In esaurimento: ne hai ${roundNice(it.qty)}${it.unit ? ' ' + escapeHtml(it.unit) : ''}${it.minQty !== '' && it.minQty !== undefined ? ` (soglia ${roundNice(it.minQty)}${it.unit ? ' ' + escapeHtml(it.unit) : ''})` : ''}</div>`
        : '';

      // Valori nutrizionali: sempre per 100 g di prodotto (dato del prodotto,
      // indipendente da quanto ne hai in dispensa in questo momento).
      const campiNutrizione = [
        ['kcal', 'Kcal', ''], ['protein', 'Proteine', 'g'], ['fat', 'Grassi', 'g'],
        ['carbs', 'Carb.', 'g'], ['fiber', 'Fibre', 'g'], ['sugar', 'Zuccheri', 'g'], ['salt', 'Sale', 'g'],
      ];
      const righeNutrizione = campiNutrizione
        .filter(([campo]) => it[campo] !== '' && it[campo] !== undefined && it[campo] !== null)
        .map(([campo, etichetta, unita]) => `<div>${etichetta}: <b>${roundNice(it[campo])}</b>${unita}</div>`)
        .join('');
      const nutrizioneHtml = righeNutrizione
        ? `<div class="nutrition-summary" style="margin:6px 0;padding:8px 10px;"><div style="font-size:11px;color:var(--ink-soft);margin-bottom:4px;">Per 100 g di prodotto</div><div class="nutrition-grid">${righeNutrizione}</div></div>`
        : '';

      const creaInfoHtml = it.creaCodice
        ? `<button type="button" class="crea-scheda-btn visibile" data-codice="${escapeAttr(it.creaCodice)}" style="margin:2px 0 4px;" title="Tutti i valori nutrizionali CREA per 100 g">ℹ️ Scheda completa (CREA)</button>`
        : '';
      const offBadgeHtml = it.offNutriscore && NUTRISCORE_COLORI[it.offNutriscore]
        ? `<span class="cat-tag" style="background:${NUTRISCORE_COLORI[it.offNutriscore]};margin-left:6px;">Nutri-Score ${escapeHtml(it.offNutriscore)}</span>`
        : '';
      const offImgHtml = it.offImmagine
        ? `<img src="${escapeAttr(it.offImmagine)}" alt="" style="width:36px;height:36px;object-fit:contain;border-radius:4px;float:right;margin:0 0 6px 8px;">`
        : '';

      card.innerHTML = `
        ${offImgHtml}
        <span class="cat-tag">${escapeHtml(it.category)}</span>${offBadgeHtml}
        <h3 style="margin:2px 0 4px;font-size:19px;">${escapeHtml(it.name)}</h3>
        ${qtyKcalHtml}
        ${lowStockHtml}
        ${nutrizioneHtml}
        ${creaInfoHtml}
        ${expiryHtml}
        ${it.notes ? `<div class="dispensa-notes">${escapeHtml(it.notes)}</div>` : ''}
      `;
      card.addEventListener('click', ()=> openDispensaEdit(it));
      const creaInfoBtn = card.querySelector('.crea-scheda-btn');
      if (creaInfoBtn) {
        creaInfoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          apriSchedaCrea(creaInfoBtn.dataset.codice);
        });
      }
      listEl.appendChild(card);
    });
  }

  let dispensaCreaCodiceCorrente = '';
  function openDispensaEdit(item){
    editingDispensaId = item ? item.id : null;
    document.getElementById('dispensa-edit-title').textContent = item ? 'Modifica prodotto' : 'Nuovo prodotto';
    document.getElementById('dispensa-delete-btn').style.display = item ? 'inline-block' : 'none';
    document.getElementById('d-name').value = item ? item.name : '';
    document.getElementById('d-category').value = item ? item.category : 'Frutta';
    document.getElementById('d-qty').value = item ? (item.qty ?? '') : '';
    document.getElementById('d-unit').value = item ? (item.unit || '') : '';
    document.getElementById('d-min-qty').value = item ? (item.minQty ?? '') : '';
    document.getElementById('d-expiry').value = item ? (item.expiry || '') : '';
    document.getElementById('d-notes').value = item ? (item.notes || '') : '';
    document.getElementById('d-kcal').value = item ? (item.kcal ?? '') : '';
    document.getElementById('d-protein').value = item ? (item.protein ?? '') : '';
    document.getElementById('d-fat').value = item ? (item.fat ?? '') : '';
    document.getElementById('d-carbs').value = item ? (item.carbs ?? '') : '';
    document.getElementById('d-fiber').value = item ? (item.fiber ?? '') : '';
    document.getElementById('d-sugar').value = item ? (item.sugar ?? '') : '';
    document.getElementById('d-salt').value = item ? (item.salt ?? '') : '';
    const hasDispensaNutrition = !!(item && (item.kcal || item.protein || item.fat || item.carbs || item.fiber || item.sugar || item.salt));
    document.getElementById('dispensa-nutrition-fields').style.display = hasDispensaNutrition ? 'flex' : 'none';
    document.getElementById('dispensa-nutrition-toggle-btn').classList.toggle('active', hasDispensaNutrition);
    dispensaCreaCodiceCorrente = (item && item.creaCodice) || '';
    document.getElementById('d-crea-search').value = '';
    document.getElementById('d-crea-scheda-btn').classList.toggle('visibile', !!dispensaCreaCodiceCorrente);

    dispensaOffBarcodeCorrente = (item && item.offBarcode) || '';
    dispensaOffImmagineCorrente = (item && item.offImmagine) || '';
    dispensaOffNutriscoreCorrente = (item && item.offNutriscore) || '';
    document.getElementById('off-text-search').value = '';
    document.getElementById('off-barcode-input').value = '';
    document.getElementById('off-status').textContent = '';
    const offPreviewEl = document.getElementById('off-preview');
    if (dispensaOffImmagineCorrente || dispensaOffBarcodeCorrente) {
      document.getElementById('off-preview-img').src = dispensaOffImmagineCorrente || '';
      document.getElementById('off-preview-img').style.display = dispensaOffImmagineCorrente ? '' : 'none';
      document.getElementById('off-preview-nome').textContent = item ? item.name : '';
      document.getElementById('off-preview-marca').textContent = '';
      const nsEl = document.getElementById('off-preview-nutriscore');
      if (dispensaOffNutriscoreCorrente && NUTRISCORE_COLORI[dispensaOffNutriscoreCorrente]) {
        nsEl.textContent = 'Nutri-Score ' + dispensaOffNutriscoreCorrente;
        nsEl.style.background = NUTRISCORE_COLORI[dispensaOffNutriscoreCorrente];
        nsEl.style.display = 'inline-block';
      } else {
        nsEl.style.display = 'none';
      }
      offPreviewEl.style.display = 'flex';
    } else {
      offPreviewEl.style.display = 'none';
    }

    document.getElementById('dispensa-edit-overlay').classList.add('active');
    formDirty = false;
  }
  function closeDispensaEdit(){
    document.getElementById('dispensa-edit-overlay').classList.remove('active');
    formDirty = false;
  }
  async function confirmCloseDispensaEdit(){
    if(formDirty && !(await confirmDialog({
      title: 'Modifiche non salvate',
      message: 'Hai modifiche non salvate a questo prodotto. Chiudere comunque? Le modifiche andranno perse.',
      confirmText: 'Chiudi senza salvare',
      danger: true
    }))) return;
    closeDispensaEdit();
  }
  document.getElementById('dispensa-edit-overlay').addEventListener('input', ()=>{ formDirty = true; });
  document.getElementById('dispensa-edit-overlay').addEventListener('change', ()=>{ formDirty = true; });

  document.getElementById('new-dispensa-item-btn').addEventListener('click', ()=> openDispensaEdit(null));
  document.getElementById('dispensa-edit-close').addEventListener('click', confirmCloseDispensaEdit);
  document.getElementById('dispensa-search').addEventListener('input', renderDispensaList);
  document.getElementById('dispensa-category-filter').addEventListener('change', renderDispensaList);
  document.getElementById('dispensa-low-stock-filter-btn').addEventListener('click', ()=>{
    dispensaLowStockOnly = !dispensaLowStockOnly;
    renderDispensaList();
  });
  document.getElementById('expiring-recipes-btn').addEventListener('click', ()=>{
    const today = new Date().toISOString().slice(0,10);
    const soonLimit = addDays(today, 3);
    const prodottiInScadenza = dispensaItems
      .filter(it => it.expiry && it.expiry >= today && it.expiry <= soonLimit)
      .map(it => it.name)
      .filter(Boolean);
    priorityPantryNames = prodottiInScadenza.map(normalize).filter(Boolean);
    priorityPantryLabels = prodottiInScadenza;
    if(!priorityPantryNames.length){
      alert('Non ci sono prodotti in scadenza entro 3 giorni.');
      return;
    }
    pantryMode = true;
    pantryResetBtn.style.display = 'inline-block';
    updatePantryPanelSub();
    switchView('recipes');
  });
  document.getElementById('dispensa-nutrition-toggle-btn').addEventListener('click', (e)=>{
    const panel = document.getElementById('dispensa-nutrition-fields');
    const showing = panel.style.display !== 'none';
    panel.style.display = showing ? 'none' : 'flex';
    e.currentTarget.classList.toggle('active', !showing);
  });
  document.getElementById('recipe-nutrition-toggle-btn').addEventListener('click', (e)=>{
    const panel = document.getElementById('recipe-nutrition-fields');
    const showing = panel.style.display !== 'none';
    panel.style.display = showing ? 'none' : 'flex';
    e.currentTarget.classList.toggle('active', !showing);
  });

  document.getElementById('dispensa-save-btn').addEventListener('click', ()=>{
    const name = document.getElementById('d-name').value.trim();
    if(!name){ alert('Scrivi il nome del prodotto.'); return; }
    const itemData = {
      id: editingDispensaId || cryptoId(),
      name,
      category: document.getElementById('d-category').value,
      qty: document.getElementById('d-qty').value,
      unit: document.getElementById('d-unit').value.trim(),
      minQty: document.getElementById('d-min-qty').value,
      expiry: document.getElementById('d-expiry').value || '',
      notes: document.getElementById('d-notes').value.trim(),
      kcal: document.getElementById('d-kcal').value,
      protein: document.getElementById('d-protein').value,
      fat: document.getElementById('d-fat').value,
      carbs: document.getElementById('d-carbs').value,
      fiber: document.getElementById('d-fiber').value,
      sugar: document.getElementById('d-sugar').value,
      salt: document.getElementById('d-salt').value,
      creaCodice: dispensaCreaCodiceCorrente,
      offBarcode: dispensaOffBarcodeCorrente,
      offImmagine: dispensaOffImmagineCorrente,
      offNutriscore: dispensaOffNutriscoreCorrente
    };
    if(editingDispensaId){
      const idx = dispensaItems.findIndex(i=>i.id === editingDispensaId);
      if(idx > -1) dispensaItems[idx] = itemData; else dispensaItems.push(itemData);
    }else{
      dispensaItems.push(itemData);
    }
    saveDispensaItems();
    renderDispensaList();
    renderPlanningDays();
    closeDispensaEdit();
  });

  document.getElementById('dispensa-delete-btn').addEventListener('click', async ()=>{
    const prodottoNome = (dispensaItems.find(i=>i.id===editingDispensaId) || {}).name || 'questo prodotto';
    const ok = await confirmDialog({
      title: 'Eliminare il prodotto?',
      message: `"${prodottoNome}" verrà eliminato dalla Dispensa, insieme a eventuali voci pianificate che lo usano. L'operazione non si può annullare.`,
      confirmText: 'Elimina prodotto',
      danger: true
    });
    if(!ok) return;
    dispensaItems = dispensaItems.filter(i=>i.id !== editingDispensaId);
    DAYS.forEach(day=>{ weekPlan[day] = (weekPlan[day]||[]).filter(e=>e.dispensaItemId !== editingDispensaId); });
    saveDispensaItems();
    saveWeek();
    renderDispensaList();
    renderPlanningDays();
    closeDispensaEdit();
  });

  document.getElementById('add-mealtype-btn').addEventListener('click', ()=>{
    const name = prompt('Nome della nuova fascia pasto (es. Aperitivo):');
    if(!name) return;
    const trimmed = name.trim();
    if(!trimmed) return;
    if(mealTypes.some(mt=>mt.toLowerCase() === trimmed.toLowerCase())){ alert('Questa fascia esiste già.'); return; }
    mealTypes.push(trimmed);
    saveMealTypes();
    renderPlanningDays();
  });

  document.getElementById('clear-week-btn').addEventListener('click', async ()=>{
    const ok = await confirmDialog({
      title: 'Svuotare la settimana?',
      message: 'Tutta la pianificazione di questa settimana verrà rimossa. Una copia resta salvata come "settimana scorsa" e potrai recuperarla con "➕ Aggiungi settimana scorsa".',
      confirmText: 'Svuota settimana',
      danger: true
    });
    if(!ok) return;
    const hasContent = DAYS.some(d => (weekPlan[d] || []).length);
    if(hasContent){
      previousWeekPlan = JSON.parse(JSON.stringify(weekPlan));
      savePreviousWeek(previousWeekPlan);
    }
    weekPlan = {}; saveWeek(); renderPlanningDays();
  });

  document.getElementById('copy-last-week-btn').addEventListener('click', ()=>{
    const hasPrev = previousWeekPlan && DAYS.some(d => (previousWeekPlan[d] || []).length);
    if(!hasPrev){
      alert('Nessuna settimana precedente salvata ancora. Viene creata automaticamente ogni volta che premi "Svuota settimana".');
      return;
    }
    const totaleVoci = DAYS.reduce((n, d) => n + (previousWeekPlan[d] || []).length, 0);
    if(!confirm(`Aggiungere ${totaleVoci} vo${totaleVoci===1?'ce':'ci'} della settimana scorsa a quella attuale? Quello che hai già pianificato per questa settimana resta invariato.`)) return;
    // Aggiunge, non sostituisce: ogni voce viene copiata con un nuovo identificativo e segnata
    // come "da consumare", così non eredita per sbaglio lo stato (✓) della settimana precedente,
    // e quanto già pianificato per questa settimana non viene toccato.
    DAYS.forEach(day=>{
      const voci = previousWeekPlan[day] || [];
      if(!voci.length) return;
      if(!weekPlan[day]) weekPlan[day] = [];
      voci.forEach(voce=>{
        weekPlan[day].push({ ...JSON.parse(JSON.stringify(voce)), id: cryptoId(), consumed: false });
      });
    });
    saveWeek();
    renderPlanningDays();
  });

  // ---------- Shopping list ----------
  const shoppingOverlay = document.getElementById('shopping-overlay');
  const shoppingSubtitle = document.getElementById('shopping-subtitle');
  const shoppingListItems = document.getElementById('shopping-list-items');
  const shoppingDispensaSyncNote = document.getElementById('shopping-dispensa-sync-note');

  // Aggiunge (o incrementa, se già presente e con la stessa unità) un ingrediente della lista
  // della spesa alla Dispensa. Ritorna true se qualcosa è stato effettivamente modificato.
  function addOrIncrementDispensaFromShopping(item){
    const existing = dispensaItems.find(it => normalize(it.name) === normalize(item.name));
    if(existing){
      if(item.fromDispensaFlag) return false; // quantità comprata sconosciuta: non tocchiamo quella in Dispensa
      const amount = parseFloat(item.qty) || 0;
      if(!amount) return false;
      // Converte la quantità comprata nell'unità già usata in Dispensa per quel prodotto, così
      // "500 g" acquistati si sommano correttamente a "1 kg" già presenti, invece di essere
      // scartati solo perché scritti con un'unità diversa ma equivalente.
      let amountToAdd = amount;
      if(existing.unit && item.unit){
        const converted = convertQty(amount, item.unit, existing.unit);
        if(converted === null) return false; // unità non equivalenti: non sommiamo
        amountToAdd = converted;
      }
      const current = parseFloat(existing.qty);
      existing.qty = String(Math.round(((isNaN(current) ? 0 : current) + amountToAdd) * 100) / 100);
      if(!existing.unit && item.unit) existing.unit = item.unit;
      return true;
    }
    dispensaItems.push({
      id: cryptoId(), name: item.name, category: repartoIngrediente(item.name),
      qty: item.fromDispensaFlag ? '' : String(parseFloat(item.qty) || ''),
      unit: item.fromDispensaFlag ? '' : (item.unit || ''),
      minQty: '',
      expiry: '', notes: '',
      kcal:'', protein:'', fat:'', carbs:'', fiber:'', sugar:'', salt:''
    });
    return true;
  }

  // Popola e apre il modal della lista della spesa con un elenco di voci già calcolato
  // (usata sia dalla lista della settimana, sia da quella di un giorno o di una singola ricetta).
  function openShoppingListOverlay(items, subtitleText, autoSubtracted){
    shoppingSubtitle.textContent = subtitleText;
    let dispensaSyncCount = 0;
    const subtractAllBtn = document.getElementById('shopping-subtract-all-btn');
    if(subtractAllBtn) subtractAllBtn.style.display = autoSubtracted ? 'none' : '';
    shoppingDispensaSyncNote.style.display = 'none';
    shoppingListItems.innerHTML = '';

    // Raggruppa per reparto (ordine "da supermercato"), così la lista si spunta più rapidamente
    // mentre si gira per i corridoi, invece di seguire l'ordine casuale delle ricette.
    const itemsConReparto = items.map(item => ({ item, reparto: repartoIngrediente(item.name) }));
    itemsConReparto.sort((a, b) => {
      const ia = REPARTO_ORDINE.indexOf(a.reparto), ib = REPARTO_ORDINE.indexOf(b.reparto);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    let repartoCorrente = null;
    itemsConReparto.forEach(({item, reparto})=>{
      if(reparto !== repartoCorrente){
        repartoCorrente = reparto;
        const header = document.createElement('li');
        header.className = 'shopping-reparto-header';
        header.innerHTML = `<span class="reparto-dot" style="background:${PANTRY_CATEGORY_COLORS[reparto] || '#8c6a2f'}"></span>${escapeHtml(reparto)}`;
        shoppingListItems.appendChild(header);
      }
      const li = document.createElement('li');
      if(item.pantryCovered) li.classList.add('covered');
      const amt = item.fromDispensaFlag ? 'dalla dispensa' : (item.pantryCovered ? 'già in Dispensa' : `${item.qty ? formatQtyForUnit(item.qty, item.unit) : ''} ${item.unit||''}`.trim());
      const giaSpuntato = !!shoppingCheckedItems[normalize(item.name)];
      li.innerHTML = `<input type="checkbox"${giaSpuntato?' checked':''}><span>${escapeHtml(item.name)}</span><span class="amt">${escapeHtml(amt)}</span>`;
      if(giaSpuntato) li.classList.add('checked');
      const amtSpan = li.querySelector('.amt');
      if(autoSubtracted && !item.fromDispensaFlag && (item.pantryCovered || item.pantryUsedQty || item.pantryNote)){
        const note = document.createElement('div');
        note.className = 'shopping-pantry-note shopping-auto-note';
        if(item.pantryCovered) note.textContent = `✓ Coperto dalla Dispensa${item.pantryApprox ? ` (corrispondenza: ${item.pantryMatchName})` : ''}`;
        else if(item.pantryUsedQty) note.textContent = `🥫 Sottratti ${formatQtyForUnit(item.pantryUsedQty, item.pantryUsedUnit)} ${item.pantryUsedUnit||''} già presenti in Dispensa${item.pantryApprox ? ` (corrispondenza: ${item.pantryMatchName})` : ''}`.trim();
        else note.textContent = `🥫 ${item.pantryNote}`;
        li.appendChild(note);
      }

      // Controllo incrociato con la Dispensa: se il prodotto risulta già presente, propone di
      // sottrarre la quantità disponibile da quella ancora da acquistare (con "Annulla" per
      // tornare indietro in caso di tocco per sbaglio).
      if(!item.fromDispensaFlag && !autoSubtracted){
        const { match: dispensaMatch, isApprox, ambiguous: otherMatches } = findDispensaMatch(item.name);
        const qtyUnitLabel = (val, unit) => unit ? `${formatQtyForUnit(val, unit)} ${unit}` : formatQtyForUnit(val, unit);
        if(dispensaMatch){
          const dispensaQtyRaw = parseFloat(dispensaMatch.qty) || 0;
          // Se le unità non sono scritte allo stesso modo, prova a convertirle (es. kg -> g, l -> ml)
          const dispensaQtyConverted = dispensaQtyRaw > 0 ? convertQty(dispensaQtyRaw, dispensaMatch.unit, item.unit) : null;
          const canSubtract = dispensaQtyConverted !== null && dispensaQtyConverted > 0;
          const approxNote = isApprox ? ` (corrispondenza simile: "${dispensaMatch.name}")` : '';
          const note = document.createElement('div');
          note.className = 'shopping-pantry-note';
          const noteText = document.createTextNode('');
          note.appendChild(noteText);
          if(canSubtract){
            const unitLabel = item.unit || '';
            const originalQty = item.qty;
            const originalAmtText = amtSpan.textContent;
            const showSubtractBtn = ()=>{
              noteText.textContent = `🥫 Ne hai già ${qtyUnitLabel(dispensaQtyConverted, unitLabel)} in Dispensa${approxNote}`;
              note.querySelectorAll('button').forEach(b=>b.remove());
              const subtractBtn = document.createElement('button');
              subtractBtn.type = 'button';
              subtractBtn.className = 'shopping-subtract-btn shopping-subtract-action';
              subtractBtn.textContent = 'Sottrai dalla lista';
              subtractBtn.addEventListener('click', applySubtract);
              note.appendChild(subtractBtn);
            };
            function applySubtract(){
              const remaining = Math.max(0, Math.round(((parseFloat(item.qty)||0) - dispensaQtyConverted) * 100) / 100);
              item.qty = remaining;
              note.querySelectorAll('button').forEach(b=>b.remove());
              if(remaining > 0){
                amtSpan.textContent = qtyUnitLabel(remaining, unitLabel);
                noteText.textContent = `🥫 Sottratti ${qtyUnitLabel(dispensaQtyConverted, unitLabel)} già in Dispensa${approxNote}`;
              }else{
                li.classList.add('covered');
                amtSpan.textContent = 'già in Dispensa';
                noteText.textContent = `🥫 Ne hai già a sufficienza in Dispensa${approxNote}: non serve comprarne altro`;
                const cb = li.querySelector('input[type=checkbox]');
                if(cb) cb.disabled = true;
              }
              const undoBtn = document.createElement('button');
              undoBtn.type = 'button';
              undoBtn.className = 'shopping-subtract-btn shopping-undo-action';
              undoBtn.textContent = 'Annulla';
              undoBtn.addEventListener('click', ()=>{
                item.qty = originalQty;
                li.classList.remove('covered');
                amtSpan.textContent = originalAmtText;
                const cb = li.querySelector('input[type=checkbox]');
                if(cb) cb.disabled = false;
                showSubtractBtn();
              });
              note.appendChild(undoBtn);
            }
            showSubtractBtn();
          }else if(dispensaQtyRaw > 0){
            noteText.textContent = `🥫 Presente in Dispensa (${qtyUnitLabel(dispensaQtyRaw, dispensaMatch.unit)})${approxNote} con un'unità diversa: verifica tu quanto comprarne`;
          }else{
            noteText.textContent = `🥫 Presente in Dispensa${approxNote} (quantità non indicata): verifica tu quanto comprarne`;
          }
          li.appendChild(note);
        }else if(otherMatches.length > 0){
          const note = document.createElement('div');
          note.className = 'shopping-pantry-note';
          note.textContent = `🥫 Potresti avere già qualcosa di simile in Dispensa (${otherMatches.map(x=>x.name).join(', ')}): verifica tu`;
          li.appendChild(note);
        }
      }

      li.querySelector('input').addEventListener('change', (e)=>{
        li.classList.toggle('checked', e.target.checked);
        const chiave = normalize(item.name);
        if(e.target.checked) shoppingCheckedItems[chiave] = true;
        else delete shoppingCheckedItems[chiave];
        saveShoppingCheckedItems();
        if(e.target.checked && !li.dataset.synced){
          li.dataset.synced = '1';
          if(item.fromDispensaFlag){
            shoppingExtraItems = shoppingExtraItems.filter(x => x.id !== item.extraId);
            saveShoppingExtra();
          }
          if(addOrIncrementDispensaFromShopping(item)){
            saveDispensaItems();
            renderDispensaList();
            dispensaSyncCount++;
            shoppingDispensaSyncNote.innerHTML = `✓ Aggiornati ${dispensaSyncCount} prodott${dispensaSyncCount===1?'o':'i'} in Dispensa` +
              ` — <button type="button" class="link-btn" id="shopping-goto-dispensa-btn">Vedi Dispensa →</button>`;
            shoppingDispensaSyncNote.style.display = 'block';
            const gotoBtn = document.getElementById('shopping-goto-dispensa-btn');
            if(gotoBtn) gotoBtn.addEventListener('click', ()=>{
              shoppingOverlay.classList.remove('active');
              switchView('dispensa');
            });
          }
        }
      });
      shoppingListItems.appendChild(li);
    });
    shoppingOverlay.classList.add('active');
  }

  document.getElementById('generate-shopping-btn').addEventListener('click', ()=>{
    const allEntries = DAYS.flatMap(day => weekPlan[day] || []);
    const plannedRecipes = allEntries.map(e=>recipes.find(r=>r.id===e.recipeId)).filter(Boolean);
    if(plannedRecipes.length === 0 && shoppingExtraItems.length === 0){
      alert(allEntries.length === 0
        ? 'Assegna almeno una ricetta a un giorno della settimana.'
        : 'Nessuna ricetta pianificata da cui generare la lista della spesa (i prodotti dalla dispensa non richiedono acquisti).');
      return;
    }
    const pairs = plannedRecipes.map(r=>({ recipe: r, scale: planServings / (r.servings || 1) }));
    const rawItems = buildAggregatedShoppingItems(pairs);
    const items = subtractPantryFromShoppingItems(rawItems);
    const subtitle = plannedRecipes.length
      ? `Per ${planServings} persone — quantità già presenti in Dispensa sottratte automaticamente`
      : 'Ingredienti segnalati mancanti dalla Dispensa';
    openShoppingListOverlay(items, subtitle, true);
  });
  document.getElementById('shopping-close').addEventListener('click', ()=> shoppingOverlay.classList.remove('active'));
  document.getElementById('shopping-subtract-all-btn').addEventListener('click', ()=>{
    // Applica in un colpo solo tutte le sottrazioni disponibili (una per riga, dove il pulsante
    // "Sottrai dalla lista" è comparso), senza doverle toccare una per una.
    shoppingListItems.querySelectorAll('.shopping-subtract-action').forEach(btn => btn.click());
  });

  document.getElementById('export-shopping-pdf-btn').addEventListener('click', ()=>{
    const items = Array.from(shoppingListItems.querySelectorAll('li')).map(li=>{
      const name = li.querySelector('span:not(.amt)')?.textContent || '';
      const amt = li.querySelector('.amt')?.textContent || '';
      return amt.trim() ? `${name} — ${amt.trim()}` : name;
    });
    if(!items.length){ alert('Genera prima la lista della spesa dalla settimana pianificata.'); return; }
    const sections = [{ heading: null, lines: items.map(t => `- ${t}`) }];
    const pdfStr = buildPdfFromSections('Lista della spesa', sections);
    downloadPdf(pdfStr, `lista-della-spesa-${new Date().toISOString().slice(0,10)}.pdf`);
  });

  // close overlays on backdrop click (per i moduli con campi da compilare, passa dallo stesso
  // controllo "modifiche non salvate" del tasto × invece di chiudere sempre senza chiedere)
  const dispensaEditOverlayEl = document.getElementById('dispensa-edit-overlay');
  [editOverlay, viewOverlay, shoppingOverlay, pasteImportOverlay, recipePickerOverlay, dispensaPickerOverlay, dispensaEditOverlayEl, pantryPickerOverlay].forEach(ov=>{
    ov.addEventListener('click', (e)=>{
      if(e.target !== ov) return;
      if(ov === editOverlay){ confirmCloseEdit(); return; }
      if(ov === dispensaEditOverlayEl){ confirmCloseDispensaEdit(); return; }
      ov.classList.remove('active');
    });
  });

  // Avvisa prima di chiudere la scheda/navigare via se c'è un modulo aperto con modifiche non
  // salvate (ricetta o prodotto Dispensa), per non perdere il lavoro fatto per una chiusura
  // accidentale. Il testo del messaggio non è mostrabile nei browser moderni per motivi di
  // sicurezza: mostrano un avviso generico predefinito, la riga sotto serve solo ad attivarlo.
  window.addEventListener('beforeunload', (e)=>{
    if(!formDirty) return;
    e.preventDefault();
    e.returnValue = '';
  });

  // ---------- Init ----------
  (async function avviaApp(){
    await inizializzaStorageFileAllAvvio();
    loadRecipes();
    recipes = recipes.map(migrateRecipe);
    saveRecipes();
    migrateWeekPlan();
    planServingsInput.value = planServings;
    updatePantryPanelSub();
    switchView('recipes');
    aggiornaControlliMenuStorage();
    mostraSceltaStorageSeNecessario();
  })();
})();
