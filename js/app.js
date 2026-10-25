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
  const PLAN_WEEKS_KEY = 'mc_ricettario_settimane_v1'; // tutte le settimane pianificate, per data del lunedì
  const SHOPPING_CHECKED_KEY = 'mc_ricettario_spesa_spuntate_v1';
  const SHOPPING_HIDDEN_KEY = 'mc_ricettario_spesa_rimosse_v1';
  const SHOPPING_QTY_KEY = 'mc_ricettario_spesa_quantita_v1';
  const SPESA_LISTA_KEY = 'mc_ricettario_spesa_lista_v1';
  const RICETTARI_KEY = 'mc_ricettario_libri_v1';
  const RACCOLTE_KEY = 'mc_ricettario_raccolte_v1';
  // Il ricettario che esiste già di fabbrica: id stabile così tutte le ricette create prima
  // dell'introduzione dei "più ricettari" continuano a trovarlo dopo l'aggiornamento.
  const DEFAULT_RICETTARIO_ID = 'default';
  const PANTRY_CATEGORY_COLORS = {
    'Frutta': '#D08A55', 'Verdura': '#6F8F5E', 'Uova': '#D4AE5C', 'Salumi': '#A65C55',
    'Latticini e pronti': '#C9AE5A', 'Surgelati': '#6F95A0', 'Pasta, riso e cereali': '#A58459',
    'Legumi': '#8A7B58', 'Farine, zucchero e lieviti': '#B79F76', 'Conserve e scatolame': '#8F6B4A',
    'Spezie e condimenti': '#B0683F', 'Oli, aceti e grassi': '#9C9A4A', 'Bevande': '#6B8CAD',
    'Snack e dolciumi': '#B8788A', 'Altro': '#7A7F78'
  };
  // Icona di riserva per la card Dispensa quando il prodotto non ha una foto
  // OFF: stessa logica delle illustrazioni-segnaposto delle card ricetta.
  const PANTRY_CATEGORY_ICONS = {
    'Frutta': '🍎', 'Verdura': '🥦', 'Uova': '🥚', 'Salumi': '🥓',
    'Latticini e pronti': '🧀', 'Surgelati': '🧊', 'Pasta, riso e cereali': '🍝',
    'Legumi': '🫘', 'Farine, zucchero e lieviti': '🌾', 'Conserve e scatolame': '🥫',
    'Spezie e condimenti': '🧂', 'Oli, aceti e grassi': '🫒', 'Bevande': '🥤',
    'Snack e dolciumi': '🍬', 'Altro': '🍽️'
  };
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
  // Pasti proponibili nel menu «Aggiungi pasto» (v5.32). Ogni giorno parte vuoto: i pasti si aggiungono
  // a piacere, anche più volte lo stesso (Spuntino, Spuntino 2…). Orari tipici usati solo per l'ordine.
  const MEAL_SUGGESTIONS = ['Colazione','Spuntino','Pranzo','Merenda','Cena','Brunch','Aperitivo','Dopocena','Pre-allenamento','Post-allenamento'];
  const MEAL_DEFAULT_TIME = {'Colazione':'07:30','Brunch':'11:00','Spuntino':'10:30','Pranzo':'13:00','Merenda':'16:30','Pre-allenamento':'17:00','Aperitivo':'18:30','Post-allenamento':'19:00','Cena':'20:00','Dopocena':'22:00'};
  const TAG_OPTIONS = ['Vegetariano','Vegano','Senza glutine','Senza lattosio','Piccante'];
  // I 14 allergeni "a dichiarazione obbligatoria" nell'UE (Reg. 1169/2011), usati qui per
  // segnalare cosa CONTIENE una ricetta — distinto dai tag dietetici sopra, che indicano
  // invece per chi è adatta (es. "Senza glutine" come scelta, non come elenco ingredienti).
  const ALLERGEN_OPTIONS = [
    'Glutine','Crostacei','Uova','Pesce','Arachidi','Soia','Latte','Frutta a guscio',
    'Sedano','Senape','Semi di sesamo','Anidride solforosa e solfiti','Lupini','Molluschi'
  ];

  let recipes = [];
  let raccolte = []; // [{ id, name }]: elenchi personali di ricette (una ricetta può stare in più raccolte: r.raccolte = [id])
  let minRatingFilter = '', raccoltaFilter = '';
  const MISURE_PRATICHE_KEY = 'mc_ricettario_misure_pratiche_v1';
  let misurePratiche = true;
  try{ misurePratiche = localStorage.getItem(MISURE_PRATICHE_KEY) !== '0'; }catch(e){}
  // "Volumi" della libreria: ogni ricetta appartiene a uno solo di questi (r.ricettarioId).
  // {id, name, cover} — cover è una dataURL opzionale (stessa pipeline di ritaglio/compressione
  // usata per le foto delle ricette), oppure '' per mostrare l'icona segnaposto.
  let ricettari = [];
  let activeRicettarioFilter = ''; // '' = tutti i ricettari insieme
  let weekPlan = {}; // { 'Lunedì': [ {id, recipeId, mealType, time}, ... ], ... }
  let mealTypes = [];
  let planServings = 4;
  let previousWeekPlan = null;
  let dispensaItems = [];
  let spesaLista = []; // lista della spesa indipendente dalla pianificazione: [{id, name, qty, unit, checked, fonti:[]}]
  let shoppingExtraItems = []; // ingredienti segnalati mancanti dalla dispensa, promemoria per la spesa: [{id, name, unit}]
  // Settimane con date reali: weekPlan/weekNotes sono SEMPRE la settimana mostrata (planWeekStart);
  // planWeeks conserva tutte le settimane, indicizzate dalla data (AAAA-MM-GG) del lunedì.
  let planWeeks = {};
  let planWeekStart = '';
  function isoLocal(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function dateFromIso(iso){ const [y,m,dd] = iso.split('-').map(Number); return new Date(y, m-1, dd, 12, 0, 0); }
  function shiftIsoDays(iso, n){ const d = dateFromIso(iso); d.setDate(d.getDate()+n); return isoLocal(d); }
  function mondayOfIso(iso){ const d = dateFromIso(iso); d.setDate(d.getDate() - ((d.getDay()+6)%7)); return isoLocal(d); }
  function realMonday(){ return mondayOfIso(isoLocal(new Date())); }
  let weekNotes = {}; // { 'Lunedì': { 'Cena': 'nota libera', ... }, ... }
  // Stato "spuntato" della lista della spesa, tenuto per nome ingrediente normalizzato (non per
  // singola lista): così lo stesso ingrediente resta spuntato anche se compare in una lista
  // rigenerata in seguito (es. dopo aver cambiato la pianificazione).
  let shoppingCheckedItems = {};
  let shoppingHiddenItems = {};   // voci della lista tolte a mano: { 'nome|unità': true }
  let shoppingQtyOverrides = {};  // quantità modificate a mano: { 'nome|unità': numero }
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
  let airFryerOnly = false;
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
    'Primi': '#C77855', 'Secondi': '#9A5A48', 'Zuppe & Vellutate': '#6F8F5E',
    'Impasti & Pane': '#B8934F', 'Salse & Sughi': '#B5654A', 'Dolci': '#B8788A',
    'Infusi & Tisane': '#7B8F7A', 'Altro': '#7A7F78'
  };
  // Un piccolo simbolo per categoria, usato come illustrazione al posto della
  // foto nelle card senza immagine: così l'elenco ricette resta curato anche
  // prima di aver fotografato qualcosa.
  const CATEGORY_ICONS = {
    'Primi': '🍝', 'Secondi': '🍖', 'Zuppe & Vellutate': '🥣',
    'Impasti & Pane': '🍞', 'Salse & Sughi': '🫙', 'Dolci': '🍰',
    'Infusi & Tisane': '🍵', 'Altro': '🍽️'
  };

  // Sottocategorie (facoltative): ogni categoria principale ne ha un elenco proprio.
  const SOTTOCATEGORIE = {
    'Primi': ['Pasta secca e fresca', 'Risi e risotti', 'Gnocchi e chicchi', 'Primi al forno e lasagne', 'Pasta ripiena'],
    'Secondi': ['Carne rossa (manzo, vitello, maiale)', 'Carne bianca (pollo, tacchino, coniglio)', 'Pesce e crostacei', 'Uova e frittate', 'Vegetariani e formaggi'],
    'Zuppe & Vellutate': ['Zuppe e minestroni', 'Vellutate e creme', 'Zuppe di pesce e brodi'],
    'Impasti & Pane': ['Pane e lievitati', 'Pizza e focacce', 'Torte salate e piadine', 'Pasta fresca (base)'],
    'Salse & Sughi': ['Sughi per pasta (pesto, ragù, pomodoro)', 'Salse d\'accompagnamento (maionese, senape, BBQ, verde)', 'Marinate e condimenti'],
    'Dolci': ['Torte e ciambelle', 'Dolci al cucchiaio e dessert', 'Biscotti e piccola pasticceria', 'Lievitati dolci e brioche', 'Frutta e gelati'],
    'Infusi & Tisane': ['Tè e infusi', 'Tisane rilassanti e digestive', 'Bevande calde e decotti'],
    'Altro': ['Contorni e insalate', 'Antipasti e snack', 'Conserve e sottoli']
  };
  let subcategoryFilter = ''; // vale solo insieme alla categoria scelta (subcategoryFilterCat)
  let subcategoryFilterCat = '';
  function recipeCategoryLabel(r){ return r.subcategory ? `${r.category} · ${r.subcategory}` : r.category; }

  // ---------- Storage ----------
  function loadRecipes(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      recipes = raw ? JSON.parse(raw) : seedData();
      if(!raw) saveRecipes();
    }catch(e){ recipes = seedData(); }
    try{
      const rawRicettari = localStorage.getItem(RICETTARI_KEY);
      ricettari = rawRicettari ? JSON.parse(rawRicettari) : [];
      if(!Array.isArray(ricettari)) ricettari = [];
    }catch(e){ ricettari = []; }
    // Chi aggiorna da una versione precedente (o chi parte da zero) deve sempre trovare
    // almeno il ricettario di partenza: qui confluiscono tutte le ricette già esistenti.
    if(!ricettari.some(rb => rb.id === DEFAULT_RICETTARIO_ID)){
      ricettari.unshift({ id: DEFAULT_RICETTARIO_ID, name: 'Il Mio Ricettario', cover: '' });
      saveRicettari();
    }
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
      // Ripulisce eventuali doppioni già accumulati (stesso nome e unità), rimasti da prima che
      // l'aggiunta controllasse i duplicati: altrimenti restano per sempre nella lista della spesa.
      const vistiExtra = new Set();
      const senzaDoppioni = [];
      shoppingExtraItems.forEach(x=>{
        if(!x || !x.name) return;
        const chiave = normalize(x.name) + '|' + normalize(x.unit || '');
        if(vistiExtra.has(chiave)) return;
        vistiExtra.add(chiave);
        senzaDoppioni.push(x);
      });
      if(senzaDoppioni.length !== shoppingExtraItems.length){
        shoppingExtraItems = senzaDoppioni;
        safeStorageSet(SHOPPING_EXTRA_KEY, JSON.stringify(shoppingExtraItems));
      }
    }catch(e){ shoppingExtraItems = []; }
    try{
      const rawSpesa = localStorage.getItem(SPESA_LISTA_KEY);
      spesaLista = rawSpesa ? JSON.parse(rawSpesa) : [];
      if(!Array.isArray(spesaLista)) spesaLista = [];
      spesaLista = spesaLista.filter(x => x && typeof x.name === 'string' && x.name.trim());
    }catch(e){ spesaLista = []; }
    try{
      const rawNotes = localStorage.getItem(WEEK_NOTES_KEY);
      weekNotes = rawNotes ? JSON.parse(rawNotes) : {};
      if(!weekNotes || typeof weekNotes !== 'object') weekNotes = {};
    }catch(e){ weekNotes = {}; }
    inizializzaSettimane();
    try{
      const rawChecked = localStorage.getItem(SHOPPING_CHECKED_KEY);
      shoppingCheckedItems = rawChecked ? JSON.parse(rawChecked) : {};
      if(!shoppingCheckedItems || typeof shoppingCheckedItems !== 'object') shoppingCheckedItems = {};
    }catch(e){ shoppingCheckedItems = {}; }
    try{
      const h = JSON.parse(localStorage.getItem(SHOPPING_HIDDEN_KEY) || '{}');
      shoppingHiddenItems = (h && typeof h === 'object' && !Array.isArray(h)) ? h : {};
    }catch(e){ shoppingHiddenItems = {}; }
    try{
      const q = JSON.parse(localStorage.getItem(SHOPPING_QTY_KEY) || '{}');
      shoppingQtyOverrides = (q && typeof q === 'object' && !Array.isArray(q)) ? q : {};
    }catch(e){ shoppingQtyOverrides = {}; }
  }
  function saveShoppingEdits(){
    safeStorageSet(SHOPPING_HIDDEN_KEY, JSON.stringify(shoppingHiddenItems));
    return safeStorageSet(SHOPPING_QTY_KEY, JSON.stringify(shoppingQtyOverrides));
  }
  function saveWeekNotes(){
    salvaSettimane();
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
  // ---------- Foto delle ricette in IndexedDB ----------
  // localStorage ha un limite di ~5 MB nel browser: bastano poche decine di foto per riempirlo.
  // Le foto stanno quindi in IndexedDB (centinaia di MB); nel salvataggio principale resta solo
  // il segnaposto '@idb'. In memoria r.photo contiene sempre l'immagine, quindi il resto del codice,
  // i backup e il file collegato non cambiano. Se IndexedDB non è disponibile si torna al vecchio
  // modo (foto dentro il salvataggio principale).
  const FOTO_DB_NAME = 'mc_ricettario_foto_db', FOTO_STORE = 'foto', FOTO_MARKER = '@idb';
  let fotoDbPromise = null, fotoDbOk = true;
  const fotoConfermate = new Map();   // id -> foto già scritta in IndexedDB
  const fotoNonCaricate = new Set();  // id con segnaposto la cui foto non è stato possibile leggere: il segnaposto va conservato
  const fotoInCoda = new Map();       // id -> foto in attesa di essere scritta
  let fotoFlushInCorso = false;
  function apriFotoDb(){
    if(fotoDbPromise) return fotoDbPromise;
    fotoDbPromise = new Promise(res=>{
      try{
        if(!window.indexedDB){ res(null); return; }
        const rq = indexedDB.open(FOTO_DB_NAME, 1);
        rq.onupgradeneeded = ()=> rq.result.createObjectStore(FOTO_STORE);
        rq.onsuccess = ()=> res(rq.result);
        rq.onerror = rq.onblocked = ()=> res(null);
      }catch(e){ res(null); }
    });
    return fotoDbPromise;
  }
  function fotoTx(mode, fn){
    return apriFotoDb().then(db => !db ? null : new Promise(res=>{
      try{
        const tx = db.transaction(FOTO_STORE, mode);
        const out = fn(tx.objectStore(FOTO_STORE));
        tx.oncomplete = ()=> res(out === undefined ? true : out);
        tx.onerror = tx.onabort = ()=> res(null);
      }catch(e){ res(null); }
    }));
  }
  async function caricaFotoDaIdb(){
    const marcate = recipes.filter(r => r.photo === FOTO_MARKER);
    const db = await apriFotoDb();
    if(!db){
      fotoDbOk = false;
      marcate.forEach(r=>{ r.photo = ''; fotoNonCaricate.add(r.id); });
      return;
    }
    let keys = null, vals = null;
    const ok = await fotoTx('readonly', st=>{ keys = st.getAllKeys(); vals = st.getAll(); });
    if(!ok){
      marcate.forEach(r=>{ r.photo = ''; fotoNonCaricate.add(r.id); });
      return;
    }
    const mappa = new Map();
    keys.result.forEach((k, i)=> mappa.set(k, vals.result[i]));
    recipes.forEach(r=>{
      if(r.photo === FOTO_MARKER){
        const f = mappa.get(r.id);
        if(typeof f === 'string' && f){ r.photo = f; fotoConfermate.set(r.id, f); }
        else{ r.photo = ''; fotoNonCaricate.add(r.id); }
      }
    });
    // pulizia: foto di ricette che non esistono più
    const idsVivi = new Set(recipes.map(r => r.id).concat(cestino.map(e => e.recipe.id)));
    const orfane = keys.result.filter(k => !idsVivi.has(k));
    if(orfane.length) fotoTx('readwrite', st=>{ orfane.forEach(k => st.delete(k)); });
  }
  async function scriviFotoInCoda(){
    if(fotoFlushInCorso || !fotoInCoda.size) return;
    fotoFlushInCorso = true;
    const lotto = new Map(fotoInCoda); fotoInCoda.clear();
    const ok = await fotoTx('readwrite', st=>{ lotto.forEach((f, id)=> st.put(f, id)); });
    fotoFlushInCorso = false;
    if(!ok){ fotoDbOk = false; return; } // IndexedDB non utilizzabile: da ora le foto restano nel salvataggio principale
    lotto.forEach((f, id)=> fotoConfermate.set(id, f));
    saveRecipes(); // ora le foto confermate possono uscire dal salvataggio principale
    if(fotoInCoda.size) scriviFotoInCoda();
  }
  function recipesPerSalvataggio(forzaSnello){
    if(!fotoDbOk) return recipes;
    return recipes.map(r=>{
      const f = r.photo;
      if(!f) return fotoNonCaricate.has(r.id) ? { ...r, photo: FOTO_MARKER } : r;
      if(fotoConfermate.get(r.id) === f) return { ...r, photo: FOTO_MARKER };
      fotoInCoda.set(r.id, f);
      return forzaSnello ? { ...r, photo: FOTO_MARKER } : r;
    });
  }
  function saveRecipes(){
    let ok = false;
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipesPerSalvataggio(false)));
      ok = true;
    }catch(err){
      // Spazio esaurito: se la foto è in coda per IndexedDB, il salvataggio principale la lascia fuori.
      if(fotoDbOk && fotoInCoda.size){
        try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(recipesPerSalvataggio(true))); ok = true; }catch(e2){ ok = false; }
      }
      if(!ok) ok = safeStorageSet(STORAGE_KEY, JSON.stringify(recipesPerSalvataggio(false))); // mostra l'avviso di spazio esaurito
    }
    if(fotoInCoda.size) scriviFotoInCoda();
    scriviSuFileCollegato();
    return ok;
  }
  function saveRaccolte(){ const ok = safeStorageSet(RACCOLTE_KEY, JSON.stringify(raccolte)); scriviSuFileCollegato(); return ok; }
  function caricaRaccolte(){
    try{ const raw = localStorage.getItem(RACCOLTE_KEY); raccolte = raw ? JSON.parse(raw) : []; }catch(e){ raccolte = []; }
    if(!Array.isArray(raccolte)) raccolte = [];
    raccolte = raccolte.filter(x => x && x.id && x.name);
  }
  function saveRicettari(){ const ok = safeStorageSet(RICETTARI_KEY, JSON.stringify(ricettari)); scriviSuFileCollegato(); return ok; }

  // Ricetta -> id del suo ricettario, con fallback a quello di partenza per le ricette salvate
  // prima che esistesse questo campo (stesso stile difensivo già usato altrove nel file per i
  // campi aggiunti in versioni successive, es. r.tags || []).
  function recipeRicettarioId(r){ return (r && r.ricettarioId) || DEFAULT_RICETTARIO_ID; }
  function ricettarioById(id){ return ricettari.find(rb => rb.id === id) || ricettari[0] || { id: DEFAULT_RICETTARIO_ID, name: 'Il Mio Ricettario', cover: '' }; }
  function ricettarioName(id){ return ricettarioById(id).name; }

  // Riempie i due <select> che elencano i ricettari — il filtro nel Ricettario e quello nel
  // modulo ricetta — ogni volta che l'elenco dei ricettari cambia (creazione, rinomina,
  // eliminazione). Chiamata una volta all'avvio e dopo ogni modifica in "Gestisci ricettari".
  function refreshRicettarioSelects(){
    const filterEl = document.getElementById('ricettario-filter');
    const formEl = document.getElementById('f-ricettario');
    if(filterEl){
      const prevFilter = activeRicettarioFilter;
      filterEl.innerHTML = '<option value="">Tutti i ricettari</option>' +
        ricettari.map(rb => `<option value="${escapeAttr(rb.id)}">${escapeHtml(rb.name)}</option>`).join('');
      // Se il ricettario filtrato è stato eliminato nel frattempo, torna a "tutti".
      if(prevFilter && !ricettari.some(rb => rb.id === prevFilter)) activeRicettarioFilter = '';
      filterEl.value = activeRicettarioFilter;
    }
    if(formEl){
      const prevValue = formEl.value;
      formEl.innerHTML = ricettari.map(rb => `<option value="${escapeAttr(rb.id)}">${escapeHtml(rb.name)}</option>`).join('');
      if(prevValue && ricettari.some(rb => rb.id === prevValue)) formEl.value = prevValue;
    }
    const csvImportEl = document.getElementById('csv-import-scope');
    if(csvImportEl){
      const prevImp = csvImportEl.value;
      csvImportEl.innerHTML = ricettari.map(rb => `<option value="${escapeAttr(rb.id)}">${escapeHtml(rb.name)}</option>`).join('');
      if(prevImp && ricettari.some(rb => rb.id === prevImp)) csvImportEl.value = prevImp;
    }
    const csvScopeEl = document.getElementById('csv-ricettario-scope');
    if(csvScopeEl){
      const prevScope = csvScopeEl.value;
      csvScopeEl.innerHTML = '<option value="">Tutti i ricettari</option>' +
        ricettari.map(rb => `<option value="${escapeAttr(rb.id)}">${escapeHtml(rb.name)}</option>`).join('');
      if(prevScope && ricettari.some(rb => rb.id === prevScope)) csvScopeEl.value = prevScope;
    }
  }

  // ---------- Gestisci ricettari ----------
  const ricettariOverlay = document.getElementById('ricettari-overlay');
  const ricettariManageList = document.getElementById('ricettari-manage-list');
  let newRicettarioCoverData = '';

  function openRicettariManage(){
    renderRicettariManageList();
    ricettariOverlay.classList.add('active');
  }
  document.getElementById('ricettari-close').addEventListener('click', ()=> ricettariOverlay.classList.remove('active'));
  document.getElementById('manage-ricettari-btn').addEventListener('click', openRicettariManage);

  function renderRicettariManageList(){
    ricettariManageList.innerHTML = ricettari.map((rb, rbIdx)=>{
      const count = recipes.filter(r => recipeRicettarioId(r) === rb.id).length;
      const coverStyle = rb.cover ? `background-image:url('${rb.cover}');` : '';
      return `
        <div class="ricettario-row" data-id="${escapeAttr(rb.id)}">
          <div class="ricettario-row-cover${rb.cover ? '' : ' ricettario-row-cover-placeholder'}" style="${coverStyle}">${rb.cover ? '' : '📚'}</div>
          <div class="ricettario-row-main">
            <input type="text" class="ricettario-row-name" value="${escapeAttr(rb.name)}" ${rb.id === DEFAULT_RICETTARIO_ID ? '' : ''}>
            <div class="ricettario-row-count">${count} ricett${count===1?'a':'e'}</div>
          </div>
          <span class="ricettario-row-order">
            <button type="button" class="btn-ghost btn-small ricettario-row-up-btn" aria-label="Sposta ${escapeAttr(rb.name)} prima" title="Sposta prima" ${rbIdx === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="btn-ghost btn-small ricettario-row-down-btn" aria-label="Sposta ${escapeAttr(rb.name)} dopo" title="Sposta dopo" ${rbIdx === ricettari.length-1 ? 'disabled' : ''}>↓</button>
          </span>
          <input type="file" class="ricettario-row-cover-input" accept="image/*" style="display:none;">
          <button type="button" class="btn-ghost btn-small ricettario-row-cover-btn">📷 Copertina</button>
          <button type="button" class="btn-ghost btn-small ricettario-row-print-btn" title="Crea un PDF A4 orizzontale con tutte le ricette di questo ricettario" ${count === 0 ? 'disabled' : ''}>📄 PDF A4</button>
          <button type="button" class="btn-ghost btn-small ricettario-row-delete-btn" ${ricettari.length <= 1 ? 'disabled title="Deve restare almeno un ricettario"' : ''}>🗑 Elimina</button>
          <div class="ricettario-row-delete-panel" style="display:none;"></div>
        </div>`;
    }).join('');

    ricettariManageList.querySelectorAll('.ricettario-row').forEach(row=>{
      const id = row.dataset.id;
      const nameInput = row.querySelector('.ricettario-row-name');
      [['.ricettario-row-up-btn', -1], ['.ricettario-row-down-btn', 1]].forEach(([sel, dir])=>{
        row.querySelector(sel).addEventListener('click', ()=>{
          const from = ricettari.findIndex(rb => rb.id === id);
          const to = from + dir;
          if(from < 0 || to < 0 || to >= ricettari.length) return;
          const [mosso] = ricettari.splice(from, 1);
          ricettari.splice(to, 0, mosso);
          saveRicettari();
          refreshRicettarioSelects();
          renderRicettariManageList();
          // il focus resta sul pulsante appena usato (o sull'altro se è arrivato in cima/fondo)
          const nuovaRiga = ricettariManageList.querySelector(`.ricettario-row[data-id="${CSS.escape(id)}"]`);
          const btn = nuovaRiga && (nuovaRiga.querySelector(sel + ':not([disabled])') || nuovaRiga.querySelector('.ricettario-row-order button:not([disabled])'));
          if(btn) btn.focus();
          renderToday();
        });
      });
      nameInput.addEventListener('change', ()=>{
        const nuovo = nameInput.value.trim();
        if(!nuovo){ nameInput.value = ricettarioName(id); return; }
        const rb = ricettarioById(id);
        rb.name = nuovo;
        saveRicettari();
        refreshRicettarioSelects();
        renderList(); renderToday();
      });

      row.querySelector('.ricettario-row-print-btn').addEventListener('click', ()=>{
        const ordineCat = Object.keys(CATEGORY_COLORS);
        const lista = recipes.filter(r => !r.archived && recipeRicettarioId(r) === id)
          .sort((a, b) => (ordineCat.indexOf(a.category) - ordineCat.indexOf(b.category)) || a.name.localeCompare(b.name, 'it'));
        if(!lista.length){ alert('Questo ricettario non ha ricette da stampare.'); return; }
        ricettariOverlay.classList.remove('active');
        stampaElencoA4(lista, r => r.servings || 1, nomeFilePdf(ricettarioName(id)));
      });

      const coverInput = row.querySelector('.ricettario-row-cover-input');
      row.querySelector('.ricettario-row-cover-btn').addEventListener('click', ()=> coverInput.click());
      coverInput.addEventListener('change', ()=>{
        const file = coverInput.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = async (e)=>{
          const result = await openPhotoCropOverlay(e.target.result);
          coverInput.value = '';
          if(result){
            const rb = ricettarioById(id);
            rb.cover = result;
            saveRicettari();
            renderRicettariManageList();
            renderToday();
          }
        };
        reader.onerror = () => alert('Non è stato possibile leggere il file immagine scelto.');
        reader.readAsDataURL(file);
      });

      row.querySelector('.ricettario-row-delete-btn').addEventListener('click', ()=>{
        if(ricettari.length <= 1) return;
        const count = recipes.filter(r => recipeRicettarioId(r) === id).length;
        const panel = row.querySelector('.ricettario-row-delete-panel');
        if(count === 0){
          confirmDialog({ title: 'Elimina ricettario', message: `Vuoi eliminare il ricettario «${ricettarioName(id)}»? È vuoto.`, confirmText: 'Elimina', danger: true })
            .then(ok => { if(ok) eliminaRicettario(id, null); });
          return;
        }
        const altri = ricettari.filter(rb => rb.id !== id);
        panel.innerHTML = `
          <div style="font-size:var(--fs-sm);margin-bottom:8px;">Questo ricettario contiene ${count} ricett${count===1?'a':'e'}. Cosa vuoi farne?</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <select class="ricettario-move-target">${altri.map(rb=>`<option value="${escapeAttr(rb.id)}">${escapeHtml(rb.name)}</option>`).join('')}</select>
            <button type="button" class="btn-ghost btn-small ricettario-move-btn">Sposta qui ed elimina il volume</button>
            <button type="button" class="btn-ghost btn-small btn-danger-action ricettario-delete-all-btn">Elimina ricette e volume</button>
            <button type="button" class="btn-ghost btn-small ricettario-cancel-delete-btn">Annulla</button>
          </div>`;
        panel.style.display = 'block';
        panel.querySelector('.ricettario-move-btn').addEventListener('click', ()=>{
          const target = panel.querySelector('.ricettario-move-target').value;
          confirmDialog({ title: 'Sposta ed elimina', message: `Le ${count} ricett${count===1?'a':'e'} di «${ricettarioName(id)}» andranno in «${ricettarioName(target)}» e il ricettario verrà eliminato. Continuare?`, confirmText: 'Sposta ed elimina', danger: true })
            .then(ok => { if(ok) eliminaRicettario(id, target); });
        });
        panel.querySelector('.ricettario-delete-all-btn').addEventListener('click', ()=>{
          confirmDialog({ title: 'Elimina ricettario e ricette', message: `Verranno eliminati il ricettario «${ricettarioName(id)}» e le sue ${count} ricett${count===1?'a':'e'} (restano 30 giorni nel Cestino). Continuare?`, confirmText: 'Elimina tutto', danger: true })
            .then(ok => { if(ok) eliminaRicettario(id, 'ELIMINA_RICETTE'); });
        });
        panel.querySelector('.ricettario-cancel-delete-btn').addEventListener('click', ()=>{
          panel.style.display = 'none';
          panel.innerHTML = '';
        });
      });
    });
  }

  // target: id del ricettario dove spostare le ricette, 'ELIMINA_RICETTE' per eliminarle insieme
  // al volume, oppure null se il volume era già vuoto.
  function eliminaRicettario(id, target){
    if(target === 'ELIMINA_RICETTE'){
      const daTogliere = recipes.filter(r => recipeRicettarioId(r) === id);
      spostaNelCestino(daTogliere);
      recipes = recipes.filter(r => recipeRicettarioId(r) !== id);
      aggiornaVoceCestino();
    } else if(target){
      recipes.forEach(r=>{ if(recipeRicettarioId(r) === id) r.ricettarioId = target; });
    }
    ricettari = ricettari.filter(rb => rb.id !== id);
    if(activeRicettarioFilter === id) activeRicettarioFilter = '';
    saveRecipes(); saveRicettari();
    refreshRicettarioSelects();
    renderRicettariManageList(); renderList(); renderToday(); renderPlanningDays();
  }

  const ricettarioAddCoverInput = document.getElementById('ricettario-add-cover-input');
  const ricettarioAddCoverPreview = document.getElementById('ricettario-add-cover-preview');
  document.getElementById('ricettario-add-cover-btn').addEventListener('click', ()=> ricettarioAddCoverInput.click());
  ricettarioAddCoverInput.addEventListener('change', ()=>{
    const file = ricettarioAddCoverInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (e)=>{
      const result = await openPhotoCropOverlay(e.target.result);
      ricettarioAddCoverInput.value = '';
      if(result){
        newRicettarioCoverData = result;
        ricettarioAddCoverPreview.style.backgroundImage = `url('${result}')`;
        ricettarioAddCoverPreview.textContent = '';
      }
    };
    reader.onerror = () => alert('Non è stato possibile leggere il file immagine scelto.');
    reader.readAsDataURL(file);
  });
  document.getElementById('ricettario-add-confirm-btn').addEventListener('click', ()=>{
    const nameInput = document.getElementById('ricettario-add-name');
    const nome = nameInput.value.trim();
    if(!nome){ alert('Dai un nome al nuovo ricettario.'); return; }
    ricettari.push({ id: cryptoId(), name: nome, cover: newRicettarioCoverData });
    saveRicettari();
    nameInput.value = '';
    newRicettarioCoverData = '';
    ricettarioAddCoverPreview.style.backgroundImage = '';
    ricettarioAddCoverPreview.textContent = '📚';
    refreshRicettarioSelects();
    renderRicettariManageList();
    renderToday();
  });
  function settimanaHaContenuto(w){
    return !!w && (DAYS.some(d => (w.plan && w.plan[d] || []).length) || DAYS.some(d => w.notes && w.notes[d] && Object.keys(w.notes[d]).length));
  }
  function inizializzaSettimane(){
    let salvate = null;
    try{ const raw = localStorage.getItem(PLAN_WEEKS_KEY); salvate = raw ? JSON.parse(raw) : null; }catch(e){ salvate = null; }
    planWeekStart = realMonday();
    if(salvate && typeof salvate === 'object'){
      planWeeks = salvate;
      const w = planWeeks[planWeekStart] || {};
      weekPlan = w.plan || {}; weekNotes = w.notes || {};
    }else{
      // Prima volta con le date: la settimana "ricorrente" di prima diventa quella corrente.
      planWeeks = {};
      salvaSettimane();
    }
  }
  function salvaSettimane(){
    planWeeks[planWeekStart] = { plan: weekPlan, notes: weekNotes };
    Object.keys(planWeeks).forEach(k => { if(!settimanaHaContenuto(planWeeks[k])) delete planWeeks[k]; });
    return safeStorageSet(PLAN_WEEKS_KEY, JSON.stringify(planWeeks));
  }
  function setPlanWeek(monday){
    salvaSettimane();
    planWeekStart = monday;
    const w = planWeeks[monday] || {};
    weekPlan = w.plan || {}; weekNotes = w.notes || {};
  }
  function settimaneComplete(){ salvaSettimane(); return planWeeks; }
  function saveWeek(){ salvaSettimane(); const ok = safeStorageSet(WEEK_KEY, JSON.stringify(weekPlan)); scriviSuFileCollegato(); return ok; }
  function saveMealTypes(){ const ok = safeStorageSet(MEALTYPES_KEY, JSON.stringify(mealTypes)); scriviSuFileCollegato(); return ok; }
  function savePantry(text){ return safeStorageSet(PANTRY_KEY, text); }
  function savePlanServings(){ return safeStorageSet(PLAN_SERVINGS_KEY, String(planServings)); }
  function savePreviousWeek(plan){ return safeStorageSet(PREV_WEEK_KEY, JSON.stringify(plan)); }
  function saveDispensaItems(){ const ok = safeStorageSet(DISPENSA_ITEMS_KEY, JSON.stringify(dispensaItems)); scriviSuFileCollegato(); return ok; }
  function saveSpesaLista(){ const ok = safeStorageSet(SPESA_LISTA_KEY, JSON.stringify(spesaLista)); scriviSuFileCollegato(); return ok; }
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
    return { recipes, ricettari, raccolte, weekPlan, planWeeks: settimaneComplete(), mealTypes, dispensaItems, shoppingExtraItems, weekNotes, spesaLista };
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
    if (Array.isArray(dati.ricettari) && dati.ricettari.length) safeStorageSet(RICETTARI_KEY, JSON.stringify(dati.ricettari));
    if (Array.isArray(dati.raccolte)) safeStorageSet(RACCOLTE_KEY, JSON.stringify(dati.raccolte));
    if (dati.weekPlan) safeStorageSet(WEEK_KEY, JSON.stringify(dati.weekPlan));
    if (dati.planWeeks && typeof dati.planWeeks === 'object') safeStorageSet(PLAN_WEEKS_KEY, JSON.stringify(dati.planWeeks));
    if (Array.isArray(dati.mealTypes)) safeStorageSet(MEALTYPES_KEY, JSON.stringify(dati.mealTypes));
    if (Array.isArray(dati.dispensaItems)) safeStorageSet(DISPENSA_ITEMS_KEY, JSON.stringify(dati.dispensaItems));
    if (Array.isArray(dati.shoppingExtraItems)) safeStorageSet(SHOPPING_EXTRA_KEY, JSON.stringify(dati.shoppingExtraItems));
    if (dati.weekNotes && typeof dati.weekNotes === 'object') safeStorageSet(WEEK_NOTES_KEY, JSON.stringify(dati.weekNotes));
    if (Array.isArray(dati.spesaLista)) safeStorageSet(SPESA_LISTA_KEY, JSON.stringify(dati.spesaLista));
  }

  function mostraBannerRiconnessione(handle){
    fileCollegatoInAttesaDiPermesso = handle;
    document.getElementById('file-reconnect-text').textContent =
      `🔓 Il file "${handle.name}" ha bisogno di conferma per riconnettersi (i browser la richiedono a ogni sessione, per sicurezza). Se non lo trova, usa "Scegli di nuovo il file" e cerca la tua cartella «Il Mio Ricettario». Intanto i dati restano salvati nel browser.`;
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
    if (!confirm('Vuoi smettere di usare il file di salvataggio?\n\nI tuoi dati restano salvati nella memoria di questo browser e non perdi nulla. Potrai ricollegare un file quando vuoi da "Backup e CSV".')) return;
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
        await ricaricaDatiInMemoria(); // niente ricarica della pagina: il permesso sul file vale solo finché la pagina resta aperta
      } else {
        alert('Permesso non concesso: il file resta scollegato per questa sessione. Puoi riprovare o collegarne un altro dal menu "Backup e CSV".');
      }
    } catch (err) {
      console.error('Errore nel richiedere il permesso sul file collegato:', err);
      alert('Non è stato possibile riconnettersi al file (forse è stato spostato, rinominato o il browser ha perso il collegamento). Usa "Scegli di nuovo il file" per indicare dove si trova adesso.');
    }
  });

  // Se il collegamento automatico non trova più il file, si può indicarlo di nuovo a mano:
  // il selettore si apre nell'ultima cartella usata.
  document.getElementById('file-reconnect-pick-btn').addEventListener('click', async () => {
    try {
      const [handle] = await apriSelettoreFile('showOpenFilePicker', {
        types: [{ description: 'File dati Il Mio Ricettario', accept: { 'application/json': ['.json'] } }]
      });
      if (!(await assicuraPermessoScrittura(handle))) { alert(MSG_PERMESSO_SCRITTURA); return; }
      if (!confirm('I dati salvati in questo file sostituiranno quelli che vedi ora. Continuare?')) return;
      await caricaDatiDaFileCollegato(handle);
      try { await salvaHandleFileSalvato(handle); } catch (err) { console.error(err); }
      fileCollegatoHandle = handle; fileCollegatoInAttesaDiPermesso = null;
      document.getElementById('file-reconnect-banner').style.display = 'none';
      await ricaricaDatiInMemoria();
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      console.error('Errore scegliendo di nuovo il file:', err);
      alert(messaggioErroreFileSystem(err) || 'Non è stato possibile aprire il file: verifica che sia un file dati valido di questo sito.');
    }
  });

  /** Rilegge tutti i dati (dal browser, dopo che il file collegato li ha aggiornati) e ridisegna l'app
   * SENZA ricaricare la pagina: con la ricarica, su alcuni browser (es. pagina aperta come file sul
   * telefono) il permesso appena concesso sul file andava perso e tornava il messaggio "Riconnetti". */
  async function ricaricaDatiInMemoria(){
    loadRecipes();
    caricaCestino();
    await caricaFotoDaIdb();
    caricaRaccolte();
    refreshRaccolteUi();
    aggiornaVoceCestino();
    recipes = recipes.map(migrateRecipe);
    saveRecipes();
    migrateWeekPlan();
    planServingsInput.value = planServings;
    updatePantryPanelSub();
    refreshRicettarioSelects();
    renderList();
    switchView('today');
    aggiornaTopbarAlerts();
    aggiornaControlliMenuStorage();
    aggiornaBannerBackup();
  }

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

  /** Apre i selettori di file con un "id" fisso: Chrome ricorda l'ultima cartella usata con quell'id,
   * quindi il file dati e i backup si ritrovano nella stessa cartella (es. «Il Mio Ricettario»).
   * Se il browser non conosce le opzioni extra, riprova senza. */
  async function apriSelettoreFile(nome, opzioni){
    try{
      const extra = { id: 'il-mio-ricettario', startIn: 'documents' };
      // showOpenFilePicker di default dà un file in SOLA LETTURA: senza mode readwrite il browser
      // chiederebbe di nuovo il permesso di scrittura a ogni apertura ("Riconnetti" all'infinito).
      if(nome === 'showOpenFilePicker') extra.mode = 'readwrite';
      return await window[nome](Object.assign(extra, opzioni));
    }catch(err){
      if(err instanceof TypeError) return await window[nome](opzioni);
      throw err;
    }
  }

  /** showOpenFilePicker concede solo la LETTURA: senza chiedere subito anche la scrittura, dopo il
   * ricaricamento della pagina il file risulta "da riconnettere" e le modifiche non vi verrebbero scritte.
   * Va chiamata subito dopo la scelta del file, mentre il tocco dell'utente è ancora valido. */
  async function assicuraPermessoScrittura(handle){
    try{
      if(await handle.queryPermission({ mode: 'readwrite' }) === 'granted') return true;
      return await handle.requestPermission({ mode: 'readwrite' }) === 'granted';
    }catch(err){ console.error('Permesso di scrittura sul file:', err); return false; }
  }
  const MSG_PERMESSO_SCRITTURA = 'Senza il permesso di scrittura il file non può essere tenuto aggiornato: collegamento annullato. Riprova e, quando il browser lo chiede, scegli di consentire la modifica del file (meglio se "a ogni visita", quando l\'opzione compare).';

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
      const handle = await apriSelettoreFile('showSaveFilePicker', {
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
      const [handle] = await apriSelettoreFile('showOpenFilePicker', {
        types: [{ description: 'File dati Il Mio Ricettario', accept: { 'application/json': ['.json'] } }]
      });
      if (!(await assicuraPermessoScrittura(handle))) { statusEl.textContent = MSG_PERMESSO_SCRITTURA; return; }
      const confermato = confirm('Aprire questo file sostituirà quello che vedi ora (ricette, dispensa, pianificazione) con il contenuto salvato nel file. Continuare?');
      if (!confermato) return;
      await caricaDatiDaFileCollegato(handle);
      safeStorageSet(STORAGE_CHOICE_DISMISSED_KEY, '1');
      try {
        await salvaHandleFileSalvato(handle);
      } catch (err) {
        console.error('File aperto correttamente, ma non è stato possibile ricordarlo per la prossima visita:', err);
      }
      fileCollegatoHandle = handle; fileCollegatoInAttesaDiPermesso = null;
      document.getElementById('file-reconnect-banner').style.display = 'none';
      chiudiSceltaStorage();
      await ricaricaDatiInMemoria();
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

  // Nessuna ricetta di esempio inclusa: l'elenco parte vuoto e le ricette le aggiungi tu.
  function seedData(){ return []; }
  function cryptoId(){ return 'r_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8); }

  function migrateRecipe(r){
    if(r.favorite === undefined) r.favorite = false;
    r.rating = Math.max(0, Math.min(5, parseInt(r.rating, 10) || 0));
    if(!Array.isArray(r.raccolte)) r.raccolte = [];
    if(r.photo === undefined) r.photo = '';
    if(r.lastMade === undefined) r.lastMade = null;
    if(!Array.isArray(r.tags)) r.tags = [];
    if(!Array.isArray(r.allergens)) r.allergens = [];
    if(r.archived === undefined) r.archived = false;
    if(r.freezable === undefined) r.freezable = false;
    if(r.timesMade === undefined) r.timesMade = r.lastMade ? 1 : 0;
    if(r.cookerType === undefined) r.cookerType = '';
    if(!Array.isArray(r.steps)) r.steps = [];
    if(!r.ricettarioId) r.ricettarioId = DEFAULT_RICETTARIO_ID;
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

  // Rende una card/riga cliccabile (un <div> con solo un listener "click")
  // raggiungibile e azionabile da tastiera: Tab la mette a fuoco, Invio/Spazio
  // la "clicca". Senza questo, chi naviga da tastiera non può aprirla.
  function makeKeyboardClickable(el, label){
    if(!el) return;
    if(!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if(!el.hasAttribute('role')) el.setAttribute('role', 'button');
    if(label && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', label);
    el.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
        if(e.target !== el) return; // non intercettare Invio/Spazio su un campo interno (es. ricerca)
        e.preventDefault();
        el.click();
      }
    });
  }
  function normalize(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }

  // Confronto "a parola intera" fra due testi gi\u00e0 normalizzati, usato dove serve riconoscere lo
  // stesso prodotto/ingrediente (Dispensa <-> ricetta) senza i falsi positivi di un contains
  // grezzo: "sale" non deve risultare contenuto in "insalata", n\u00e9 "pepe" in "peperone". Dopo
  // normalize() restano solo lettere/cifre ascii, spazi e punteggiatura, quindi \b individua
  // correttamente i confini anche per termini con pi\u00f9 parole (es. "farina 00").
  function contieneTermineIntero(testoNorm, terminoNorm){
    if(!testoNorm || !terminoNorm) return false;
    if(testoNorm === terminoNorm) return true;
    const escaped = terminoNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try{
      return new RegExp(`\\b${escaped}\\b`).test(testoNorm);
    }catch(err){ return false; }
  }

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

  // ---------- Icone (sprite SVG in index.html) e piccoli pezzi di markup condivisi ----------
  function icon(name, cls){
    return `<svg class="ico${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  }
  function porzioniLabel(n){ return `${n} ${n === 1 ? 'porzione' : 'porzioni'}`; }
  // Miniatura della ricetta: la foto, oppure un segnaposto tinto con la categoria
  function recipeThumbHtml(r){
    return r.photo
      ? `<img class="thumb" src="${r.photo}" alt="${escapeAttr(r.name)}">`
      : `<div class="thumb thumb-placeholder" aria-hidden="true"><span>${CATEGORY_ICONS[r.category] || '🍽️'}</span></div>`;
  }
  // Solo i dati davvero presenti: il tempo compare se c'è, le porzioni hanno sempre un valore
  function recipeMetaHtml(r){
    return `${r.time ? `<span>${icon('clock')} ${r.time} min</span>` : ''}<span>${icon('user')} ${porzioniLabel(r.servings)}</span>${r.rating ? `<span class="rating-mini" title="Il tuo voto">★ ${r.rating}</span>` : ''}`;
  }
  function recipeTagsHtml(r){
    return `<span class="cat-tag">${escapeHtml(recipeCategoryLabel(r))}</span>`
      + (ricettari.length > 1 ? `<span class="ricettario-tag" title="Ricettario">${escapeHtml(ricettarioName(recipeRicettarioId(r)))}</span>` : '')
      + (recipeHasPressure(r) ? '<span class="pressure-badge" title="Ha passaggi per pentola a pressione">🍲</span>' : '')
      + (recipeHasRobot(r) ? '<span class="robot-badge" title="Ha passaggi con impostazioni robot da cucina">🤖</span>' : '')
      + (recipeHasAirFryer(r) ? '<span class="airfryer-badge" title="Ha passaggi per friggitrice ad aria">🌀</span>' : '')
      + (recipeIsTraditional(r) ? '<span class="traditional-badge" title="Ricetta tradizionale, senza robot, pentola a pressione o friggitrice ad aria">🔥</span>' : '');
  }

  // ---------- List rendering ----------
  const listEl = document.getElementById('recipe-list');
  const searchEl = document.getElementById('search');
  const categoryFilterEl = document.getElementById('category-filter');
  const ricettarioFilterEl = document.getElementById('ricettario-filter');
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
      case 'rating': return arr.sort((a,b)=> (b.rating||0) - (a.rating||0) || a.name.localeCompare(b.name));
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
    return pantryList.some(p=> p && (contieneTermineIntero(target, p) || contieneTermineIntero(p, target)));
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
      return nome && (contieneTermineIntero(nome, n) || contieneTermineIntero(n, nome));
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
  function findDispensaMatch(ingredientName){
    const target = normalize(ingredientName);
    const exact = dispensaItems.find(it => normalize(it.name) === target);
    if(exact) return { match: exact, isApprox: false, ambiguous: [] };
    const fuzzy = dispensaItems.filter(it=>{
      const p = normalize(it.name);
      return p && (contieneTermineIntero(target, p) || contieneTermineIntero(p, target));
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
    const scale = entryServings(entry) / (recipe.servings || 1);
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
  function recipeHasAirFryer(r){
    return (r.steps || []).some(s => !!(s.airFryerTemp || s.airFryerPreheat));
  }
  function recipeIsTraditional(r){
    return !recipeHasRobot(r) && !recipeHasPressure(r) && !recipeHasAirFryer(r);
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
      message: `${nomi}\n\nFiniranno nel Cestino (menu ⋯) per 30 giorni; subito dopo potrai anche toccare «Annulla».`,
      confirmText: `Elimina ${n} ricett${n===1?'a':'e'}`,
      danger: true
    });
    if(!ok) return;
    eliminaRicetteConAnnulla(recipes.filter(r => ricetteSelezionate.has(r.id)), `${n} ricett${n===1?'a eliminata':'e eliminate'}`);
    impostaModalitaSelezione(false);
    renderPlanningDays();
  });

  // Applica a tutte le ricette gli stessi filtri (ricerca, categoria, tempo, preferite, metodo di
  // cottura, tag, allergeni esclusi, ingredienti esclusi, archiviate) usati dall'elenco a schermo —
  // estratta a parte così anche l'esportazione PDF dell'intero ricettario può riutilizzarla ed
  // esportare esattamente le ricette che si vedono in quel momento, non sempre tutte.
  let ignoraSottocategoria = false;
  function getFilteredRecipes(){
    const q = normalize(searchEl.value);
    const cat = categoryFilterEl.value;
    const timeFilter = timeFilterEl.value;
    return recipes.filter(r=>{
      if(showArchivedOnly){ if(!r.archived) return false; }
      else { if(r.archived) return false; }
      if(favoritesOnly && !r.favorite) return false;
      if(pressureOnly && !recipeHasPressure(r)) return false;
      if(robotOnly && !recipeHasRobot(r)) return false;
      if(airFryerOnly && !recipeHasAirFryer(r)) return false;
      if(traditionalOnly && !recipeIsTraditional(r)) return false;
      const matchesCat = !cat || r.category === cat;
      if(!matchesCat) return false;
      if(cat && subcategoryFilter && subcategoryFilterCat === cat && !ignoraSottocategoria && r.subcategory !== subcategoryFilter) return false;
      if(activeRicettarioFilter && recipeRicettarioId(r) !== activeRicettarioFilter) return false;
      if(minRatingFilter === 'none'){ if(r.rating) return false; }
      else if(minRatingFilter && (r.rating || 0) < parseInt(minRatingFilter, 10)) return false;
      if(raccoltaFilter && !(r.raccolte || []).includes(raccoltaFilter)) return false;
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
      const inName = normalize(r.name).includes(q);
      const inIngr = r.ingredients.some(i=>normalize(i.name).includes(q));
      return inName || inIngr;
    });
  }

  const LIST_CHUNK = 48;
  let listTotal = 0, listFilteredIds = [], listSentinelObserver = null;
  function renderCardsChunked(items, makeCard){
    if(listSentinelObserver){ listSentinelObserver.disconnect(); listSentinelObserver = null; }
    let shown = 0;
    const sentinel = document.createElement('div');
    sentinel.className = 'list-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    const more = ()=>{
      const frag = document.createDocumentFragment();
      const end = Math.min(items.length, shown + LIST_CHUNK);
      for(; shown < end; shown++) frag.appendChild(makeCard(items[shown]));
      if(sentinel.parentNode) sentinel.remove();
      listEl.appendChild(frag);
      if(shown < items.length){
        listEl.appendChild(sentinel);
        if(!listSentinelObserver && 'IntersectionObserver' in window){
          listSentinelObserver = new IntersectionObserver(entries=>{
            if(entries.some(en => en.isIntersecting)) more();
          }, { rootMargin: '900px 0px' });
        }
        if(listSentinelObserver) listSentinelObserver.observe(sentinel);
        else more(); // browser senza IntersectionObserver: disegna tutto
      }else if(listSentinelObserver){ listSentinelObserver.disconnect(); listSentinelObserver = null; }
    };
    more();
  }
  let elencoIds = []; // ordine delle ricette nell'elenco mostrato
  let viewSeq = [];   // ordine per i pulsanti Precedente / Successiva nella scheda
  function renderList(){
    syncCategoryChips();
    syncSubcategoryChips();
    syncFavoritesUi();
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
      elencoIds = scored.map(x => x.recipe.id);
      if(scored.length === 0){
        const messaggio = priorityPantryNames.length
          ? 'Nessuna ricetta usa i prodotti che scadono a breve con i filtri attuali. Prova a rimuovere filtri o ad aggiungere una ricetta che li utilizzi.'
          : `Nessuna ricetta${limit === Infinity ? '' : (limit === 0 ? ' già pronta con quello che hai' : ` con al massimo ${limit} ingredient${limit===1?'e':'i'} mancant${limit===1?'e':'i'}`)} in questa categoria/ricerca. Prova ad alzare la soglia di ingredienti mancanti, oppure aggiungi qualcosa in Dispensa.`;
        listEl.innerHTML = `<div class="empty-state">${messaggio}</div>`;
        return;
      }
      listTotal = scored.length;
      renderCardsChunked(scored, ({recipe:r, match, priorityMatches})=>{
        const card = document.createElement('div');
        card.className = 'card';
        card.style.setProperty('--cat-color', CATEGORY_COLORS[r.category] || '#8A8F86');
        const ready = match.missing.length === 0;
        const scarso = match.insufficienti.length > 0;
        const badge = ready
          ? (scarso ? `<span class="match-badge scarso">⚠ Quantità scarse</span>`
                    : `<span class="match-badge ready">✓ Puoi farla</span>`)
          : `<span class="match-badge missing">Manca ${match.missing.length} ingr.</span>`;
        card.innerHTML = `
          ${recipeThumbHtml(r)}
          <div class="card-body">
            ${badge}
            ${ready ? `<div class="pantry-caveat">Controllare le quantità effettive che hai a disposizione</div>` : ''}
            ${priorityMatches.length ? `<div class="match-badge ready">Usa prima: ${priorityMatches.map(escapeHtml).join(', ')}</div>` : ''}
            <h3>${escapeHtml(r.name)}</h3>
            <div class="card-badges">${recipeTagsHtml(r)}</div>
            <div class="meta">${recipeMetaHtml(r)}</div>
            ${!ready?`<div class="missing-list"><b>Ti manca:</b> ${match.missing.map(escapeHtml).join(', ')}</div>`:''}
            ${scarso?`<div class="missing-list scarso"><b>Per ${porzioniRichieste} porzioni potrebbe non bastare:</b> ${
              match.insufficienti.map(i=>`${escapeHtml(i.nome)} (servono ${roundNice(i.serve)} ${escapeHtml(i.unita)}, hai ${roundNice(i.hai)})`).join(', ')
            }</div>`:''}
          </div>
        `;
        card.addEventListener('click', ()=> openView(r.id, true));
        makeKeyboardClickable(card, r.name);
        return card;
      });
      return;
    }

    if(filtered.length === 0){
      const nessunaPreferita = favoritesOnly && !showArchivedOnly && !recipes.some(r => r.favorite && !r.archived);
      listEl.innerHTML = nessunaPreferita
        ? '<div class="empty-state">Non hai ancora ricette preferite: tocca il cuore su una ricetta per ritrovarla qui.</div>'
        : (favoritesOnly && categoryFilterEl.value
          ? '<div class="empty-state">Nessuna ricetta preferita in questa categoria. Scegli un\'altra categoria o "Tutte".</div>'
          : '<div class="empty-state">Nessuna ricetta trovata. Prova a cercare altro, oppure aggiungine una nuova.</div>');
      return;
    }

    filtered = sortRecipes(filtered);
    elencoIds = filtered.map(r => r.id);
    listTotal = filtered.length;
    listFilteredIds = filtered.map(r => r.id);

    renderCardsChunked(filtered, r=>{
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.recipeId = r.id;
      const selezionata = ricetteSelezionate.has(r.id);
      if(selectionMode && selezionata) card.classList.add('selezionata');
      card.style.setProperty('--cat-color', CATEGORY_COLORS[r.category] || '#8A8F86');
      card.innerHTML = `
        ${selectionMode
          ? `<span class="card-select-box" aria-hidden="true">${selezionata ? '☑' : '☐'}</span>`
          : `<button class="star ${r.favorite?'active':''}" data-id="${r.id}" aria-pressed="${r.favorite ? 'true' : 'false'}" aria-label="${r.favorite ? 'Togli dai preferiti' : 'Aggiungi ai preferiti'}: ${escapeAttr(r.name)}">${icon('heart')}</button>`}
        ${recipeThumbHtml(r)}
        <div class="card-body">
          <h3>${escapeHtml(r.name)}</h3>
          <div class="card-badges">${recipeTagsHtml(r)}</div>
          <div class="meta">${recipeMetaHtml(r)}</div>
          ${r.lastMade ? `<div class="last-made">${lastMadeLabel(r.lastMade)}</div>` : ''}
        </div>
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
          openView(r.id, true);
        }
      });
      makeKeyboardClickable(card, r.name);
      return card;
    });
  }

  // Con molte ricette le schede si disegnano a blocchi: le prime subito, le altre quando
  // ci si avvicina in fondo all'elenco (e la ricerca aspetta un attimo prima di partire).
  let searchTimer = null;
  searchEl.addEventListener('input', ()=>{ clearTimeout(searchTimer); searchTimer = setTimeout(renderList, 140); });
  categoryFilterEl.addEventListener('change', renderList);
  ricettarioFilterEl.addEventListener('change', ()=>{
    activeRicettarioFilter = ricettarioFilterEl.value;
    renderList();
  });
  timeFilterEl.addEventListener('change', renderList);
  const ratingFilterEl = document.getElementById('rating-filter');
  const raccoltaFilterEl = document.getElementById('raccolta-filter');
  ratingFilterEl.addEventListener('change', ()=>{ minRatingFilter = ratingFilterEl.value; renderList(); });
  raccoltaFilterEl.addEventListener('change', ()=>{ raccoltaFilter = raccoltaFilterEl.value; renderList(); });
  function refreshRaccolteUi(){
    const cur = raccoltaFilter;
    raccoltaFilterEl.innerHTML = '<option value="">Tutte le ricette</option>' + raccolte.map(x => `<option value="${escapeAttr(x.id)}">${escapeHtml(x.name)}</option>`).join('');
    if(raccolte.some(x => x.id === cur)) raccoltaFilterEl.value = cur; else { raccoltaFilter = ''; raccoltaFilterEl.value = ''; }
    if(typeof currentViewId !== 'undefined' && currentViewId) renderViewRaccolteRating();
  }
  sortSelectEl.addEventListener('change', ()=>{
    sortMode = sortSelectEl.value;
    renderList();
  });
  function syncFavoritesUi(){
    favoritesFilterBtn.classList.toggle('btn-gold', favoritesOnly);
    favoritesFilterBtn.classList.toggle('btn-ghost', !favoritesOnly);
    favoritesFilterBtn.setAttribute('aria-pressed', String(favoritesOnly));
    const title = document.getElementById('recipes-title');
    if(title) title.textContent = favoritesOnly ? 'Preferiti' : 'Le mie ricette';
    const sub = document.getElementById('recipes-sub');
    if(sub) sub.textContent = favoritesOnly ? 'Le ricette che hai segnato con il cuore, per categoria.' : 'Tutte le tue ricette, organizzate in un posto.';
    updateNavActive();
  }
  function setFavoritesOnly(v){
    favoritesOnly = !!v;
    renderList();
  }
  favoritesFilterBtn.addEventListener('click', ()=> setFavoritesOnly(!favoritesOnly));

  // Chip delle categorie: specchio del menu nascosto #category-filter (che resta la
  // fonte del valore, così tutto il resto del codice continua a leggerlo da lì).
  const categoryChipsEl = document.getElementById('category-chips');
  function buildCategoryChips(){
    categoryChipsEl.innerHTML = '';
    Array.from(categoryFilterEl.options).forEach(opt=>{
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.dataset.value = opt.value;
      b.textContent = opt.value === '' ? 'Tutte' : opt.textContent;
      b.addEventListener('click', ()=>{
        categoryFilterEl.value = opt.value;
        renderList();
      });
      categoryChipsEl.appendChild(b);
    });
  }
  function syncCategoryChips(){
    // Quante ricette ci sono per categoria, con gli stessi filtri attuali (ricerca, preferite…)
    // tranne la categoria stessa: così, ad esempio in "Preferiti", si vede subito in quali
    // categorie ci sono ricette e quali sono vuote.
    const corrente = categoryFilterEl.value;
    categoryFilterEl.value = '';
    const conteggi = {};
    let totale = 0;
    try{
      getFilteredRecipes().forEach(r=>{ conteggi[r.category] = (conteggi[r.category] || 0) + 1; totale++; });
    }finally{ categoryFilterEl.value = corrente; }
    categoryChipsEl.querySelectorAll('.chip').forEach(b=>{
      const on = b.dataset.value === corrente;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
      const n = b.dataset.value === '' ? totale : (conteggi[b.dataset.value] || 0);
      if(!b.dataset.label) b.dataset.label = b.textContent;
      b.innerHTML = `${escapeHtml(b.dataset.label)} <span class="chip-n">${n}</span>`;
      b.classList.toggle('chip-empty', n === 0 && !on);
      b.setAttribute('aria-label', `${b.dataset.label}: ${n} ricett${n === 1 ? 'a' : 'e'}`);
    });
  }
  const subcategoryChipsEl = document.getElementById('subcategory-chips');
  function syncSubcategoryChips(){
    const cat = categoryFilterEl.value;
    const lista = SOTTOCATEGORIE[cat];
    if(!cat || !lista){ subcategoryChipsEl.style.display = 'none'; subcategoryChipsEl.innerHTML = ''; return; }
    if(subcategoryFilterCat !== cat){ subcategoryFilter = ''; subcategoryFilterCat = cat; }
    const conteggi = {}; let totale = 0;
    ignoraSottocategoria = true;
    try{ getFilteredRecipes().forEach(r=>{ totale++; if(r.subcategory) conteggi[r.subcategory] = (conteggi[r.subcategory] || 0) + 1; }); }
    finally{ ignoraSottocategoria = false; }
    // sottocategorie personalizzate presenti nelle ricette (da un import) si aggiungono in fondo
    const voci = lista.concat(Object.keys(conteggi).filter(k => !lista.includes(k)));
    subcategoryChipsEl.innerHTML = '';
    [['', 'Tutte']].concat(voci.map(v => [v, v])).forEach(([val, label])=>{
      const n = val === '' ? totale : (conteggi[val] || 0);
      const on = subcategoryFilter === val;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip' + (on ? ' active' : '') + (n === 0 && !on ? ' chip-empty' : '');
      b.dataset.value = val; b.setAttribute('aria-pressed', String(on));
      b.innerHTML = `${escapeHtml(label)} <span class="chip-n">${n}</span>`;
      b.addEventListener('click', ()=>{ subcategoryFilter = val; subcategoryFilterCat = cat; renderList(); });
      subcategoryChipsEl.appendChild(b);
    });
    subcategoryChipsEl.style.display = 'flex';
  }
  buildCategoryChips();
  const archivedFilterBtn = document.getElementById('archived-filter-btn');
  archivedFilterBtn.addEventListener('click', ()=>{
    showArchivedOnly = !showArchivedOnly;
    archivedFilterBtn.textContent = showArchivedOnly ? 'Mostra attive' : 'Mostra archiviate';
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
  const airFryerFilterBtn = document.getElementById('airfryer-filter-btn');
  airFryerFilterBtn.addEventListener('click', ()=>{
    airFryerOnly = !airFryerOnly;
    airFryerFilterBtn.classList.toggle('active', airFryerOnly);
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
    const q = normalize(query);
    const matches = dispensaItems.filter(it => !q || normalize(it.name).includes(q))
      .sort((a,b) => a.name.localeCompare(b.name));
    pantryPickerList.innerHTML = matches.length ? matches.map(it => {
      const checked = pantryPickerDraft.has(it.id);
      return `
      <div class="recipe-picker-item" data-id="${it.id}">
        <span class="card-select-box" style="position:static;">${checked ? '☑' : '☐'}</span>
        <span class="cat-dot" style="background:${PANTRY_CATEGORY_COLORS[it.category] || '#8A8F86'}"></span>
        <span class="name">${escapeHtml(it.name)}</span>
        <span class="meta">${escapeHtml(it.category)}</span>
      </div>
    `;}).join('') : '<div class="recipe-picker-empty">Nessun prodotto in dispensa. Aggiungine uno dalla vista Dispensa.</div>';
    pantryPickerList.querySelectorAll('.recipe-picker-item').forEach(item=>{
      item.addEventListener('click', ()=>{
        const id = item.dataset.id;
        if(pantryPickerDraft.has(id)) pantryPickerDraft.delete(id);
        else pantryPickerDraft.add(id);
        renderPantryPickerList(pantryPickerSearch.value);
      });
      makeKeyboardClickable(item);
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
    const count = (pressureOnly?1:0) + (robotOnly?1:0) + (airFryerOnly?1:0) + (traditionalOnly?1:0) + activeTagFilters.size + activeAllergenExclusions.size + (excludeItems.length?1:0);
    advFiltersToggle.textContent = count ? `Cottura, tag ed esclusioni (${count}) ▾` : 'Cottura, tag ed esclusioni ▾';
    updateFiltersBadge();
  }
  // Numero di filtri attivi (oltre a ricerca e categoria) accanto al pulsante "Filtri"
  function updateFiltersBadge(){
    const n = (pressureOnly?1:0) + (robotOnly?1:0) + (airFryerOnly?1:0) + (traditionalOnly?1:0)
      + activeTagFilters.size + activeAllergenExclusions.size + (excludeItems.length?1:0)
      + (activeRicettarioFilter ? 1 : 0) + (timeFilterEl.value ? 1 : 0) + (minRatingFilter ? 1 : 0) + (raccoltaFilter ? 1 : 0) + (favoritesOnly ? 1 : 0) + (showArchivedOnly ? 1 : 0);
    const badge = document.getElementById('filters-badge');
    if(badge){ badge.textContent = String(n); badge.hidden = !n; }
    const btn = document.getElementById('filters-open-btn');
    if(btn){
      btn.classList.toggle('has-filters', n > 0);
      btn.setAttribute('aria-label', n ? `Filtri: ${n} attiv${n===1?'o':'i'}` : 'Filtri');
    }
  }
  advFiltersToggle.addEventListener('click', ()=>{
    const opening = advFiltersPanel.style.display === 'none';
    advFiltersPanel.style.display = opening ? 'block' : 'none';
    advFiltersToggle.classList.toggle('active', opening);
  });

  // ---------- Finestra "Filtri" ----------
  const filtersOverlay = document.getElementById('filters-overlay');
  document.getElementById('filters-open-btn').addEventListener('click', ()=>{
    updateFiltersBadge(); updateRecipesMeta();
    filtersOverlay.classList.add('active');
  });
  const closeFilters = ()=> filtersOverlay.classList.remove('active');
  document.getElementById('filters-close').addEventListener('click', closeFilters);
  document.getElementById('filters-apply-btn').addEventListener('click', closeFilters);
  filtersOverlay.addEventListener('click', (e)=>{ if(e.target === filtersOverlay) closeFilters(); });
  // "Azzera" riporta tutto allo stato iniziale riusando i comandi che già esistono
  document.getElementById('filters-reset-btn').addEventListener('click', ()=>{
    filtersOverlay.querySelectorAll('.tag-filter-chip.active').forEach(b=> b.click());
    const ex = document.getElementById('exclude-clear-btn');
    if(ex && ex.style.display !== 'none') ex.click();
    if(favoritesOnly) favoritesFilterBtn.click();
    if(showArchivedOnly) archivedFilterBtn.click();
    ricettarioFilterEl.value = ''; ricettarioFilterEl.dispatchEvent(new Event('change'));
    timeFilterEl.value = ''; timeFilterEl.dispatchEvent(new Event('change'));
    ratingFilterEl.value = ''; ratingFilterEl.dispatchEvent(new Event('change'));
    raccoltaFilterEl.value = ''; raccoltaFilterEl.dispatchEvent(new Event('change'));
    updateFiltersBadge(); updateRecipesMeta();
  });
  // Conteggio delle ricette mostrate (accanto all'ordinamento e nel pulsante dei filtri)
  function updateRecipesMeta(){
    const n = listEl.querySelector(':scope > .empty-state') ? 0 : listTotal;
    const cnt = document.getElementById('recipes-count');
    if(cnt) cnt.textContent = n === 1 ? '1 ricetta' : `${n} ricette`;
    const ap = document.getElementById('filters-apply-btn');
    if(ap) ap.textContent = n === 1 ? 'Mostra 1 ricetta' : `Mostra ${n} ricette`;
    updateFiltersBadge();
  }
  new MutationObserver(updateRecipesMeta).observe(listEl, { childList: true });
  updateRecipesMeta();
  document.getElementById('recipes-fab').addEventListener('click', ()=> document.getElementById('new-recipe-btn').click());

  // ---------- Menu "Importa ricetta" ----------
  const importMenuBtn = document.getElementById('more-menu-btn');
  const importMenuDropdown = document.getElementById('more-menu-dropdown');
  importMenuBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    importMenuDropdown.classList.toggle('open');
    if(importMenuDropdown.classList.contains('open')) updateBackupReminder();
  });
  importMenuDropdown.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=> importMenuDropdown.classList.remove('open'));
  });
  document.addEventListener('click', (e)=>{
    if(importMenuDropdown.classList.contains('open') && !importMenuDropdown.contains(e.target) && e.target !== importMenuBtn){
      importMenuDropdown.classList.remove('open');
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

  // ---------- Temi (v5.36) ----------
  // Sei temi: i colori sono nel CSS ([data-tema="…"]). Basilico è quello di partenza,
  // Rame è il tema scuro. Il vecchio "scuro" salvato in precedenza diventa Rame.
  const TEMA_STORAGE_KEY = 'mc_ricettario_tema_v1';
  const TEMI = [
    { key:'basilico',  nome:'Basilico',     desc:'Verde foglia con accenti pomodoro' },
    { key:'pomodoro',  nome:'Pomodoro',     desc:'Rosso mattone su fondo crema' },
    { key:'zafferano', nome:'Zafferano',    desc:'Ambra e oro su avorio' },
    { key:'melanzana', nome:'Melanzana',    desc:'Viola profondo con accenti oro' },
    { key:'oliva',     nome:'Oliva e lino', desc:'Verde oliva spento su beige' },
    { key:'rame',      nome:'Rame (scuro)', desc:'Carbone con arancio rame, per la sera' }
  ];
  function temaSalvato(){
    let t = '';
    try { t = localStorage.getItem(TEMA_STORAGE_KEY) || ''; } catch(e) {}
    if(t === 'scuro') t = 'rame';
    return TEMI.some(x => x.key === t) ? t : 'basilico';
  }
  let temaCorrente = temaSalvato();
  function applicaTema(tema, salvaScelta){
    if(!TEMI.some(x => x.key === tema)) tema = 'basilico';
    temaCorrente = tema;
    const root = document.documentElement;
    if(tema === 'basilico') root.removeAttribute('data-tema'); else root.setAttribute('data-tema', tema);
    root.classList.toggle('bulma-theme-dark', tema === 'rame');
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--accent').trim() || '#36723E');
    if(salvaScelta) safeStorageSet(TEMA_STORAGE_KEY, tema);
    if(typeof renderTemaGrid === 'function') renderTemaGrid();
  }
  function renderTemaGrid(){
    const grid = document.getElementById('tema-grid');
    if(!grid) return;
    grid.innerHTML = TEMI.map(t => `
      <button type="button" class="bulma-card tema-card${t.key === temaCorrente ? ' selected' : ''}" data-tema-scelta="${t.key}" role="radio" aria-checked="${t.key === temaCorrente}" aria-label="${escapeAttr(t.nome)}: ${escapeAttr(t.desc)}">
        <span class="tema-preview" data-tema-preview="${t.key}" aria-hidden="true">
          <span class="tp-bar"><span class="tp-dot"></span><span class="tp-line"></span></span>
          <span class="tp-body">
            <span class="tp-hero"><span class="tp-title"></span><span class="tp-btn">Cosa cucino?</span></span>
            <span class="tp-row"><span class="tp-time">13:00</span><span class="tp-meal"></span><span class="tp-tag"></span></span>
          </span>
        </span>
        <span class="tema-info"><span class="tema-name">${escapeHtml(t.nome)}</span>${t.key === temaCorrente ? '<span class="bulma-tag bulma-is-primary bulma-is-light">✓ In uso</span>' : ''}<span class="tema-desc">${escapeHtml(t.desc)}</span></span>
      </button>`).join('');
    grid.querySelectorAll('.tema-card').forEach(b => b.addEventListener('click', () => applicaTema(b.dataset.temaScelta, true)));
  }
  applicaTema(temaCorrente, false);


  // ---------- Edit modal ----------
  const editOverlay = document.getElementById('edit-overlay');
  const editTitle = document.getElementById('edit-title');
  const fName = document.getElementById('f-name');
  const fCategory = document.getElementById('f-category');
  const fSubcategory = document.getElementById('f-subcategory');
  function refreshSubcategoryOptions(valore){
    const lista = SOTTOCATEGORIE[fCategory.value] || [];
    const voci = (valore && !lista.includes(valore)) ? lista.concat([valore]) : lista;
    fSubcategory.innerHTML = '<option value="">— nessuna —</option>' + voci.map(v => `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
    fSubcategory.value = valore || '';
  }
  fCategory.addEventListener('change', ()=> refreshSubcategoryOptions(''));
  const fServings = document.getElementById('f-servings');
  const fTime = document.getElementById('f-time');
  const fCookerType = document.getElementById('f-cooker-type');
  const fNotes = document.getElementById('f-notes');
  const fPhoto = document.getElementById('f-photo');
  const fPhotoPreview = document.getElementById('f-photo-preview');
  const ingredientsEditor = document.getElementById('ingredients-editor');
  const stepsEditor = document.getElementById('steps-editor');

  // Stima i grammi effettivi di un ingrediente dalla sua quantità+unità, per
  // poter scalare correttamente i valori nutrizionali (definiti per 100 g). Riconosce
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

  // ---------- Open Food Facts: ricerca testo + barcode per il form Dispensa ----------
  // Un modo per compilare la scheda prodotto. I valori nutrizionali di OFF sono
  // già per 100 g: si usano così come sono, senza scalare su nessuna quantità.
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
      document.getElementById('d-category').value = prodotto.categoria;
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

  // Messaggio chiaro: Open Food Facts è un servizio gratuito gestito da volontari e a volte è
  // sovraccarico o in manutenzione, oppure limita le ricerche ravvicinate.
  function messaggioErroreOff(err){
    if(typeof navigator !== 'undefined' && navigator.onLine === false) return 'Sei offline: la ricerca su Open Food Facts richiede internet. Puoi compilare a mano.';
    if(err && err.status === 429) return 'Troppe ricerche ravvicinate su Open Food Facts: aspetta qualche secondo e riprova.';
    if(err && err.status >= 500) return 'Open Food Facts non risponde in questo momento (servizio in manutenzione o sovraccarico). Riprova tra poco, oppure compila a mano.';
    return 'Non riesco a raggiungere Open Food Facts. Riprova tra poco, oppure compila a mano.';
  }

  if (typeof attachOffAutocomplete === 'function') {
    attachOffAutocomplete(offTextSearch, (prodotto) => {
      offStatus.textContent = '';
      applicaProdottoOff(prodotto);
    }, (err) => {
      offStatus.textContent = messaggioErroreOff(err);
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
        offStatus.textContent = messaggioErroreOff(err);
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
      script.src = 'js/vendor/html5-qrcode.min.js';
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
    refreshSubcategoryOptions(source ? (source.subcategory || '') : '');
    // Una ricetta esistente mantiene il suo ricettario; una nuova parte da quello attualmente
    // filtrato nel Ricettario (se si è aperto "+ Nuova ricetta" da dentro un volume specifico),
    // altrimenti dal ricettario di partenza.
    document.getElementById('f-ricettario').value = source ? recipeRicettarioId(source) : (activeRicettarioFilter || DEFAULT_RICETTARIO_ID);
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

    // Le informazioni facoltative restano ripiegate, a meno che la ricetta ne abbia già qualcuna
    const moreEl = document.getElementById('f-more');
    if(moreEl) moreEl.open = !!(sourceTags.length || sourceAllergens.length || (source && source.freezable) || (source && source.cookerType) || nutrizioneUtente);

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

  function gestisciFileFoto(inputEl){
    const file = inputEl.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (e)=>{
      const result = await openPhotoCropOverlay(e.target.result);
      inputEl.value = ''; // permette di riselezionare lo stesso file in seguito, se si annulla
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
  }
  fPhoto.addEventListener('change', ()=> gestisciFileFoto(fPhoto));
  // Su telefono e tablet: pulsante che apre direttamente la fotocamera posteriore
  const fPhotoCamera = document.getElementById('f-photo-camera');
  const fPhotoCameraBtn = document.getElementById('f-photo-camera-btn');
  try{ if(window.matchMedia('(pointer:coarse)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) fPhotoCameraBtn.hidden = false; }catch(e){}
  fPhotoCameraBtn.addEventListener('click', ()=> fPhotoCamera.click());
  fPhotoCamera.addEventListener('change', ()=> gestisciFileFoto(fPhotoCamera));
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
    data = data || {text:'',vel:'',temp:'',time:'',mode:'Normale',pressure:'',pressureUnit:'bar',pressureRelease:'Naturale',pressureReleaseMin:'',minLiquid:'',airFryerTemp:'',airFryerPreheat:false};
    const hasRobotData = !!(data.vel || data.temp || (data.mode && data.mode !== 'Normale'));
    const hasPressureData = !!(data.pressure || data.minLiquid || data.pressureReleaseMin || (data.pressureRelease && data.pressureRelease !== 'Naturale'));
    const hasAirFryerData = !!(data.airFryerTemp || data.airFryerPreheat);
    const block = document.createElement('div');
    block.className = 'step-block';
    block.innerHTML = `
      <textarea class="step-text" placeholder="Descrivi il passaggio…" rows="2">${escapeHtml(data.text)}</textarea>
      <div class="step-row-bottom">
        <div class="mini">Durata (min)<input type="number" class="step-time" min="0" value="${data.time ?? ''}"></div>
        <button type="button" class="robot-toggle-btn ${hasRobotData?'active':''}">🤖 Impostazioni robot</button>
        <button type="button" class="pressure-toggle-btn ${hasPressureData?'active':''}">🍲 Impostazioni pentola a pressione</button>
        <button type="button" class="airfryer-toggle-btn ${hasAirFryerData?'active':''}">🌀 Impostazioni friggitrice ad aria</button>
        <div style="flex:1;"></div>
        <button class="remove-row" title="Rimuovi passaggio">×</button>
      </div>
      <div class="step-settings robot-settings" style="display:${hasRobotData?'flex':'none'};">
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
      <div class="step-settings airfryer-settings" style="display:${hasAirFryerData?'flex':'none'};">
        <div class="mini">Temp. °C<input type="number" class="step-airfryer-temp" min="0" max="230" value="${data.airFryerTemp ?? ''}"></div>
        <label class="mini" style="flex-direction:row;align-items:center;gap:6px;">
          <input type="checkbox" class="step-airfryer-preheat" ${data.airFryerPreheat ? 'checked' : ''}> Preriscaldamento
        </label>
      </div>
    `;
    block.querySelector('.remove-row').addEventListener('click', ()=> block.remove());
    block.querySelector('.robot-toggle-btn').addEventListener('click', (e)=>{
      const panel = block.querySelector('.robot-settings');
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
    block.querySelector('.airfryer-toggle-btn').addEventListener('click', (e)=>{
      const panel = block.querySelector('.airfryer-settings');
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
      minLiquid: block.querySelector('.step-min-liquid').value,
      airFryerTemp: block.querySelector('.step-airfryer-temp').value,
      airFryerPreheat: block.querySelector('.step-airfryer-preheat').checked
    })).filter(s=>s.text);

    const tags = Array.from(fTagsWrap.querySelectorAll('input[type="checkbox"]:checked')).map(cb=>cb.value);
    const allergens = Array.from(fAllergensWrap.querySelectorAll('input[type="checkbox"]:checked')).map(cb=>cb.value);
    const freezable = document.getElementById('f-freezable').checked;

    let existingExtra = {favorite:false, lastMade:null, timesMade:0, archived:false};
    let campiEsterni = {}; // campi del protocollo pp-ricettario: il modulo non li mostra ma non deve perderli
    if(editingId){
      const prev = recipes.find(r=>r.id===editingId);
      if(prev){
        existingExtra = {favorite:prev.favorite, lastMade:prev.lastMade, timesMade:prev.timesMade||null, archived:!!prev.archived};
        ['externalId','fonteUrl','fonteNome'].forEach(k=>{ if(prev[k]) campiEsterni[k] = prev[k]; });
      }
    }

    const nutrizioneUtente = leggiNutrizioneUtenteForm();

    const recipeData = {
      id: editingId || cryptoId(), name, category: fCategory.value, subcategory: fSubcategory.value || '',
      ricettarioId: document.getElementById('f-ricettario').value || DEFAULT_RICETTARIO_ID,
      servings: parseInt(fServings.value) || 1, time: parseInt(fTime.value) || 0,
      cookerType: fCookerType.value,
      ingredients: finalIngredients, steps, tags, allergens, freezable, notes: fNotes.value.trim(),
      photo: currentPhotoData, favorite: existingExtra.favorite, lastMade: existingExtra.lastMade, timesMade: existingExtra.timesMade,
      nutrizioneUtente, archived: existingExtra.archived, ...campiEsterni
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
    const ricetta = recipes.find(r=>r.id===editingId);
    const recipeName = (ricetta || {}).name || 'questa ricetta';
    const ok = await confirmDialog({
      title: 'Eliminare la ricetta?',
      message: `"${recipeName}" verrà tolta, insieme a eventuali voci pianificate che la usano. Per 30 giorni la ritrovi nel Cestino (menu ⋯) e subito dopo puoi toccare «Annulla».`,
      confirmText: 'Elimina ricetta',
      danger: true
    });
    if(ok && ricetta){
      eliminaRicetteConAnnulla([ricetta], `«${recipeName}» eliminata`);
      renderList(); renderPlanningDays(); closeEdit();
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
  const practicalToggle = document.getElementById('practical-toggle');
  practicalToggle.setAttribute('aria-pressed', String(misurePratiche));
  practicalToggle.addEventListener('click', ()=>{
    misurePratiche = !misurePratiche;
    practicalToggle.setAttribute('aria-pressed', String(misurePratiche));
    try{ localStorage.setItem(MISURE_PRATICHE_KEY, misurePratiche ? '1' : '0'); }catch(e){}
    const r = recipes.find(x => x.id === currentViewId);
    if(r) renderView(r);
  });
  const viewSteps = document.getElementById('view-steps');
  const viewNotesBlock = document.getElementById('view-notes-block');
  const viewNotes = document.getElementById('view-notes');

  // ---------- Cestino delle ricette eliminate ----------
  // Le ricette eliminate restano 30 giorni nel cestino (nel browser, non nei backup). La foto
  // resta in IndexedDB con lo stesso id della ricetta.
  const CESTINO_KEY = 'mc_ricettario_cestino_v1';
  const CESTINO_GIORNI = 30;
  let cestino = []; // [{ recipe, deletedAt, hasPhoto }]
  function saveCestino(){ return safeStorageSet(CESTINO_KEY, JSON.stringify(cestino)); }
  function caricaCestino(){
    try{ const raw = localStorage.getItem(CESTINO_KEY); cestino = raw ? JSON.parse(raw) : []; }catch(e){ cestino = []; }
    if(!Array.isArray(cestino)) cestino = [];
    const limite = Date.now() - CESTINO_GIORNI * 86400000;
    const prima = cestino.length;
    cestino = cestino.filter(e => e && e.recipe && e.recipe.id && new Date(e.deletedAt).getTime() > limite);
    if(cestino.length !== prima) saveCestino();
  }
  function spostaNelCestino(lista){
    const ora = new Date().toISOString();
    lista.forEach(r=>{
      const copia = JSON.parse(JSON.stringify(r));
      const foto = r.photo || '';
      if(foto && fotoDbOk){
        copia.photo = '';
        if(fotoConfermate.get(r.id) !== foto) fotoInCoda.set(r.id, foto);
      } // se IndexedDB non c'è, la foto resta dentro la voce del cestino
      cestino.push({ recipe: copia, deletedAt: ora, hasPhoto: !!foto });
    });
    saveCestino();
    if(fotoInCoda.size) scriviFotoInCoda();
  }
  async function ripristinaDalCestino(id){
    const i = cestino.findIndex(e => e.recipe.id === id);
    if(i < 0) return false;
    const e = cestino[i];
    const r = JSON.parse(JSON.stringify(e.recipe));
    if(e.hasPhoto && !r.photo){
      let rq = null;
      await fotoTx('readonly', st=>{ rq = st.get(id); });
      r.photo = (rq && typeof rq.result === 'string') ? rq.result : '';
    }
    if(recipes.some(x => x.id === r.id)) r.id = cryptoId();
    recipes.push(migrateRecipe(r));
    cestino.splice(i, 1);
    saveRecipes(); saveCestino();
    return true;
  }
  let undoTimer = null;
  function mostraAnnulla(testo, onUndo, durataMs){
    const el = document.getElementById('undo-toast');
    document.getElementById('undo-toast-text').textContent = testo;
    el.hidden = false;
    clearTimeout(undoTimer);
    const chiudi = ()=>{ el.hidden = true; };
    document.getElementById('undo-toast-btn').onclick = async ()=>{ chiudi(); clearTimeout(undoTimer); await onUndo(); };
    undoTimer = setTimeout(chiudi, durataMs || 9000);
  }
  // Toglie dalla pianificazione (settimana mostrata) le voci che usano le ricette indicate e le restituisce, per poterle rimettere con "Annulla"
  function togliVociPianoDi(ids){
    const tolte = {};
    DAYS.forEach(d=>{
      const tutte = weekPlan[d] || [];
      tolte[d] = tutte.filter(e => e.recipeId && ids.has(e.recipeId));
      weekPlan[d] = tutte.filter(e => !(e.recipeId && ids.has(e.recipeId)));
    });
    return tolte;
  }
  function rimettiVociPiano(tolte){
    DAYS.forEach(d=>{ if((tolte[d] || []).length) weekPlan[d] = (weekPlan[d] || []).concat(tolte[d]); });
    saveWeek();
  }
  function eliminaRicetteConAnnulla(lista, etichetta){
    const ids = new Set(lista.map(r => r.id));
    spostaNelCestino(lista);
    recipes = recipes.filter(r => !ids.has(r.id));
    const tolte = togliVociPianoDi(ids);
    saveRecipes(); saveWeek();
    mostraAnnulla(etichetta, async ()=>{
      for(const id of ids) await ripristinaDalCestino(id);
      rimettiVociPiano(tolte);
      renderList(); renderPlanningDays(); aggiornaVoceCestino();
    });
    aggiornaVoceCestino();
  }
  function aggiornaVoceCestino(){
    const b = document.getElementById('open-cestino-btn');
    if(b) b.textContent = cestino.length ? `🗑 Cestino (${cestino.length})` : '🗑 Cestino';
  }
  const cestinoOverlay = document.getElementById('cestino-overlay');
  function renderCestino(){
    const ul = document.getElementById('cestino-list');
    document.getElementById('cestino-empty-btn').hidden = !cestino.length;
    if(!cestino.length){ ul.innerHTML = '<li class="empty">Il cestino è vuoto.</li>'; return; }
    ul.innerHTML = '';
    cestino.slice().reverse().forEach(e=>{
      const giorni = Math.max(0, CESTINO_GIORNI - Math.floor((Date.now() - new Date(e.deletedAt).getTime()) / 86400000));
      const li = document.createElement('li');
      li.innerHTML = `<div class="c-info"><div class="c-name">${escapeHtml(e.recipe.name)}</div><div class="c-when">Eliminata il ${new Date(e.deletedAt).toLocaleDateString('it-IT')} · resta ancora ${giorni} giorni</div></div><button type="button" class="btn-gold btn-small c-restore">Ripristina</button><button type="button" class="btn-ghost btn-small btn-danger-action c-delete">Elimina</button>`;
      li.querySelector('.c-restore').addEventListener('click', async ()=>{
        await ripristinaDalCestino(e.recipe.id); renderCestino(); renderList(); aggiornaVoceCestino();
      });
      li.querySelector('.c-delete').addEventListener('click', async ()=>{
        const ok = await confirmDialog({ title: 'Eliminare per sempre?', message: `«${e.recipe.name}» verrà eliminata definitivamente.`, confirmText: 'Elimina per sempre', danger: true });
        if(!ok) return;
        cestino = cestino.filter(x => x !== e); saveCestino();
        if(!recipes.some(r => r.id === e.recipe.id)) fotoTx('readwrite', st=>{ st.delete(e.recipe.id); });
        renderCestino(); aggiornaVoceCestino();
      });
      ul.appendChild(li);
    });
  }
  document.getElementById('open-cestino-btn').addEventListener('click', ()=>{ renderCestino(); cestinoOverlay.classList.add('active'); });
  const chiudiCestino = ()=> cestinoOverlay.classList.remove('active');
  ['cestino-close','cestino-done'].forEach(id => document.getElementById(id).addEventListener('click', chiudiCestino));
  cestinoOverlay.addEventListener('click', e=>{ if(e.target === cestinoOverlay) chiudiCestino(); });
  document.getElementById('cestino-empty-btn').addEventListener('click', async ()=>{
    const ok = await confirmDialog({ title: 'Svuotare il cestino?', message: `Le ${cestino.length} ricette nel cestino verranno eliminate definitivamente.`, confirmText: 'Svuota il cestino', danger: true });
    if(!ok) return;
    const ids = cestino.map(e => e.recipe.id).filter(id => !recipes.some(r => r.id === id));
    cestino = []; saveCestino();
    if(ids.length) fotoTx('readwrite', st=>{ ids.forEach(id => st.delete(id)); });
    renderCestino(); aggiornaVoceCestino();
  });

  // ---------- Voto a stelle e raccolte (scheda ricetta) ----------
  function renderViewRaccolteRating(){
    const r = recipes.find(x => x.id === currentViewId);
    const starsEl = document.getElementById('view-rating');
    if(!r || !starsEl) return;
    starsEl.innerHTML = [1,2,3,4,5].map(n =>
      `<button type="button" class="${n <= (r.rating || 0) ? 'on' : ''}" role="radio" aria-checked="${n === r.rating}" data-n="${n}" aria-label="${n} ${n === 1 ? 'stella' : 'stelle'}" title="${n} ${n === 1 ? 'stella' : 'stelle'}${n === r.rating ? ' (tocca di nuovo per togliere)' : ''}">★</button>`).join('');
    const chips = (r.raccolte || []).map(id => raccolte.find(x => x.id === id)).filter(Boolean)
      .map(x => `<span class="raccolta-chip">${escapeHtml(x.name)}</span>`).join('');
    document.getElementById('view-raccolte').innerHTML = chips;
    document.getElementById('view-raccolte-btn').textContent = chips ? '📂 Modifica raccolte' : '📂 Raccolte';
  }
  document.getElementById('view-rating').addEventListener('click', e=>{
    const b = e.target.closest('button[data-n]');
    const r = recipes.find(x => x.id === currentViewId);
    if(!b || !r) return;
    const n = parseInt(b.dataset.n, 10);
    r.rating = r.rating === n ? 0 : n;
    saveRecipes(); renderViewRaccolteRating(); renderList();
  });
  const raccolteOverlay = document.getElementById('raccolte-overlay');
  function renderRaccolteList(){
    const r = recipes.find(x => x.id === currentViewId);
    document.getElementById('raccolte-sub').textContent = r ? `Scegli in quali raccolte inserire «${r.name}».` : '';
    const ul = document.getElementById('raccolte-list');
    if(!raccolte.length){ ul.innerHTML = '<li class="empty">Non hai ancora nessuna raccolta: creane una qui sotto.</li>'; return; }
    ul.innerHTML = '';
    raccolte.forEach(x=>{
      const n = recipes.filter(rr => (rr.raccolte || []).includes(x.id)).length;
      const li = document.createElement('li');
      li.innerHTML = `<label><input type="checkbox" ${r && (r.raccolte || []).includes(x.id) ? 'checked' : ''}><span>${escapeHtml(x.name)}</span><span class="n-ric">${n} ${n === 1 ? 'ricetta' : 'ricette'}</span></label><button type="button" class="icon-btn" aria-label="Elimina la raccolta ${escapeAttr(x.name)}" title="Elimina la raccolta (le ricette restano)">${icon('trash')}</button>`;
      li.querySelector('input').addEventListener('change', ev=>{
        if(!r) return;
        const set = new Set(r.raccolte || []);
        if(ev.target.checked) set.add(x.id); else set.delete(x.id);
        r.raccolte = Array.from(set);
        saveRecipes(); renderRaccolteList(); renderViewRaccolteRating(); renderList();
      });
      li.querySelector('button').addEventListener('click', async ()=>{
        const ok = await confirmDialog({ title: 'Eliminare la raccolta?', message: `La raccolta «${x.name}» verrà eliminata. Le ${n} ricette al suo interno restano nel ricettario.`, confirmText: 'Elimina raccolta', danger: true });
        if(!ok) return;
        raccolte = raccolte.filter(y => y.id !== x.id);
        recipes.forEach(rr => { if((rr.raccolte || []).includes(x.id)) rr.raccolte = rr.raccolte.filter(i => i !== x.id); });
        saveRaccolte(); saveRecipes(); refreshRaccolteUi(); renderRaccolteList(); renderList();
      });
      ul.appendChild(li);
    });
  }
  document.getElementById('view-raccolte-btn').addEventListener('click', ()=>{ renderRaccolteList(); raccolteOverlay.classList.add('active'); });
  const chiudiRaccolte = ()=> raccolteOverlay.classList.remove('active');
  ['raccolte-close','raccolte-done'].forEach(id => document.getElementById(id).addEventListener('click', chiudiRaccolte));
  raccolteOverlay.addEventListener('click', e=>{ if(e.target === raccolteOverlay) chiudiRaccolte(); });
  document.getElementById('raccolte-new-form').addEventListener('submit', e=>{
    e.preventDefault();
    const inp = document.getElementById('raccolte-new-name');
    const nome = inp.value.trim();
    if(!nome){ inp.focus(); return; }
    let x = raccolte.find(y => normalize(y.name) === normalize(nome));
    if(!x){ x = { id: cryptoId(), name: nome }; raccolte.push(x); saveRaccolte(); }
    const r = recipes.find(rr => rr.id === currentViewId);
    if(r && !(r.raccolte || []).includes(x.id)){ r.raccolte = (r.raccolte || []).concat(x.id); saveRecipes(); }
    inp.value = '';
    refreshRaccolteUi(); renderRaccolteList(); renderList();
  });

  function openView(id, dallElenco){
    const r = recipes.find(x=>x.id === id);
    if(!r) return;
    if(dallElenco) viewSeq = elencoIds.slice();
    else if(!viewOverlay.classList.contains('active')) viewSeq = [];
    currentViewId = id;
    currentServings = r.servings;
    renderView(r);
    aggiornaNavSequenza();
    viewOverlay.classList.add('active');
  }

  // Precedente / Successiva: scorre l'elenco da cui si è aperta la ricetta, senza tornare indietro.
  const viewSeqNav = document.getElementById('view-seq-nav');
  function aggiornaNavSequenza(){
    const i = viewSeq.indexOf(currentViewId);
    const mostra = viewSeq.length > 1 && i > -1;
    viewSeqNav.hidden = !mostra;
    if(!mostra) return;
    document.getElementById('view-seq-count').textContent = `${i + 1} di ${viewSeq.length}`;
    document.getElementById('view-prev-btn').disabled = i === 0;
    document.getElementById('view-next-btn').disabled = i === viewSeq.length - 1;
  }
  function vaiARicettaVicina(dir){
    const i = viewSeq.indexOf(currentViewId);
    if(i < 0) return;
    const j = i + dir;
    if(j < 0 || j >= viewSeq.length) return;
    openView(viewSeq[j]);
    viewOverlay.scrollTop = 0;
    const m = viewOverlay.querySelector('.modal'); if(m) m.scrollTop = 0;
  }
  document.getElementById('view-prev-btn').addEventListener('click', ()=> vaiARicettaVicina(-1));
  document.getElementById('view-next-btn').addEventListener('click', ()=> vaiARicettaVicina(1));
  document.addEventListener('keydown', (e)=>{
    if(!viewOverlay.classList.contains('active') || e.altKey || e.ctrlKey || e.metaKey) return;
    if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if(/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName||'')) || e.target.isContentEditable) return;
    if(document.querySelector('.overlay.active:not(#view-overlay)')) return;
    vaiARicettaVicina(e.key === 'ArrowLeft' ? -1 : 1);
  });
  // Su telefono: scorri da destra a sinistra per la successiva, da sinistra a destra per la precedente.
  (function(){
    let x0 = null, y0 = 0;
    viewOverlay.addEventListener('touchstart', e=>{ const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; if(e.touches.length > 1 || e.target.closest('input,textarea,select,.timer,[data-no-swipe]')) x0 = null; }, {passive:true});
    viewOverlay.addEventListener('touchend', e=>{
      if(x0 === null) return;
      const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
      if(Math.abs(dx) > 90 && Math.abs(dy) < 45 && Math.abs(dx) > Math.abs(dy) * 2.5) vaiARicettaVicina(dx < 0 ? 1 : -1);
    }, {passive:true});
  })();

  // La scheda ricetta si comporta come una pagina: apre una voce nella cronologia del browser,
  // così il tasto/gesto "indietro" (anche su telefono) torna all'elenco invece di uscire dal sito.
  // Si aggancia al solo cambio di stato della finestra, quindi vale per ogni modo di chiuderla.
  try{ if(history.state && history.state.ricetta) history.replaceState(null, ''); }catch(e){}
  new MutationObserver(()=>{
    try{
      const aperta = viewOverlay.classList.contains('active');
      const inCronologia = !!(history.state && history.state.ricetta);
      if(aperta && !inCronologia) history.pushState({ ricetta: true }, '');
      else if(!aperta && inCronologia) history.back();
    }catch(e){}
  }).observe(viewOverlay, { attributes: true, attributeFilter: ['class'] });
  // Scegliere una voce della barra laterale con la scheda aperta torna prima all'elenco.
  document.querySelector('.app-sidebar').addEventListener('click', (e)=>{
    if(e.target.closest('button') && viewOverlay.classList.contains('active')){
      viewOverlay.classList.remove('active'); currentViewId = null;
    }
  }, true);
  window.addEventListener('popstate', ()=>{
    if(viewOverlay.classList.contains('active')){
      viewOverlay.classList.remove('active'); currentViewId = null;
    }
  });

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

  // ---------- Misure pratiche: quantità scalate arrotondate a valori comodi ----------
  // Cambiando le porzioni, 187,5 g di farina diventano ~190 g, 1500 g diventano 1,5 kg, 2,4 uova
  // diventano ~2 uova. Il segno ~ avvisa che il valore è stato arrotondato. Si può spegnere.
  function arrotondaPratico(v){
    if(v < 5) return Math.round(v * 2) / 2;
    if(v < 20) return Math.round(v);
    if(v < 100) return Math.round(v / 5) * 5;
    if(v < 500) return Math.round(v / 10) * 10;
    return Math.round(v / 25) * 25;
  }
  function numeroBreve(n){ return String(Math.round(n * 100) / 100); }
  // Ritorna { q, unit, approx } per un ingrediente {name, qty, unit} alla scala indicata.
  function quantitaScalata(i, scale){
    const unit = String(i.unit || '').trim();
    if(!i.qty) return { q: '', unit, approx: false };
    const exact = (parseFloat(i.qty) || 0) * scale;
    if(!misurePratiche || Math.abs(scale - 1) < 1e-9 || !(exact > 0)) return { q: formatQtyForUnit(exact, unit), unit, approx: false };
    const u = unit.toLowerCase();
    const diverso = (val) => Math.abs(val - exact) / exact > 0.01;
    const base = (['kg'].includes(u) ? 1000 : (['g','gr','grammi'].includes(u) ? 1 : (['l','lt','litro','litri'].includes(u) ? 1000 : (['ml'].includes(u) ? 1 : 0))));
    if(base){
      const peso = ['kg','g','gr','grammi'].includes(u);
      const tot = exact * base; // in g o ml
      const r = tot >= 1000 ? Math.round(tot / 50) * 50 : arrotondaPratico(tot);
      const approx = Math.abs(r - tot) / tot > 0.01;
      if(r >= 1000) return { q: numeroBreve(r / 1000), unit: peso ? 'kg' : 'l', approx };
      return { q: numeroBreve(r), unit: peso ? 'g' : 'ml', approx };
    }
    if(!unit){
      if(/uov/i.test(i.name || '')){
        const r = Math.max(1, Math.round(exact));
        return { q: String(r), unit, approx: diverso(r) };
      }
      const h = Math.max(0.5, Math.round(exact * 2) / 2);
      const whole = Math.floor(h), mezzo = h - whole >= 0.5;
      return { q: mezzo ? (whole ? `${whole} e 1/2` : '1/2') : String(whole), unit, approx: diverso(h) };
    }
    return { q: formatQtyForUnit(exact, unit), unit, approx: false };
  }
  function quantitaScalataHtml(i, scale){
    const x = quantitaScalata(i, scale);
    return `${x.approx ? '<span class="approx" title="Valore arrotondato">~</span>' : ''}${escapeHtml(x.q)} ${escapeHtml(x.unit)}`.trim();
  }

  function plural(n, one, many){ return n === 1 ? one : many; }

  // I valori nutrizionali per ricetta NON si calcolano sommando i singoli
  // ingredienti crudi: la cottura altera in modo non prevedibile acqua, grassi
  // e altri valori (es. la pasta assorbe acqua, un fritto assorbe olio). I dati
  // mostrati sono quindi solo quelli inseriti dall'utente per porzione; non
  // sono calcolati da noi.
  const NUTRITION_FIELDS = [
    {key:'kcal', label:'Kcal', unit:''},
    {key:'proteine', label:'Proteine', unit:'g'},
    {key:'grassi', label:'Grassi', unit:'g'},
    {key:'carboidrati', label:'Carboidrati', unit:'g'},
    {key:'fibre', label:'Fibre', unit:'g'},
    {key:'zuccheri', label:'Zuccheri', unit:'g'},
    {key:'sale', label:'Sale', unit:'g'}
  ];
  function renderView(r){
    viewCategory.textContent = recipeCategoryLabel(r);
    viewCategory.style.setProperty('--cat-color', CATEGORY_COLORS[r.category] || '#8A8F86');
    const viewRicettarioEl = document.getElementById('view-ricettario');
    if(ricettari.length > 1){
      viewRicettarioEl.textContent = ricettarioName(recipeRicettarioId(r));
      viewRicettarioEl.style.display = 'inline-block';
    } else {
      viewRicettarioEl.style.display = 'none';
    }
    viewName.textContent = r.name;
    renderViewRaccolteRating();
    viewTime.innerHTML = (r.time ? `<span>${icon('clock', 'ico-sm')} ${r.time} min</span>` : '')
      + `<span>${icon('user', 'ico-sm')} Ricetta per ${porzioniLabel(r.servings)}</span>`;
    const extraChips = [];
    if(recipeHasPressure(r)) extraChips.push('<span class="view-tag-chip">🍲 Pentola a pressione</span>');
    if(recipeHasRobot(r)) extraChips.push('<span class="view-tag-chip">🤖 Robot da cucina</span>');
    if(recipeHasAirFryer(r)) extraChips.push('<span class="view-tag-chip">🌀 Friggitrice ad aria</span>');
    if(recipeIsTraditional(r)) extraChips.push('<span class="view-tag-chip">🔥 Tradizionale</span>');
    if(r.cookerType) extraChips.push(`<span class="view-tag-chip">${r.cookerType === 'Elettrica' ? '⚡' : '🔥'} ${escapeHtml(r.cookerType)}</span>`);
    viewTags.innerHTML = (r.tags || []).map(t=>`<span class="view-tag-chip">${escapeHtml(t)}</span>`).join('') + extraChips.join('');

    const viewAllergens = document.getElementById('view-allergens');
    if(r.allergens && r.allergens.length){
      viewAllergens.innerHTML = '<span style="font-size:var(--fs-xs);color:var(--ink-soft);margin-right:6px;font-weight:600;">Contiene:</span>' +
        r.allergens.map(a=>`<span class="view-tag-chip allergen-chip">${escapeHtml(a)}</span>`).join('');
    } else {
      viewAllergens.innerHTML = '';
    }
    document.getElementById('view-archived-note').style.display = r.archived ? 'block' : 'none';
    const archiveToggleBtn = document.getElementById('archive-toggle-btn');
    if(archiveToggleBtn) archiveToggleBtn.textContent = r.archived ? 'Disarchivia' : 'Archivia';
    document.getElementById('freezable-suggestion').style.display = r.freezable ? 'flex' : 'none';

    if(r.photo){ viewPhoto.src = r.photo; viewPhoto.alt = r.name; viewPhoto.style.display = 'block'; }
    else{ viewPhoto.style.display = 'none'; }

    viewFavoriteBtn.classList.toggle('active', !!r.favorite);
    viewFavoriteBtn.setAttribute('aria-pressed', String(!!r.favorite));

    viewLastMadeText.textContent = r.lastMade
      ? `${lastMadeLabel(r.lastMade)} (${new Date(r.lastMade).toLocaleDateString('it-IT')}) — preparata ${r.timesMade || 1} volt${(r.timesMade||1)===1?'a':'e'}`
      : 'Non ancora preparata';

    viewServingsCount.textContent = currentServings;
    const scale = currentServings / (r.servings || 1);
    viewIngredients.innerHTML = '';
    r.ingredients.forEach(i=>{
      const li = document.createElement('li');
      li.innerHTML = `<span>${escapeHtml(i.name)}</span><span class="amt">${quantitaScalataHtml(i, scale)}</span>`;
      viewIngredients.appendChild(li);
    });

    const viewNutrition = document.getElementById('view-nutrition');
    const nutrizioneUtente = r.nutrizioneUtente || null;
    let nutritionHtml = '';
    if(nutrizioneUtente){
      const rows = NUTRITION_FIELDS
        .filter(f => nutrizioneUtente[f.key] !== null && nutrizioneUtente[f.key] !== undefined)
        .map(f => `<div>${f.label}: <b>${roundNice(nutrizioneUtente[f.key])}</b>${f.unit}</div>`).join('');
      nutritionHtml += `
        <div class="nutrition-summary">
          <h4>Valori nutrizionali (per porzione)</h4>
          <div class="nutrition-grid">${rows}</div>
          <div class="nutrition-note" style="opacity:.7;margin-top:6px;">Inseriti da te: verifica sempre la fonte da cui provengono.</div>
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

    const fonteEl = document.getElementById('view-fonte');
    if(r.fonteUrl){ fonteEl.href = r.fonteUrl; fonteEl.textContent = '↗ Ricetta originale' + (r.fonteNome ? ' (' + r.fonteNome + ')' : ''); fonteEl.style.display = ''; }
    else{ fonteEl.style.display = 'none'; fonteEl.removeAttribute('href'); }
    if(r.notes || r.fonteUrl){ viewNotesBlock.style.display = 'block'; viewNotes.textContent = r.notes || ''; }
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
  document.getElementById('view-back-btn').addEventListener('click', ()=> document.getElementById('view-close').click());
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
  // Calcola cosa togliere dalla Dispensa cucinando una ricetta per un certo numero di porzioni.
  // Stesse regole prudenti del "consumato" del piano: solo prodotti identificati con certezza e unità convertibili.
  function calcolaScaloDispensa(recipe, porzioni){
    const scale = (parseFloat(porzioni) || recipe.servings || 1) / (recipe.servings || 1);
    const running = new Map(), toUpdate = [], skipped = new Set(), ambigui = [];
    (recipe.ingredients || []).forEach(ing=>{
      if(!ing.name) return;
      const { match, ambiguous } = findDispensaMatch(ing.name);
      if(ambiguous.length){ ambigui.push(ing.name); return; }
      if(!match) return;
      const amount = (parseFloat(ing.qty) || 0) * scale;
      if(!amount) return;
      const conv = convertQty(amount, ing.unit, match.unit);
      const cur = running.has(match) ? running.get(match) : parseFloat(match.qty);
      if(conv === null || isNaN(cur)){ skipped.add(match.name); return; }
      const next = Math.round(Math.max(0, cur - conv) * 100) / 100;
      running.set(match, next);
      toUpdate.push({ item: match, amount, unit: ing.unit, conv, next });
    });
    return { toUpdate, skipped: Array.from(skipped), ambigui };
  }
  function registraPreparata(r){
    const prima = { lastMade: r.lastMade, timesMade: r.timesMade };
    r.lastMade = new Date().toISOString();
    r.timesMade = (r.timesMade || 0) + 1;
    return prima;
  }
  const madeOverlay = document.getElementById('made-overlay');
  let madeCtx = null;
  function chiediPreparata(r, porzioni){
    if(!r) return;
    const piano = calcolaScaloDispensa(r, porzioni);
    madeCtx = { r, porzioni, piano };
    document.getElementById('made-sub').textContent = `«${r.name}» · ${porzioni} ${porzioni == 1 ? 'porzione' : 'porzioni'}`;
    const box = document.getElementById('made-list');
    let html = '';
    if(piano.toUpdate.length){
      html += '<b>Verranno tolti dalla Dispensa:</b><ul>' + piano.toUpdate.map(u => `<li>${escapeHtml(u.item.name)}: −${escapeHtml(formatQtyForUnit(u.amount, u.unit))} ${escapeHtml(u.unit || '')} (restano ${roundNice(u.next)} ${escapeHtml(u.item.unit || '')})</li>`).join('') + '</ul>';
    }else{
      html += 'Nessun ingrediente di questa ricetta è stato riconosciuto con certezza in Dispensa: non c\'è nulla da scalare.';
    }
    const note = [];
    if(piano.skipped.length) note.push(`Non modificati (unità diverse o quantità non indicata): ${piano.skipped.map(escapeHtml).join(', ')}.`);
    if(piano.ambigui.length) note.push(`Non modificati (più prodotti simili, verifica tu): ${piano.ambigui.map(escapeHtml).join(', ')}.`);
    if(note.length) html += `<div class="made-note">${note.join(' ')}</div>`;
    box.innerHTML = html;
    document.getElementById('made-scala-btn').hidden = !piano.toUpdate.length;
    madeOverlay.classList.add('active');
  }
  function chiudiMade(){ madeOverlay.classList.remove('active'); madeCtx = null; }
  document.getElementById('made-cancel-btn').addEventListener('click', chiudiMade);
  document.getElementById('made-close').addEventListener('click', chiudiMade);
  madeOverlay.addEventListener('click', e=>{ if(e.target === madeOverlay) chiudiMade(); });
  document.getElementById('made-solo-btn').addEventListener('click', ()=>{
    if(!madeCtx) return;
    const { r } = madeCtx; chiudiMade();
    registraPreparata(r); saveRecipes(); if(currentViewId === r.id) renderView(r); renderList();
  });
  document.getElementById('made-scala-btn').addEventListener('click', ()=>{
    if(!madeCtx) return;
    const { r, piano } = madeCtx; chiudiMade();
    const prima = registraPreparata(r);
    const annullo = piano.toUpdate.map(u => ({ id: u.item.id, qty: u.item.qty }));
    piano.toUpdate.forEach(u => { u.item.qty = String(u.next); });
    saveRecipes(); saveDispensaItems(); renderDispensaList(); aggiornaTopbarAlerts();
    if(currentViewId === r.id) renderView(r);
    renderList();
    mostraAnnulla(`«${r.name}» preparata · Dispensa aggiornata`, ()=>{
      annullo.forEach(a => { const it = dispensaItems.find(x => x.id === a.id); if(it) it.qty = a.qty; });
      r.lastMade = prima.lastMade; r.timesMade = prima.timesMade;
      saveRecipes(); saveDispensaItems(); renderDispensaList(); aggiornaTopbarAlerts();
      if(currentViewId === r.id) renderView(r);
      renderList();
    }, 12000);
  });
  markMadeBtn.addEventListener('click', ()=>{
    const r = recipes.find(x=>x.id === currentViewId);
    if(!r) return;
    chiediPreparata(r, currentServings || r.servings || 1);
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
      scheduleMealtypeSelect.innerHTML = mealCatalogue().map(mt=>`<option>${escapeHtml(mt)}</option>`).join('');
      const jsDay = new Date().getDay(); // 0=domenica...6=sabato
      scheduleDaySelect.selectedIndex = jsDay === 0 ? 6 : jsDay - 1;
      scheduleTimeInput.value = '';
      scheduleStatus.style.display = 'none';
      document.getElementById('schedule-week-select').value = '0';
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
    const delta = parseInt(document.getElementById('schedule-week-select').value, 10) || 0;
    const target = shiftIsoDays(realMonday(), delta * 7);
    const prima = planWeekStart;
    setPlanWeek(target); // di solito è già la settimana reale (fuori dalla pianificazione)
    weekPlan[day] = weekPlan[day] || [];
    weekPlan[day].push({ id: cryptoId(), recipeId: currentViewId, mealType, time: scheduleTimeInput.value || '' });
    saveWeek();
    if(prima !== target) setPlanWeek(prima);
    scheduleStatus.textContent = `✓ Aggiunta a ${day} ${dataBreve(shiftIsoDays(target, DAYS.indexOf(day)))}`;
    scheduleStatus.style.display = 'block';
    offerAddMissingToShoppingList(recipes.find(r=>r.id === currentViewId));
  });

  // Costruisce le sezioni PDF (titolo escluso: lo mette chi chiama, serve diverso per l'export
  // di una singola ricetta rispetto a quello dell'intero ricettario) per una ricetta, alle
  // porzioni indicate. Condivisa tra l'esportazione di una singola ricetta e quella di tutto
  // il ricettario, così il contenuto di ciascuna ricetta resta identico nei due casi.
  function recipeCookingMethodLabel(r){
    const metodi = [];
    if(recipeHasRobot(r)) metodi.push('Robot da cucina');
    if(recipeHasPressure(r)) metodi.push('Pentola a pressione');
    if(recipeHasAirFryer(r)) metodi.push('Friggitrice ad aria');
    if(!metodi.length) metodi.push('Tradizionale');
    return metodi.join(' + ');
  }

  function recipePdfSections(r, servings){
    const scale = servings / (r.servings || 1);
    const metaLine = `${r.category} · ${servings} porzioni${r.time ? ' · circa ' + r.time + ' min' : ''}`;
    const cotturaLine = `Cottura: ${recipeCookingMethodLabel(r)}`;
    const sections = [{
      heading: null,
      lines: [metaLine, cotturaLine, (r.tags && r.tags.length) ? 'Tag: ' + r.tags.join(', ') : null, (r.allergens && r.allergens.length) ? 'Allergeni: ' + r.allergens.join(', ') : null].filter(Boolean)
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
    sections.push({
      heading: 'Preparazione',
      lines: r.steps.map((s, idx) => `${idx+1}. ${stepToCsvText(s)}`)
    });
    if(r.notes){
      sections.push({ heading: 'Note', lines: r.notes.split('\n') });
    }
    return sections;
  }

  // Nome file "pulito" (senza accenti né simboli) per i PDF.
  function pdfFileSlug(testo, fallback){
    const t = String(testo || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w\-]+/g,'_').replace(/^_+|_+$/g,'');
    return t || fallback;
  }

  document.getElementById('export-recipe-pdf-btn').addEventListener('click', ()=>{
    const r = recipes.find(x=>x.id === currentViewId);
    if(!r) return;
    const pdfStr = buildPdfFromSections(r.name, recipePdfSections(r, currentServings));
    const safeName = pdfFileSlug(r.name, 'ricetta');
    const libro = pdfFileSlug(ricettarioName(recipeRicettarioId(r)), 'ricettario');
    downloadPdf(pdfStr, `${libro}_${safeName}.pdf`);
  });


  // ---------- Stampa A4 orizzontale: una ricetta per pagina, con l'impianto della scheda ----------
  function schedaStampaHtml(r, porzioni){
    const scale = porzioni / (r.servings || 1);
    const chipExtra = [];
    if(recipeHasPressure(r)) chipExtra.push('🍲 Pentola a pressione');
    if(recipeHasRobot(r)) chipExtra.push('🤖 Robot da cucina');
    if(recipeHasAirFryer(r)) chipExtra.push('🌀 Friggitrice ad aria');
    if(recipeIsTraditional(r)) chipExtra.push('🔥 Tradizionale');
    if(r.cookerType) chipExtra.push((r.cookerType === 'Elettrica' ? '⚡ ' : '🔥 ') + r.cookerType);
    const chips = (r.tags || []).concat(chipExtra).map(t => `<span class="ps-chip">${escapeHtml(t)}</span>`).join('');
    const allerg = (r.allergens && r.allergens.length)
      ? `<div class="ps-chips"><span class="lbl">Contiene:</span>${r.allergens.map(a => `<span class="ps-chip allergen">${escapeHtml(a)}</span>`).join('')}</div>` : '';
    const steps = (r.steps || []).map((s, i) => {
      const meta = [];
      if(s.vel) meta.push('Vel. ' + s.vel);
      if(s.temp) meta.push(s.temp + ' °C');
      if(s.mode && s.mode !== 'Normale') meta.push(s.mode);
      if(s.time) meta.push(s.time + ' min');
      if(s.pressure) meta.push('🍲 ' + s.pressure + ' ' + ({bar:'Bar', psi:'PSI', kpa:'kPa'}[s.pressureUnit] || 'Bar'));
      if(s.pressureRelease) meta.push('Rilascio: ' + s.pressureRelease);
      if(s.minLiquid) meta.push('Liquido min. ' + s.minLiquid + ' ml');
      if(s.pressureReleaseMin) meta.push(s.pressureReleaseMin + ' min rilascio');
      if(s.airFryerTemp) meta.push('🌀 ' + s.airFryerTemp + ' °C');
      return `<div class="ps-step"><div class="ps-num">${i + 1}</div><div class="t">${escapeHtml(s.text)}${meta.length ? `<div class="m">${meta.map(escapeHtml).join(' · ')}</div>` : ''}</div></div>`;
    }).join('');
    const ing = (r.ingredients || []).map(i => `<li><span>${escapeHtml(i.name)}</span><span class="amt">${quantitaScalataHtml(i, scale)}</span></li>`).join('');
    let nutri = '';
    const n = r.nutrizioneUtente;
    if(n){
      const rows = NUTRITION_FIELDS.filter(f => n[f.key] !== null && n[f.key] !== undefined).map(f => `<div>${f.label}: <b>${roundNice(n[f.key])}</b>${f.unit}</div>`).join('');
      if(rows) nutri = `<div class="ps-box"><h3>Valori nutrizionali (per porzione)</h3><div class="ps-nutri">${rows}</div></div>`;
    }
    const pills = `<span class="ps-pill">${escapeHtml(recipeCategoryLabel(r))}</span>` + (ricettari.length > 1 ? `<span class="ps-pill alt">${escapeHtml(ricettarioName(recipeRicettarioId(r)))}</span>` : '');
    const corta = (r.steps || []).length <= 7 && (r.ingredients || []).length <= 10 && String(r.notes || '').length < 300;
    return `<section class="ps-sheet${corta ? ' ps-short' : ''}">
      <div class="ps-body">
        <div class="ps-main">
          <div class="ps-tags">${pills}</div>
          <h1 class="ps-title">${escapeHtml(r.name)}</h1>
          <div class="ps-meta">${r.time ? `<span>${r.time} min</span>` : ''}<span>Ricetta per ${porzioniLabel(porzioni)}</span></div>
          ${chips ? `<div class="ps-chips">${chips}</div>` : ''}${allerg}
          <h2 class="ps-h">Procedimento</h2>
          <div class="ps-steps">${steps || '<div class="ps-step"><div class="t">—</div></div>'}</div>
          ${r.notes ? `<div class="ps-notes"><b>Note personali —</b> ${escapeHtml(r.notes)}</div>` : ''}
        </div>
        <div class="ps-side">
          ${r.photo ? `<img class="ps-photo" src="${escapeAttr(r.photo)}" alt="">` : ''}
          <div class="ps-box"><h3>Ingredienti</h3><ul class="ps-ing">${ing}</ul></div>
          ${nutri}
        </div>
      </div>
    </section>`;
  }
  // ---------- PDF A4 orizzontale vettoriale (nessuna stampante: il file si scarica direttamente) ----------
  // Stesso impianto della scheda: titolo e procedimento a sinistra, ingredienti (e foto) in una colonna
  // a destra che parte dal margine alto del foglio. Margini del foglio: 10 mm (8 mm su due colonne).
  function pdfMisura(testo, size, bold){
    if(!pdfMeasureCtx){ pdfMeasureCtx = document.createElement('canvas').getContext('2d'); }
    pdfMeasureCtx.font = `${bold ? 'bold ' : ''}${size}px Helvetica, Arial, sans-serif`;
    return pdfMeasureCtx.measureText(testo).width;
  }
  function pdfAvvolgi(testo, size, larghezza, bold){
    const out = [];
    String(testo || '').split('\n').forEach(par => {
      const parole = par.split(/\s+/).filter(Boolean);
      if(!parole.length){ out.push(''); return; }
      let riga = '';
      parole.forEach(p => {
        const prova = riga ? riga + ' ' + p : p;
        if(pdfMisura(prova, size, bold) <= larghezza || !riga){
          if(!riga && pdfMisura(p, size, bold) > larghezza){
            // parola più larga della colonna: spezzata
            let pezzo = '';
            for(const ch of p){ if(pdfMisura(pezzo + ch, size, bold) > larghezza && pezzo){ out.push(pezzo); pezzo = ch; } else pezzo += ch; }
            riga = pezzo;
          } else riga = prova;
        } else { out.push(riga); riga = p; }
      });
      if(riga) out.push(riga);
    });
    return out.length ? out : [''];
  }
  function pdfColore(hex){
    const n = parseInt(hex.replace('#',''), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255].map(v => v.toFixed(3)).join(' ');
  }
  function pdfRettArrotondato(x, y, w, h, r){
    // (x,y) = angolo in basso a sinistra
    const k = 0.5523 * r;
    return `${x + r} ${y} m ${x + w - r} ${y} l ${x + w - r + k} ${y} ${x + w} ${y + r - k} ${x + w} ${y + r} c ` +
      `${x + w} ${y + h - r} l ${x + w} ${y + h - r + k} ${x + w - r + k} ${y + h} ${x + w - r} ${y + h} c ` +
      `${x + r} ${y + h} l ${x + r - k} ${y + h} ${x} ${y + h - r + k} ${x} ${y + h - r} c ` +
      `${x} ${y + r} l ${x} ${y + r - k} ${x + r - k} ${y} ${x + r} ${y} c h`;
  }
  async function pdfPreparaFoto(src){
    // restituisce { w, h, data(binaria JPEG) } oppure null
    try{
      if(!src || typeof src !== 'string' || !src.startsWith('data:image')) return null;
      const img = new Image(); img.src = src; await img.decode();
      let b64 = null;
      if(/^data:image\/jpeg/i.test(src)) b64 = src.split(',')[1];
      else{
        const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
        const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(img, 0, 0);
        b64 = cv.toDataURL('image/jpeg', 0.88).split(',')[1];
      }
      return { w: img.naturalWidth, h: img.naturalHeight, data: atob(b64) };
    }catch(e){ return null; }
  }

  async function creaPdfSchedeA4(lista, porzioniDi, layout){
    const PW = 841.89, PH = 595.28;
    const colonne = layout === 'colonne';
    const M = colonne ? 22.7 : 28.35;               // 8 mm / 10 mm
    const GAP = colonne ? 25.5 : 34;                // spazio tra le due colonne di pagina / tra testo e ingredienti
    const FW = colonne ? (PW - 2 * M - GAP) / 2 : PW - 2 * M;   // larghezza di un riquadro di impaginazione
    const FH = PH - 2 * M;
    const foto = new Map();
    for(const r of lista){ if(r.photo) foto.set(r.id, await pdfPreparaFoto(r.photo)); }

    const pagine = [];          // ogni pagina: array di comandi
    const immagini = [];        // { w, h, data }
    let fi = -1, y = 0;
    const perPagina = colonne ? 2 : 1;
    function nuovoRiquadro(){
      fi++;
      if(!pagine[Math.floor(fi / perPagina)]) pagine[Math.floor(fi / perPagina)] = [];
      y = PH - M;
    }
    const xRiquadro = () => M + (fi % perPagina) * (FW + GAP);
    const cmd = c => pagine[Math.floor(fi / perPagina)].push(c);

    function testo(x, yTop, lh, size, str, opz){
      opz = opz || {};
      const base = yTop - (lh + size * 0.72) / 2;
      cmd(`BT /${opz.bold ? 'F2' : 'F1'} ${size.toFixed(2)} Tf ${pdfColore(opz.col || '#1f2a22')} rg 1 0 0 1 ${x.toFixed(2)} ${base.toFixed(2)} Tm (${pdfSanitizeText(str)}) Tj ET`);
    }
    function riempi(path, fill, stroke){
      let c = `${pdfColore(fill)} rg `;
      if(stroke) c += `${pdfColore(stroke)} RG 0.6 w `;
      cmd(`q ${c}${path} ${stroke ? 'B' : 'f'} Q`);
    }

    function costruisci(r, S){
      const porz = porzioniDi(r);
      const scala = porz / (r.servings || 1);
      const wl = colonne ? FW * 0.64 - 6 : FW * 0.62 - GAP / 2;
      const wr = FW - wl - (colonne ? 12 : GAP);
      const sinistra = [], destra = [];
      const nero = '#1f2a22', grigio = '#5a645d';

      // etichette (categoria · sottocategoria, ricettario)
      const pills = [recipeCategoryLabel(r)];
      if(ricettari.length > 1) pills.push(ricettarioName(recipeRicettarioId(r)));
      const sP = S * 0.77, hP = sP + 7;
      sinistra.push({ h: hP + S * 0.4, draw(x, yt){
        let cx = x;
        pills.forEach((p, i) => {
          const w = pdfMisura(p, sP, true) + 16;
          riempi(pdfRettArrotondato(cx, yt - hP, w, hP, 4), i === 0 ? '#efe3d8' : '#dcecdc');
          testo(cx + 8, yt, hP, sP, p, { bold: true, col: i === 0 ? '#7a4a35' : '#2f5a35' });
          cx += w + 6;
        });
      }});
      // titolo
      const sT = S * (colonne ? 1.7 : 2.0), lhT = sT * 1.18;
      const righeT = pdfAvvolgi(r.name, sT, wl, true);
      sinistra.push({ h: righeT.length * lhT + S * 0.45, draw(x, yt){ righeT.forEach((t, i) => testo(x, yt - i * lhT, lhT, sT, t, { bold: true })); }});
      // meta
      const sM = S * 0.96;
      const meta = [r.time ? `${r.time} min` : '', `Ricetta per ${porzioniLabel(porz)}`].filter(Boolean).join('     ');
      sinistra.push({ h: sM * 1.4 + S * 0.45, draw(x, yt){ testo(x, yt, sM * 1.4, sM, meta, { col: grigio }); }});
      // chip: tag, metodi, allergeni
      const extra = [];
      if(recipeHasPressure(r)) extra.push('Pentola a pressione');
      if(recipeHasRobot(r)) extra.push('Robot da cucina');
      if(recipeHasAirFryer(r)) extra.push('Friggitrice ad aria');
      if(recipeIsTraditional(r)) extra.push('Tradizionale');
      if(r.cookerType) extra.push(r.cookerType);
      const chipTag = (r.tags || []).concat(extra);
      const sC = S * 0.85, hC = sC + 7;
      function righeChip(lbl, voci, fill, col){
        if(!voci.length) return;
        // distribuisce i chip su più righe se serve
        const righe = []; let riga = [], larg = lbl ? pdfMisura(lbl, sC, true) + 8 : 0;
        voci.forEach(v => {
          const w = pdfMisura(v, sC, true) + 14;
          if(larg + w > wl && riga.length){ righe.push(riga); riga = []; larg = 0; }
          riga.push({ v, w }); larg += w + 5;
        });
        righe.push(riga);
        righe.forEach((rg, ri) => sinistra.push({ h: hC + 4, draw(x, yt){
          let cx = x;
          if(lbl && ri === 0){ testo(cx, yt, hC, sC, lbl, { bold: true, col: grigio }); cx += pdfMisura(lbl, sC, true) + 8; }
          else if(lbl) cx += pdfMisura(lbl, sC, true) + 8;
          rg.forEach(c => { riempi(pdfRettArrotondato(cx, yt - hC, c.w, hC, hC / 2), fill); testo(cx + 7, yt, hC, sC, c.v, { bold: true, col }); cx += c.w + 5; });
        }}));
      }
      righeChip('', chipTag, '#dcecdc', '#2f5a35');
      righeChip('Contiene:', r.allergens || [], '#f7dcdc', '#8a2a2a');
      sinistra[sinistra.length - 1].h += S * 0.5;

      // procedimento
      const sH = S * 1.46, rN = S * 0.62, sS = S, lhS = S * 1.38;
      const wTesto = wl - (rN * 2 + 8);
      const passi = (r.steps || []).map((s, i) => {
        const meta = [];
        if(s.vel) meta.push('Vel. ' + s.vel);
        if(s.temp) meta.push(s.temp + ' °C');
        if(s.mode && s.mode !== 'Normale') meta.push(s.mode);
        if(s.time) meta.push(s.time + ' min');
        if(s.pressure) meta.push(s.pressure + ' ' + ({bar:'Bar', psi:'PSI', kpa:'kPa'}[s.pressureUnit] || 'Bar'));
        if(s.pressureRelease) meta.push('Rilascio: ' + s.pressureRelease);
        if(s.minLiquid) meta.push('Liquido min. ' + s.minLiquid + ' ml');
        if(s.pressureReleaseMin) meta.push(s.pressureReleaseMin + ' min rilascio');
        if(s.airFryerTemp) meta.push(s.airFryerTemp + ' °C (friggitrice)');
        const righe = pdfAvvolgi(s.text, sS, wTesto, false);
        const righeMeta = meta.length ? pdfAvvolgi(meta.join(' · '), S * 0.9, wTesto, false) : [];
        const h = righe.length * lhS + righeMeta.length * S * 1.25 + S * 0.62;
        return { h, draw(x, yt){
          riempi(circoloPath(x + rN, yt - rN - 1, rN), '#2f6b3a');
          const sn = rN * 1.05; const num = String(i + 1);
          testo(x + rN - pdfMisura(num, sn, true) / 2, yt - 1, rN * 2, sn, num, { bold: true, col: '#ffffff' });
          righe.forEach((t, k) => testo(x + rN * 2 + 8, yt - k * lhS, lhS, sS, t));
          righeMeta.forEach((t, k) => testo(x + rN * 2 + 8, yt - righe.length * lhS - k * S * 1.25, S * 1.25, S * 0.9, t, { col: grigio }));
        }};
      });
      function circoloPath(cx, cy, rr){
        const k = 0.5523 * rr;
        return `${cx + rr} ${cy} m ${cx + rr} ${cy + k} ${cx + k} ${cy + rr} ${cx} ${cy + rr} c ${cx - k} ${cy + rr} ${cx - rr} ${cy + k} ${cx - rr} ${cy} c ${cx - rr} ${cy - k} ${cx - k} ${cy - rr} ${cx} ${cy - rr} c ${cx + k} ${cy - rr} ${cx + rr} ${cy - k} ${cx + rr} ${cy} c h`;
      }
      if(passi.length){
        passi[0].h += sH * 1.2 + S * 0.3;
        const d0 = passi[0].draw;
        passi[0].draw = (x, yt) => { testo(x, yt, sH * 1.2, sH, 'Procedimento', { bold: true }); d0(x, yt - sH * 1.2 - S * 0.3); };
        passi.forEach(p => sinistra.push(p));
      }
      if(r.notes){
        const sN = S * 0.88, lhN = sN * 1.4;
        const righe = pdfAvvolgi('Note personali — ' + r.notes, sN, wl, false);
        righe.forEach((t, i) => sinistra.push({ h: lhN + (i === 0 ? S * 0.9 : 0), draw(x, yt){
          let yy = yt;
          if(i === 0){ cmd(`q ${pdfColore('#cfd6cf')} RG 0.6 w ${x} ${yt - S * 0.3} m ${x + wl} ${yt - S * 0.3} l S Q`); yy = yt - S * 0.9; }
          if(i === 0 && t.startsWith('Note personali —')){
            testo(x, yy, lhN, sN, 'Note personali —', { bold: true, col: '#4a544d' });
            testo(x + pdfMisura('Note personali — ', sN, true), yy, lhN, sN, t.slice('Note personali — '.length), { col: '#4a544d' });
          } else testo(x, yy, lhN, sN, t, { col: '#4a544d' });
        }}));
      }

      // colonna di destra: foto, ingredienti, valori nutrizionali (parte dal margine alto)
      const f = foto.get(r.id);
      if(f){
        const wF = wr, hF = Math.min(wF * f.h / f.w, colonne ? 80 : 170);
        const wFi = hF === wF * f.h / f.w ? wF : hF * f.w / f.h;
        destra.push({ h: hF + 10, foto: true, draw(x, yt){
          const idx = immagini.push(f) - 1;
          cmd(`q ${wFi.toFixed(2)} 0 0 ${hF.toFixed(2)} ${(x + (wr - wFi) / 2).toFixed(2)} ${(yt - hF).toFixed(2)} cm /Im${idx} Do Q`);
        }});
      }
      const pad = S * 0.95, sB = S * 1.12, sI = S * 0.95, lhI = S * 1.2;
      const voci = (r.ingredients || []).map(i => {
        const q = quantitaScalata(i, scala);
        const am = `${q.approx ? '~' : ''}${q.q} ${q.unit}`.trim();
        const wAm = pdfMisura(am, sI, false);
        const righe = pdfAvvolgi(i.name, sI, Math.max(40, wr - pad * 2 - wAm - 10), false);
        return { am, wAm, righe, h: Math.max(righe.length * lhI, lhI) + S * 0.55 };
      });
      const hBox = pad * 2 + sB * 1.5 + voci.reduce((a, v) => a + v.h, 0);
      destra.push({ h: hBox + 8, draw(x, yt){
        riempi(pdfRettArrotondato(x, yt - hBox, wr, hBox, 9), '#eef4ec', '#d7e2d4');
        testo(x + pad, yt - pad, sB * 1.5, sB, 'Ingredienti', { bold: true });
        let yy = yt - pad - sB * 1.5;
        voci.forEach((v, k) => {
          if(k > 0) cmd(`q ${pdfColore('#d7e2d4')} RG 0.5 w ${x + pad} ${yy + S * 0.14} m ${x + wr - pad} ${yy + S * 0.14} l S Q`);
          v.righe.forEach((t, j) => testo(x + pad, yy - S * 0.2 - j * lhI, lhI, sI, t));
          testo(x + wr - pad - v.wAm, yy - S * 0.2, lhI, sI, v.am, { col: grigio });
          yy -= v.h;
        });
      }});
      const n = r.nutrizioneUtente;
      if(n){
        const righeN = NUTRITION_FIELDS.filter(fd => n[fd.key] !== null && n[fd.key] !== undefined).map(fd => `${fd.label}: ${roundNice(n[fd.key])}${fd.unit}`);
        if(righeN.length){
          const sn = S * 0.9, lhn = sn * 1.35, hN = pad * 2 + sB * 1.5 + righeN.length * lhn;
          destra.push({ h: hN + 8, draw(x, yt){
            riempi(pdfRettArrotondato(x, yt - hN, wr, hN, 9), '#eef4ec', '#d7e2d4');
            testo(x + pad, yt - pad, sB * 1.5, sB * 0.9, 'Valori nutrizionali (per porzione)', { bold: true });
            righeN.forEach((t, k) => testo(x + pad, yt - pad - sB * 1.5 - k * lhn, lhn, sn, t));
          }});
        }
      }
      // gli ingredienti partono dal margine alto del foglio; la foto va sotto
      destra.sort((p, q) => (p.foto ? 1 : 0) - (q.foto ? 1 : 0));
      return { sinistra, destra, wl, wr, hS: sinistra.reduce((a, it) => a + it.h, 0), hD: destra.reduce((a, it) => a + it.h, 0) };
    }

    lista.forEach((r, ri) => {
      // dimensione del carattere: fissa su due colonne, adattata al foglio nella ricetta singola per pagina
      let S, b;
      if(colonne){ S = 8.5; b = costruisci(r, S); }
      else{
        S = 13; b = costruisci(r, S);
        while(Math.max(b.hS, b.hD) > FH && S > 7){ S -= 0.4; b = costruisci(r, S); }
      }
      const corta = b.sinistra.length <= 14 && b.hS < FH * 0.7;
      if(!colonne || fi < 0) nuovoRiquadro();
      else{
        const resto = y - M;
        const serve = Math.max(b.hS, b.hD);
        if(serve > resto && (corta || resto < 110)) nuovoRiquadro();
      }
      let x0 = xRiquadro(), yInizio = y;
      if(b.hD > y - M){ nuovoRiquadro(); x0 = xRiquadro(); yInizio = y; }
      // colonna di destra dal margine alto del blocco
      let yd = yInizio; const xd = x0 + FW - b.wr;
      b.destra.forEach(it => { it.draw(xd, yd); yd -= it.h; });
      const fineDestra = yd;
      // colonna di sinistra, con continuazione sul riquadro successivo se serve
      let xs = x0, ys = yInizio, primo = true;
      const fiInizio = fi;
      b.sinistra.forEach(it => {
        if(ys - it.h < M && !primo){ nuovoRiquadro(); xs = xRiquadro(); ys = y; }
        it.draw(xs, ys); ys -= it.h; primo = false;
      });
      y = (fi === fiInizio) ? Math.min(ys, fineDestra) : ys;
      if(colonne){
        y -= 7;
        if(ri < lista.length - 1 && y > M + 20){
          cmd(`q ${pdfColore('#b9c4b9')} RG 0.6 w [3 3] 0 d ${xRiquadro()} ${y + 3.5} m ${xRiquadro() + FW} ${y + 3.5} l S Q`);
          y -= 7;
        }
      }
    });

    // assemblaggio del file PDF
    const oggetti = [];
    let id = 5;
    const idImm = [];
    const uniche = [...new Set(immagini)];
    uniche.forEach(im => { idImm.push(id++); });
    const idPag = [], idCont = [];
    pagine.forEach(() => { idPag.push(id++); idCont.push(id++); });
    oggetti[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    oggetti[2] = `<< /Type /Pages /Kids [${idPag.map(n => n + ' 0 R').join(' ')}] /Count ${pagine.length} >>`;
    oggetti[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    oggetti[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    uniche.forEach((im, k) => {
      oggetti[idImm[k]] = { isStream: true, extra: `/Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`, data: im.data };
    });
    pagine.forEach((cmds, i) => {
      // le immagini sono numerate per ordine di inserimento: /ImN → oggetto dell'immagine unica corrispondente
      const xo = immagini.map((im, n) => `/Im${n} ${idImm[uniche.indexOf(im)]} 0 R`).join(' ');
      oggetti[idPag[i]] = `<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << ${xo} >> >> /MediaBox [0 0 ${PW} ${PH}] /Contents ${idCont[i]} 0 R >>`;
      oggetti[idCont[i]] = { isStream: true, data: cmds.join('\n') };
    });
    let out = '%PDF-1.4\n';
    const off = [0];
    for(let n = 1; n < id; n++){
      off[n] = out.length;
      const o = oggetti[n];
      if(typeof o === 'string') out += `${n} 0 obj\n${o}\nendobj\n`;
      else{
        const dict = o.extra ? `<< ${o.extra} /Length ${o.data.length} >>` : `<< /Length ${o.data.length} >>`;
        out += `${n} 0 obj\n${dict}\nstream\n${o.data}\nendstream\nendobj\n`;
      }
    }
    const xref = out.length;
    out += `xref\n0 ${id}\n0000000000 65535 f \n`;
    for(let n = 1; n < id; n++) out += `${String(off[n]).padStart(10, '0')} 00000 n \n`;
    out += `trailer\n<< /Size ${id} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return out;
  }
  const LAYOUT_STAMPA_KEY = 'mc_ricettario_layout_stampa_v1';
  function layoutStampaSalvato(){ try{ return localStorage.getItem(LAYOUT_STAMPA_KEY) === 'pagina' ? 'pagina' : 'colonne'; }catch(e){ return 'colonne'; } }
  // Adatta ogni scheda al foglio: riduce il carattere finché la ricetta sta in una pagina A4 orizzontale.
  function adattaSchedeAlFoglio(root){
    const oldStyle = root.getAttribute('style');
    root.style.cssText = 'display:block;position:absolute;left:-10000px;top:0;width:277mm;';
    const altezzaMax = 189 * 96 / 25.4;
    root.querySelectorAll('.ps-sheet').forEach(sh => {
      let sta = false;
      for(let pt = 13; pt >= 7.5 && !sta; pt -= 0.5){
        sh.style.setProperty('--ps', pt + 'pt');
        sta = sh.scrollHeight <= altezzaMax;
      }
      // ricetta lunghissima: il procedimento passa su due colonne
      if(!sta){
        sh.classList.add('ps-tight');
        for(let pt = 11; pt >= 7 && !sta; pt -= 0.5){
          sh.style.setProperty('--ps', pt + 'pt');
          sta = sh.scrollHeight <= altezzaMax;
        }
      }
    });
    if(oldStyle === null) root.removeAttribute('style'); else root.setAttribute('style', oldStyle);
  }
  function preparaStampaSchede(lista, porzioniDi, layout){
    document.getElementById('print-root')?.remove();
    document.getElementById('print-page-style')?.remove();
    const root = document.createElement('div');
    root.id = 'print-root';
    if(layout === 'colonne') root.classList.add('ps-colonne');
    root.innerHTML = lista.map(r => schedaStampaHtml(r, porzioniDi(r))).join('');
    const st = document.createElement('style');
    st.id = 'print-page-style';
    st.textContent = layout === 'colonne' ? '@page{size:A4 landscape;margin:8mm}' : '@page{size:A4 landscape;margin:10mm}';
    document.head.appendChild(st);
    document.body.appendChild(root);
    if(layout !== 'colonne') adattaSchedeAlFoglio(root);
    document.body.classList.add('printing-sheets');
    const pulisci = ()=>{
      document.body.classList.remove('printing-sheets');
      root.remove(); st.remove();
      window.removeEventListener('afterprint', pulisci);
    };
    window.addEventListener('afterprint', pulisci);
    return { root, pulisci };
  }
  function stampaSchedeA4(lista, porzioniDi, layout){
    layout = layout || 'pagina';
    const { root, pulisci } = preparaStampaSchede(lista, porzioniDi, layout);
    // le foto devono essere caricate prima di aprire la stampa
    const imgs = Array.from(root.querySelectorAll('img'));
    Promise.all(imgs.map(im => im.complete ? 0 : new Promise(ok => { im.onload = im.onerror = ok; })))
      .then(()=> setTimeout(()=>{
        if(layout !== 'colonne') adattaSchedeAlFoglio(root); // le foto caricate cambiano le altezze
        try{ window.print(); }catch(e){ pulisci(); }
      }, 150));
    return { root, pulisci };
  }
  function nomeFilePdf(base){ return (String(base || 'ricette').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'ricette') + '-a4.pdf'; }
  async function esportaPdfSchede(lista, porzioniDi, layout, nomeFile){
    try{
      const pdf = await creaPdfSchedeA4(lista, porzioniDi, layout);
      downloadPdf(pdf, nomeFile);
    }catch(err){
      console.error(err);
      alert('Non è stato possibile creare il PDF.');
    }
  }
  // Più ricette: chiede se una per pagina oppure su due colonne (la scelta resta come predefinita) e
  // scarica direttamente il file PDF, senza passare dalla stampante.
  function stampaElencoA4(lista, porzioniDi, nomeFile){
    if(lista.length === 1){ esportaPdfSchede(lista, porzioniDi, 'pagina', nomeFile || nomeFilePdf(lista[0].name)); return; }
    const ov = document.getElementById('layout-stampa-overlay');
    document.getElementById('layout-stampa-intro').textContent = `Stai per creare un PDF A4 orizzontale con ${lista.length} ricette.`;
    ov.querySelector(`input[value="${layoutStampaSalvato()}"]`).checked = true;
    const okB = document.getElementById('layout-stampa-ok'), cancB = document.getElementById('layout-stampa-cancel'), xB = document.getElementById('layout-stampa-close');
    function fine(){ ov.classList.remove('active'); okB.removeEventListener('click', onOk); cancB.removeEventListener('click', fine); xB.removeEventListener('click', fine); }
    function onOk(){
      const layout = ov.querySelector('input[name="layout-stampa"]:checked').value;
      try{ localStorage.setItem(LAYOUT_STAMPA_KEY, layout); }catch(e){}
      fine();
      esportaPdfSchede(lista, porzioniDi, layout, nomeFile || 'ricettario-a4.pdf');
    }
    okB.addEventListener('click', onOk); cancB.addEventListener('click', fine); xB.addEventListener('click', fine);
    ov.classList.add('active');
  }
  // Stampa dal browser (Ctrl/Cmd+P o menu Stampa) con una scheda ricetta aperta: stesso risultato
  // pulito della stampa A4 orizzontale, senza menu, pulsanti «Modifica», porzioni e simili.
  window.addEventListener('beforeprint', ()=>{
    if(document.body.classList.contains('printing-sheets')) return;
    if(!viewOverlay.classList.contains('active')) return;
    const r = recipes.find(x => x.id === currentViewId);
    if(r) preparaStampaSchede([r], () => currentServings, 'pagina');
  });
  document.getElementById('print-recipe-a4-btn').addEventListener('click', ()=>{
    const r = recipes.find(x=>x.id === currentViewId);
    if(!r) return;
    document.getElementById('view-export-menu-dropdown').classList.remove('open');
    esportaPdfSchede([r], () => currentServings, 'pagina', nomeFilePdf(r.name));
  });

  // Esporta il ricettario (o una selezione di categorie/ricette) in un solo PDF: un indice
  // raggruppato per categoria, poi una pagina divisoria per ogni categoria e una ricetta per
  // pagina (alle sue porzioni base, dato che non si sta guardando una scheda precisa con
  // porzioni scalate). Le ricette archiviate restano sempre fuori, come dal resto del sito.
  const exportPdfOverlay = document.getElementById('export-pdf-overlay');
  const exportPdfList = document.getElementById('export-pdf-list');
  const exportPdfSearch = document.getElementById('export-pdf-search');
  const exportPdfCount = document.getElementById('export-pdf-count');
  let exportPdfSelezionate = new Set();

  // Filtri opzionali per restringere l'elenco da cui scegliere (stessa logica delle
  // ricerca avanzata nella vista Ricettario: metodi e tag in AND, allergeni come esclusione),
  // ma con uno stato tutto suo, separato da quello della vista principale.
  let exportPdfPressureOnly = false;
  let exportPdfRobotOnly = false;
  let exportPdfAirFryerOnly = false;
  let exportPdfTraditionalOnly = false;
  let exportPdfTagFilters = new Set();
  let exportPdfAllergenExclusions = new Set();
  // A differenza dei tag (AND, deve averli tutti), qui è un OR: una ricetta passa se appartiene
  // a UNO qualsiasi dei ricettari selezionati, dato che una ricetta sta in un solo volume.
  let exportPdfRicettarioFilters = new Set();

  function resetExportPdfFilters(){
    exportPdfPressureOnly = exportPdfRobotOnly = exportPdfAirFryerOnly = exportPdfTraditionalOnly = false;
    exportPdfTagFilters = new Set();
    exportPdfAllergenExclusions = new Set();
    exportPdfRicettarioFilters = new Set();
    [exportPdfPressureBtn, exportPdfRobotBtn, exportPdfAirFryerBtn, exportPdfTraditionalBtn].forEach(b=>b.classList.remove('active'));
    exportPdfTagRow.querySelectorAll('.tag-filter-chip').forEach(b=>b.classList.remove('active'));
    exportPdfAllergenRow.querySelectorAll('.tag-filter-chip').forEach(b=>b.classList.remove('active'));
    exportPdfRicettarioRow.querySelectorAll('.tag-filter-chip').forEach(b=>b.classList.remove('active'));
  }

  // Tutte le ricette esportabili, SENZA i filtri di cottura/tag/allergeni: è l'insieme usato
  // per generare davvero il PDF e per "Deseleziona tutte", così una selezione fatta prima di
  // applicare un filtro non viene mai persa silenziosamente alla conferma.
  function exportPdfRicetteAttive(){
    return sortRecipes(recipes.filter(r=>!r.archived));
  }

  // Sottoinsieme filtrato per metodo di cottura/tag/allergeni, usato solo per decidere
  // cosa mostrare nell'elenco di scelta e cosa selezionare con "Seleziona tutte (visibili)".
  function exportPdfRicetteFiltrate(){
    return exportPdfRicetteAttive().filter(r=>{
      if(exportPdfPressureOnly && !recipeHasPressure(r)) return false;
      if(exportPdfRobotOnly && !recipeHasRobot(r)) return false;
      if(exportPdfAirFryerOnly && !recipeHasAirFryer(r)) return false;
      if(exportPdfTraditionalOnly && !recipeIsTraditional(r)) return false;
      if(exportPdfTagFilters.size > 0){
        const rTags = r.tags || [];
        for(const t of exportPdfTagFilters){ if(!rTags.includes(t)) return false; }
      }
      if(exportPdfAllergenExclusions.size > 0){
        const rAllergens = r.allergens || [];
        for(const a of exportPdfAllergenExclusions){ if(rAllergens.includes(a)) return false; }
      }
      if(exportPdfRicettarioFilters.size > 0 && !exportPdfRicettarioFilters.has(recipeRicettarioId(r))) return false;
      return true;
    });
  }

  function renderExportPdfList(filtro){
    const q = normalize(filtro || '');
    const active = exportPdfRicetteFiltrate();
    const categorie = Object.keys(CATEGORY_COLORS);
    let html = '';
    categorie.forEach(cat=>{
      const filtrate = active.filter(r => r.category === cat && (!q || normalize(r.name).includes(q)));
      if(!filtrate.length) return;
      const tutteSelezionate = filtrate.every(r => exportPdfSelezionate.has(r.id));
      html += `
        <label class="export-pdf-category-header">
          <input type="checkbox" class="export-pdf-cat-check" data-cat="${escapeAttr(cat)}" ${tutteSelezionate ? 'checked' : ''}>
          <span class="cat-dot" style="background:${CATEGORY_COLORS[cat]}"></span>
          <span class="cat-name">${escapeHtml(cat)}</span>
          <span class="cat-count">${filtrate.length} ricett${filtrate.length === 1 ? 'a' : 'e'}</span>
        </label>
        ${filtrate.map(r => `
          <label class="recipe-picker-item export-pdf-item">
            <input type="checkbox" class="export-pdf-check" value="${escapeAttr(r.id)}" ${exportPdfSelezionate.has(r.id) ? 'checked' : ''}>
            <span class="name">${escapeHtml(r.name)}</span>
          </label>
        `).join('')}
      `;
    });
    exportPdfList.innerHTML = html || '<div class="recipe-picker-empty">Nessuna ricetta trovata.</div>';

    exportPdfList.querySelectorAll('.export-pdf-check').forEach(cb=>{
      cb.addEventListener('change', ()=>{
        if(cb.checked) exportPdfSelezionate.add(cb.value); else exportPdfSelezionate.delete(cb.value);
        aggiornaContatoreExportPdf();
        renderExportPdfList(exportPdfSearch.value);
      });
    });
    exportPdfList.querySelectorAll('.export-pdf-cat-check').forEach(cb=>{
      cb.addEventListener('change', ()=>{
        const cat = cb.dataset.cat;
        const filtrate = active.filter(r => r.category === cat && (!q || normalize(r.name).includes(q)));
        if(cb.checked) filtrate.forEach(r => exportPdfSelezionate.add(r.id));
        else filtrate.forEach(r => exportPdfSelezionate.delete(r.id));
        aggiornaContatoreExportPdf();
        renderExportPdfList(exportPdfSearch.value);
      });
    });
  }

  function aggiornaContatoreExportPdf(){
    const n = exportPdfSelezionate.size;
    exportPdfCount.textContent = n === 0 ? 'Nessuna ricetta selezionata' : `${n} ricett${n === 1 ? 'a' : 'e'} selezionat${n === 1 ? 'a' : 'e'}`;
  }

  const exportPdfFiltersToggle = document.getElementById('export-pdf-filters-toggle');
  const exportPdfFiltersPanel = document.getElementById('export-pdf-filters-panel');
  const exportPdfPressureBtn = document.getElementById('export-pdf-pressure-btn');
  const exportPdfRobotBtn = document.getElementById('export-pdf-robot-btn');
  const exportPdfAirFryerBtn = document.getElementById('export-pdf-airfryer-btn');
  const exportPdfTraditionalBtn = document.getElementById('export-pdf-traditional-btn');
  const exportPdfTagRow = document.getElementById('export-pdf-tag-row');
  const exportPdfAllergenRow = document.getElementById('export-pdf-allergen-row');
  const exportPdfRicettarioRow = document.getElementById('export-pdf-ricettario-row');

  exportPdfTagRow.innerHTML = TAG_OPTIONS.map(t=>`<button type="button" class="tag-filter-chip" data-tag="${escapeAttr(t)}">${escapeHtml(t)}</button>`).join('');
  exportPdfAllergenRow.innerHTML = ALLERGEN_OPTIONS.map(t=>`<button type="button" class="tag-filter-chip" data-allergen="${escapeAttr(t)}">${escapeHtml(t)}</button>`).join('');

  // Ricostruito ogni volta che si apre il pannello (non solo una volta all'avvio, a differenza
  // dei tag/allergeni): l'elenco dei ricettari può cambiare durante la sessione.
  function renderExportPdfRicettarioRow(){
    exportPdfRicettarioRow.innerHTML = ricettari.map(rb=>`<button type="button" class="tag-filter-chip" data-ricettario="${escapeAttr(rb.id)}">📚 ${escapeHtml(rb.name)}</button>`).join('');
    exportPdfRicettarioRow.querySelectorAll('.tag-filter-chip').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.ricettario;
        if(exportPdfRicettarioFilters.has(id)) exportPdfRicettarioFilters.delete(id); else exportPdfRicettarioFilters.add(id);
        btn.classList.toggle('active', exportPdfRicettarioFilters.has(id));
        renderExportPdfList(exportPdfSearch.value);
      });
    });
  }

  exportPdfFiltersToggle.addEventListener('click', ()=>{
    const aperto = exportPdfFiltersPanel.style.display !== 'none';
    exportPdfFiltersPanel.style.display = aperto ? 'none' : 'block';
    exportPdfFiltersToggle.textContent = aperto ? '🔍 Filtra per cottura, tag o allergeni ▾' : '🔍 Filtra per cottura, tag o allergeni ▴';
  });
  exportPdfPressureBtn.addEventListener('click', ()=>{
    exportPdfPressureOnly = !exportPdfPressureOnly;
    exportPdfPressureBtn.classList.toggle('active', exportPdfPressureOnly);
    renderExportPdfList(exportPdfSearch.value);
  });
  exportPdfRobotBtn.addEventListener('click', ()=>{
    exportPdfRobotOnly = !exportPdfRobotOnly;
    exportPdfRobotBtn.classList.toggle('active', exportPdfRobotOnly);
    renderExportPdfList(exportPdfSearch.value);
  });
  exportPdfAirFryerBtn.addEventListener('click', ()=>{
    exportPdfAirFryerOnly = !exportPdfAirFryerOnly;
    exportPdfAirFryerBtn.classList.toggle('active', exportPdfAirFryerOnly);
    renderExportPdfList(exportPdfSearch.value);
  });
  exportPdfTraditionalBtn.addEventListener('click', ()=>{
    exportPdfTraditionalOnly = !exportPdfTraditionalOnly;
    exportPdfTraditionalBtn.classList.toggle('active', exportPdfTraditionalOnly);
    renderExportPdfList(exportPdfSearch.value);
  });
  exportPdfTagRow.querySelectorAll('.tag-filter-chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const t = btn.dataset.tag;
      if(exportPdfTagFilters.has(t)) exportPdfTagFilters.delete(t); else exportPdfTagFilters.add(t);
      btn.classList.toggle('active', exportPdfTagFilters.has(t));
      renderExportPdfList(exportPdfSearch.value);
    });
  });
  exportPdfAllergenRow.querySelectorAll('.tag-filter-chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const a = btn.dataset.allergen;
      if(exportPdfAllergenExclusions.has(a)) exportPdfAllergenExclusions.delete(a); else exportPdfAllergenExclusions.add(a);
      btn.classList.toggle('active', exportPdfAllergenExclusions.has(a));
      renderExportPdfList(exportPdfSearch.value);
    });
  });
  document.getElementById('export-pdf-filters-clear-btn').addEventListener('click', ()=>{
    resetExportPdfFilters();
    renderExportPdfList(exportPdfSearch.value);
  });

  document.getElementById('export-all-pdf-btn').addEventListener('click', ()=>{
    const active = exportPdfRicetteAttive();
    if(!active.length){
      alert('Non hai ancora nessuna ricetta da esportare (quelle archiviate restano escluse).');
      return;
    }
    exportPdfSelezionate = new Set(active.map(r=>r.id)); // di default parte con tutto selezionato
    exportPdfSearch.value = '';
    renderExportPdfRicettarioRow();
    resetExportPdfFilters();
    exportPdfFiltersPanel.style.display = 'none';
    exportPdfFiltersToggle.textContent = '🔍 Filtra per cottura, tag o allergeni ▾';
    renderExportPdfList('');
    aggiornaContatoreExportPdf();
    exportPdfOverlay.classList.add('active');
  });
  document.getElementById('export-pdf-close').addEventListener('click', ()=> exportPdfOverlay.classList.remove('active'));
  exportPdfSearch.addEventListener('input', ()=> renderExportPdfList(exportPdfSearch.value));
  document.getElementById('export-pdf-all-btn').addEventListener('click', ()=>{
    // Seleziona solo le ricette attualmente visibili (dopo filtri e ricerca), non tutto il ricettario.
    const q = normalize(exportPdfSearch.value || '');
    exportPdfRicetteFiltrate().filter(r => !q || normalize(r.name).includes(q)).forEach(r => exportPdfSelezionate.add(r.id));
    aggiornaContatoreExportPdf();
    renderExportPdfList(exportPdfSearch.value);
  });
  document.getElementById('export-pdf-none-btn').addEventListener('click', ()=>{
    exportPdfSelezionate.clear();
    aggiornaContatoreExportPdf();
    renderExportPdfList(exportPdfSearch.value);
  });

  document.getElementById('print-a4-confirm-btn').addEventListener('click', ()=>{
    const selezionate = exportPdfRicetteAttive().filter(r => exportPdfSelezionate.has(r.id));
    if(!selezionate.length){ alert('Seleziona almeno una ricetta da stampare.'); return; }
    const ordineCat = Object.keys(CATEGORY_COLORS);
    selezionate.sort((a, b) => (ordineCat.indexOf(a.category) - ordineCat.indexOf(b.category)) || a.name.localeCompare(b.name, 'it'));
    exportPdfOverlay.classList.remove('active');
    stampaElencoA4(selezionate, r => r.servings || 1);
  });

  document.getElementById('export-pdf-confirm-btn').addEventListener('click', ()=>{
    const active = exportPdfRicetteAttive();
    const selezionate = active.filter(r => exportPdfSelezionate.has(r.id));
    if(!selezionate.length){
      alert('Seleziona almeno una ricetta da esportare.');
      return;
    }
    const categorie = Object.keys(CATEGORY_COLORS).filter(cat => selezionate.some(r => r.category === cat));
    // Se la selezione attraversa più ricettari, ogni ricetta riporta sotto il titolo da quale
    // volume viene — superfluo (e quindi omesso) quando si esporta un solo ricettario alla volta.
    const ricettariCoinvolti = new Set(selezionate.map(r => recipeRicettarioId(r)));
    const mostraRicettarioInPdf = ricettariCoinvolti.size > 1;

    const indiceLines = [];
    categorie.forEach(cat=>{
      indiceLines.push(cat);
      selezionate.filter(r => r.category === cat).forEach(r => indiceLines.push(`- ${r.name}${mostraRicettarioInPdf ? ` (${ricettarioName(recipeRicettarioId(r))})` : ''}`));
    });
    const sections = [{ heading: 'Indice', lines: indiceLines }];

    categorie.forEach(cat=>{
      const ricetteCategoria = selezionate.filter(r => r.category === cat);
      sections.push({
        heading: cat,
        headingSize: 20,
        pageBreakBefore: true,
        lines: [`${ricetteCategoria.length} ricett${ricetteCategoria.length === 1 ? 'a' : 'e'}`]
      });
      ricetteCategoria.forEach(r=>{
        const recipeSections = recipePdfSections(r, r.servings || 1);
        recipeSections[0] = { ...recipeSections[0], heading: r.name, headingSize: 16, pageBreakBefore: true };
        if(mostraRicettarioInPdf){
          recipeSections[0] = { ...recipeSections[0], lines: [`Ricettario: ${ricettarioName(recipeRicettarioId(r))}`, ...recipeSections[0].lines] };
        }
        sections.push(...recipeSections);
      });
    });

    const tutte = selezionate.length === active.length;
    // Se tutte le ricette scelte stanno in un solo ricettario, il PDF ne porta il nome
    // (titolo e nome file); altrimenti resta quello generico.
    const idsLibri = [...new Set(selezionate.map(recipeRicettarioId))];
    const libroUnico = idsLibri.length === 1 ? ricettarioName(idsLibri[0]) : '';
    const pdfStr = buildPdfFromSections(libroUnico || 'Il Mio Ricettario', sections);
    const prefisso = libroUnico ? pdfFileSlug(libroUnico, 'ricettario') : 'ricettario';
    const filename = tutte
      ? `${prefisso}-completo-${new Date().toISOString().slice(0,10)}.pdf`
      : `${prefisso}-selezione-${new Date().toISOString().slice(0,10)}.pdf`;
    downloadPdf(pdfStr, filename);
    exportPdfOverlay.classList.remove('active');
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
        if(parsed && parsed.protocollo === 'pp-ricettario'){ ppApriPacchetto(parsed); importRecipeFileInput.value = ''; return; }
        if(Array.isArray(parsed.recipes)){
          alert('Questo sembra un file di backup completo, non una singola ricetta. Usa "Importa backup" nel menu "Backup e CSV".');
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
        // Il ricettarioId nel file si riferisce a un volume di chi l'ha esportata: qui non
        // esiste, quindi la ricetta importata riparte sempre dal ricettario di partenza
        // (si può comunque spostarla in un altro volume dopo, modificandola).
        const recipe = migrateRecipe({ ...parsed, id: cryptoId(), ricettarioId: undefined, favorite: false, lastMade: null, timesMade: 0 });
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
    const fattore = e.servings || planServings; // porzioni di questo pasto, o il valore generale della settimana se non personalizzato
    const risultato = {};
    let almenoUno = false;
    for(const [k, v] of Object.entries(r.nutrizioneUtente)){
      if(v !== null && v !== undefined){ risultato[k] = v * fattore; almenoUno = true; }
      else{ risultato[k] = null; }
    }
    return almenoUno ? risultato : null;
  }

  /** Porzioni effettive di un pasto pianificato: quelle personalizzate per
   * quel pasto se presenti, altrimenti il valore generale della settimana
   * impostato in alto nella pianificazione. */
  function entryServings(e){
    return e.servings || planServings;
  }

  /** Collega una voce pianificata (entry) alla sua ricetta e calcola il
   * fattore di scala ingredienti/porzioni da usare per la lista della spesa
   * e per i PDF, tenendo conto delle porzioni personalizzate per quel
   * pasto. Ritorna null se la ricetta collegata non esiste più. */
  function entryRecipePair(e){
    const r = recipes.find(x=>x.id === e.recipeId);
    if(!r) return null;
    return { recipe: r, scale: entryServings(e) / (r.servings || 1), entry: e };
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
  function computeWeekPlanData(){
    const days = DAYS.map(day=>{
      const entries = (weekPlan[day] || []).slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
      return { day, entries: entries.map(e=>({ time: e.time || '', mealType: e.mealType, name: planEntryName(e), servings: entryServings(e) })) };
    });
    const allEntries = DAYS.flatMap(day => weekPlan[day] || []);
    const pairs = allEntries.map(entryRecipePair).filter(Boolean);
    const shoppingItems = buildAggregatedShoppingItems(pairs);
    return { days, shoppingItems };
  }
  function shoppingItemLine(i){
    if(i.fromDispensaFlag) return `${i.name} (dalla dispensa)`;
    return `${i.name}${i.qty ? ' — ' + formatQtyForUnit(i.qty, i.unit) : ''}${i.unit ? ' ' + i.unit : ''}`;
  }

  // ---------- Generatore PDF minimale (testo + un piccolo logo in calce a ogni pagina, nessuna libreria esterna) ----------
  // Logo "Clan Destino" (JPEG 140x140, sfondo bianco) incorporato come base64: nessun file
  // esterno da scaricare al volo, il PDF resta generabile offline come il resto del sito.
  const PDF_LOGO_JPEG_B64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCACMAIwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD6pooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooqlquuaVocHn6rqVlp8P8Az0up1iX82IoAu0Vwlx8dfhnbPsfxtohP/TO4Dj81yKv6T8WfAWtyCLT/ABhoU8rdI/tiK5+ikg0AdZRSI6yKHRgysMgg5BpaACiiigAooooAKKKKACiiigAooooAKyPFfi3RfBOiz61r9/FY2UI5dzyzdlVRyzHsBzS+K/FGl+DPD97r2s3AgsbOMySN1J7BVHdicADuTXiGl6TrPxI1O68d+MIrq3tNMjea3sIV3nTo1Xd5US/xXRABeTqhIVcP/qwC7e+OviJ8TbuW08N21x4W0pfvNsVtQdCMhpGb93agjscyY5CkVe0j9m/SXf8AtDX7ganeOuXlm/02Zz7y3GVP/AY1qv4z1DS/Fnw3stZ8A69DaaLYSeXqljJHmA28o2yC6i+/8u4Mxzu272BJwa6/wJ4zl0fwHaP49kh0O9snayaW7nXZeBMbJYm/5ahkK8gcnPFAHK/D3/hAPFzpZWOna5YSy2r3tst26Qi4hSUwuV8ptoKuMFTgjIOMGs7RNC+H/wARPDt3r95pV9pGnW9qLz7VqkdrcRGMlwTuw7AjYSRlWwynuKTwdplpojfaorzXNSNvaX9ppz6f4ZvPKtxdTmZnZmH70g4AC7RgHqTkU9PtdN8MeCZfBkd/pDQ3jQwXVhqWnTaK95AITHIwkmBBuXPlndnA2DHPUAXSPh9q2j2kmsfC7xRdx20Mpjkt7TzGhVxgsktlcEkMARna4YZ4TpXX+C/jlvvLfQ/HdnDoupTP5FvfwsTYXkg6oGbDQyf9M5MEceoFY+p6Jq91p3gP4dz31wfEjhdS1LV7OSSMQRRAB5Q4wJZmysYY5PJYgZFXL/SdM+IU2qeFZ4Bqs2j2UcGp+IplVbS5ul5a3mUYJKjDb1+aMngqeGAPZ6K8S+GXjbVPBPiCH4feLZbiS1lkMGkX1026WOQAH7HM3Rm2kGN+jqRjB+VfbaACiiigAooooAKKKKACiiq2p38Wl6ddX85xDawvM59FVSx/QUAeI/EO/n+I/wAUbbwvazKmleHZEkmZsGN79lLhmB4KwRBnweN5VT1rp7rx83w1nksdb0aG08KtGBpGrwTmWF2252XT4zG7tkhyCp3cknJrj/gv4Ql8Z+CtevNQuJbW81+CZ5bqLlkluyZXbB64j+zDHQgEd625bfxl4R0sPr2k+Gxoei2kqLbaWxFvqjuVEEf2RkxE/m7DuDEDJAHPABleF/C0H9uK3hvTVg165iaeS4u1fbo1jOqtFFdR79s06DcsUXAVACeAC3oz6N4T+HNlP4l1u4NxeRr++1fUT511IeyoccZ6COMAegrW8FeGz4Z0KO2uJRcajcO11qF1jm4un5kf6Z4UdlVR0FeWfHJoz4jji1Oa8fTDZwOUVGENsiyu00rMBjJUInqCR2oA9UHjTRUAa6uhZRlxF5l0RGgcjIQkn5Wx/C2DWvcW1tqFs8FxDFcW8q4aORQ6OD2IPBFfMnxKstNuNT0TTdA1a4t4tXtrZF092AgiWHbIJmB5ViqkYI3EnJODg+xfCS51b7PrGm307XllYXhjs7turq2WKZ7hcrzwOcDpQAuq+B77w3bTzeC2kW0dGFxoPnmOGVSDk2z5zbS8nG0hCcZA+8PLPEWhanrnhPRvB3gy3vJ/Dt/MYBbwboJFVCDdPqMxX5Jd5KeXjklmIYgLX0jXl/xA8OTQ6rcWNjdmwsfGcbWFywLBI75E3RudpBAljR4n2kE7Uwc80Acx4x0HQ/FnhW505fFekaprukxg3X9nSpvsoVbMbKqsW/0djkMTuK71Jy5r0H4QeNLjxr4Nin1MKmtafK+nanGMfLcxHDHjswww/wB6snwL8KLrRtQh1LXbjRwlrBJBZ6To1gLayt1kADsxOXldlAGWOOvGTmuZ+FjP4T+MeveGyz/Z9SsROpY8Ga1k8nP1aJomPrQB7lRRRQAUUUUAFFFFABXG/Ga5e0+FHi6WMlW/sm5UEdsxkf1rsq5n4naW+tfDrxNp0YJkuNLuY0A7t5bY/XFAHH/Dy7vfC3wkuL3RtGl1m8tgPJsIXCNOUjijABOf4Vz07cVu+Mbi41Oy8FpdWr2T3+s2clxauwYxMkck/lkjg4eJR6cVl/s+6oup+A4G3AuVhlIH+3BGT/4+HH4VufFA/Y9G0/XCSI9F1S1v5iB0hD+XK34RyO34UAdiOgrP8QW8N1oWoQzrG0T20gYSAFcbT1zxWgOlNkjSWNo5FDIwIZSMgg9RQB81r8PvDeo2C+ItWstRGp3T+fYWumt/pQhHCrGpwkcfq753HJPZa7XwLeeKfBJdNR8NXdv4flkX5ftJuZ4Hc/6wk8tkn5gAMdh68tp3iLxR4Z8aX/hbw7o/9rT2DS/ZoU4ZoldQplkc4wqMoGSMFuPSvWlutVTwdKviWaFNVnjMjx2+CsRyPlBHocDPrk0AddFKk0aSxsHRwGVlOQQehFcj8WD5Pg2S+UDzbC8s7yI+jR3MZ/UZH41t+GW/4lrIMhY7ieNQRjCiVgMe3p7YrD+J5F5pWmaEo3S6xqtpbBR18tJBNKfoI4noAva94j1nS/EmhaZYeGbrU7HUZJFu9QjlCpYBQMFgRzn6jpxk8V5hrTG0/aT8MunAuJb2JwO4awhbn8UBr2+OWOUMY3V9pIO0g4PcfWvECV1v9pPSmhO4adHqF249FEMNsD/32HH4UAe5UUUUAFFFFABRRRQAUjKGUggEHqD3paKAPBvhBOfh74113wRdArFZ3DxWygcvbyFp7Vh68NMhx/FsHetbSPE3jPx5ZRa4X0Kbw7e3AtLnQIUWWSC1dT5pu52cCORUJJRVPJCkckix8cvCF2ptPH2iW801/pEZiv7e34lurHcGOw/89ImAkT3HfpWTJqupfFkaJZxym78MXSK+q2+lMsEl0SfllkkZwRauA25UG8OpjPqADt/hz4hSGKLwre3yXc9tbiXTL4OGXVLDgRzK3RnUFUkHqA3RxXWa4l3JpNyLG+i0+4CZW5lQOsYBySQeOgPPbrzjFeaaprfhHXvEWi/DzQdKaQW7zOmo6TIkC6K8KZLRMBywLqpAG079rZ5WtnSPGeu2cEv2m1i8W2FvK9u2p6EUMyuh2ss1sSCHB6+WW/3V6UAeW3vxB03wvr+oT29zZ6/dXjSm4m06VXimiKArD97cvzAgtnJZ93AwKi/4XCNStY9Eni1LXHS48yL7HB595DbjG2KZoiyeYSCOvQZIHSvXZ/iL4AdPI1CWO2PeC/02WFgfTbJGKfaeP9BjhFv4V0TVdVJOBHpumtFDn3lkCRD67qALfw/u9SPhmXVNf0xNCM8slytpJISbaHAA8wt0bClj6Z7VxmreKrHUbt/FupSzRWE0EmnaBBFIkd1JC+BcahGjkM3G3YFBbYoIB8zFUvH3i8xafHqHjAw3lgZWEfhzSpvMtyyMm5r+5xjYhkQsgAUZ5EgHEfifQ4r/AF220/4g6cNS03XLhToWrw2iPcaRO6giycIGUpgEhsMjYbdnqADL8H+EL/wlLZeKdOi8ODTbVNz6voN3LD/bEO0osMtoQUMruUG7cNre/FbfwD02XWNe8TeNbhxNHI66RZzjpKsTF55VPdXnZiPpXGahYGB7b4e+Co9Pi1TVZ3lmuNOjeO2UKSjXvll2CLGnyrtIDyklR+7XP0R4W8N2HhDw7p+g6XH5dnYQrDGD1IHVj6knJJ9SaANSiiigAooooAKKKKACiiigA614X43+G2rfD/U5/E/gi0lvNIld5r3RbdQZbZm/1ktsp+V0YD54Dw2BjBClPdKKAPn/AMGeJNBaDW/EfhiS0XXbjTYNKsIZXSGztPK3BY1YqDDyQxil5JUBWYYNb/wS+HV54c1bXr7U7eeKG11G6ttK8/IeWJ2UyXJ/veZsjwfRTjrXR+M/gt4a8XXz6xD9q0PXGBB1PTJPKlk9pF+7IDgZDA5HGa4tfAfxc8GHboeq6Trtqmdqxytp8zfWMh4PxCigCf4neOfEnhrxxqTaTqs4t9O0/S5o9NKRtHdTT3phdDld+TH02kEEZ9ad/bF1bfGXXdE1zWr9dNd4FtFbUvLXbdwlFiWAL8+JVchxymFzxmsWS5+JK6quq3/ws8/VkK7b7y9PuJgV+6RKCp47ccVOB8Xda1Fr2LwPDYXTqEN9eXdlC4HbmON5cD2YUAX/AIf2LeDJda8Na/GkvhQQNbi41HSUs5ppVPkiIbDi73wqDvUZIAB5OK52PxZqSabB8M/A/wBv8QXVsDGBcttaCEkhRcyL/qIVHGzJlYDaSmcHpNP+BniXX7j7V428XsiuNslnom9GkH917qUmVlPQqMCvVPC/hDQfBelppfh/S7bTrROdkK4LH1Zjyx9ySaAMD4ZfDO28A2U9zc3H9pa/qG1tQ1FkC+YQMLHGo4SJBwqDgAfQDtqKKACiiigAooooAKKKKACiiigAooooAKKKKADA9KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9k=';
  const PDF_LOGO_W = 140, PDF_LOGO_H = 140;

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
    const logoObjId = objId++;
    const pageObjIds = [], contentObjIds = [];
    pages.forEach(()=>{ pageObjIds.push(objId++); contentObjIds.push(objId++); });

    const objects = [];
    objects[catalogObjId] = `<< /Type /Catalog /Pages ${pagesObjId} 0 R >>`;
    objects[pagesObjId] = `<< /Type /Pages /Kids [${pageObjIds.map(n=>n+' 0 R').join(' ')}] /Count ${pages.length} >>`;
    objects[fontObjId] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;
    // Logo incorporato come immagine JPEG grezza (filtro DCTDecode: i byte del file restano
    // quelli, nessuna ricompressione) — atob() restituisce già una "stringa binaria" con un
    // carattere per byte, lo stesso formato che downloadPdf si aspetta per l'intero PDF.
    objects[logoObjId] = {
      isStream: true,
      extra: `/Type /XObject /Subtype /Image /Width ${PDF_LOGO_W} /Height ${PDF_LOGO_H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`,
      data: atob(PDF_LOGO_JPEG_B64)
    };

    pages.forEach((pageCmds, i)=>{
      const pageId = pageObjIds[i], contentId = contentObjIds[i];
      objects[pageId] = `<< /Type /Page /Parent ${pagesObjId} 0 R /Resources << /Font << /F1 ${fontObjId} 0 R >> /XObject << /LogoCD ${logoObjId} 0 R >> >> /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R >>`;
      const streamLines = ['BT'];
      pageCmds.forEach(c=>{
        streamLines.push(`/F1 ${c.size} Tf`);
        streamLines.push(`1 0 0 1 ${(c.x !== undefined ? c.x : MARGIN_X).toFixed(2)} ${c.y.toFixed(2)} Tm`);
        streamLines.push(`(${pdfSanitizeText(c.text)}) Tj`);
      });
      streamLines.push('ET');
      // Logo "Clan Destino" + firma dell'autore in calce, identici su ogni pagina (il disegno
      // di un'immagine con l'operatore "Do" deve stare fuori dal blocco di testo BT/ET).
      const footerSize = 20, footerX = MARGIN_X, footerY = 20;
      streamLines.push('q');
      streamLines.push(`${footerSize} 0 0 ${footerSize} ${footerX} ${footerY} cm`);
      streamLines.push('/LogoCD Do');
      streamLines.push('Q');
      streamLines.push('BT');
      streamLines.push('/F1 7.5 Tf');
      streamLines.push(`1 0 0 1 ${(footerX + footerSize + 6).toFixed(2)} ${(footerY + footerSize / 2 - 3).toFixed(2)} Tm`);
      streamLines.push(`(${pdfSanitizeText('Clan Destino - Giampiero Santoro')}) Tj`);
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
        const dict = obj.extra ? `<< ${obj.extra} /Length ${obj.data.length} >>` : `<< /Length ${obj.data.length} >>`;
        out += `${n} 0 obj\n${dict}\nstream\n${obj.data}\nendstream\nendobj\n`;
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
        const handle = await apriSelettoreFile('showSaveFilePicker', {
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
        ? entries.map(e => `${e.time ? e.time + ' — ' : ''}${e.mealType}: ${e.name}${e.servings !== planServings ? ` (${e.servings} porzioni)` : ''}`)
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

  // ---------- Condividi la lista della spesa come testo ----------
  function testoListaDa(ul, titolo){
    const righe = [titolo, ''];
    let n = 0;
    Array.from(ul.children).forEach(li=>{
      if(li.classList.contains('shopping-reparto-header')){
        if(n || righe.length > 2) righe.push('');
        righe.push(li.textContent.trim().toUpperCase());
        return;
      }
      const cb = li.querySelector('input[type=checkbox]');
      if((cb && cb.checked) || li.classList.contains('checked')) return;
      const name = (li.querySelector('.spesa-name, span') || {}).textContent || '';
      const amt = (li.querySelector('.amt') || {}).textContent || '';
      if(!name.trim() || li.classList.contains('shopping-empty')) return;
      righe.push(`☐ ${name.trim()}${amt.trim() ? ' — ' + amt.trim() : ''}`); n++;
    });
    return n ? righe.join('\n') : '';
  }
  async function condividiTestoLista(ul, titolo, btn){
    const testo = testoListaDa(ul, titolo);
    if(!testo){ alert('Non c\'è nulla da condividere: la lista è vuota o è già tutta spuntata.'); return; }
    const orig = btn.textContent;
    const ok = msg => { btn.textContent = msg; setTimeout(()=>{ btn.textContent = orig; }, 2000); };
    if(navigator.share){
      try{ await navigator.share({ title: titolo, text: testo }); return; }
      catch(err){ if(err && err.name === 'AbortError') return; }
    }
    try{ await navigator.clipboard.writeText(testo); ok('✓ Copiata negli appunti'); }
    catch(_){ window.prompt('Copia la lista:', testo); }
  }
  document.getElementById('share-spesa-btn').addEventListener('click', e => condividiTestoLista(spesaItemsEl, 'Lista della spesa', e.currentTarget));
  document.getElementById('share-shopping-btn').addEventListener('click', e => condividiTestoLista(shoppingListItems, 'Lista della spesa (settimana)', e.currentTarget));

  // ---------- Promemoria settimanale di backup ----------
  const BACKUP_SNOOZE_KEY = 'mc_ricettario_backup_snooze_v1';
  const BACKUP_REMINDER_OFF_KEY = 'mc_ricettario_backup_promemoria_off_v1';
  function aggiornaBannerBackup(){
    const ban = document.getElementById('backup-weekly-banner');
    const tog = document.getElementById('backup-reminder-toggle-btn');
    if(!ban) return;
    const off = localStorage.getItem(BACKUP_REMINDER_OFF_KEY) === '1';
    if(tog) tog.textContent = off ? '🔕 Promemoria settimanale: disattivato' : '🔔 Promemoria settimanale: attivo';
    const raw = localStorage.getItem(LAST_BACKUP_KEY);
    const days = raw ? (Date.now() - new Date(raw).getTime()) / 86400000 : Infinity;
    const snooze = parseInt(localStorage.getItem(BACKUP_SNOOZE_KEY) || '0', 10);
    const due = !off && recipes.length > 0 && days >= 7 && Date.now() >= snooze;
    if(due){
      document.getElementById('backup-weekly-text').textContent = raw
        ? `💾 Ultimo backup ${Math.floor(days)} giorni fa: salvane uno nuovo per non perdere le ricette.`
        : '💾 Non hai ancora fatto nessun backup: salvane uno per non perdere le ricette.';
    }
    ban.style.display = due ? 'flex' : 'none';
  }
  document.getElementById('backup-weekly-do-btn').addEventListener('click', () => document.getElementById('export-btn').click());
  document.getElementById('backup-weekly-later-btn').addEventListener('click', () => {
    safeStorageSet(BACKUP_SNOOZE_KEY, String(Date.now() + 86400000)); aggiornaBannerBackup();
  });
  document.getElementById('backup-weekly-off-btn').addEventListener('click', () => {
    safeStorageSet(BACKUP_REMINDER_OFF_KEY, '1'); aggiornaBannerBackup();
  });
  document.getElementById('backup-reminder-toggle-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    safeStorageSet(BACKUP_REMINDER_OFF_KEY, localStorage.getItem(BACKUP_REMINDER_OFF_KEY) === '1' ? '0' : '1');
    aggiornaBannerBackup();
  });

  // ---------- Annulla importazione: fotografia dei dati prima dell'importazione ----------
  async function ripristinaSnapshotDati(json){
    const d = JSON.parse(json);
    recipes = (d.recipes || []).map(migrateRecipe);
    ricettari = Array.isArray(d.ricettari) && d.ricettari.length ? d.ricettari : ricettari;
    raccolte = Array.isArray(d.raccolte) ? d.raccolte : [];
    dispensaItems = d.dispensaItems || [];
    shoppingExtraItems = d.shoppingExtraItems || [];
    spesaLista = d.spesaLista || [];
    if(Array.isArray(d.mealTypes) && d.mealTypes.length) mealTypes = d.mealTypes;
    planWeeks = d.planWeeks && typeof d.planWeeks === 'object' ? d.planWeeks : {};
    const w = planWeeks[planWeekStart] || {};
    weekPlan = w.plan || {}; weekNotes = w.notes || {};
    saveRecipes(); saveRicettari(); saveRaccolte(); saveDispensaItems(); saveShoppingExtra(); saveSpesaLista(); saveMealTypes();
    saveWeek(); saveWeekNotes();
    refreshRicettarioSelects(); refreshRaccolteUi(); renderList(); renderPlanningDays(); renderDispensaList(); renderSpesaLista(); renderToday();
  }

  // ---------- Cambio dispositivo ----------
  const trasfOverlay = document.getElementById('trasferimento-overlay');
  function mostraTabTrasferimento(invia){
    document.getElementById('trasf-invia').hidden = !invia;
    document.getElementById('trasf-ricevi').hidden = invia;
    [['trasf-tab-invia', invia], ['trasf-tab-ricevi', !invia]].forEach(([id, on])=>{
      const b = document.getElementById(id); b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on));
    });
  }
  document.getElementById('open-trasferimento-btn').addEventListener('click', ()=>{
    salvaSettimane();
    const nFoto = recipes.filter(r => r.photo).length;
    const nSett = Object.keys(planWeeks).length;
    const parti = [`${recipes.length} ${recipes.length === 1 ? 'ricetta' : 'ricette'}`, `${nFoto} ${nFoto === 1 ? 'foto' : 'foto'}`,
      `${dispensaItems.length} prodott${dispensaItems.length === 1 ? 'o' : 'i'} in dispensa`, `${nSett} settiman${nSett === 1 ? 'a' : 'e'} pianificat${nSett === 1 ? 'a' : 'e'}`];
    if(raccolte.length) parti.push(`${raccolte.length} ${raccolte.length === 1 ? 'raccolta' : 'raccolte'}`);
    document.getElementById('trasf-summary').textContent = 'Verranno trasferiti: ' + parti.join(' · ') + '.';
    const web = location.protocol === 'http:' || location.protocol === 'https:';
    document.getElementById('trasf-share-url-btn').disabled = !web;
    document.getElementById('trasf-url-note').textContent = web ? '' : 'Stai usando una copia locale del ricettario: pubblica il sito (GitHub Pages) per avere un indirizzo da condividere.';
    mostraTabTrasferimento(true);
    trasfOverlay.classList.add('active');
  });
  document.getElementById('trasf-tab-invia').addEventListener('click', ()=> mostraTabTrasferimento(true));
  document.getElementById('trasf-tab-ricevi').addEventListener('click', ()=> mostraTabTrasferimento(false));
  document.getElementById('trasf-export-btn').addEventListener('click', ()=> document.getElementById('export-btn').click());
  document.getElementById('trasf-import-btn').addEventListener('click', ()=>{ trasfOverlay.classList.remove('active'); document.getElementById('import-file-input').click(); });
  document.getElementById('trasf-share-url-btn').addEventListener('click', async ()=>{
    const url = location.href.split('#')[0].replace(/index\.html$/, '');
    const nota = document.getElementById('trasf-url-note');
    if(navigator.share){ try{ await navigator.share({ title: 'Il Mio Ricettario', url }); return; }catch(err){ if(err && err.name === 'AbortError') return; } }
    try{ await navigator.clipboard.writeText(url); nota.textContent = '✓ Indirizzo copiato'; }
    catch(_){ window.prompt('Copia l\'indirizzo:', url); }
  });
  const chiudiTrasf = ()=> trasfOverlay.classList.remove('active');
  ['trasf-close','trasf-done'].forEach(id => document.getElementById(id).addEventListener('click', chiudiTrasf));
  trasfOverlay.addEventListener('click', e=>{ if(e.target === trasfOverlay) chiudiTrasf(); });

  // ---------- Export / Import backup ----------
  document.getElementById('export-btn').addEventListener('click', async ()=>{
    const data = JSON.stringify({ recipes, ricettari, raccolte, weekPlan, planWeeks: settimaneComplete(), mealTypes, dispensaItems, shoppingExtraItems, weekNotes, spesaLista }, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const saved = await saveFileSmart(blob, `ricettario-backup-${new Date().toISOString().slice(0,10)}.json`, 'application/json', '.json', 'Backup JSON');
    if(!saved) return;
    safeStorageSet(LAST_BACKUP_KEY, new Date().toISOString());
    updateBackupReminder();
    aggiornaBannerBackup();
  });

  const importBtn = document.getElementById('import-btn');
  // Sceglie dove vanno le ricette di un backup: come nel backup, in un ricettario esistente o in uno nuovo.
  // Restituisce { mode, id?, name? } oppure null se l'utente annulla.
  function chiediDestinazioneImport(numRicette, nomeFile){
    return new Promise(resolve=>{
      const ov = document.getElementById('import-dest-overlay');
      const sel = document.getElementById('import-dest-existing');
      const nome = document.getElementById('import-dest-new-name');
      document.getElementById('import-dest-intro').textContent = `Il file contiene ${numRicette} ricett${numRicette === 1 ? 'a' : 'e'}.`;
      sel.innerHTML = ricettari.map(rb => `<option value="${escapeAttr(rb.id)}">${escapeHtml(rb.name)}</option>`).join('');
      nome.value = String(nomeFile || '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
      ov.querySelector('input[value="originale"]').checked = true;
      function fine(r){
        ov.classList.remove('active');
        okB.removeEventListener('click', onOk); cancB.removeEventListener('click', onCanc); xB.removeEventListener('click', onCanc);
        resolve(r);
      }
      const okB = document.getElementById('import-dest-ok'), cancB = document.getElementById('import-dest-cancel'), xB = document.getElementById('import-dest-close');
      function onCanc(){ fine(null); }
      function onOk(){
        const mode = ov.querySelector('input[name="import-dest"]:checked').value;
        if(mode === 'esistente') return fine({ mode, id: sel.value });
        if(mode === 'nuovo'){
          const n = nome.value.trim();
          if(!n){ alert('Dai un nome al nuovo ricettario.'); nome.focus(); return; }
          return fine({ mode, name: n });
        }
        fine({ mode: 'originale' });
      }
      sel.onfocus = () => { ov.querySelector('input[value="esistente"]').checked = true; };
      nome.onfocus = () => { ov.querySelector('input[value="nuovo"]').checked = true; };
      okB.addEventListener('click', onOk); cancB.addEventListener('click', onCanc); xB.addEventListener('click', onCanc);
      ov.classList.add('active');
    });
  }

  const importFileInput = document.getElementById('import-file-input');
  importBtn.addEventListener('click', ()=> importFileInput.click());
  importFileInput.addEventListener('change', ()=>{
    const file = importFileInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (e)=>{
      try{
        let parsed = JSON.parse(e.target.result);
        const prima = JSON.stringify(datiCompletiPerFile()); // per «Annulla importazione»
        let incoming = Array.isArray(parsed) ? parsed : (parsed.recipes || []);
        if(!Array.isArray(incoming)) throw new Error('Formato non valido');
        if(incoming.length){
          const dest = await chiediDestinazioneImport(incoming.length, file.name);
          if(!dest){ importFileInput.value = ''; return; }
          if(dest.mode !== 'originale'){
            let destId = dest.id;
            if(dest.mode === 'nuovo'){ destId = cryptoId(); ricettari.push({ id: destId, name: dest.name, cover: '' }); saveRicettari(); refreshRicettarioSelects(); }
            incoming = incoming.map(r => r ? Object.assign({}, r, { ricettarioId: destId }) : r);
            // ogni ricetta va nel ricettario scelto: i ricettari del backup non servono
            if(!Array.isArray(parsed)) parsed = Object.assign({}, parsed, { ricettari: [] });
          }
        }
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
        // I ricettari del backup arrivano con lo stesso id con cui le ricette li referenziano
        // (ricettarioId): aggiungendo quelli nuovi e aggiornando quelli già noti (solo se si è
        // scelto di sovrascrivere), le ricette importate ritrovano subito il volume giusto.
        let addedRicettari = 0;
        if(Array.isArray(parsed.ricettari)){
          const existingRicettariIds = new Set(ricettari.map(rb=>rb.id));
          parsed.ricettari.forEach(rb=>{
            if(!rb || !rb.id) return;
            if(existingRicettariIds.has(rb.id)){
              if(overwrite){
                const idx = ricettari.findIndex(x=>x.id===rb.id);
                if(idx > -1) ricettari[idx] = rb;
              }
            }else{
              ricettari.push(rb); addedRicettari++;
            }
          });
          if(parsed.ricettari.length) saveRicettari();
        }
        if(Array.isArray(parsed.raccolte)){
          const note = new Set(raccolte.map(x=>x.id));
          parsed.raccolte.forEach(x=>{ if(x && x.id && x.name && !note.has(x.id)) raccolte.push({ id: x.id, name: String(x.name) }); });
          saveRaccolte(); refreshRaccolteUi();
        }
        if(parsed.planWeeks && typeof parsed.planWeeks === 'object'){
          // Backup con date: unisce settimana per settimana senza perdere ciò che c'è già
          salvaSettimane();
          Object.keys(parsed.planWeeks).forEach(lun=>{
            const inc = parsed.planWeeks[lun] || {};
            const loc = planWeeks[lun] || { plan: {}, notes: {} };
            DAYS.forEach(d=>{
              const gia = new Set((loc.plan[d] || []).map(e=>e.id));
              const nuovi = ((inc.plan || {})[d] || []).filter(e=>e && !gia.has(e.id));
              if(nuovi.length) loc.plan[d] = (loc.plan[d] || []).concat(nuovi);
              if(inc.notes && inc.notes[d]) loc.notes[d] = Object.assign({}, inc.notes[d], loc.notes[d] || {});
            });
            planWeeks[lun] = loc;
          });
          const w = planWeeks[planWeekStart] || {};
          weekPlan = w.plan || {}; weekNotes = w.notes || {};
          migrateWeekPlan(); saveWeek();
        }else if(parsed.weekPlan){ weekPlan = {...weekPlan, ...parsed.weekPlan}; migrateWeekPlan(); saveWeek(); }

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
        if(Array.isArray(parsed.spesaLista)){
          const idsSpesa = new Set(spesaLista.map(i=>i.id));
          parsed.spesaLista.forEach(i=>{ if(i && i.name && !idsSpesa.has(i.id)) spesaLista.push(i); });
          saveSpesaLista();
        }
        if(!parsed.planWeeks && parsed.weekNotes && typeof parsed.weekNotes === 'object'){
          Object.keys(parsed.weekNotes).forEach(day=>{
            if(!weekNotes[day]) weekNotes[day] = {};
            Object.assign(weekNotes[day], parsed.weekNotes[day]);
          });
          saveWeekNotes();
        }
        saveRecipes(); refreshRicettarioSelects(); renderList(); renderPlanningDays(); renderDispensaList();

        let msg = `Ricette: ${addedRecipes} ${plural(addedRecipes,'aggiunta','aggiunte')}, ${updatedRecipes} ${plural(updatedRecipes,'aggiornata','aggiornate')}`;
        if(matchingRecipes.length && !overwrite) msg += `, ${matchingRecipes.length} già ${plural(matchingRecipes.length,'presente','presenti')} (non modificat${plural(matchingRecipes.length,'a','e')})`;
        msg += '.';
        if(addedRicettari) msg += `\nRicettari: ${addedRicettari} nuov${plural(addedRicettari,'o','i')}.`;
        if(incomingDispensa.length){
          msg += `\nDispensa: ${addedDispensa} ${plural(addedDispensa,'aggiunto','aggiunti')}, ${updatedDispensa} ${plural(updatedDispensa,'aggiornato','aggiornati')}`;
          if(matchingDispensa.length && !overwrite) msg += `, ${matchingDispensa.length} già ${plural(matchingDispensa.length,'presente','presenti')} (non modificat${plural(matchingDispensa.length,'o','i')})`;
          msg += '.';
        }
        alert(msg);
        mostraAnnulla('Importazione completata', ()=> ripristinaSnapshotDati(prima), 20000);
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
    if(s.airFryerTemp) parts.push(`friggitrice ad aria ${s.airFryerTemp}°C${s.airFryerPreheat ? ', preriscaldata' : ''}`);
    else if(s.airFryerPreheat) parts.push('friggitrice ad aria preriscaldata');
    return parts.length ? `${s.text} (${parts.join(', ')})` : s.text;
  }
  function csvStepTextToStep(raw){
    const m = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(raw.trim());
    let text = raw.trim(), timeVal = '', velVal = '', tempVal = '', modeVal = 'Normale';
    let airFryerTempVal = '', airFryerPreheatVal = false;
    if(m){
      text = m[1].trim();
      let inner = m[2];
      // La parte "friggitrice ad aria …" va estratta e tolta dal resto PRIMA delle
      // altre regex: altrimenti la sua temperatura verrebbe scambiata per quella
      // del robot da cucina (entrambe scritte come "NNN°C" nello stesso testo).
      const airFryerMatch = /friggitrice ad aria(?:\s+([\d.,]+)\s*°?C)?(,?\s*preriscaldata)?/i.exec(inner);
      if(airFryerMatch){
        if(airFryerMatch[1]) airFryerTempVal = airFryerMatch[1].replace(',','.');
        if(airFryerMatch[2]) airFryerPreheatVal = true;
        inner = inner.slice(0, airFryerMatch.index) + inner.slice(airFryerMatch.index + airFryerMatch[0].length);
      }
      const timeMatch = /([\d.,]+)\s*min/i.exec(inner);
      if(timeMatch) timeVal = timeMatch[1].replace(',','.');
      const velMatch = /vel\.?\s*([\d.,]+)/i.exec(inner);
      if(velMatch) velVal = velMatch[1].replace(',','.');
      const tempMatch = /([\d.,]+)\s*°?C/i.exec(inner);
      if(tempMatch) tempVal = tempMatch[1].replace(',','.');
      const modeMatch = /(Reverse|Turbo|Vapore|Normale)/i.exec(inner);
      if(modeMatch) modeVal = modeMatch[1][0].toUpperCase() + modeMatch[1].slice(1).toLowerCase();
    }
    return {text, vel:velVal, temp:tempVal, time:timeVal, mode:modeVal, airFryerTemp:airFryerTempVal, airFryerPreheat:airFryerPreheatVal};
  }

  document.getElementById('export-csv-btn').addEventListener('click', ()=>{
    const scope = document.getElementById('csv-ricettario-scope').value;
    const header = ['Nome','Categoria','Ricettario','Porzioni','Tempo (min)','Tag','Allergeni','Ingredienti','Passaggi','Note'];
    const rows = [header];
    recipes.filter(r => !scope || recipeRicettarioId(r) === scope).forEach(r=>{
      rows.push([
        r.name, r.category, ricettarioName(recipeRicettarioId(r)), r.servings, r.time,
        (r.tags || []).join(', '),
        (r.allergens || []).join(', '),
        r.ingredients.map(ingredientToCsvText).join(' | '),
        r.steps.map(stepToCsvText).join(' | '),
        r.notes || ''
      ]);
    });
    if(rows.length < 2){ alert('Nessuna ricetta da esportare con questo ricettario selezionato.'); return; }
    const csvContent = rows.map(toCsvRow).join('\r\n');
    const blob = new Blob(['\ufeff' + csvContent], {type:'text/csv;charset=utf-8;'});
    const safeScope = scope ? '-' + ricettarioName(scope).toLowerCase().replace(/[^\w]+/g,'-').replace(/^-+|-+$/g,'') : '';
    saveFileSmart(blob, `ricette${safeScope}-${new Date().toISOString().slice(0,10)}.csv`, 'text/csv', '.csv', 'File CSV');
  });

  // Trova un ricettario per nome (senza distinguere maiuscole/accenti) o lo crea al volo: usato
  // dall'importazione CSV quando la colonna "Ricettario" nomina un volume che qui non esiste
  // ancora, cos\u00ec l'importazione non obbliga a crearlo prima a mano.
  function ricettarioIdByNameOrCreate(nome){
    const n = normalize(nome);
    const trovato = ricettari.find(rb => normalize(rb.name) === n);
    if(trovato) return trovato.id;
    const nuovo = { id: cryptoId(), name: nome.trim(), cover: '' };
    ricettari.push(nuovo);
    return nuovo.id;
  }

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
          ricettario: header.indexOf('ricettario'),
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

        // Ricettario di ricaduta per le righe senza colonna "Ricettario" (o con cella vuota):
        // quello scelto nella pagina «Importa ricette» per questa importazione, altrimenti quello di partenza.
        const fallbackRicettarioId = document.getElementById('csv-import-scope').value || DEFAULT_RICETTARIO_ID;
        let added = 0, updated = 0, skipped = 0;

        rows.forEach(row=>{
          const name = (row[idx.name] || '').trim();
          const key = name.toLowerCase();
          const existing = recipes.find(r => r.name.trim().toLowerCase() === key);
          const ricettarioRaw = idx.ricettario > -1 ? (row[idx.ricettario] || '').trim() : '';
          const ricettarioIdRiga = ricettarioRaw ? ricettarioIdByNameOrCreate(ricettarioRaw) : fallbackRicettarioId;

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
            if(idx.ricettario > -1 && ricettarioRaw) existing.ricettarioId = ricettarioIdRiga;
            updated++;
            return;
          }

          recipes.push(migrateRecipe({
            id: cryptoId(), name, category, servings, time, ricettarioId: ricettarioIdRiga,
            ingredients: ingredients.length ? ingredients : [{name:'',qty:'',unit:''}],
            steps: steps.length ? steps : [{text:'',vel:'',temp:'',time:'',mode:'Normale'}],
            tags, allergens, notes
          }));
          added++;
        });

        saveRecipes(); saveRicettari(); refreshRicettarioSelects(); renderList(); renderPlanningDays();
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

  // ===== Importa valori nutrizionali da testo =====
  (function(){
    const ov = document.getElementById('nutri-import-overlay');
    if(!ov || typeof NutritionParser === 'undefined') return;
    const $ = id => document.getElementById(id);
    const KEYS = NutritionParser.CAMPI;
    let target = null; // 'dispensa' (per 100 g) | 'ricetta' (per porzione)
    let parsed = null;
    const campiForm = {
      dispensa: { kcal:'d-kcal', protein:'d-protein', fat:'d-fat', carbs:'d-carbs', fiber:'d-fiber', sugar:'d-sugar', salt:'d-salt', panel:'dispensa-nutrition-fields', btn:'dispensa-nutrition-toggle-btn' },
      ricetta: { kcal:'f-nutri-kcal', protein:'f-nutri-protein', fat:'f-nutri-fat', carbs:'f-nutri-carbs', fiber:'f-nutri-fiber', sugar:'f-nutri-sugar', salt:'f-nutri-salt', panel:'recipe-nutrition-fields', btn:'recipe-nutrition-toggle-btn' }
    };
    const baseTarget = () => target === 'dispensa' ? '100g' : 'porzione';
    const nomeBase = b => b === '100g' ? '100 g' : 'una porzione';
    function msg(html, colore){ const m = $('nutri-import-msg'); m.innerHTML = html; m.style.color = colore || 'var(--ink-soft)'; }
    function apri(t){
      target = t; parsed = null; daFoto = false;
      $('nutri-import-text').value = '';
      $('nutri-import-base').value = 'auto';
      $('nutri-import-grams').value = '';
      $('nutri-import-preview').style.display = 'none';
      $('nutri-import-apply').style.display = 'none';
      msg(t === 'dispensa' ? 'I valori verranno salvati <b>per 100 g</b> di prodotto: se incolli quelli per porzione, li converto io.' : 'I valori verranno salvati <b>per porzione</b>: se incolli quelli per 100 g, li converto io con i grammi della porzione.');
      ov.classList.add('active');
      setTimeout(() => $('nutri-import-text').focus(), 50);
    }
    function chiudi(){ ov.classList.remove('active'); }
    let daFoto = false;
    function analizza(){
      const testo = $('nutri-import-text').value;
      const r = NutritionParser.interpreta(testo, { ocr: daFoto });
      if(!r.trovati){ parsed = null; $('nutri-import-preview').style.display = 'none'; $('nutri-import-apply').style.display = 'none'; msg('Non ho riconosciuto nessun valore nutrizionale. Incolla la tabella con i nomi (Energia, Grassi, Carboidrati, Proteine…) e i numeri.', 'var(--danger, #b3261e)'); return; }
      let base = $('nutri-import-base').value; if(base === 'auto') base = r.base;
      const gIn = parseFloat($('nutri-import-grams').value);
      const grammi = gIn > 0 ? gIn : r.porzioneGrammi;
      if(r.porzioneGrammi && !(gIn > 0)) $('nutri-import-grams').value = r.porzioneGrammi;
      const avvisi = r.note.slice();
      let valori = r.valori;
      if(!base){ base = baseTarget(); avvisi.push('Non ho trovato se i valori sono per 100 g o per porzione: li considero ' + (base === '100g' ? 'per 100 g' : 'per porzione') + '. Cambia la scelta qui sopra se non è così.'); }
      if(base !== baseTarget()){
        const c = NutritionParser.converti(valori, base, baseTarget(), grammi);
        if(!c){ parsed = null; $('nutri-import-preview').style.display = 'none'; $('nutri-import-apply').style.display = 'none'; msg('I valori sono ' + (base === '100g' ? 'per 100 g' : 'per porzione') + ' ma servono ' + (baseTarget() === '100g' ? 'per 100 g' : 'per porzione') + ': indica i <b>grammi di una porzione</b> e premi di nuovo «Leggi i valori».', 'var(--danger, #b3261e)'); return; }
        valori = c; avvisi.push('Convertiti da ' + nomeBase(base) + ' a ' + nomeBase(baseTarget()) + ' (porzione di ' + grammi + ' g).');
      }
      valori = NutritionParser.arrotonda(valori);
      parsed = valori;
      KEYS.forEach(k => { $('nutri-p-' + k).value = valori[k] !== undefined ? valori[k] : ''; });
      $('nutri-import-preview-title').textContent = 'Valori trovati (' + (baseTarget() === '100g' ? 'per 100 g' : 'per porzione') + ')';
      $('nutri-import-preview').style.display = 'block';
      $('nutri-import-apply').style.display = '';
      avvisi.push(...NutritionParser.controlla(NutritionParser.arrotonda(r.valori), base));
      const mancano = KEYS.filter(k => valori[k] === undefined).length;
      if(mancano) avvisi.push(mancano + ' valori non trovati: restano come sono nel modulo.');
      msg(avvisi.length ? '<ul style="margin:4px 0 0 18px;padding:0;">' + avvisi.map(a => '<li>' + a.replace(/</g,'&lt;') + '</li>').join('') + '</ul>' : 'Controlla i valori e premi «Usa questi valori».');
    }
    function applica(){
      if(!parsed) return;
      const cf = campiForm[target];
      KEYS.forEach(k => {
        const v = $('nutri-p-' + k).value;
        if(v !== '') $(cf[k]).value = v;
      });
      $(cf.panel).style.display = 'flex';
      $(cf.btn).classList.add('active');
      chiudi();
    }
    $('dispensa-nutrition-import-btn').addEventListener('click', () => apri('dispensa'));
    $('recipe-nutrition-import-btn').addEventListener('click', () => apri('ricetta'));
    // --- Lettura da foto: OCR locale (Tesseract.js), caricato solo al primo uso ---
    let ocrPronto = null;
    function caricaScript(src){
      return new Promise((ok, ko) => { const sc = document.createElement('script'); sc.src = src; sc.onload = ok; sc.onerror = () => ko(new Error('script')); document.head.appendChild(sc); });
    }
    async function prepara(){
      if(ocrPronto) return ocrPronto;
      ocrPronto = (async () => {
        if(typeof Tesseract === 'undefined') await caricaScript('js/vendor/ocr/tesseract.min.js');
        return Tesseract.createWorker(['ita','eng'], 1, {
          workerPath: 'js/vendor/ocr/worker.min.js', corePath: 'js/vendor/ocr/', langPath: 'js/vendor/ocr/', workerBlobURL: false,
          logger: m => { if(m.status === 'recognizing text') msg('Lettura della foto… ' + Math.round((m.progress||0)*100) + '%'); }
        });
      })();
      ocrPronto.catch(() => { ocrPronto = null; });
      return ocrPronto;
    }
    // Ingrandisce e rende in grigio la foto: la lettura dei numeri piccoli migliora molto.
    async function migliora(file){
      try{
        const bmp = await createImageBitmap(file);
        const lato = Math.max(bmp.width, bmp.height);
        const k = Math.min(3, Math.max(1, 2200 / lato));
        const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
        const cx = cv.getContext('2d'); cx.filter = 'grayscale(1) contrast(1.4)'; cx.drawImage(bmp, 0, 0, cv.width, cv.height);
        return await new Promise(ok => cv.toBlob(b => ok(b || file), 'image/png'));
      }catch(e){ return file; }
    }
    $('nutri-import-photo').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0]; e.target.value = '';
      if(!f) return;
      try{
        msg('Preparo la lettura da foto (al primo uso carica circa 13 MB, poi resta sul dispositivo)…');
        const w = await prepara();
        msg('Lettura della foto…');
        const r = await w.recognize(await migliora(f));
        const testo = (r && r.data && r.data.text || '').trim();
        if(!testo){ msg('Non sono riuscito a leggere testo nella foto. Prova con una foto più nitida e dritta, oppure scrivi o incolla i valori.', 'var(--danger, #b3261e)'); return; }
        $('nutri-import-text').value = testo;
        daFoto = true; analizza();
        const m = $('nutri-import-msg'); m.innerHTML = '<div><b>Testo letto dalla foto: controlla bene i numeri</b>, la lettura può sbagliare.</div>' + m.innerHTML;
      }catch(err){
        ocrPronto = null;
        msg('La lettura da foto non è disponibile (serve la versione completa del sito, non il file singolo). Puoi incollare o scrivere il testo qui sotto.', 'var(--danger, #b3261e)');
      }
    });
    $('nutri-import-close').addEventListener('click', chiudi);
    $('nutri-import-cancel').addEventListener('click', chiudi);
    $('nutri-import-analyze').addEventListener('click', analizza);
    $('nutri-import-apply').addEventListener('click', applica);
    ['nutri-import-base','nutri-import-grams'].forEach(id => $(id).addEventListener('change', () => { if($('nutri-import-text').value.trim()) analizza(); }));
  })();

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
  let cookServings = 1;
  let cookIngrDone = new Set();
  const cookIngrPanel = document.getElementById('cook-ingr-panel');
  const cookIngrBtn = document.getElementById('cook-ingr-btn');
  const cookStepIngrEl = document.getElementById('cook-step-ingr');
  function cookIngrLabel(i){
    const scale = cookServings / (cookRecipe.servings || 1);
    const x = quantitaScalata(i, scale);
    return `${x.approx ? '~' : ''}${x.q} ${x.unit}`.trim();
  }
  function renderCookIngrPanel(){
    document.getElementById('cook-ingr-title').textContent = `Ingredienti · ${cookServings} ${cookServings === 1 ? 'porzione' : 'porzioni'}`;
    const ul = document.getElementById('cook-ingr-list');
    ul.innerHTML = '';
    (cookRecipe.ingredients || []).forEach((i, idx)=>{
      const li = document.createElement('li');
      li.className = cookIngrDone.has(idx) ? 'done' : '';
      li.innerHTML = `<input type="checkbox" aria-label="Preparato: ${escapeAttr(i.name)}"${cookIngrDone.has(idx) ? ' checked' : ''}><span class="n">${escapeHtml(i.name)}</span><span class="amt">${escapeHtml(cookIngrLabel(i))}</span>`;
      li.addEventListener('click', e=>{
        if(e.target.tagName !== 'INPUT'){ const cb = li.querySelector('input'); cb.checked = !cb.checked; }
        if(li.querySelector('input').checked) cookIngrDone.add(idx); else cookIngrDone.delete(idx);
        li.classList.toggle('done', cookIngrDone.has(idx));
      });
      ul.appendChild(li);
    });
  }
  function setCookIngrPanel(open){
    cookIngrPanel.hidden = !open;
    cookIngrBtn.setAttribute('aria-expanded', String(open));
    if(open) renderCookIngrPanel();
  }
  cookIngrBtn.addEventListener('click', ()=> setCookIngrPanel(cookIngrPanel.hidden));
  document.getElementById('cook-ingr-close').addEventListener('click', ()=> setCookIngrPanel(false));
  // Ingredienti citati nel passaggio corrente (nome intero o prima parola di almeno 4 lettere)
  function cookIngredientiDelPassaggio(testo){
    const t = String(testo || '').toLowerCase();
    return (cookRecipe.ingredients || []).filter(i=>{
      const n = String(i.name || '').toLowerCase().trim();
      if(n.length < 3) return false;
      if(t.includes(n)) return true;
      const w = n.split(/[\s,(]+/)[0];
      if(w.length < 4) return false;
      const stem = w.slice(0, Math.max(4, w.length - 1)).replace(/[^a-zà-ú]/g, '');
      return stem.length >= 4 && new RegExp('(^|[^a-zà-ú])' + stem).test(t);
    });
  }

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
    cookServings = currentServings || cookRecipe.servings || 1;
    cookIngrDone = new Set();
    setCookIngrPanel(false);
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
    setCookIngrPanel(false);
    resetCookTimers(); fermaVoce();
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
    const citati = cookIngredientiDelPassaggio(s.text);
    cookStepIngrEl.innerHTML = citati.map(i=>`<span>${escapeHtml(i.name)}<b>${escapeHtml(cookIngrLabel(i))}</b></span>`).join('');
    cookStepIngrEl.style.display = citati.length ? 'flex' : 'none';
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
    cookTimerBtn.textContent = cookTimers.some(t => t.key === 'step-' + cookStepIndex && !t.done) ? 'Timer avviato ✓' : 'Avvia timer';
    cookTimerBtn.disabled = false;

    const hasReleaseTimer = hasPressure && s.pressureRelease !== 'Rapido' && !!s.pressureReleaseMin;
    if(hasReleaseTimer){
      cookReleaseRow.style.display = 'flex';
      cookReleaseTimerBtn.textContent = cookTimers.some(t => t.key === 'rel-' + cookStepIndex && !t.done) ? 'Timer rilascio avviato ✓' : `Avvia timer rilascio (${s.pressureReleaseMin} min)`;
      cookReleaseTimerBtn.disabled = false;
    }

    cookPrevBtn.disabled = cookStepIndex === 0;
    cookNextBtn.textContent = cookStepIndex === cookSteps.length - 1 ? 'Fine ✓' : 'Avanti →';
  }

  cookPrevBtn.addEventListener('click', ()=>{ if(cookStepIndex>0){ cookStepIndex--; renderCookStep(); }});
  cookNextBtn.addEventListener('click', ()=>{
    if(cookStepIndex < cookSteps.length - 1){ cookStepIndex++; renderCookStep(); }
    else{ const rFatta = cookRecipe, pFatte = cookServings; exitCookMode(); chiediPreparata(rFatta, pFatte); }
  });
  // ---------- Timer multipli, allarme, lettura e comandi vocali ----------
  const cookTimers = []; // { id, label, key, endsAt, total, done }
  const cookTimersEl = document.getElementById('cook-timers');
  let cookTick = null, cookAlarmInterval = null, cookAudioCtx = null;
  function cookBeep(){
    try{
      cookAudioCtx = cookAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if(cookAudioCtx.state === 'suspended') cookAudioCtx.resume();
      [0, 0.28, 0.56].forEach(dt=>{
        const o = cookAudioCtx.createOscillator(), g = cookAudioCtx.createGain();
        o.type = 'sine'; o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, cookAudioCtx.currentTime + dt);
        g.gain.exponentialRampToValueAtTime(0.35, cookAudioCtx.currentTime + dt + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, cookAudioCtx.currentTime + dt + 0.22);
        o.connect(g); g.connect(cookAudioCtx.destination);
        o.start(cookAudioCtx.currentTime + dt); o.stop(cookAudioCtx.currentTime + dt + 0.25);
      });
    }catch(e){}
    try{ navigator.vibrate && navigator.vibrate([300, 150, 300]); }catch(e){}
  }
  function cookFmt(ms){
    const t = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0');
  }
  function renderCookTimers(){
    cookTimersEl.innerHTML = '';
    cookTimers.forEach(t=>{
      const el = document.createElement('div');
      el.className = 'ct' + (t.done ? ' done' : '');
      el.dataset.id = t.id;
      el.innerHTML = `<span class="n">${escapeHtml(t.label)}</span><span class="t">${t.done ? 'Finito!' : cookFmt(t.endsAt - Date.now())}</span>` +
        (t.done ? `<button type="button" data-act="stop" aria-label="Ferma l'allarme">Ferma</button>`
                : `<button type="button" data-act="plus" aria-label="Aggiungi un minuto">+1′</button><button type="button" data-act="del" aria-label="Elimina il timer">✕</button>`);
      cookTimersEl.appendChild(el);
    });
  }
  function updateCookTimers(){
    let nuovoFinito = false;
    cookTimers.forEach(t=>{ if(!t.done && t.endsAt <= Date.now()){ t.done = true; nuovoFinito = true; } });
    if(nuovoFinito){
      cookBeep();
      clearInterval(cookAlarmInterval);
      cookAlarmInterval = setInterval(()=>{ if(cookTimers.some(t => t.done)) cookBeep(); else { clearInterval(cookAlarmInterval); cookAlarmInterval = null; } }, 2500);
    }
    // aggiorna i numeri senza ricostruire tutto (così i tocchi sui pulsanti non si perdono)
    if(nuovoFinito || cookTimersEl.children.length !== cookTimers.length) renderCookTimers();
    else cookTimers.forEach(t=>{ const el = cookTimersEl.querySelector(`[data-id="${t.id}"] .t`); if(el && !t.done) el.textContent = cookFmt(t.endsAt - Date.now()); });
    if(!cookTimers.length){ clearInterval(cookTick); cookTick = null; }
  }
  function avviaCookTimer(minuti, label, key){
    const ms = Math.round(parseFloat(minuti) * 60000);
    if(!(ms > 0)) return null;
    if(key){
      const gia = cookTimers.find(t => t.key === key && !t.done);
      if(gia) return gia; // già avviato per questo passaggio
    }
    try{ cookAudioCtx = cookAudioCtx || new (window.AudioContext || window.webkitAudioContext)(); if(cookAudioCtx.state === 'suspended') cookAudioCtx.resume(); }catch(e){}
    const t = { id: cryptoId(), label: label || 'Timer', key: key || null, endsAt: Date.now() + ms, total: ms, done: false };
    cookTimers.push(t);
    renderCookTimers();
    if(!cookTick) cookTick = setInterval(updateCookTimers, 500);
    return t;
  }
  function resetCookTimers(){
    cookTimers.length = 0;
    clearInterval(cookTick); cookTick = null;
    clearInterval(cookAlarmInterval); cookAlarmInterval = null;
    renderCookTimers();
  }
  cookTimersEl.addEventListener('click', e=>{
    const b = e.target.closest('button[data-act]');
    const id = b && b.closest('.ct').dataset.id;
    const i = cookTimers.findIndex(t => t.id === id);
    if(i < 0) return;
    if(b.dataset.act === 'plus'){ cookTimers[i].endsAt += 60000; }
    else{ cookTimers.splice(i, 1); }
    renderCookTimers();
  });
  function fermaAllarmi(){
    for(let i = cookTimers.length - 1; i >= 0; i--) if(cookTimers[i].done) cookTimers.splice(i, 1);
    clearInterval(cookAlarmInterval); cookAlarmInterval = null;
    renderCookTimers();
  }
  function etichettaPassaggio(){
    const t = String((cookSteps[cookStepIndex] || {}).text || '').trim();
    return `Passo ${cookStepIndex + 1}` + (t ? ': ' + t.split(/\s+/).slice(0, 2).join(' ') : '');
  }
  cookTimerBtn.addEventListener('click', ()=>{
    const s = cookSteps[cookStepIndex];
    const t = avviaCookTimer(s.time, etichettaPassaggio(), 'step-' + cookStepIndex);
    cookTimerBtn.textContent = 'Timer avviato ✓';
  });
  cookReleaseTimerBtn.addEventListener('click', ()=>{
    const s = cookSteps[cookStepIndex];
    avviaCookTimer(s.pressureReleaseMin, `Rilascio · passo ${cookStepIndex + 1}`, 'rel-' + cookStepIndex);
    cookReleaseTimerBtn.textContent = 'Timer rilascio avviato ✓';
  });
  // Timer libero
  const cookAddForm = document.getElementById('cook-add-timer-form');
  document.getElementById('cook-add-timer-btn').addEventListener('click', e=>{
    cookAddForm.hidden = !cookAddForm.hidden;
    e.currentTarget.setAttribute('aria-expanded', String(!cookAddForm.hidden));
    if(!cookAddForm.hidden) document.getElementById('cook-add-timer-min').focus();
  });
  cookAddForm.addEventListener('submit', e=>{
    e.preventDefault();
    const m = document.getElementById('cook-add-timer-min'), n = document.getElementById('cook-add-timer-name');
    if(avviaCookTimer(m.value, n.value.trim() || 'Timer')){ m.value = ''; n.value = ''; cookAddForm.hidden = true; document.getElementById('cook-add-timer-btn').setAttribute('aria-expanded', 'false'); }
  });
  cookAddForm.querySelectorAll('.cook-quick button').forEach(b => b.addEventListener('click', ()=>{
    avviaCookTimer(b.dataset.min, document.getElementById('cook-add-timer-name').value.trim() || `${b.dataset.min} min`);
    cookAddForm.hidden = true;
  }));

  // Lettura ad alta voce
  function testoDelPassaggio(){
    const s = cookSteps[cookStepIndex]; if(!s) return '';
    const parti = [`Passaggio ${cookStepIndex + 1} di ${cookSteps.length}.`, s.text];
    if(s.time) parti.push(`Tempo: ${s.time} minuti.`);
    if(s.temp) parti.push(`Temperatura ${s.temp} gradi.`);
    if(s.vel) parti.push(`Velocità ${s.vel}.`);
    return parti.join(' ');
  }
  let cookParlando = false;
  function leggiPassaggio(){
    if(!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(testoDelPassaggio());
    u.lang = 'it-IT';
    u.onstart = ()=>{ cookParlando = true; if(cookRec) try{ cookRec.stop(); }catch(e){} };
    u.onend = u.onerror = ()=>{ cookParlando = false; if(cookVoceAttiva) avviaRiconoscimento(); };
    speechSynthesis.speak(u);
  }
  const cookSpeakBtn = document.getElementById('cook-speak-btn');
  if(!('speechSynthesis' in window)) cookSpeakBtn.hidden = true;
  cookSpeakBtn.addEventListener('click', leggiPassaggio);

  // Comandi vocali
  const numeriParole = { un: 1, uno: 1, una: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10, undici: 11, dodici: 12, quindici: 15, venti: 20, venticinque: 25, trenta: 30, quaranta: 40, cinquanta: 50, sessanta: 60 };
  let cookRec = null, cookVoceAttiva = false;
  const cookVoiceBtn = document.getElementById('cook-voice-btn');
  const cookVoiceStatus = document.getElementById('cook-voice-status');
  function statoVoce(t){ cookVoiceStatus.textContent = t; cookVoiceStatus.hidden = !t; }
  function interpretaComando(testo){
    const t = String(testo || '').toLowerCase().replace(/[.,!?]/g, ' ').replace(/\s+/g, ' ').trim();
    if(!t) return;
    statoVoce(`Ho sentito: «${t}»`);
    const m = t.match(/timer(?: da| di)? (\d+(?:[.,]\d+)?|[a-zàèéìòù]+) (minut|ora|ore)/);
    if(m){
      let n = parseFloat(String(m[1]).replace(',', '.'));
      if(isNaN(n)) n = numeriParole[m[1]];
      if(n){ avviaCookTimer(m[2].startsWith('minut') ? n : n * 60, `${n} ${m[2].startsWith('minut') ? 'min' : (n === 1 ? 'ora' : 'ore')}`); return; }
    }
    if(/\b(mezz'?ora)\b/.test(t) && /timer/.test(t)){ avviaCookTimer(30, '30 min'); return; }
    if(/\b(stop|ferma|basta|silenzio|zitto)\b/.test(t)){ speechSynthesis && speechSynthesis.cancel(); fermaAllarmi(); return; }
    if(/\b(avanti|prossimo|successivo|continua|vai)\b/.test(t)){ cookNextBtn.click(); return; }
    if(/\b(indietro|precedente|torna)\b/.test(t)){ cookPrevBtn.click(); return; }
    if(/\b(ripeti|rileggi|leggi)\b/.test(t)){ leggiPassaggio(); return; }
    if(/\bingredienti\b/.test(t)){ cookIngrBtn.click(); return; }
    if(/\btimer\b/.test(t) && cookTimerBtn.style.display !== 'none'){ cookTimerBtn.click(); return; }
  }
  function avviaRiconoscimento(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR || !cookVoceAttiva || cookParlando) return;
    try{
      cookRec = new SR();
      cookRec.lang = 'it-IT'; cookRec.continuous = true; cookRec.interimResults = false;
      cookRec.onresult = ev=>{
        for(let i = ev.resultIndex; i < ev.results.length; i++){
          if(ev.results[i].isFinal) interpretaComando(ev.results[i][0].transcript);
        }
      };
      cookRec.onerror = ev=>{
        if(ev.error === 'not-allowed' || ev.error === 'service-not-allowed'){
          cookVoceAttiva = false; aggiornaPulsanteVoce();
          statoVoce('Il browser non ha consentito il microfono: abilitalo nelle impostazioni del sito e riprova.');
        }else if(ev.error === 'network'){
          statoVoce('Il riconoscimento vocale richiede la connessione a internet.');
        }
      };
      cookRec.onend = ()=>{ if(cookVoceAttiva && !cookParlando && cookOverlay.classList.contains('active')) setTimeout(avviaRiconoscimento, 300); };
      cookRec.start();
    }catch(e){ /* già avviato */ }
  }
  function aggiornaPulsanteVoce(){
    cookVoiceBtn.setAttribute('aria-pressed', String(cookVoceAttiva));
    cookVoiceBtn.textContent = cookVoceAttiva ? '🎤 Voce attiva' : '🎤 Voce';
    if(!cookVoceAttiva) statoVoce('');
    else statoVoce('Di\': «avanti», «indietro», «ripeti», «ingredienti», «timer 10 minuti», «stop».');
  }
  function fermaVoce(){
    cookVoceAttiva = false;
    if(cookRec){ try{ cookRec.onend = null; cookRec.stop(); }catch(e){} cookRec = null; }
    try{ speechSynthesis && speechSynthesis.cancel(); }catch(e){}
    aggiornaPulsanteVoce();
  }
  cookVoiceBtn.addEventListener('click', ()=>{
    if(!(window.SpeechRecognition || window.webkitSpeechRecognition)){
      statoVoce('Questo browser non supporta i comandi vocali (funzionano su Chrome e simili, con connessione internet).');
      return;
    }
    if(cookVoceAttiva){ fermaVoce(); return; }
    cookVoceAttiva = true; aggiornaPulsanteVoce(); avviaRiconoscimento();
  });

  // ---------- Vista: Ricettario / Pianificazione ----------
  function todayDayName(){
    const jsDay = new Date().getDay(); // 0=domenica...6=sabato
    return DAYS[jsDay === 0 ? 6 : jsDay - 1];
  }

  function renderToday(){
    aggiornaTopbarAlerts();
    const content = document.getElementById('today-content');
    const day = todayDayName();
    const entries = (weekPlan[day] || []).slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
    const today = new Date().toISOString().slice(0,10);
    const soonLimit = addDays(today, 3);
    const expiring = dispensaItems
      .filter(it => it.expiry && it.expiry >= today && it.expiry <= soonLimit)
      .sort((a,b)=>a.expiry.localeCompare(b.expiry));
    const weekEntries = DAYS.flatMap(d=>weekPlan[d] || []);
    const shoppingCount = buildAggregatedShoppingItems(
      weekEntries.map(entryRecipePair).filter(Boolean)
    ).length;
    const dateLabel = new Date().toLocaleDateString('it-IT', {weekday:'long', day:'numeric', month:'long'});
    const mealsHtml = entries.length ? entries.map(e=>{
      const name = escapeHtml(planEntryName(e));
      return `<li><span class="today-time">${escapeHtml(e.time || '—')}</span><b>${name}</b> <span class="today-meal">· ${escapeHtml(e.mealType || 'Pasto')}</span></li>`;
    }).join('') : '<p class="today-empty">Nessun pasto pianificato per oggi.</p>';
    const MAX_SCADENZE_MOSTRATE = 4;
    const expiryHtml = expiring.length ? [
      expiring.slice(0, MAX_SCADENZE_MOSTRATE).map(it=>{
        const date = new Date(it.expiry + 'T00:00:00').toLocaleDateString('it-IT', {day:'numeric', month:'short'});
        const giorni = Math.round((new Date(it.expiry + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000);
        const quando = giorni <= 0 ? 'Scade oggi' : giorni === 1 ? 'Scade domani' : `Scade tra ${giorni} giorni`;
        const urgente = giorni <= 1;
        const qtyLabel = (it.qty || it.unit) ? ` · ${`${it.qty ? roundNice(it.qty) : ''} ${escapeHtml(it.unit||'')}`.trim()}` : '';
        return `<li>
          <span class="cat-dot" style="background:${PANTRY_CATEGORY_COLORS[it.category] || '#8A8F86'}"></span>
          <b>${escapeHtml(it.name)}</b>${qtyLabel}
          <span class="${urgente ? 'today-expiry-urgent' : 'today-expiry-soon'}"> · ${quando} (${date})</span>
        </li>`;
      }).join(''),
      expiring.length > MAX_SCADENZE_MOSTRATE
        ? `<li class="today-expiry-more">+ altri ${expiring.length - MAX_SCADENZE_MOSTRATE} prodotti in scadenza entro 3 giorni</li>`
        : ''
    ].join('') : '<p class="today-empty">Nessun prodotto in scadenza nei prossimi 3 giorni.</p>';
    const shoppingText = shoppingCount
      ? `${shoppingCount} voci da verificare per i pasti pianificati.${spesaLista.length ? ` Più ${spesaLista.length} nella tua lista.` : ''}`
      : (shoppingExtraItems.length ? `${shoppingExtraItems.length} promemoria dalla Dispensa.` : (spesaLista.length ? `${spesaLista.length} voci nella tua lista della spesa.` : 'Nessuna lista della spesa da preparare.'));
    const libraryHtml = ricettari.map(rb=>{
      const count = recipes.filter(r=>!r.archived && recipeRicettarioId(r) === rb.id).length;
      const coverStyle = rb.cover ? `background-image:url('${rb.cover}');` : '';
      return `
        <button type="button" class="library-book${rb.cover ? '' : ' library-book-placeholder'}" data-ricettario="${escapeAttr(rb.id)}" style="${coverStyle}">
          ${rb.cover ? '' : '<span class="library-book-icon">📚</span>'}
          <span class="library-book-label"><b>${escapeHtml(rb.name)}</b><br>${count} ricett${count===1?'a':'e'}</span>
        </button>`;
    }).join('');

    // Saluto discreto, in base all'ora (nessun nome inventato: l'app non conosce l'utente)
    const ora = new Date().getHours();
    const saluto = ora < 13 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera';

    // Foto o segnaposto colorato per una ricetta
    const photoBlock = (r, cls)=> r && r.photo
      ? `<span class="${cls}"><img src="${escapeAttr(r.photo)}" alt="" loading="lazy"></span>`
      : `<span class="${cls} ph" aria-hidden="true">${CATEGORY_ICONS[(r||{}).category] || '🍽️'}</span>`;

    // I pasti di oggi: una scheda per ogni voce pianificata (ricetta o prodotto di dispensa)
    const mealCardsHtml = entries.length ? `<div class="meal-cards">${entries.map(e=>{
      const r = e.recipeId ? recipes.find(x=>x.id === e.recipeId) : null;
      const label = `<span class="meal-label"><span>${escapeHtml(e.mealType || 'Pasto')}</span>${e.time ? `<span class="t">${escapeHtml(e.time)}</span>` : ''}</span>`;
      const meta = r ? [
        r.time ? `<span>${icon('clock')}${escapeHtml(String(r.time))} min</span>` : '',
        r.servings ? `<span>${icon('user')}${escapeHtml(porzioniLabel(entryServings(e)))}</span>` : ''
      ].join('') : '';
      const catColor = r ? (CATEGORY_COLORS[r.category] || '') : '';
      const inner = `${label}${photoBlock(r, 'meal-photo')}<span class="meal-title"><span>${escapeHtml(planEntryName(e))}</span></span>${meta ? `<span class="meal-meta">${meta}</span>` : ''}`;
      return r
        ? `<button type="button" class="meal-card" data-open-recipe="${escapeAttr(r.id)}" style="${catColor ? `--cat-color:${catColor};` : ''}" aria-label="Apri ${escapeAttr(r.name)}">${inner}</button>`
        : `<div class="meal-card">${inner}</div>`;
    }).join('')}</div>` : `<div class="today-empty-card"><p>Nessun pasto pianificato per oggi.</p><button type="button" class="btn-gold btn-small" id="today-empty-plan-btn">Pianifica i pasti</button></div>`;

    // La mia settimana: elenco compatto dei sette giorni
    const todayIdx = DAYS.indexOf(day);
    const weekRowsHtml = DAYS.map((d, i)=>{
      const list = (weekPlan[d] || []).slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
      const txt = list.length
        ? list.map(en=>`<b>${escapeHtml(en.mealType || 'Pasto')}:</b> ${escapeHtml(planEntryName(en))}`).join('<br>')
        : '<span class="none">Nessun pasto</span>';
      return `<li class="${i === todayIdx ? 'is-today' : ''}"><span class="wd">${escapeHtml(d.slice(0,3))}</span><span class="wm">${txt}</span></li>`;
    }).join('');

    // Ricette preferite (le più recenti per ultima preparazione, poi alfabetico)
    const favs = recipes.filter(r=>r.favorite && !r.archived)
      .sort((a,b)=> (b.lastMade||'').localeCompare(a.lastMade||'') || a.name.localeCompare(b.name))
      .slice(0, 4);
    const favsHtml = favs.length
      ? `<div class="mini-grid">${favs.map(r=>`<button type="button" class="mini-recipe" data-open-recipe="${escapeAttr(r.id)}" style="${CATEGORY_COLORS[r.category] ? `--cat-color:${CATEGORY_COLORS[r.category]};` : ''}">${photoBlock(r, 'mr-photo')}<span class="mr-body"><span class="mr-title">${escapeHtml(r.name)}</span><span class="mr-sub">${escapeHtml(r.category || '')}</span></span></button>`).join('')}</div>`
      : `<p class="today-empty">Tocca il cuore su una ricetta per ritrovarla qui.</p>`;

    // Riquadro statistiche accanto al titolo (stessi calcoli della pagina Statistiche)
    const S = calcolaStatistiche();
    const miniTile = (n, lbl)=> `<div class="today-stat"><b>${n}</b><span>${lbl}</span></div>`;
    const statsCardHtml = S.n ? `
        <section class="today-stats-card" aria-labelledby="today-stats-h">
          <div class="block-head"><h3 id="today-stats-h">Le tue statistiche</h3><button type="button" class="link-btn" id="today-stats-btn">Vedi tutte →</button></div>
          <div class="today-stats-grid">
            ${miniTile(S.n, 'ricette')}
            ${miniTile(S.totPreparazioni, 'preparazioni')}
            ${miniTile(S.nConVoto ? S.votoMedio.toFixed(1).replace('.',',') + ' ★' : '–', 'voto medio')}
            ${miniTile(S.preferite, 'preferite')}
          </div>
          <p class="today-stats-top">${S.piuCucinate.length ? `Più cucinata: <b>${escapeHtml(S.piuCucinate[0].name)}</b> (${S.piuCucinate[0].timesMade} volt${S.piuCucinate[0].timesMade===1?'a':'e'})` : 'Segna una ricetta come preparata per vedere la più cucinata.'}</p>
        </section>` : `
        <section class="today-stats-card" aria-labelledby="today-stats-h">
          <div class="block-head"><h3 id="today-stats-h">Le tue statistiche</h3></div>
          <p class="today-empty">Aggiungi qualche ricetta per vedere le statistiche.</p>
        </section>`;

    content.innerHTML = `
      <div class="today-hero-row">
      <div class="page-head">
        <div><h2>Oggi</h2><p>${escapeHtml(dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1))}</p>
          <p class="today-hello"><strong>${saluto}!</strong> Cosa si cucina oggi?</p></div>
        <button type="button" class="btn-gold" id="today-plan-btn">${icon('calendar','ico-sm')} Organizza la settimana</button>
      </div>
        ${statsCardHtml}
      </div>
      <div class="today-grid">
        <section class="today-card"><h3>Le mie ricette</h3><p class="today-empty">${recipes.filter(r=>!r.archived).length ? `${recipes.filter(r=>!r.archived).length} ricett${recipes.filter(r=>!r.archived).length===1?'a':'e'} nel tuo ricettario.` : 'Non hai ancora ricette: aggiungi la prima.'}</p><div class="today-actions"><button type="button" class="btn-ghost btn-small" id="today-quick-pantry-btn">Sfoglia le ricette</button></div></section>
        <section class="today-card"><h3>Da consumare prima</h3><ul class="today-list">${expiryHtml}</ul><div class="today-actions"><button type="button" class="btn-ghost btn-small" id="today-expiry-btn">Apri Dispensa</button>${expiring.length ? `<button type="button" class="btn-ghost btn-small" id="today-expiry-recipes-btn">Trova ricette</button>` : ''}</div></section>
        <section class="today-card"><h3>Lista della spesa</h3><p class="today-empty">${escapeHtml(shoppingText)}</p><div class="today-actions"><button type="button" class="btn-ghost btn-small" id="today-shopping-btn">Apri lista</button><button type="button" class="btn-ghost btn-small" id="today-recipes-btn">Cerca ricette</button></div></section>
      </div>
      <div class="today-layout">
        <section class="today-block" aria-labelledby="today-meals-h">
          <div class="block-head"><h3 id="today-meals-h">I pasti di oggi</h3></div>
          ${mealCardsHtml}
        </section>
        <section class="today-card today-week-card" aria-labelledby="today-week-h">
          <div class="block-head"><h3 id="today-week-h">La mia settimana</h3><button type="button" class="link-btn" id="today-meals-btn">Vedi la pianificazione →</button></div>
          <ul class="week-list">${weekRowsHtml}</ul>
        </section>
      </div>
      <section class="today-block" aria-labelledby="today-fav-h">
        <div class="block-head"><h3 id="today-fav-h">Le tue ricette preferite</h3>${favs.length ? '<button type="button" class="link-btn" id="today-fav-all-btn">Vedi tutte →</button>' : ''}</div>
        ${favsHtml}
      </section>
      <section class="today-block today-library" aria-labelledby="today-lib-h">
        <div class="block-head"><h3 id="today-lib-h">La tua libreria</h3><button type="button" class="btn-ghost btn-small" id="today-library-manage-btn">Gestisci ricettari</button></div>
        <div class="library-shelf">${libraryHtml}</div>
      </section>`;
    document.getElementById('today-plan-btn').addEventListener('click', ()=>switchView('planning'));
    document.getElementById('today-meals-btn').addEventListener('click', ()=>switchView('planning'));
    const todayStatsBtn = document.getElementById('today-stats-btn');
    if(todayStatsBtn) todayStatsBtn.addEventListener('click', ()=>switchView('stats'));
    const emptyPlanBtn = document.getElementById('today-empty-plan-btn');
    if(emptyPlanBtn) emptyPlanBtn.addEventListener('click', ()=>switchView('planning'));
    const favAllBtn = document.getElementById('today-fav-all-btn');
    if(favAllBtn) favAllBtn.addEventListener('click', ()=>{ favoritesOnly = true; switchView('recipes'); });
    content.querySelectorAll('[data-open-recipe]').forEach(btn=>{
      btn.addEventListener('click', ()=> openView(btn.dataset.openRecipe));
    });
    document.getElementById('today-expiry-btn').addEventListener('click', ()=>switchView('dispensa'));
    const todayExpiryRecipesBtn = document.getElementById('today-expiry-recipes-btn');
    if(todayExpiryRecipesBtn) todayExpiryRecipesBtn.addEventListener('click', ()=>{
      attivaRicercaConScadenza(expiring.map(it=>it.name));
    });
    document.getElementById('today-recipes-btn').addEventListener('click', ()=>switchView('recipes'));
    document.getElementById('today-shopping-btn').addEventListener('click', ()=>document.getElementById('generate-shopping-btn').click());
    document.getElementById('today-quick-pantry-btn').addEventListener('click', ()=>{ favoritesOnly = false; switchView('recipes'); });
    document.getElementById('today-library-manage-btn').addEventListener('click', ()=> openRicettariManage());
    content.querySelectorAll('.library-book').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        activeRicettarioFilter = btn.dataset.ricettario;
        ricettarioFilterEl.value = activeRicettarioFilter;
        switchView('recipes');
        renderList();
      });
    });
  }

  // Etichetta breve mostrata nella barra ☰ su schermo piccolo, per vista corrente.
  const NAV_LABELS = {
    today: 'Oggi', recipes: 'Le mie ricette', planning: 'Pianificazione',
    spesa: 'Lista della spesa', dispensa: 'Dispensa', info: 'Come funziona', stats: 'Statistiche',
    importa: 'Importa ricette', backup: 'Backup', tema: 'Tema'
  };
  let currentView = 'today';
  // Evidenzia la voce attiva nella barra laterale e nella barra a schede dello smartphone.
  // "Preferiti" è la stessa vista delle ricette con il filtro dei preferiti attivo.
  function updateNavActive(){
    const v = currentView;
    const stato = {
      'nav-today-btn': v === 'today',
      'nav-recipes-btn': v === 'recipes' && !favoritesOnly,
      'nav-favorites-btn': v === 'recipes' && favoritesOnly,
      'nav-planning-btn': v === 'planning',
      'nav-dispensa-btn': v === 'dispensa',
      'nav-shopping-btn': v === 'spesa',
      'nav-stats-btn': v === 'stats',
      'nav-import-btn': v === 'importa',
      'nav-backup-btn': v === 'backup',
      'nav-tema-btn': v === 'tema',
      'nav-info-btn': v === 'info',
      'tab-today': v === 'today',
      'tab-recipes': v === 'recipes',
      'tab-planning': v === 'planning',
      'tab-dispensa': v === 'dispensa',
      'tab-shopping': v === 'spesa'
    };
    Object.keys(stato).forEach(id=>{
      const btn = document.getElementById(id);
      if(!btn) return;
      btn.classList.toggle('active', stato[id]);
      // aria-current segnala alla tecnologia assistiva quale voce corrisponde alla pagina mostrata
      if(stato[id]) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
    });
  }
  function switchView(view){
    currentView = view;
    document.body.setAttribute('data-view', view);
    // Fuori dalla pianificazione si lavora sempre sulla settimana reale in corso
    if(view !== 'planning' && planWeekStart && planWeekStart !== realMonday()) setPlanWeek(realMonday());
    document.getElementById('today-view').style.display = view === 'today' ? '' : 'none';
    document.getElementById('recipes-view').style.display = view === 'recipes' ? '' : 'none';
    document.getElementById('planning-view').style.display = view === 'planning' ? '' : 'none';
    document.getElementById('dispensa-view').style.display = view === 'dispensa' ? '' : 'none';
    document.getElementById('spesa-view').style.display = view === 'spesa' ? '' : 'none';
    document.getElementById('stats-view').style.display = view === 'stats' ? '' : 'none';
    document.getElementById('import-view').style.display = view === 'importa' ? '' : 'none';
    document.getElementById('backup-view').style.display = view === 'backup' ? '' : 'none';
    document.getElementById('tema-view').style.display = view === 'tema' ? '' : 'none';
    document.getElementById('info-view').style.display = view === 'info' ? '' : 'none';
    updateNavActive();
    if(view === 'today') renderToday();
    if(view === 'recipes') renderList();
    if(view === 'planning') renderPlanningDays();
    if(view === 'dispensa') renderDispensaList();
    if(view === 'spesa') renderSpesaLista();
    if(view === 'stats') renderStatistiche();
    if(view === 'backup') updateBackupReminder();
    if(view === 'tema') renderTemaGrid();
    const navCurrentLabel = document.getElementById('nav-current-label');
    if(navCurrentLabel) navCurrentLabel.textContent = NAV_LABELS[view] || '';
    closeMobileNav();
    window.scrollTo(0, 0);
  }
  document.getElementById('nav-today-btn').addEventListener('click', ()=> switchView('today'));
  document.getElementById('nav-recipes-btn').addEventListener('click', ()=>{ favoritesOnly = false; switchView('recipes'); });
  document.getElementById('nav-favorites-btn').addEventListener('click', ()=>{ favoritesOnly = true; switchView('recipes'); });
  // Voci che aprono finestre o menu già esistenti (nessuna funzione duplicata)
  document.getElementById('nav-shopping-btn').addEventListener('click', ()=> switchView('spesa'));
  document.getElementById('nav-stats-btn').addEventListener('click', ()=> switchView('stats'));

  // ---------- Statistiche (v5.26) ----------
  // Tutto calcolato al volo dai dati già presenti (nessun nuovo dato salvato).
  function calcolaStatistiche(){
    const attive = recipes.filter(r=>!r.archived);
    const oggi = Date.now(), GIORNO = 86400000;
    const fatte = attive.filter(r=>(r.timesMade||0) > 0);
    const totPreparazioni = attive.reduce((n,r)=> n + (r.timesMade||0), 0);
    const conVoto = attive.filter(r=>r.rating > 0);
    const conTempo = attive.filter(r=>r.time > 0);
    const perCategoria = {};
    attive.forEach(r=>{ const c = r.category || 'Senza categoria'; perCategoria[c] = (perCategoria[c]||0) + 1; });
    const giorniDa = r => r.lastMade ? Math.floor((oggi - new Date(r.lastMade).getTime())/GIORNO) : null;
    return {
      n: attive.length,
      archiviate: recipes.length - attive.length,
      preferite: attive.filter(r=>r.favorite).length,
      conFoto: attive.filter(r=>r.photo).length,
      mai: attive.filter(r=>!(r.timesMade>0)),
      fatte: fatte.length,
      totPreparazioni,
      piuCucinate: fatte.slice().sort((a,b)=> (b.timesMade||0)-(a.timesMade||0) || (b.lastMade||'').localeCompare(a.lastMade||'')).slice(0,5),
      miglioriVoti: conVoto.slice().sort((a,b)=> b.rating-a.rating || (b.timesMade||0)-(a.timesMade||0)).slice(0,5),
      votoMedio: conVoto.length ? conVoto.reduce((n,r)=>n+r.rating,0)/conVoto.length : 0,
      nConVoto: conVoto.length,
      tempoMedio: conTempo.length ? Math.round(conTempo.reduce((n,r)=>n+r.time,0)/conTempo.length) : 0,
      veloci: conTempo.filter(r=>r.time <= 30).length,
      dimenticate: fatte.filter(r=>giorniDa(r) >= 60).sort((a,b)=> a.lastMade.localeCompare(b.lastMade)).slice(0,5),
      giorniDa,
      categorie: Object.entries(perCategoria).sort((a,b)=> b[1]-a[1])
    };
  }
  function renderStatistiche(){
    const box = document.getElementById('stats-body');
    if(!box) return;
    const S = calcolaStatistiche();
    if(!S.n){ box.innerHTML = '<div class="stats-empty">Non hai ancora ricette: appena ne aggiungi qualcuna qui compariranno le statistiche.</div>'; return; }
    const tile = (n, etichetta) => `<div class="stat-tile"><div class="stat-num">${n}</div><div class="stat-lbl">${etichetta}</div></div>`;
    const riga = (r, extra) => `<li><button type="button" class="stat-link" data-id="${escapeAttr(r.id)}">${escapeHtml(r.name)}</button><span class="stat-extra">${extra}</span></li>`;
    const lista = (titolo, righe, vuoto) => `<section class="stat-card"><h3>${titolo}</h3>${righe.length ? `<ol>${righe.join('')}</ol>` : `<p class="stat-vuoto">${vuoto}</p>`}</section>`;
    const max = Math.max(...S.categorie.map(c=>c[1]));
    const barre = S.categorie.map(([c,n])=>`<div class="stat-bar"><span class="stat-bar-lbl">${escapeHtml(c)}</span><span class="stat-bar-track"><span class="stat-bar-fill" style="width:${Math.round(n/max*100)}%;background:${CATEGORY_COLORS[c] || '#8A8F86'}"></span></span><span class="stat-bar-n">${n}</span></div>`).join('');
    const volte = n => `${n} volt${n===1?'a':'e'}`;
    const giorniTxt = r => { const g = S.giorniDa(r); return g >= 365 ? 'oltre un anno fa' : g >= 60 ? `${Math.round(g/30)} mesi fa` : `${g} giorni fa`; };
    box.innerHTML = `
      <div class="stat-tiles">
        ${tile(S.n, 'ricette')}
        ${tile(S.preferite, 'preferite')}
        ${tile(S.totPreparazioni, 'preparazioni totali')}
        ${tile(S.nConVoto ? S.votoMedio.toFixed(1).replace('.',',') + ' ★' : '–', 'voto medio')}
        ${tile(S.tempoMedio ? S.tempoMedio + ' min' : '–', 'tempo medio')}
        ${tile(S.veloci, 'pronte in 30 min')}
      </div>
      <div class="stat-grid">
        ${lista('Le più cucinate', S.piuCucinate.map(r=>riga(r, volte(r.timesMade))), 'Non hai ancora segnato nessuna ricetta come preparata.')}
        ${lista('Le meglio votate', S.miglioriVoti.map(r=>riga(r, '★ '+r.rating)), 'Non hai ancora dato voti.')}
        ${lista('Da riscoprire (ferme da 2 mesi o più)', S.dimenticate.map(r=>riga(r, giorniTxt(r))), 'Niente di dimenticato: bene così.')}
        ${lista('Mai preparate', S.mai.slice(0,5).map(r=>riga(r, '')), 'Le hai preparate tutte almeno una volta.').replace('<h3>Mai preparate</h3>', `<h3>Mai preparate (${S.mai.length})</h3>`)}
      </div>
      <section class="stat-card"><h3>Per categoria</h3><div class="stat-bars">${barre}</div></section>
      <p class="stat-foot">${S.conFoto} ricette su ${S.n} hanno una foto${S.archiviate ? ` · ${S.archiviate} archiviate non contate` : ''}. Il conteggio delle preparazioni parte da quando segni «Ho preparato questa oggi» o chiudi la modalità cucina con «Fine».</p>`;
    box.querySelectorAll('.stat-link').forEach(b=> b.addEventListener('click', ()=> openView(b.dataset.id)));
  }
  document.getElementById('nav-import-btn').addEventListener('click', ()=> switchView('importa'));
  document.getElementById('nav-tema-btn').addEventListener('click', ()=> switchView('tema'));
  document.getElementById('nav-backup-btn').addEventListener('click', ()=> switchView('backup'));
  document.getElementById('more-goto-import').addEventListener('click', ()=> switchView('importa'));
  document.getElementById('more-goto-backup').addEventListener('click', ()=> switchView('backup'));
  document.getElementById('backup-goto-import').addEventListener('click', ()=> switchView('importa'));
  document.getElementById('nav-ricettari-btn').addEventListener('click', ()=>{
    closeMobileNav();
    openRicettariManage();
  });
  // Barra a schede dello smartphone
  document.getElementById('tab-today').addEventListener('click', ()=> switchView('today'));
  document.getElementById('tab-recipes').addEventListener('click', ()=>{ favoritesOnly = false; switchView('recipes'); });
  document.getElementById('tab-planning').addEventListener('click', ()=> switchView('planning'));
  document.getElementById('tab-dispensa').addEventListener('click', ()=> switchView('dispensa'));
  document.getElementById('tab-shopping').addEventListener('click', ()=> switchView('spesa'));
  document.getElementById('nav-planning-btn').addEventListener('click', ()=> switchView('planning'));
  document.getElementById('nav-dispensa-btn').addEventListener('click', ()=> switchView('dispensa'));
  document.getElementById('nav-info-btn').addEventListener('click', ()=> switchView('info'));
  document.getElementById('legal-link').addEventListener('click', e=>{
    e.preventDefault(); switchView('info');
    setTimeout(()=> document.getElementById('note-legali').scrollIntoView({behavior:'smooth', block:'start'}), 50);
  });
  // Scorciatoie dirette tra Pianificazione e Dispensa, per non dover passare dal menu di
  // navigazione in alto quando si passa dall'una all'altra mentre si organizza la settimana.
  document.getElementById('dispensa-goto-planning-btn').addEventListener('click', ()=> switchView('planning'));

  // ---------- Barra superiore: ricerca rapida e avvisi dispensa ----------
  const topbarSearchEl = document.getElementById('topbar-search');
  if(topbarSearchEl){
    topbarSearchEl.addEventListener('input', ()=>{
      switchView('recipes');
      searchEl.value = topbarSearchEl.value;
      searchEl.dispatchEvent(new Event('input'));
    });
  }
  document.getElementById('topbar-new-recipe-btn').addEventListener('click', ()=>{
    switchView('recipes');
    document.getElementById('new-recipe-btn').click();
  });
  function apriAvvisiDispensa(){
    switchView('dispensa');
    if(!dispensaLowStockOnly) document.getElementById('dispensa-low-stock-filter-btn').click();
  }
  document.getElementById('topbar-alerts-btn').addEventListener('click', apriAvvisiDispensa);
  document.getElementById('mobile-alerts-btn').addEventListener('click', apriAvvisiDispensa);
  document.getElementById('mobile-search-btn').addEventListener('click', ()=>{
    switchView('recipes');
    searchEl.focus();
  });
  // Pallino con il numero di prodotti in esaurimento o in scadenza nei prossimi 3 giorni:
  // ricalcolato ogni volta che si passa per Oggi o Dispensa, cioè quando questi dati
  // possono essere cambiati.
  function aggiornaTopbarAlerts(){
    const badges = ['topbar-alerts-badge', 'mobile-alerts-badge'].map(id => document.getElementById(id)).filter(Boolean);
    if(!badges.length) return;
    const today = new Date().toISOString().slice(0,10);
    const soonLimit = addDays(today, 3);
    let count = 0;
    dispensaItems.forEach(it=>{
      const qty = parseFloat(it.qty), minQty = parseFloat(it.minQty);
      const basso = !isNaN(qty) && (qty <= 0 || (!isNaN(minQty) && qty <= minQty));
      const inScadenza = it.expiry && it.expiry >= today && it.expiry <= soonLimit;
      if(basso || inScadenza) count++;
    });
    badges.forEach(badge=>{
      if(count > 0){ badge.textContent = count > 99 ? '99+' : String(count); badge.style.display = 'flex'; }
      else badge.style.display = 'none';
    });
  }

  // ---------- Cassetto ☰ di navigazione su schermo piccolo ----------
  // Sotto i 760px l'intera barra laterale (marchio, voci, interruttore tema) diventa
  // un cassetto a comparsa aperto/chiuso da questo pulsante, con uno sfondo scuro
  // dietro per poterlo chiudere toccando fuori.
  const appSidebarEl = document.getElementById('app-sidebar');
  const sidebarBackdropEl = document.getElementById('sidebar-backdrop');
  const navHamburgerBtn = document.getElementById('nav-hamburger-btn');
  function closeMobileNav(){
    appSidebarEl.classList.remove('open');
    sidebarBackdropEl.classList.remove('open');
    navHamburgerBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleMobileNav(){
    const opening = !appSidebarEl.classList.contains('open');
    appSidebarEl.classList.toggle('open', opening);
    sidebarBackdropEl.classList.toggle('open', opening);
    navHamburgerBtn.setAttribute('aria-expanded', String(opening));
  }
  navHamburgerBtn.addEventListener('click', (e)=>{ e.stopPropagation(); toggleMobileNav(); });
  // Su schermo largo il menu laterale si può nascondere per avere più spazio (utile per la
  // settimana); la scelta resta salvata su questo dispositivo.
  const SIDEBAR_KEY = 'mc_ricettario_sidebar_v1';
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  function applicaSidebarNascosta(nascosta, salva){
    document.documentElement.classList.toggle('sidebar-hidden', nascosta);
    if(sidebarToggleBtn){
      sidebarToggleBtn.setAttribute('aria-expanded', String(!nascosta));
      const et = nascosta ? 'Mostra il menu' : 'Nascondi il menu';
      sidebarToggleBtn.setAttribute('aria-label', et); sidebarToggleBtn.title = et;
    }
    if(salva) safeStorageSet(SIDEBAR_KEY, nascosta ? 'hidden' : 'shown');
  }
  (function(){ let v = ''; try{ v = localStorage.getItem(SIDEBAR_KEY) || ''; }catch(e){} applicaSidebarNascosta(v === 'hidden', false); })();
  if(sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', ()=> applicaSidebarNascosta(!document.documentElement.classList.contains('sidebar-hidden'), true));
  sidebarBackdropEl.addEventListener('click', closeMobileNav);
  document.addEventListener('click', (e)=>{
    if(appSidebarEl.classList.contains('open') && !appSidebarEl.contains(e.target) && e.target !== navHamburgerBtn){
      closeMobileNav();
    }
  });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMobileNav(); });

  // ---------- Accessibilità delle finestre (modali) ----------
  // Esc chiude la finestra in primo piano, il Tab resta dentro la finestra aperta e, alla chiusura,
  // il focus torna al pulsante che l'aveva aperta. Le finestre sono marcate come "dialog" per
  // le tecnologie assistive. La finestra di conferma gestisce già da sola il proprio Esc.
  (function setupDialogA11y(){
    const overlays = Array.from(document.querySelectorAll('.overlay'));
    const openers = new Map();
    overlays.forEach(ov=>{
      const modal = ov.querySelector('.modal');
      if(modal){
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('tabindex', '-1');
        const h = modal.querySelector('h2');
        if(h){ if(!h.id) h.id = ov.id + '-title'; modal.setAttribute('aria-labelledby', h.id); }
      }
      new MutationObserver(()=>{
        const attiva = ov.classList.contains('active');
        if(attiva && !openers.has(ov)){
          openers.set(ov, document.activeElement);
          if(modal) setTimeout(()=>{ if(!modal.contains(document.activeElement)) modal.focus({preventScroll:true}); }, 30);
        }else if(!attiva && openers.has(ov)){
          const el = openers.get(ov); openers.delete(ov);
          if(el && el.isConnected && typeof el.focus === 'function' && !document.querySelector('.overlay.active')) el.focus({preventScroll:true});
        }
      }).observe(ov, { attributes:true, attributeFilter:['class'] });
    });
    const topOverlay = ()=>{
      const attivi = overlays.filter(o=>o.classList.contains('active'));
      return attivi.length ? attivi[attivi.length - 1] : null;
    };
    document.addEventListener('keydown', (e)=>{
      const top = topOverlay();
      if(!top) return;
      if(e.key === 'Escape'){
        if(top.id === 'confirm-overlay') return;
        const closeBtn = top.querySelector('.close-x');
        if(closeBtn){ e.preventDefault(); closeBtn.click(); }
        return;
      }
      if(e.key === 'Tab'){
        const focusables = Array.from(top.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'))
          .filter(el => !el.disabled && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden');
        if(!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if(!top.contains(document.activeElement) || document.activeElement.classList.contains('modal')){
          e.preventDefault(); (e.shiftKey ? last : first).focus();
        }else if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    });
  })();

  // ---------- Pianificazione settimanale ----------
  const planningDaysEl = document.getElementById('planning-days');
  let selectedPlanDay = null;

  // ---------- Finestra di selezione ricetta (per la pianificazione) ----------
  const recipePickerOverlay = document.getElementById('recipe-picker-overlay');
  const recipePickerSearch = document.getElementById('recipe-picker-search');
  const recipePickerList = document.getElementById('recipe-picker-list');
  let pickerTargetDay = null, pickerTargetMealType = null, pickerTargetTime = '';

  function renderRecipePickerList(query){
    const q = normalize(query);
    const piuLibri = ricettari.length > 1;
    const matches = recipes
      .filter(r => !q || normalize(r.name).includes(q) || r.ingredients.some(i => normalize(i.name).includes(q)) || (piuLibri && normalize(ricettarioName(recipeRicettarioId(r))).includes(q)))
      .sort((a,b) => a.name.localeCompare(b.name));
    recipePickerList.innerHTML = matches.length ? matches.map(r => `
      <div class="recipe-picker-item" data-id="${r.id}">
        <span class="cat-dot" style="background:${CATEGORY_COLORS[r.category] || '#8A8F86'}"></span>
        <span class="name">${escapeHtml(r.name)}</span>
        <span class="meta">${escapeHtml(r.category)}${r.time ? ` · ${r.time} min` : ''}${recipeHasPressure(r) ? ' · 🍲' : ''}</span>
        ${piuLibri ? `<span class="picker-book">${icon('book')} ${escapeHtml(ricettarioName(recipeRicettarioId(r)))}</span>` : ''}
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
      makeKeyboardClickable(item);
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
    const q = normalize(query);
    const matches = dispensaItems.filter(it => !q || normalize(it.name).includes(q))
      .sort((a,b) => a.name.localeCompare(b.name));
    dispensaPickerList.innerHTML = matches.length ? matches.map(it => `
      <div class="recipe-picker-item" data-id="${it.id}">
        <span class="cat-dot" style="background:${PANTRY_CATEGORY_COLORS[it.category] || '#8A8F86'}"></span>
        <span class="name">${escapeHtml(it.name)}</span>
        <span class="meta">${escapeHtml(it.category)}${(it.qty || it.unit) ? ` · ${it.qty ? roundNice(it.qty) : ''} ${escapeHtml(it.unit||'')}` : ''}</span>
      </div>
    `).join('') : '<div class="recipe-picker-empty">Nessun prodotto in dispensa. Aggiungine uno dalla vista Dispensa.</div>';
    dispensaPickerList.querySelectorAll('.recipe-picker-item').forEach(item=>{
      item.addEventListener('click', ()=>{
        const it = dispensaItems.find(x=>x.id === item.dataset.id);
        if(!it) return;
        showDispensaPickerQtyStep(it);
      });
      makeKeyboardClickable(item);
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
    const servingsControl = e.dispensaItemId ? '' : `<span class="plan-entry-servings" title="Porzioni per questo pasto (di default il valore impostato in alto)">
      <input type="number" class="plan-entry-servings-input" min="1" data-entry-id="${escapeAttr(e.id)}" value="${entryServings(e)}">
    </span>`;
    const rec = e.dispensaItemId ? null : recipes.find(x => x.id === e.recipeId);
    const thumb = `<span class="plan-entry-thumb${rec && rec.photo ? '' : ' no-photo'}" aria-hidden="true">${rec && rec.photo ? `<img src="${escapeAttr(rec.photo)}" alt="" loading="lazy">` : (e.dispensaItemId ? '🥫' : '🍽')}</span>`;
    const metaParti = [];
    if(rec && rec.time) metaParti.push(`<span>${icon('clock','ico-xs')} ${escapeHtml(String(rec.time))} min</span>`);
    if(nutrizione && nutrizione.kcal !== null && nutrizione.kcal !== undefined) metaParti.push(`<span>${roundNice(nutrizione.kcal)} kcal</span>`);
    const metaHtml = metaParti.length ? `<div class="plan-entry-meta">${metaParti.join('')}</div>` : '';
    return `<div class="plan-entry">
      ${thumb}
      <div class="plan-entry-main">
        ${e.time ? `<span class="plan-entry-time">${escapeHtml(e.time)}</span>` : ''}
        <span class="plan-entry-name" ${nameAttr}>${name}</span>
        ${servingsControl}
        ${consumeControl}
        <button class="icon-btn plan-entry-remove" data-entry-id="${escapeAttr(e.id)}" title="Rimuovi">×</button>
      </div>
      ${metaHtml}
      ${nutrizioneHtml}
    </div>`;
  }

  // Genera e apre la lista della spesa per le sole ricette pianificate in un giorno specifico
  // (i pasti "dalla dispensa" sono esclusi, dato che non richiedono acquisti).
  function openDayShoppingList(day){
    const dayPairs = (weekPlan[day] || []).map(entryRecipePair).filter(Boolean);
    const dayRecipes = dayPairs.map(p => p.recipe);
    if(dayRecipes.length === 0){
      alert(`Nessuna ricetta pianificata per ${day}.`);
      return;
    }
    const items = buildAggregatedShoppingItems(dayPairs, false);
    const porzioniLabel = dayPairs.every(p => entryServings(p.entry) === entryServings(dayPairs[0].entry))
      ? `Per ${entryServings(dayPairs[0].entry)} persone — `
      : '';
    openShoppingListOverlay(items, `${porzioniLabel}${escapeHtml(day)}: ${formatRicetteSubtitle(dayRecipes, 'volte in questo giorno')}`);
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

  // Modo di visualizzazione della pianificazione: griglia della settimana (desktop) o un giorno alla volta.
  // Sugli schermi stretti la griglia non sarebbe leggibile: lì si usa sempre il giorno singolo.
  const PLAN_MODE_KEY = 'mc_ricettario_planmode_v1';
  let planMode = 'week';
  try{ planMode = localStorage.getItem(PLAN_MODE_KEY) === 'day' ? 'day' : 'week'; }catch(e){}
  const planNarrowMQ = window.matchMedia('(max-width:900px)');
  function effectivePlanMode(){ return planNarrowMQ.matches ? 'day' : planMode; }
  function setPlanMode(m){
    planMode = m === 'day' ? 'day' : 'week';
    try{ localStorage.setItem(PLAN_MODE_KEY, planMode); }catch(e){}
    renderPlanningDays();
  }
  document.getElementById('plan-mode-week').addEventListener('click', ()=> setPlanMode('week'));
  document.getElementById('plan-mode-day').addEventListener('click', ()=> setPlanMode('day'));
  const planWeekLabelText = document.getElementById('plan-week-label-text');
  const MESI_BREVI = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
  function dataBreve(iso){ const d = dateFromIso(iso); return `${d.getDate()} ${MESI_BREVI[d.getMonth()]}`; }
  function dataDelGiorno(day){ return shiftIsoDays(planWeekStart, DAYS.indexOf(day)); }
  function etichettaSettimana(lun){
    const dom = shiftIsoDays(lun, 6), a = dateFromIso(lun), b = dateFromIso(dom);
    const rng = a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${MESI_BREVI[b.getMonth()]} ${b.getFullYear()}` : `${dataBreve(lun)} – ${dataBreve(dom)} ${b.getFullYear()}`;
    const diff = Math.round((dateFromIso(lun) - dateFromIso(realMonday())) / (7*86400000));
    const rel = diff === 0 ? 'questa settimana' : diff === 1 ? 'prossima settimana' : diff === -1 ? 'settimana scorsa' : '';
    return rel ? `${rng} · ${rel}` : rng;
  }
  function aggiornaEtichettaSettimana(){
    if(planWeekLabelText){
      const intero = etichettaSettimana(planWeekStart), p = intero.split(' · ');
      planWeekLabelText.textContent = '';
      const riga1 = document.createElement('span'); riga1.className = 'plan-week-range'; riga1.textContent = p[0];
      planWeekLabelText.appendChild(riga1);
      if(p[1]){
        const riga2 = document.createElement('span'); riga2.className = 'plan-week-rel'; riga2.textContent = p[1].charAt(0).toUpperCase() + p[1].slice(1);
        planWeekLabelText.appendChild(riga2);
      }
    }
    const oggiBtn = document.getElementById('plan-week-today');
    if(oggiBtn) oggiBtn.hidden = planWeekStart === realMonday();
  }
  function vaiSettimana(lun){ setPlanWeek(lun); renderPlanningDays(); }
  document.getElementById('plan-week-prev').addEventListener('click', ()=> vaiSettimana(shiftIsoDays(planWeekStart, -7)));
  document.getElementById('plan-week-next').addEventListener('click', ()=> vaiSettimana(shiftIsoDays(planWeekStart, 7)));
  document.getElementById('plan-week-today').addEventListener('click', ()=> vaiSettimana(realMonday()));
  const onPlanMQChange = ()=>{ if(typeof currentView !== 'undefined' && currentView === 'planning') renderPlanningDays(); };
  if(planNarrowMQ.addEventListener) planNarrowMQ.addEventListener('change', onPlanMQChange);
  else if(planNarrowMQ.addListener) planNarrowMQ.addListener(onPlanMQChange);

  // ---------- Pasti a piacere (v5.32) ----------
  // Un «pasto» di un giorno esiste se ha almeno una voce pianificata oppure è stato aggiunto
  // a mano (in tal caso è registrato in weekNotes[giorno][nome], anche con nota vuota).
  function mealCatalogue(){
    const extra = mealTypes.filter(m => m && !MEAL_SUGGESTIONS.some(s => s.toLowerCase() === m.toLowerCase()));
    return MEAL_SUGGESTIONS.concat(extra);
  }
  function baseMealName(n){ return String(n||'').replace(/\s+\d+$/, ''); }
  function entryMealType(e){ return e.mealType || 'Pasto'; }
  // Orario di un pasto: quello scelto a mano (weekNotes[giorno].__orari[pasto]), altrimenti
  // il più presto tra le voci già inserite, altrimenti l'orario tipico del pasto.
  const ORARI_KEY = '__orari';
  function explicitSlotTime(day, mt){
    const o = weekNotes && weekNotes[day] && weekNotes[day][ORARI_KEY];
    return (o && o[mt]) || '';
  }
  function slotTime(day, mt){
    const ex = explicitSlotTime(day, mt);
    if(ex) return ex;
    const ts = (weekPlan[day] || []).filter(e => entryMealType(e) === mt && e.time).map(e => e.time).sort();
    return ts[0] || MEAL_DEFAULT_TIME[baseMealName(mt)] || '';
  }
  function setSlotTime(day, mt, t){
    if(!weekNotes[day]) weekNotes[day] = {};
    if(!weekNotes[day][ORARI_KEY]) weekNotes[day][ORARI_KEY] = {};
    if(t) weekNotes[day][ORARI_KEY][mt] = t; else delete weekNotes[day][ORARI_KEY][mt];
    if(t) (weekPlan[day] || []).forEach(e => { if(entryMealType(e) === mt) e.time = t; });
    saveWeek(); saveWeekNotes();
    renderPlanningDays();
  }
  function slotTimeInputHtml(day, mt){
    return `<input type="time" class="plan-slot-time" value="${escapeAttr(slotTime(day, mt))}" aria-label="Orario: ${escapeAttr(mt)} di ${escapeAttr(day)}" title="Orario del pasto: la giornata si ordina in base all'orario">`;
  }
  function slotsOfDay(day){
    const seen = new Map();
    const add = n => { if(!seen.has(n)) seen.set(n, { name: n, idx: seen.size, times: [] }); return seen.get(n); };
    (weekPlan[day] || []).forEach(e => { const s = add(entryMealType(e)); if(e.time) s.times.push(e.time); });
    Object.keys((weekNotes && weekNotes[day]) || {}).filter(n => n !== ORARI_KEY).forEach(n => add(n));
    const arr = Array.from(seen.values());
    arr.forEach(s => { s.key = slotTime(day, s.name) || '99:99'; });
    arr.sort((a,b) => a.key.localeCompare(b.key) || a.idx - b.idx);
    return arr.map(s => s.name);
  }
  function addMealSlot(day, name){
    name = String(name||'').trim();
    if(!name) return;
    const esistenti = new Set(slotsOfDay(day).map(s => s.toLowerCase()));
    let finale = name, n = 2;
    while(esistenti.has(finale.toLowerCase())) finale = `${name} ${n++}`;
    if(!weekNotes[day]) weekNotes[day] = {};
    weekNotes[day][finale] = '';
    const orario = MEAL_DEFAULT_TIME[baseMealName(finale)];
    if(orario){ if(!weekNotes[day][ORARI_KEY]) weekNotes[day][ORARI_KEY] = {}; weekNotes[day][ORARI_KEY][finale] = orario; }
    const baseName = baseMealName(name);
    if(!mealCatalogue().some(m => m.toLowerCase() === baseName.toLowerCase())){ mealTypes.push(baseName); saveMealTypes(); }
    saveWeekNotes();
    renderPlanningDays();
  }
  async function removeMealSlot(day, mt){
    const voci = (weekPlan[day] || []).filter(e => entryMealType(e) === mt);
    if(voci.length){
      const ok = await confirmDialog({
        title: 'Rimuovere questo pasto?',
        message: `«${mt}» di ${day} contiene ${voci.length} ${voci.length === 1 ? 'voce' : 'voci'}: verranno tolte dal piano (le ricette restano nel ricettario).`,
        confirmText: 'Rimuovi pasto',
        danger: true
      });
      if(!ok) return;
      weekPlan[day] = (weekPlan[day] || []).filter(e => entryMealType(e) !== mt);
    }
    if(weekNotes[day]){
      delete weekNotes[day][mt];
      if(weekNotes[day][ORARI_KEY]) delete weekNotes[day][ORARI_KEY][mt];
      if(!Object.keys(weekNotes[day]).filter(k => k !== ORARI_KEY).length) delete weekNotes[day];
    }
    saveWeek(); saveWeekNotes();
    renderPlanningDays();
  }
  function addMealSelectHtml(day){
    return `<div class="plan-add-meal"><select class="plan-add-meal-select" data-day="${escapeAttr(day)}" aria-label="Aggiungi un pasto: ${escapeAttr(day)}">
      <option value="">＋ Aggiungi pasto…</option>
      ${mealCatalogue().map(m => `<option value="${escapeAttr(m)}">${escapeHtml(m)}</option>`).join('')}
      <option value="__altro">Altro (scrivi il nome)…</option>
    </select></div>`;
  }

  // Settimana: una riga per giorno; ogni giorno contiene solo i pasti che hai aggiunto.
  function weekSlotHtml(day, mt, isToday){
    const entries = (weekPlan[day] || []).filter(e => entryMealType(e) === mt).slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
    const note = (weekNotes[day] && weekNotes[day][mt]) || '';
    return `<div class="plan-meal-block${entries.length ? ' filled' : ''}${isToday ? ' is-today' : ''}" data-day="${escapeAttr(day)}" data-mealtype="${escapeAttr(mt)}">
      <div class="plan-slot-head">${slotTimeInputHtml(day, mt)}<span class="plan-slot-name">${escapeHtml(mt)}</span><button type="button" class="icon-btn slot-remove-btn" data-day="${escapeAttr(day)}" data-mealtype="${escapeAttr(mt)}" title="Rimuovi questo pasto" aria-label="Rimuovi il pasto ${escapeAttr(mt)} di ${escapeAttr(day)}">×</button></div>
      ${entries.length ? `<div class="plan-entry-list">${entries.map(renderPlanEntry).join('')}</div>` : ''}
      <input type="text" class="plan-grid-note-input" placeholder="Nota…" value="${escapeAttr(note)}" aria-label="Nota: ${escapeAttr(day)}, ${escapeAttr(mt)}"${note ? '' : ' hidden'}>
      <div class="plan-add-row">
        <input type="time" class="plan-add-time" aria-hidden="true" tabindex="-1" value="${escapeAttr(slotTime(day, mt))}">
        <button type="button" class="btn-ghost btn-small plan-add-btn" aria-label="Aggiungi una ricetta: ${escapeAttr(day)}, ${escapeAttr(mt)}" title="Cerca una ricetta">${icon('plus','ico-xs')}<span class="lbl"> Ricetta</span></button>
        <button type="button" class="btn-ghost btn-small plan-add-dispensa-btn" aria-label="Aggiungi dalla dispensa: ${escapeAttr(day)}, ${escapeAttr(mt)}" title="Aggiungi un prodotto dalla dispensa">${icon('box','ico-xs')}<span class="lbl"> Dispensa</span></button>
        ${note ? '' : `<button type="button" class="btn-ghost btn-small plan-add-note-btn" aria-label="Aggiungi una nota: ${escapeAttr(day)}, ${escapeAttr(mt)}" title="Aggiungi una nota">${icon('pencil','ico-xs')}</button>`}
      </div>
    </div>`;
  }
  // Righe della matrice settimanale: tutti i pasti usati in almeno un giorno, in ordine di orario
  // (media degli orari dei giorni in cui compaiono). Così le righe sono allineate tra i giorni.
  function planRowsOfWeek(){
    const map = new Map();
    DAYS.forEach(day => slotsOfDay(day).forEach(n => {
      let r = map.get(n);
      if(!r){ r = { name: n, idx: map.size, mins: [] }; map.set(n, r); }
      const t = slotTime(day, n);
      if(/^\d{1,2}:\d{2}$/.test(t)){ const p = t.split(':'); r.mins.push(parseInt(p[0],10) * 60 + parseInt(p[1],10)); }
    }));
    return Array.from(map.values())
      .map(r => ({ name: r.name, idx: r.idx, key: r.mins.length ? r.mins.reduce((a,b)=>a+b,0) / r.mins.length : 1e6 }))
      .sort((a,b) => a.key - b.key || a.idx - b.idx)
      .map(r => r.name);
  }
  // Settimana: una colonna per giorno, una riga per pasto (matrice). Le caselle dei pasti che quel
  // giorno non hai aggiunto sono vuote e, toccandole, creano il pasto.
  function buildPlanGridHtml(){
    const jsDay = new Date().getDay();
    const todayName = planWeekStart === realMonday() ? DAYS[jsDay === 0 ? 6 : jsDay - 1] : '';
    const righe = planRowsOfWeek();
    let html = `<div class="plan-grid plan-week plan-matrix" role="group" aria-label="Pianificazione della settimana" style="grid-template-rows:auto repeat(${righe.length},auto) auto">
      <div class="plan-matrix-corner" style="grid-column:1;grid-row:1"></div>`;
    righe.forEach((mt, r) => {
      html += `<div class="plan-row-label" style="grid-column:1;grid-row:${r + 2}" aria-hidden="true">${escapeHtml(mt)}</div>`;
    });
    DAYS.forEach((day, di)=>{
      const isToday = day === todayName;
      const presenti = new Set(slotsOfDay(day));
      html += `<div class="plan-week-row${isToday ? ' is-today' : ''}" style="grid-column:${di + 2}">
        <div class="plan-grid-dayhead${isToday ? ' today' : ''}"><span class="dname">${escapeHtml(day)}</span><span class="ddate">${escapeHtml(dataBreve(dataDelGiorno(day)))}</span><span class="dtools"><button type="button" class="icon-btn plan-grid-day-shopping" data-day="${escapeAttr(day)}" title="Lista della spesa di ${escapeAttr(day)}" aria-label="Lista della spesa di ${escapeAttr(day)}">${icon('cart','ico-xs')}</button><button type="button" class="icon-btn plan-grid-day-open" data-day="${escapeAttr(day)}" title="Apri ${escapeAttr(day)} nel dettaglio" aria-label="Apri ${escapeAttr(day)} nel dettaglio">${icon('pencil','ico-xs')}</button></span></div>
        ${righe.map(mt => presenti.has(mt)
          ? weekSlotHtml(day, mt, isToday)
          : `<button type="button" class="plan-slot-empty" data-day="${escapeAttr(day)}" data-mealtype="${escapeAttr(mt)}" aria-label="Aggiungi ${escapeAttr(mt)}: ${escapeAttr(day)}" title="Aggiungi ${escapeAttr(mt)}">＋</button>`).join('')}
        ${righe.length ? '' : '<span class="plan-day-free">Giorno libero: aggiungi i pasti che ti servono</span>'}
        ${addMealSelectHtml(day)}
      </div>`;
    });
    return html + '</div>';
  }

  function renderPlanningDays(){
    if(!planningDaysEl) return;
    if(!selectedPlanDay){
      const jsDay = new Date().getDay(); // 0=domenica...6=sabato
      selectedPlanDay = planWeekStart === realMonday() ? DAYS[jsDay === 0 ? 6 : jsDay - 1] : DAYS[0];
    }
    aggiornaEtichettaSettimana();

    const weekMode = effectivePlanMode() === 'week';
    const narrow = planNarrowMQ.matches;
    document.getElementById('plan-view-toggle').style.display = narrow ? 'none' : '';
    document.getElementById('plan-mode-week').classList.toggle('active', weekMode);
    document.getElementById('plan-mode-day').classList.toggle('active', !weekMode);
    document.getElementById('plan-mode-week').setAttribute('aria-pressed', String(weekMode));
    document.getElementById('plan-mode-day').setAttribute('aria-pressed', String(!weekMode));
    document.getElementById('plan-day-nav').style.display = weekMode ? 'none' : '';

    const dayTabsEl = document.getElementById('plan-day-tabs');
    dayTabsEl.innerHTML = DAYS.map(day =>
      `<button type="button" class="plan-day-tab ${day === selectedPlanDay ? 'active' : ''}" data-day="${escapeAttr(day)}">${escapeHtml(day.slice(0,3))} ${dataDelGiorno(day).slice(8).replace(/^0/,'')}</button>`
    ).join('');
    dayTabsEl.querySelectorAll('.plan-day-tab').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        selectedPlanDay = btn.dataset.day;
        renderPlanningDays();
      });
    });

    planningDaysEl.innerHTML = '';
    if(weekMode){
      planningDaysEl.innerHTML = buildPlanGridHtml();
      planningDaysEl.querySelectorAll('.plan-grid-day-shopping').forEach(b=> b.addEventListener('click', ()=> openDayShoppingList(b.dataset.day)));
      planningDaysEl.querySelectorAll('.plan-grid-day-open').forEach(b=> b.addEventListener('click', ()=>{ selectedPlanDay = b.dataset.day; setPlanMode('day'); }));
    } else {
    const day = selectedPlanDay;
    const dayEntries = weekPlan[day] || [];
    const card = document.createElement('div');
    card.className = 'plan-day-card';

    const blocksHtml = slotsOfDay(day).map(mt=>{
      const entries = dayEntries.filter(e=>entryMealType(e) === mt)
        .slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
      const entriesHtml = entries.length ? entries.map(renderPlanEntry).join('') : `<div class="plan-entry-empty">Nessuna ricetta</div>`;
      const totaleMealHtml = entries.length ? (() => {
        const t = nutrizioneMealBlock(day, mt);
        return t ? `<div class="plan-meal-total">Totale ${escapeHtml(mt.toLowerCase())}: ${formattaNutrizioneCompatta(t)}</div>` : '';
      })() : '';
      return `<div class="plan-meal-block" data-day="${escapeAttr(day)}" data-mealtype="${escapeAttr(mt)}">
        <div class="plan-meal-header">
          <span class="plan-tl-time">${slotTimeInputHtml(day, mt)}</span><span class="plan-meal-name">${escapeHtml(mt)}</span>
          <span class="plan-meal-actions"><button type="button" class="icon-btn slot-remove-btn" data-day="${escapeAttr(day)}" data-mealtype="${escapeAttr(mt)}" title="Rimuovi questo pasto" aria-label="Rimuovi il pasto ${escapeAttr(mt)}">🗑</button></span>
        </div>
        <div class="plan-entry-list">${entriesHtml}</div>
        ${totaleMealHtml}
        <div class="plan-add-row">
          <input type="time" class="plan-add-time" aria-hidden="true" tabindex="-1" value="${escapeAttr(slotTime(day, mt))}">
          <button class="btn-ghost btn-small plan-add-btn">🔍 Cerca ricetta…</button>
          <button class="btn-ghost btn-small plan-add-dispensa-btn">🥫 Dalla dispensa…</button>
        </div>
        <input type="text" class="plan-note-input" placeholder="Nota (es. cena fuori, avanzi, preparare il giorno prima…)" value="${escapeAttr((weekNotes[day] && weekNotes[day][mt]) || '')}">
      </div>`;
    }).join('');
    const giornoLiberoHtml = blocksHtml ? '' : '<p class="plan-day-free">Giorno libero: aggiungi i pasti che ti servono.</p>';
    const orphanedHtml = '';

    const totaleGiorno = nutrizioneGiorno(day);
    const totaleGiornoHtml = totaleGiorno
      ? `<div class="plan-day-total">📊 Totale ${escapeHtml(day.toLowerCase())}: ${formattaNutrizioneCompatta(totaleGiorno)}</div>` : '';
    const nPasti = slotsOfDay(day).length;
    const nRicette = dayEntries.filter(e => !e.dispensaItemId).length;
    const nDispensa = dayEntries.filter(e => e.dispensaItemId).length;
    const porzioniGiorno = dayEntries.filter(e => !e.dispensaItemId).map(e => entryServings(e)).filter(n => Number.isFinite(n) && n > 0);
    const personeMin = porzioniGiorno.length ? Math.min(...porzioniGiorno) : planServings;
    const personeMax = porzioniGiorno.length ? Math.max(...porzioniGiorno) : planServings;
    const personeTesto = personeMin === personeMax ? String(personeMin) : `da ${personeMin} a ${personeMax}`;
    const kcalGiorno = totaleGiorno && totaleGiorno.kcal !== null && totaleGiorno.kcal !== undefined ? roundNice(totaleGiorno.kcal) : null;
    const riepilogoHtml = `<aside class="plan-day-side" aria-label="${escapeAttr(day)} in breve">
      <h4>${escapeHtml(day)} in breve</h4>
      <div class="plan-sum-row"><span>Pasti</span><b>${nPasti}</b></div>
      <div class="plan-sum-row"><span>Ricette</span><b>${nRicette}</b></div>
      ${nDispensa ? `<div class="plan-sum-row"><span>Dalla dispensa</span><b>${nDispensa}</b></div>` : ''}
      <div class="plan-sum-row"><span>Calorie</span><b>${kcalGiorno !== null ? kcalGiorno + ' kcal' : '—'}</b></div>
      <div class="plan-sum-row"><span>Persone</span><b>${personeTesto}</b></div>
      ${totaleGiornoHtml}
      <hr>
      <button type="button" class="btn-ghost btn-small plan-day-shopping-btn">🛒 Lista della spesa del giorno</button>
      <button type="button" class="btn-ghost btn-small plan-week-totals-btn">📊 Totali settimana</button>
    </aside>`;

    card.innerHTML = `<div class="plan-day-wrap">
      <div class="plan-day-main">
        <h3>${escapeHtml(day)} <span class="plan-day-date">${escapeHtml(dataBreve(dataDelGiorno(day)))}</span></h3>
        <div class="plan-timeline">${blocksHtml}</div>${giornoLiberoHtml}${addMealSelectHtml(day)}
      </div>
      ${riepilogoHtml}
    </div>`;
    planningDaysEl.appendChild(card);

    card.querySelectorAll('.plan-note-input').forEach(input=>{
      input.addEventListener('change', ()=>{
        const mt = input.closest('.plan-meal-block').dataset.mealtype;
        const testo = input.value.trim();
        if(!weekNotes[day]) weekNotes[day] = {};
        weekNotes[day][mt] = testo;
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

    }
    planningDaysEl.querySelectorAll('.plan-add-note-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const inp = btn.closest('.plan-meal-block').querySelector('.plan-grid-note-input');
        if(!inp) return;
        inp.hidden = false; btn.remove(); inp.focus();
      });
    });
    planningDaysEl.querySelectorAll('.plan-grid-note-input').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const block = inp.closest('.plan-meal-block');
        const day = block.dataset.day, mt = block.dataset.mealtype;
        const testo = inp.value.trim();
        if(!weekNotes[day]) weekNotes[day] = {};
        weekNotes[day][mt] = testo;
        saveWeekNotes();
      });
    });
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
    planningDaysEl.querySelectorAll('.plan-entry-servings-input').forEach(input=>{
      input.addEventListener('change', ()=>{
        const entryId = input.dataset.entryId;
        let entry = null;
        for(const d of DAYS){
          const found = (weekPlan[d] || []).find(x=>x.id === entryId);
          if(found){ entry = found; break; }
        }
        if(!entry) return;
        const val = parseInt(input.value, 10);
        if(!val || val < 1){ input.value = entryServings(entry); return; }
        // Se il valore coincide con quello generale della settimana, non si salva una
        // personalizzazione: così il pasto continua a seguire il valore "in alto" anche
        // se viene cambiato in futuro, invece di restare fissato a quel numero.
        entry.servings = (val === planServings) ? undefined : val;
        saveWeek();
        renderPlanningDays();
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
    planningDaysEl.querySelectorAll('.plan-slot-time').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const block = inp.closest('.plan-meal-block');
        setSlotTime(block.dataset.day, block.dataset.mealtype, inp.value);
      });
    });
    planningDaysEl.querySelectorAll('.plan-slot-empty').forEach(btn=>{
      btn.addEventListener('click', ()=> addMealSlot(btn.dataset.day, btn.dataset.mealtype));
    });
    planningDaysEl.querySelectorAll('.slot-remove-btn').forEach(btn=>{
      btn.addEventListener('click', ()=> removeMealSlot(btn.dataset.day, btn.dataset.mealtype));
    });
    planningDaysEl.querySelectorAll('.plan-add-meal-select').forEach(sel=>{
      sel.addEventListener('change', ()=>{
        let nome = sel.value;
        const giorno = sel.dataset.day;
        sel.value = '';
        if(nome === '__altro'){
          nome = prompt('Nome del pasto (es. Aperitivo, Spuntino di mezzanotte):') || '';
        }
        if(nome) addMealSlot(giorno, nome);
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
    const pairs = allEntries.map(entryRecipePair).filter(Boolean);
    const count = buildAggregatedShoppingItems(pairs).length;
    if(count > 0){ badge.textContent = ` · ${count}`; badge.style.display = 'inline'; }
    else { badge.textContent = ''; badge.style.display = 'none'; }
  }

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

  // Passa al Ricettario in modalità "Cosa posso cucinare?" con i nomi passati già
  // impostati come priorità ("Usa prima"): condivisa tra il pulsante in Dispensa e
  // quello nella card "Da consumare prima" della pagina Oggi.
  function attivaRicercaConScadenza(nomiProdotti){
    priorityPantryNames = (nomiProdotti || []).map(normalize).filter(Boolean);
    priorityPantryLabels = (nomiProdotti || []).filter(Boolean);
    if(!priorityPantryNames.length){
      alert('Non ci sono prodotti in scadenza entro 3 giorni.');
      return;
    }
    pantryMode = true;
    pantryResetBtn.style.display = 'inline-block';
    updatePantryPanelSub();
    switchView('recipes');
  }

  function renderDispensaList(){
    aggiornaTopbarAlerts();
    updatePantryPanelSub();
    const listEl = document.getElementById('dispensa-list');
    const q = normalize(document.getElementById('dispensa-search').value);
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

    // "In esaurimento" vale sia nel senso stretto (sotto la soglia "Avvisa sotto" impostata)
    // sia, a prescindere da quella soglia, quando la quantità registrata è proprio a zero: un
    // prodotto finito non deve restare silenzioso solo perché non gli è mai stata data una soglia.
    const isLowStock = it => {
      const qty = parseFloat(it.qty);
      const minQty = parseFloat(it.minQty);
      if(isNaN(qty)) return false;
      if(qty <= 0) return true;
      return !isNaN(minQty) && qty <= minQty;
    };

    const filtered = dispensaItems.filter(it=>{
      if(cat && it.category !== cat) return false;
      if(q && !normalize(it.name).includes(q)) return false;
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

    listEl.innerHTML = '<div class="dispensa-head" aria-hidden="true"><span>Ingrediente</span><span>Quantità</span><span>Unità</span><span>Categoria</span><span></span></div>';
    filtered.forEach(it=>{
      const card = document.createElement('div');
      card.className = 'card dispensa-row';

      const isExpired = !!it.expiry && it.expiry < today;
      const isSoon = !!it.expiry && !isExpired && it.expiry <= soonLimit;
      const low = isLowStock(it);
      const dotCls = isExpired ? 'expired' : (low ? 'low' : '');
      const subParts = [];
      if(low) subParts.push('<span class="dispensa-low-stock">In esaurimento</span>');
      if(it.expiry){
        const cls = isExpired ? 'expired' : isSoon ? 'soon' : '';
        const label = isExpired ? 'Scaduto il ' : isSoon ? 'Scade il ' : 'Scade il ';
        subParts.push(`<span class="dispensa-expiry ${cls}">${label}${new Date(it.expiry + 'T00:00:00').toLocaleDateString('it-IT')}</span>`);
      }
      if(it.offNutriscore && NUTRISCORE_COLORI[it.offNutriscore]){
        subParts.push(`<span class="cat-tag" style="background:${NUTRISCORE_COLORI[it.offNutriscore]};">Nutri-Score ${escapeHtml(it.offNutriscore)}</span>`);
      }
      const kcalTxt = (it.kcal !== undefined && it.kcal !== '' && it.kcal !== null && !isNaN(parseFloat(it.kcal))) ? `${roundNice(it.kcal)} kcal/100 g` : '';
      const thumb = it.offImmagine ? `<img class="dispensa-thumb" src="${escapeAttr(it.offImmagine)}" alt="">` : `<span class="dispensa-dot ${dotCls}" aria-hidden="true"></span>`;
      const qtyTxt = (it.qty !== undefined && it.qty !== '' && it.qty !== null) ? roundNice(it.qty) : '–';

      card.innerHTML = `
        <div class="dispensa-name-cell">${thumb}<div class="dispensa-name-text"><div class="dname">${escapeHtml(it.name)}</div>${kcalTxt ? `<div class="dsub">${escapeHtml(kcalTxt)}</div>` : ''}${subParts.length ? `<div class="dispensa-badges">${subParts.join('')}</div>` : ''}</div></div>
        <div class="dispensa-qty">${qtyTxt}</div>
        <div class="dispensa-unit">${escapeHtml(it.unit || '')}</div>
        <div class="dispensa-cat">${escapeHtml(it.category || '')}</div>
        <div class="dispensa-actions">
          <button type="button" class="icon-btn dispensa-edit-btn" aria-label="Modifica ${escapeAttr(it.name)}" title="Modifica">${icon('pencil')}</button>
          <button type="button" class="icon-btn dispensa-del-btn" aria-label="Elimina ${escapeAttr(it.name)}" title="Elimina">${icon('trash')}</button>
        </div>
      `;
      card.addEventListener('click', ()=> openDispensaEdit(it));
      card.querySelector('.dispensa-edit-btn').addEventListener('click', ev=>{ ev.stopPropagation(); openDispensaEdit(it); });
      card.querySelector('.dispensa-del-btn').addEventListener('click', ev=>{
        ev.stopPropagation();
        editingDispensaId = it.id;
        document.getElementById('dispensa-delete-btn').click();
      });
      makeKeyboardClickable(card, it.name);
      listEl.appendChild(card);
    });
  }

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
    attivaRicercaConScadenza(prodottiInScadenza);
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
    weekPlan = {}; weekNotes = {}; saveWeek(); saveWeekNotes(); renderPlanningDays();
  });

  document.getElementById('copy-last-week-btn').addEventListener('click', ()=>{
    const precedente = (planWeeks[shiftIsoDays(planWeekStart, -7)] || {}).plan;
    const sorgente = (precedente && DAYS.some(d => (precedente[d] || []).length)) ? precedente : previousWeekPlan;
    const hasPrev = sorgente && DAYS.some(d => (sorgente[d] || []).length);
    if(!hasPrev){
      alert('La settimana precedente è vuota. Se hai appena svuotato questa settimana, la copia viene recuperata da lì.');
      return;
    }
    const totaleVoci = DAYS.reduce((n, d) => n + (sorgente[d] || []).length, 0);
    if(!confirm(`Aggiungere ${totaleVoci} vo${totaleVoci===1?'ce':'ci'} della settimana precedente a quella mostrata (${etichettaSettimana(planWeekStart)})? Quello che hai già pianificato resta invariato.`)) return;
    // Aggiunge, non sostituisce: ogni voce viene copiata con un nuovo identificativo e segnata
    // come "da consumare", così non eredita per sbaglio lo stato (✓) della settimana precedente,
    // e quanto già pianificato per questa settimana non viene toccato.
    DAYS.forEach(day=>{
      const voci = sorgente[day] || [];
      if(!voci.length) return;
      if(!weekPlan[day]) weekPlan[day] = [];
      voci.forEach(voce=>{
        weekPlan[day].push({ ...JSON.parse(JSON.stringify(voce)), id: cryptoId(), consumed: false });
      });
    });
    saveWeek();
    renderPlanningDays();
  });

  // ---------- Ripeti la settimana / lista della spesa per date ----------
  function vociDellaSettimana(w){ return DAYS.reduce((n, d) => n + (((w || {}).plan || {})[d] || []).length, 0); }
  const repeatOverlay = document.getElementById('repeat-week-overlay');
  const closeRepeat = ()=> repeatOverlay.classList.remove('active');
  function aggiornaAnteprimaRipeti(){
    salvaSettimane();
    const n = Math.max(1, Math.min(12, parseInt(document.getElementById('repeat-week-count').value, 10) || 1));
    const salta = document.getElementById('repeat-week-skip').checked;
    let ok = 0, saltate = 0;
    for(let i = 1; i <= n; i++){
      const w = planWeeks[shiftIsoDays(planWeekStart, 7*i)];
      if(salta && vociDellaSettimana(w) > 0) saltate++; else ok++;
    }
    document.getElementById('repeat-week-preview').textContent = `Verrà copiata su ${ok} settiman${ok === 1 ? 'a' : 'e'}` + (saltate ? ` (${saltate} già pianificat${saltate === 1 ? 'a' : 'e'}, saltat${saltate === 1 ? 'a' : 'e'})` : '') + '.';
    document.getElementById('repeat-week-confirm').disabled = ok === 0;
  }
  document.getElementById('repeat-week-btn').addEventListener('click', ()=>{
    salvaSettimane();
    const tot = vociDellaSettimana({ plan: weekPlan });
    if(!tot){ alert('Questa settimana è vuota: non c\'è nulla da ripetere.'); return; }
    document.getElementById('repeat-week-info').textContent = `Copia le ${tot} voci di ${etichettaSettimana(planWeekStart).split(' · ')[0]} sulle settimane successive. Le note per fascia pasto vengono copiate insieme.`;
    aggiornaAnteprimaRipeti();
    repeatOverlay.classList.add('active');
  });
  ['repeat-week-count','repeat-week-skip'].forEach(id => document.getElementById(id).addEventListener('input', aggiornaAnteprimaRipeti));
  ['repeat-week-close','repeat-week-cancel'].forEach(id => document.getElementById(id).addEventListener('click', closeRepeat));
  repeatOverlay.addEventListener('click', e => { if(e.target === repeatOverlay) closeRepeat(); });
  document.getElementById('repeat-week-confirm').addEventListener('click', ()=>{
    salvaSettimane();
    const n = Math.max(1, Math.min(12, parseInt(document.getElementById('repeat-week-count').value, 10) || 1));
    const salta = document.getElementById('repeat-week-skip').checked;
    const copiaVoci = JSON.parse(JSON.stringify(weekPlan));
    const copiaNote = JSON.parse(JSON.stringify(weekNotes));
    for(let i = 1; i <= n; i++){
      const lun = shiftIsoDays(planWeekStart, 7*i);
      const esistente = planWeeks[lun];
      if(salta && vociDellaSettimana(esistente) > 0) continue;
      const plan = (esistente && esistente.plan) || {}, notes = (esistente && esistente.notes) || {};
      DAYS.forEach(day=>{
        const voci = copiaVoci[day] || [];
        if(!voci.length) return;
        if(!plan[day]) plan[day] = [];
        voci.forEach(v => plan[day].push({ ...v, id: cryptoId(), consumed: false }));
        Object.keys(copiaNote[day] || {}).forEach(mt => { if(!notes[day]) notes[day] = {}; if(!notes[day][mt]) notes[day][mt] = copiaNote[day][mt]; });
      });
      planWeeks[lun] = { plan, notes };
    }
    safeStorageSet(PLAN_WEEKS_KEY, JSON.stringify(planWeeks));
    scriviSuFileCollegato();
    closeRepeat();
    renderPlanningDays();
  });

  const rangeOverlay = document.getElementById('range-shopping-overlay');
  const closeRange = ()=> rangeOverlay.classList.remove('active');
  function vociNelIntervallo(da, a){
    salvaSettimane();
    const out = [];
    if(!da || !a || da > a) return out;
    for(let iso = da, guard = 0; iso <= a && guard < 400; iso = shiftIsoDays(iso, 1), guard++){
      const lun = mondayOfIso(iso);
      const w = planWeeks[lun];
      const day = DAYS[(dateFromIso(iso).getDay() + 6) % 7];
      ((w && w.plan && w.plan[day]) || []).forEach(e => { const p = entryRecipePair(e); if(p) out.push(p); });
    }
    return out;
  }
  function aggiornaAnteprimaIntervallo(){
    const pairs = vociNelIntervallo(document.getElementById('range-from').value, document.getElementById('range-to').value);
    const el = document.getElementById('range-shopping-preview');
    const da = document.getElementById('range-from').value, a = document.getElementById('range-to').value;
    el.textContent = (!da || !a || da > a) ? 'Scegli un intervallo valido.' : `${pairs.length} ricett${pairs.length === 1 ? 'a pianificata' : 'e pianificate'} in questo intervallo.`;
    document.getElementById('range-shopping-confirm').disabled = !pairs.length;
  }
  document.getElementById('range-shopping-btn').addEventListener('click', ()=>{
    const oggi = isoLocal(new Date());
    const from = document.getElementById('range-from'), to = document.getElementById('range-to');
    if(!from.value){ from.value = planWeekStart === realMonday() ? oggi : planWeekStart; }
    if(!to.value || to.value < from.value){ to.value = shiftIsoDays(from.value, 6); }
    aggiornaAnteprimaIntervallo();
    rangeOverlay.classList.add('active');
  });
  ['range-from','range-to'].forEach(id => document.getElementById(id).addEventListener('input', aggiornaAnteprimaIntervallo));
  ['range-shopping-close','range-shopping-cancel'].forEach(id => document.getElementById(id).addEventListener('click', closeRange));
  rangeOverlay.addEventListener('click', e => { if(e.target === rangeOverlay) closeRange(); });
  document.getElementById('range-shopping-confirm').addEventListener('click', ()=>{
    const da = document.getElementById('range-from').value, a = document.getElementById('range-to').value;
    const pairs = vociNelIntervallo(da, a);
    if(!pairs.length) return;
    closeRange();
    const items = buildAggregatedShoppingItems(pairs, false);
    openShoppingListOverlay(items, `Dal ${escapeHtml(dataBreve(da))} al ${escapeHtml(dataBreve(a))}: ${formatRicetteSubtitle(pairs.map(p => p.recipe), 'volte in questo periodo')}`);
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

  // Elenca le ricette pianificate una sola volta anche se compaiono più volte (es. la stessa
  // ricetta a pranzo e cena, o in più giorni): le quantità nella lista sono già sommate da
  // buildAggregatedShoppingItems, qui serve solo evitare che il nome si ripeta nel sottotitolo,
  // segnalando invece in rosso quante volte è stata pianificata.
  function formatRicetteSubtitle(plannedRecipes, periodLabel){
    const counts = [];
    const index = new Map();
    plannedRecipes.forEach(r=>{
      if(index.has(r.id)){ counts[index.get(r.id)].count++; }
      else{ index.set(r.id, counts.length); counts.push({ name: r.name, count: 1 }); }
    });
    return counts.map(({name, count})=>{
      const label = escapeHtml(name);
      return count > 1
        ? `${label} <span style="color:var(--red);font-weight:600;">(x${count} ${escapeHtml(periodLabel)})</span>`
        : label;
    }).join(', ');
  }

  // Popola e apre il modal della lista della spesa con un elenco di voci già calcolato
  // (usata sia dalla lista della settimana, sia da quella di un giorno o di una singola ricetta).
  function shoppingItemKey(item){ return normalize(item.name) + '|' + normalize(item.unit || ''); }
  function updateShoppingSummary(){
    const el = document.getElementById('shopping-summary');
    if(!el) return;
    let todo = 0, done = 0;
    shoppingListItems.querySelectorAll('li').forEach(li=>{
      const cb = li.querySelector(':scope > input[type=checkbox]');
      if(!cb || li.classList.contains('covered')) return;
      if(cb.checked) done++; else todo++;
    });
    el.innerHTML = `<span class="shopping-count todo"><b>${todo}</b> da comprare</span><span class="shopping-count done"><b>${done}</b> nel carrello</span>`;
    el.style.display = (todo + done) ? 'flex' : 'none';
  }
  function openShoppingListOverlay(itemsOriginali, subtitleText){
    // Copie di lavoro: le modifiche a mano (voci tolte, quantità cambiate) si applicano qui,
    // senza toccare i dati di partenza (ricette, pianificazione, Dispensa).
    const hiddenHere = [];
    const items = itemsOriginali.map(i => ({...i})).filter(item=>{
      if(item.fromDispensaFlag) return true;
      const k = shoppingItemKey(item);
      if(shoppingHiddenItems[k]){ hiddenHere.push(k); return false; }
      return true;
    });
    items.forEach(item=>{
      if(item.fromDispensaFlag) return;
      const ov = shoppingQtyOverrides[shoppingItemKey(item)];
      if(ov > 0) item.qty = ov;
    });
    shoppingSubtitle.innerHTML = subtitleText;
    let dispensaSyncCount = 0;
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
        header.innerHTML = `<span class="reparto-dot" style="background:${PANTRY_CATEGORY_COLORS[reparto] || '#8A8F86'}"></span>${escapeHtml(reparto)}`;
        shoppingListItems.appendChild(header);
      }
      const li = document.createElement('li');
      const amt = item.fromDispensaFlag ? 'dalla dispensa' : `${item.qty ? formatQtyForUnit(item.qty, item.unit) : ''} ${item.unit||''}`.trim();
      const giaSpuntato = !!shoppingCheckedItems[normalize(item.name)];
      li.innerHTML = `<input type="checkbox"${giaSpuntato?' checked':''} aria-label="Segna come comprato: ${escapeAttr(item.name)}"><span>${escapeHtml(item.name)}</span><span class="amt">${escapeHtml(amt)}</span>`;
      if(giaSpuntato) li.classList.add('checked');
      const amtSpan = li.querySelector('.amt');

      // Modifica e rimozione della singola voce
      const itemKey = shoppingItemKey(item);
      const actions = document.createElement('div');
      actions.className = 'shopping-item-actions';
      actions.innerHTML = (item.fromDispensaFlag ? '' : `<button type="button" class="icon-btn shopping-edit-btn" aria-label="Modifica la quantità di ${escapeAttr(item.name)}" title="Modifica quantità">${icon('pencil')}</button>`)
        + `<button type="button" class="icon-btn shopping-remove-btn" aria-label="Togli ${escapeAttr(item.name)} dalla lista" title="Togli dalla lista">${icon('trash')}</button>`;
      li.appendChild(actions);
      const editBtn = actions.querySelector('.shopping-edit-btn');
      if(editBtn) editBtn.addEventListener('click', ()=>{
        if(li.querySelector('.shopping-edit-form')) return;
        const form = document.createElement('form');
        form.className = 'shopping-edit-form';
        form.innerHTML = `<input type="number" min="0" step="any" inputmode="decimal" aria-label="Quantità di ${escapeAttr(item.name)}" value="${item.qty ? escapeAttr(String(item.qty)) : ''}"><span class="u">${escapeHtml(item.unit || '')}</span><button type="submit" class="btn-gold btn-small">Salva</button><button type="button" class="btn-ghost btn-small shopping-edit-cancel">Annulla</button>`;
        const inp = form.querySelector('input');
        const closeForm = ()=>{ form.remove(); amtSpan.style.display = ''; actions.style.display = ''; };
        form.addEventListener('submit', ev=>{
          ev.preventDefault();
          const val = parseFloat(String(inp.value).replace(',', '.'));
          if(!(val > 0)){ inp.focus(); return; }
          item.qty = val;
          shoppingQtyOverrides[itemKey] = val;
          saveShoppingEdits();
          amtSpan.textContent = `${formatQtyForUnit(val, item.unit)} ${item.unit || ''}`.trim();
          closeForm();
        });
        form.querySelector('.shopping-edit-cancel').addEventListener('click', closeForm);
        amtSpan.style.display = 'none';
        actions.style.display = 'none';
        li.insertBefore(form, amtSpan);
        inp.focus(); inp.select();
      });
      actions.querySelector('.shopping-remove-btn').addEventListener('click', async ()=>{
        if(item.fromDispensaFlag){
          const ok = await confirmDialog({
            title: 'Togliere dalla lista?',
            message: `"${item.name}" è un promemoria dalla Dispensa: verrà eliminato dalla lista.`,
            confirmText: 'Togli', danger: true
          });
          if(!ok) return;
          shoppingExtraItems = shoppingExtraItems.filter(x => x.id !== item.extraId);
          saveShoppingExtra();
        }else{
          shoppingHiddenItems[itemKey] = true;
          delete shoppingQtyOverrides[itemKey];
          saveShoppingEdits();
          hiddenHere.push(itemKey);
        }
        removeShoppingRow(li);
      });

      // Controllo incrociato con la Dispensa: se il prodotto risulta già presente, propone di
      // sottrarre la quantità disponibile da quella ancora da acquistare (con "Annulla" per
      // tornare indietro in caso di tocco per sbaglio).
      if(!item.fromDispensaFlag){
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
        updateShoppingSummary();
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

    // Una voce tolta sparisce dalla lista; se il reparto resta vuoto sparisce anche l'intestazione.
    function removeShoppingRow(li){
      const prev = li.previousElementSibling;
      li.remove();
      if(prev && prev.classList.contains('shopping-reparto-header')){
        const next = prev.nextElementSibling;
        if(!next || next.classList.contains('shopping-reparto-header') || next.classList.contains('shopping-hidden-note')) prev.remove();
      }
      refreshHiddenNote();
      updateShoppingSummary();
    }
    // In fondo: quante voci sono state tolte, con il modo di rimetterle (nessuna perdita irreversibile)
    function refreshHiddenNote(){
      shoppingListItems.querySelectorAll('.shopping-hidden-note').forEach(n=>n.remove());
      if(!hiddenHere.length) return;
      const note = document.createElement('li');
      note.className = 'shopping-hidden-note';
      note.innerHTML = `<div>${hiddenHere.length} ${hiddenHere.length === 1 ? 'voce tolta' : 'voci tolte'} dalla lista</div><button type="button" class="link-btn">Rimetti ${hiddenHere.length === 1 ? 'la voce' : 'le voci'} in lista</button>`;
      note.querySelector('button').addEventListener('click', ()=>{
        hiddenHere.forEach(k => { delete shoppingHiddenItems[k]; });
        saveShoppingEdits();
        openShoppingListOverlay(itemsOriginali, subtitleText);
      });
      shoppingListItems.appendChild(note);
    }
    refreshHiddenNote();
    updateShoppingSummary();
    if(!items.length && !hiddenHere.length) shoppingListItems.innerHTML = '<li class="shopping-empty">La lista è vuota.</li>';
    shoppingOverlay.classList.add('active');
  }

  document.getElementById('generate-shopping-btn').addEventListener('click', ()=>{
    const allEntries = DAYS.flatMap(day => weekPlan[day] || []);
    const pairs = allEntries.map(entryRecipePair).filter(Boolean);
    const plannedRecipes = pairs.map(p => p.recipe);
    if(plannedRecipes.length === 0 && shoppingExtraItems.length === 0){
      alert(allEntries.length === 0
        ? 'Assegna almeno una ricetta a un giorno della settimana.'
        : 'Nessuna ricetta pianificata da cui generare la lista della spesa (i prodotti dalla dispensa non richiedono acquisti).');
      return;
    }
    const items = buildAggregatedShoppingItems(pairs);
    const porzioniUniformi = pairs.length && pairs.every(p => entryServings(p.entry) === entryServings(pairs[0].entry));
    const subtitle = plannedRecipes.length
      ? `${porzioniUniformi ? `Per ${entryServings(pairs[0].entry)} persone — ` : ''}${formatRicetteSubtitle(plannedRecipes, 'volte questa settimana')}`
      : 'Ingredienti segnalati mancanti dalla Dispensa';
    openShoppingListOverlay(items, subtitle);
  });
  document.getElementById('shopping-close').addEventListener('click', ()=> shoppingOverlay.classList.remove('active'));
  document.getElementById('shopping-subtract-all-btn').addEventListener('click', ()=>{
    // Applica in un colpo solo tutte le sottrazioni disponibili (una per riga, dove il pulsante
    // "Sottrai dalla lista" è comparso), senza doverle toccare una per una.
    shoppingListItems.querySelectorAll('.shopping-subtract-action').forEach(btn => btn.click());
  });
  document.getElementById('shopping-reset-btn').addEventListener('click', ()=>{
    // Svuota le spunte (che restano segnate finché non le togli a mano) e i promemoria "dalla
    // dispensa" accumulati nel tempo: così si riparte puliti e si può rigenerare la lista per la
    // giornata o la settimana che serve, senza doppioni o spunte di prodotti già comprati prima.
    const ok = confirm('Svuotare la lista della spesa? Verranno tolte tutte le spunte e i promemoria "dalla dispensa" accumulati finora (le ricette pianificate restano, puoi rigenerare la lista subito dopo).');
    if(!ok) return;
    shoppingExtraItems = [];
    shoppingCheckedItems = {};
    shoppingHiddenItems = {};
    shoppingQtyOverrides = {};
    saveShoppingExtra();
    saveShoppingCheckedItems();
    saveShoppingEdits();
    shoppingOverlay.classList.remove('active');
  });

  document.getElementById('export-shopping-pdf-btn').addEventListener('click', ()=>{
    // Ricostruisce le sezioni per reparto ("🥦 FRUTTA E VERDURA" ecc.) leggendo l'elenco così
    // com'è mostrato a video, intestazioni comprese: prima andavano perse perché il nome del
    // reparto nell'intestazione non è dentro un <span> (solo il pallino colorato lo è), quindi
    // il selettore usato per le righe normali non lo trovava.
    const sections = [];
    let currentLines = null;
    Array.from(shoppingListItems.children).forEach(li=>{
      if(li.classList.contains('shopping-reparto-header')){
        currentLines = [];
        sections.push({ heading: li.textContent.trim(), lines: currentLines });
        return;
      }
      const spans = li.querySelectorAll('span');
      const name = spans[0] ? spans[0].textContent : '';
      const amt = li.querySelector('.amt')?.textContent || '';
      if(!name) return;
      if(!currentLines){ currentLines = []; sections.push({ heading: null, lines: currentLines }); }
      currentLines.push(`- ${amt.trim() ? `${name} — ${amt.trim()}` : name}`);
    });
    if(!sections.some(s => s.lines.length)){ alert('Genera prima la lista della spesa dalla settimana pianificata.'); return; }
    const pdfStr = buildPdfFromSections('Lista della spesa', sections);
    downloadPdf(pdfStr, `lista-della-spesa-${new Date().toISOString().slice(0,10)}.pdf`);
  });


  // ============ Lista della spesa indipendente dalla pianificazione ============
  // Una lista "libera" (spesaLista): ci si aggiungono ingredienti a mano e le righe di una ricetta,
  // e la si può unire con la lista generata dalla settimana pianificata, sommando i doppioni.
  let spesaUndoSnapshot = null; // copia della lista prima dell'ultima unione, per "Annulla"
  const spesaItemsEl = document.getElementById('spesa-items');

  // Somma (o aggiunge) delle righe {name, qty, unit} alla lista libera. Righe con lo stesso
  // ingrediente e unità equivalenti (g/kg, ml/l, singolare/plurale) diventano una sola riga.
  // Ritorna { aggiunte, sommate }.
  function spesaAggiungiRighe(righe, fonte){
    let aggiunte = 0, sommate = 0;
    righe.forEach(r=>{
      const name = String(r.name || '').trim();
      if(!name) return;
      const qty = parseFloat(r.qty) || 0;
      const unit = r.unit || '';
      const gruppo = unitGroupKey(unit);
      const esistente = spesaLista.find(x => normalize(x.name) === normalize(name) && unitGroupKey(x.unit) === gruppo);
      if(esistente){
        const base = unitBaseQty(parseFloat(esistente.qty) || 0, esistente.unit) + unitBaseQty(qty, unit);
        if(base > 0){
          const disp = displayUnitForGroup(gruppo, base, esistente.unit || unit);
          esistente.qty = Math.round(disp.qty * 100) / 100;
          esistente.unit = disp.unit;
        }
        esistente.checked = false;
        if(fonte && !(esistente.fonti || []).includes(fonte)) esistente.fonti = (esistente.fonti || []).concat(fonte);
        sommate++;
      }else{
        spesaLista.push({ id: cryptoId(), name, qty, unit, checked: false, fonti: fonte ? [fonte] : [] });
        aggiunte++;
      }
    });
    saveSpesaLista();
    return { aggiunte, sommate };
  }
  function spesaRigheDiRicetta(r, porzioni){
    const scala = (parseFloat(porzioni) || r.servings || 1) / (r.servings || 1);
    return r.ingredients.map(ing => ({ name: ing.name, qty: (parseFloat(ing.qty) || 0) * scala, unit: ing.unit || '' }));
  }

  function renderSpesaLista(){
    if(!spesaItemsEl) return;
    const undoBtn = document.getElementById('spesa-undo-btn');
    if(undoBtn) undoBtn.hidden = !spesaUndoSnapshot;
    spesaItemsEl.innerHTML = '';
    if(!spesaLista.length){
      spesaItemsEl.innerHTML = '<li class="shopping-empty">La lista è vuota. Scrivi un ingrediente qui sopra, aggiungi una ricetta oppure unisci la lista della settimana.</li>';
    }
    const conReparto = spesaLista.map(item => ({ item, reparto: repartoIngrediente(item.name) }));
    conReparto.sort((a, b)=>{
      const ia = REPARTO_ORDINE.indexOf(a.reparto), ib = REPARTO_ORDINE.indexOf(b.reparto);
      const d = (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      return d || a.reparto.localeCompare(b.reparto) || a.item.name.localeCompare(b.item.name);
    });
    let corrente = null;
    conReparto.forEach(({item, reparto})=>{
      if(reparto !== corrente){
        corrente = reparto;
        const h = document.createElement('li');
        h.className = 'shopping-reparto-header';
        h.innerHTML = `<span class="reparto-dot" style="background:${PANTRY_CATEGORY_COLORS[reparto] || '#8A8F86'}"></span>${escapeHtml(reparto)}`;
        spesaItemsEl.appendChild(h);
      }
      const li = document.createElement('li');
      li.dataset.id = item.id;
      if(item.checked) li.classList.add('checked');
      const amt = item.qty ? `${formatQtyForUnit(item.qty, item.unit)} ${item.unit || ''}`.trim() : '';
      const fonti = (item.fonti || []).length ? `<span class="spesa-fonti">da ${escapeHtml(item.fonti.join(', '))}</span>` : '';
      li.innerHTML = `<input type="checkbox"${item.checked ? ' checked' : ''} aria-label="Segna come comprato: ${escapeAttr(item.name)}"><span class="spesa-name">${escapeHtml(item.name)}${fonti}</span><span class="amt">${escapeHtml(amt)}</span><div class="shopping-item-actions"><button type="button" class="icon-btn spesa-edit-btn" aria-label="Modifica ${escapeAttr(item.name)}" title="Modifica">${icon('pencil')}</button><button type="button" class="icon-btn shopping-remove-btn spesa-del-btn" aria-label="Togli ${escapeAttr(item.name)} dalla lista" title="Togli dalla lista">${icon('trash')}</button></div>`;
      li.querySelector('input[type=checkbox]').addEventListener('change', e=>{
        item.checked = e.target.checked; saveSpesaLista(); renderSpesaLista();
      });
      li.querySelector('.spesa-del-btn').addEventListener('click', ()=>{
        spesaLista = spesaLista.filter(x => x.id !== item.id); saveSpesaLista(); renderSpesaLista();
      });
      li.querySelector('.spesa-edit-btn').addEventListener('click', ()=>{
        if(li.querySelector('.shopping-edit-form')) return;
        const form = document.createElement('form');
        form.className = 'shopping-edit-form';
        form.innerHTML = `<input type="text" class="e-name" aria-label="Nome" value="${escapeAttr(item.name)}" style="width:150px"><input type="number" class="e-qty" min="0" step="any" inputmode="decimal" aria-label="Quantità" value="${item.qty ? escapeAttr(String(item.qty)) : ''}"><input type="text" class="e-unit" list="unit-suggestions" aria-label="Unità" value="${escapeAttr(item.unit || '')}" style="width:80px"><button type="submit" class="btn-gold btn-small">Salva</button><button type="button" class="btn-ghost btn-small e-cancel">Annulla</button>`;
        form.addEventListener('submit', ev=>{
          ev.preventDefault();
          const nome = form.querySelector('.e-name').value.trim();
          if(!nome){ form.querySelector('.e-name').focus(); return; }
          item.name = nome;
          item.qty = parseFloat(String(form.querySelector('.e-qty').value).replace(',', '.')) || 0;
          item.unit = form.querySelector('.e-unit').value.trim();
          saveSpesaLista(); renderSpesaLista();
        });
        form.querySelector('.e-cancel').addEventListener('click', ()=> renderSpesaLista());
        li.querySelector('.amt').style.display = 'none';
        li.querySelector('.shopping-item-actions').style.display = 'none';
        li.appendChild(form);
        form.querySelector('.e-name').focus();
      });
      spesaItemsEl.appendChild(li);
    });
    const daComprare = spesaLista.filter(x => !x.checked).length, nelCarrello = spesaLista.length - daComprare;
    document.getElementById('spesa-summary').innerHTML = spesaLista.length
      ? `<span class="shopping-count todo"><b>${daComprare}</b> da comprare</span><span class="shopping-count done"><b>${nelCarrello}</b> nel carrello</span>`
      : '';
    document.getElementById('spesa-to-dispensa-btn').disabled = !nelCarrello;
    document.getElementById('spesa-remove-checked-btn').disabled = !nelCarrello;
    document.getElementById('spesa-clear-btn').disabled = !spesaLista.length;
    document.getElementById('spesa-pdf-btn').disabled = !spesaLista.length;
  }

  document.getElementById('spesa-add-form').addEventListener('submit', e=>{
    e.preventDefault();
    const nameEl = document.getElementById('spesa-add-name');
    const qtyEl = document.getElementById('spesa-add-qty');
    const unitEl = document.getElementById('spesa-add-unit');
    if(!nameEl.value.trim()){ nameEl.focus(); return; }
    spesaAggiungiRighe([{ name: nameEl.value, qty: String(qtyEl.value).replace(',', '.'), unit: unitEl.value.trim() }], '');
    nameEl.value = ''; qtyEl.value = ''; unitEl.value = '';
    renderSpesaLista();
    nameEl.focus();
  });

  document.getElementById('spesa-week-btn').addEventListener('click', ()=> document.getElementById('generate-shopping-btn').click());

  document.getElementById('spesa-merge-btn').addEventListener('click', async ()=>{
    const pairs = DAYS.flatMap(day => weekPlan[day] || []).map(entryRecipePair).filter(Boolean);
    const itemsSettimana = buildAggregatedShoppingItems(pairs, false);
    if(!itemsSettimana.length){
      alert('La lista della settimana è vuota: assegna prima qualche ricetta a un giorno nella Pianificazione.');
      return;
    }
    const gia = itemsSettimana.filter(i => spesaLista.some(x => normalize(x.name) === normalize(i.name) && unitGroupKey(x.unit) === unitGroupKey(i.unit))).length;
    const ok = await confirmDialog({
      title: 'Unire le due liste?',
      message: `Gli ingredienti della settimana (${itemsSettimana.length}) vengono sommati alla tua lista: ${gia} ${gia === 1 ? 'è già presente e la sua quantità si somma' : 'sono già presenti e le loro quantità si sommano'}, gli altri ${itemsSettimana.length - gia} si aggiungono. La lista della settimana non cambia. Se cambi idea, "Annulla ultima unione" ripristina la lista.`,
      confirmText: 'Unisci'
    });
    if(!ok) return;
    spesaUndoSnapshot = JSON.parse(JSON.stringify(spesaLista));
    const { aggiunte, sommate } = spesaAggiungiRighe(itemsSettimana, 'Settimana');
    renderSpesaLista();
    const sum = document.getElementById('spesa-summary');
    sum.insertAdjacentHTML('beforeend', `<span class="shopping-count done" role="status">Unite: ${aggiunte} nuove, ${sommate} sommate</span>`);
  });
  document.getElementById('spesa-undo-btn').addEventListener('click', ()=>{
    if(!spesaUndoSnapshot) return;
    spesaLista = spesaUndoSnapshot; spesaUndoSnapshot = null;
    saveSpesaLista(); renderSpesaLista();
  });

  document.getElementById('spesa-to-dispensa-btn').addEventListener('click', async ()=>{
    const spuntati = spesaLista.filter(x => x.checked);
    if(!spuntati.length) return;
    const ok = await confirmDialog({
      title: 'Mettere in Dispensa?',
      message: `${spuntati.length} ${spuntati.length === 1 ? 'prodotto spuntato viene aggiunto' : 'prodotti spuntati vengono aggiunti'} in Dispensa (o la loro quantità si somma a quella già presente) e tolti da questa lista.`,
      confirmText: 'Aggiungi in Dispensa'
    });
    if(!ok) return;
    spuntati.forEach(addOrIncrementDispensaFromShopping);
    saveDispensaItems();
    spesaLista = spesaLista.filter(x => !x.checked);
    saveSpesaLista(); renderSpesaLista();
  });
  document.getElementById('spesa-remove-checked-btn').addEventListener('click', ()=>{
    spesaLista = spesaLista.filter(x => !x.checked); saveSpesaLista(); renderSpesaLista();
  });
  document.getElementById('spesa-clear-btn').addEventListener('click', async ()=>{
    const ok = await confirmDialog({ title: 'Svuotare la lista?', message: `Tutte le ${spesaLista.length} voci della tua lista della spesa verranno tolte. La lista della settimana non cambia.`, confirmText: 'Svuota', danger: true });
    if(!ok) return;
    spesaLista = []; spesaUndoSnapshot = null; saveSpesaLista(); renderSpesaLista();
  });
  document.getElementById('spesa-pdf-btn').addEventListener('click', ()=>{
    if(!spesaLista.length) return;
    const gruppi = new Map();
    spesaLista.slice().sort((a,b)=>a.name.localeCompare(b.name)).forEach(item=>{
      const rep = repartoIngrediente(item.name);
      if(!gruppi.has(rep)) gruppi.set(rep, []);
      const amt = item.qty ? `${formatQtyForUnit(item.qty, item.unit)} ${item.unit || ''}`.trim() : '';
      gruppi.get(rep).push(`- ${amt ? `${item.name} — ${amt}` : item.name}`);
    });
    const sections = Array.from(gruppi.entries())
      .sort((a,b)=>{ const ia = REPARTO_ORDINE.indexOf(a[0]), ib = REPARTO_ORDINE.indexOf(b[0]); return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib); })
      .map(([heading, lines]) => ({ heading, lines }));
    downloadPdf(buildPdfFromSections('Lista della spesa', sections), `lista-della-spesa-${new Date().toISOString().slice(0,10)}.pdf`);
  });

  // --- Aggiungere gli ingredienti di una ricetta ---
  const spesaRecipeOverlay = document.getElementById('spesa-recipe-overlay');
  const spesaRecipeList = document.getElementById('spesa-recipe-list');
  const spesaRecipeServings = document.getElementById('spesa-recipe-servings');
  const spesaRecipeAddBtn = document.getElementById('spesa-recipe-add-btn');
  const spesaRecipeMsg = document.getElementById('spesa-recipe-msg');
  let spesaRecipeSelectedId = null;
  function renderSpesaRecipeList(query){
    const q = normalize(query || '');
    const trovate = recipes.filter(r => !r.archived && (!q || normalize(r.name).includes(q) || r.ingredients.some(i => normalize(i.name).includes(q))))
      .sort((a,b)=>a.name.localeCompare(b.name));
    spesaRecipeList.innerHTML = trovate.length ? trovate.map(r => `
      <div class="recipe-picker-item${r.id === spesaRecipeSelectedId ? ' selected' : ''}" data-id="${escapeAttr(r.id)}" role="button" tabindex="0" aria-pressed="${r.id === spesaRecipeSelectedId}">
        <span class="cat-dot" style="background:${CATEGORY_COLORS[r.category] || '#8A8F86'}"></span>
        <span class="name">${escapeHtml(r.name)}</span>
        <span class="meta">${escapeHtml(r.category)} · ${r.servings} porz.</span>
      </div>`).join('') : '<div class="recipe-picker-empty">Nessuna ricetta trovata.</div>';
    spesaRecipeList.querySelectorAll('.recipe-picker-item').forEach(el=>{
      const scegli = ()=>{
        spesaRecipeSelectedId = el.dataset.id;
        const r = recipes.find(x => x.id === spesaRecipeSelectedId);
        if(r) spesaRecipeServings.value = r.servings || 1;
        spesaRecipeAddBtn.disabled = !r;
        spesaRecipeMsg.textContent = '';
        renderSpesaRecipeList(document.getElementById('spesa-recipe-search').value);
      };
      el.addEventListener('click', scegli);
      el.addEventListener('keydown', ev=>{ if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); scegli(); } });
    });
  }
  function apriSpesaRecipe(){
    spesaRecipeSelectedId = null; spesaRecipeAddBtn.disabled = true; spesaRecipeMsg.textContent = '';
    document.getElementById('spesa-recipe-search').value = '';
    renderSpesaRecipeList('');
    spesaRecipeOverlay.classList.add('active');
    document.getElementById('spesa-recipe-search').focus();
  }
  document.getElementById('spesa-add-recipe-btn').addEventListener('click', apriSpesaRecipe);
  document.getElementById('spesa-recipe-search').addEventListener('input', e=> renderSpesaRecipeList(e.target.value));
  document.getElementById('spesa-recipe-close').addEventListener('click', ()=>{ spesaRecipeOverlay.classList.remove('active'); renderSpesaLista(); });
  spesaRecipeOverlay.addEventListener('click', e=>{ if(e.target === spesaRecipeOverlay){ spesaRecipeOverlay.classList.remove('active'); renderSpesaLista(); } });
  spesaRecipeAddBtn.addEventListener('click', ()=>{
    const r = recipes.find(x => x.id === spesaRecipeSelectedId);
    if(!r) return;
    const { aggiunte, sommate } = spesaAggiungiRighe(spesaRigheDiRicetta(r, spesaRecipeServings.value), r.name);
    spesaRecipeMsg.textContent = `✓ ${r.name}: ${aggiunte} ingredienti aggiunti${sommate ? `, ${sommate} sommati a voci già presenti` : ''}. Puoi sceglierne un'altra.`;
  });
  // Dalla scheda di una ricetta: aggiunge gli ingredienti (con le porzioni visualizzate) alla lista
  document.getElementById('recipe-to-list-btn').addEventListener('click', ()=>{
    const r = recipes.find(x => x.id === currentViewId);
    if(!r) return;
    const { aggiunte, sommate } = spesaAggiungiRighe(spesaRigheDiRicetta(r, currentServings), r.name);
    const btn = document.getElementById('recipe-to-list-btn');
    const orig = btn.innerHTML;
    btn.textContent = `✓ Aggiunti ${aggiunte + sommate} ingredienti`;
    btn.disabled = true;
    setTimeout(()=>{ btn.innerHTML = orig; btn.disabled = false; }, 1800);
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

  // ---------- PWA: service worker, avviso copia locale, installazione ----------
  (function setupPwa(){
    const proto = location.protocol;
    const web = proto === 'http:' || proto === 'https:';
    const $ = id => document.getElementById(id);
    const get = k => { try { return localStorage.getItem(k); } catch(_) { return null; } };
    const set = (k,v) => { try { localStorage.setItem(k,v); } catch(_) {} };
    if (web && 'serviceWorker' in navigator && location.hostname !== '') {
      navigator.serviceWorker.register('sw.js').catch(() => {});
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    }
    const ob = $('origin-banner');
    if (ob && !web && get('mc_origin_banner_nascosto') !== '1') {
      ob.style.display = 'flex';
      $('origin-backup-btn').addEventListener('click', () => { const b = $('export-btn') || $('nav-backup'); if (b) b.click(); });
      $('origin-dismiss-btn').addEventListener('click', () => { ob.style.display = 'none'; set('mc_origin_banner_nascosto','1'); });
    }
    let deferred = null;
    const ib = $('install-banner');
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault(); deferred = e;
      if (ib && get('mc_install_nascosto') !== '1') ib.style.display = 'flex';
    });
    window.addEventListener('appinstalled', () => { if (ib) ib.style.display = 'none'; });
    if ($('install-btn')) $('install-btn').addEventListener('click', async () => {
      if (!deferred) return; deferred.prompt(); try { await deferred.userChoice; } catch(_) {}
      deferred = null; ib.style.display = 'none';
    });
    if ($('install-dismiss-btn')) $('install-dismiss-btn').addEventListener('click', () => { ib.style.display = 'none'; set('mc_install_nascosto','1'); });
  })();


  // ============ Integrazione con il sito «Pentola a pressione» — protocollo pp-ricettario v1 ============
  // Il sito esterno apre questo ricettario con  #pp=<JSON in base64url>  (oppure consegna lo stesso JSON
  // come file, da caricare con «Importa ricetta (file)»). Nulla viene scritto senza conferma: i dati
  // sono validati e ridotti a una lista di campi noti, poi mostrati in un'anteprima.
  // Dedup: la ricetta è riconosciuta da externalId; l'operazione da idOperazione.
  const PP_DONE_KEY = 'mc_ricettario_pp_importati_v1';
  const PP_MAX_CHARS = 90000;
  const PP_CATEGORIE = ['Primi','Secondi','Zuppe & Vellutate','Impasti & Pane','Salse & Sughi','Dolci','Infusi & Tisane','Altro'];
  const PP_ID_RE = /^[A-Za-z0-9_.:-]{3,80}$/;
  let ppPacchetto = null;

  function ppStr(v, max){ return (typeof v === 'string') ? v.trim().slice(0, max) : ''; }
  function ppNum(v, min, max){ const n = parseFloat(v); return (isFinite(n) && n >= min && n <= max) ? n : null; }
  function ppUrl(v){
    const s = ppStr(v, 500);
    if(!s) return '';
    try{ const u = new URL(s); return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : ''; }catch(e){ return ''; }
  }
  function ppDecodifica(b64url){
    if(b64url.length > PP_MAX_CHARS) throw new Error('Il pacchetto è troppo grande.');
    let s = b64url.replace(/-/g,'+').replace(/_/g,'/');
    while(s.length % 4) s += '=';
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder('utf-8').decode(bytes));
  }
  // Ritorna { ok:true, dati } con i soli campi ammessi, oppure { ok:false, errore }.
  function ppValida(obj){
    if(!obj || typeof obj !== 'object') return { ok:false, errore:'Il contenuto non è un pacchetto riconoscibile.' };
    if(obj.protocollo !== 'pp-ricettario') return { ok:false, errore:'Il file non è un pacchetto del sito Pentola a pressione.' };
    if(obj.versione !== 1) return { ok:false, errore:'Versione del protocollo non supportata (' + String(obj.versione).slice(0,10) + '). Aggiorna il ricettario.' };
    const idOp = ppStr(obj.idOperazione, 80);
    if(!PP_ID_RE.test(idOp)) return { ok:false, errore:'Il pacchetto non ha un identificativo operazione valido.' };
    const r = obj.ricetta;
    if(!r || typeof r !== 'object') return { ok:false, errore:'Il pacchetto non contiene una ricetta.' };
    const externalId = ppStr(r.externalId, 80);
    if(!PP_ID_RE.test(externalId)) return { ok:false, errore:'La ricetta non ha un identificativo valido.' };
    const name = ppStr(r.name, 120);
    if(!name) return { ok:false, errore:'La ricetta non ha un nome.' };
    if(!Array.isArray(r.ingredients) || !r.ingredients.length || r.ingredients.length > 80) return { ok:false, errore:'Gli ingredienti mancano o sono troppi.' };
    const ingredients = [];
    for(const i of r.ingredients){
      const n = ppStr(i && i.name, 120);
      if(!n) continue;
      ingredients.push({ name: n, qty: ppNum(i.qty, 0, 100000) || 0, unit: ppStr(i.unit, 20) });
    }
    if(!ingredients.length) return { ok:false, errore:'Nessun ingrediente valido nel pacchetto.' };
    const steps = [];
    (Array.isArray(r.steps) ? r.steps.slice(0, 60) : []).forEach(s=>{
      const text = ppStr(s && s.text, 2000);
      if(!text) return;
      const st = { text };
      const pr = ppNum(s.pressure, 0, 50); if(pr !== null) st.pressure = pr;
      if(['bar','psi','kpa'].includes(s.pressureUnit)) st.pressureUnit = s.pressureUnit;
      if(['Naturale','Rapido','Misto'].includes(s.pressureRelease)) st.pressureRelease = s.pressureRelease;
      const rm = ppNum(s.pressureReleaseMin, 0, 600); if(rm !== null) st.pressureReleaseMin = rm;
      const ml = ppNum(s.minLiquid, 0, 10000); if(ml !== null) st.minLiquid = ml;
      const t = ppNum(s.time, 0, 1440); if(t !== null) st.time = t;
      steps.push(st);
    });
    const ricetta = {
      externalId, name, ingredients, steps,
      category: PP_CATEGORIE.includes(r.category) ? r.category : 'Altro',
      servings: Math.round(ppNum(r.servings, 1, 100) || 4),
      time: Math.round(ppNum(r.time, 0, 2880) || 0),
      cookerType: ['Elettrica','A fornello'].includes(r.cookerType) ? r.cookerType : '',
      notes: ppStr(r.notes, 4000),
      fonteUrl: ppUrl(r.fonteUrl),
      fonteNome: ppStr(r.fonteNome, 120),
      tags: (Array.isArray(r.tags) ? r.tags : []).filter(t => TAG_OPTIONS.includes(t))
    };
    const pi = (obj.pianificazione && typeof obj.pianificazione === 'object') ? obj.pianificazione : {};
    const data = /^\d{4}-\d{2}-\d{2}$/.test(pi.data || '') ? pi.data : '';
    const ora = /^\d{2}:\d{2}$/.test(pi.ora || '') ? pi.ora : '';
    return { ok:true, dati: { idOp, ricetta, pian: { data, pasto: ppStr(pi.pasto, 40), ora }, spesa: obj.spesa !== false } };
  }
  function ppLeggiDone(){
    try{ const d = JSON.parse(localStorage.getItem(PP_DONE_KEY) || '{}'); return (d && typeof d === 'object' && !Array.isArray(d)) ? d : {}; }catch(e){ return {}; }
  }
  function ppSegnaDone(idOp, info){
    const d = ppLeggiDone();
    d[idOp] = Object.assign({ t: Date.now() }, info);
    const chiavi = Object.keys(d).sort((a,b)=> d[b].t - d[a].t).slice(0, 200);
    const out = {}; chiavi.forEach(k => out[k] = d[k]);
    safeStorageSet(PP_DONE_KEY, JSON.stringify(out));
  }
  async function ppErrore(msg){
    await confirmDialog({ title:'Impossibile importare la ricetta', message: msg, confirmText:'Ok', cancelText:'Chiudi' });
  }
  async function ppApriPacchetto(obj){
    const v = ppValida(obj);
    if(!v.ok){ await ppErrore(v.errore); return; }
    ppPacchetto = v.dati;
    const { ricetta, pian, idOp } = ppPacchetto;
    const gia = ppLeggiDone()[idOp];
    const esistente = recipes.find(x => x.externalId === ricetta.externalId);
    const sub = document.getElementById('pp-sub');
    sub.textContent = `«${ricetta.name}» — ${porzioniLabel(ricetta.servings)}, ${ricetta.ingredients.length} ingredienti` +
      (esistente ? '. È già nel tuo ricettario: non verrà duplicata.' : '. Verrà aggiunta al tuo ricettario.') +
      (gia ? ' Questa operazione risulta già eseguita in passato.' : '');
    const pastoSel = document.getElementById('pp-pasto');
    const pasti = Array.from(new Set(mealTypes.concat(MEAL_SUGGESTIONS)));
    pastoSel.innerHTML = pasti.map(m => `<option>${escapeHtml(m)}</option>`).join('');
    if(pian.pasto && pasti.includes(pian.pasto)) pastoSel.value = pian.pasto;
    document.getElementById('pp-data').value = pian.data || isoLocal(new Date());
    document.getElementById('pp-ora').value = pian.ora || MEAL_DEFAULT_TIME[pastoSel.value] || '';
    document.getElementById('pp-piano').checked = true;
    document.getElementById('pp-piano-campi').style.display = '';
    const spesaCb = document.getElementById('pp-spesa');
    const giaInSpesa = spesaLista.some(x => (x.fonti || []).includes(ricetta.name));
    spesaCb.checked = ppPacchetto.spesa && !giaInSpesa && !(gia && gia.spesa);
    document.getElementById('pp-spesa-nota').textContent = (giaInSpesa || (gia && gia.spesa))
      ? 'Gli ingredienti di questa ricetta risultano già nella lista della spesa: la casella è spenta per non sommarli due volte.' : '';
    document.getElementById('pp-overlay').classList.add('active');
  }
  async function ppEsegui(){
    if(!ppPacchetto) return;
    const { ricetta: r, idOp } = ppPacchetto;
    const volePiano = document.getElementById('pp-piano').checked;
    const voleSpesa = document.getElementById('pp-spesa').checked;
    const dataIso = document.getElementById('pp-data').value;
    const pasto = document.getElementById('pp-pasto').value;
    const ora = document.getElementById('pp-ora').value;
    if(volePiano && !/^\d{4}-\d{2}-\d{2}$/.test(dataIso)){ alert('Scegli una data valida per la pianificazione.'); return; }
    const righe = [];
    let ricetta = recipes.find(x => x.externalId === r.externalId);
    if(ricetta){ righe.push('Ricetta già presente: non duplicata.'); }
    else{
      ricetta = migrateRecipe({
        id: cryptoId(), name: r.name, category: r.category, subcategory: '', ricettarioId: DEFAULT_RICETTARIO_ID,
        servings: r.servings, time: r.time, cookerType: r.cookerType, ingredients: r.ingredients, steps: r.steps,
        tags: r.tags, allergens: [], freezable: false, notes: r.notes, photo: '', favorite: false, lastMade: null,
        timesMade: 0, archived: false, externalId: r.externalId, fonteUrl: r.fonteUrl, fonteNome: r.fonteNome
      });
      recipes.push(ricetta);
      if(!saveRecipes()){ recipes.pop(); alert('Salvataggio non riuscito (spazio del browser esaurito?). Nessuna modifica applicata.'); return; }
      righe.push('Ricetta aggiunta al ricettario.');
    }
    let target = '';
    if(volePiano){
      const giorno = DAYS[(dateFromIso(dataIso).getDay() + 6) % 7];
      target = mondayOfIso(dataIso);
      const prima = planWeekStart;
      setPlanWeek(target);
      weekPlan[giorno] = weekPlan[giorno] || [];
      if(weekPlan[giorno].some(e => e.recipeId === ricetta.id && entryMealType(e) === pasto)){
        righe.push(`Già pianificata: ${giorno} ${dataBreve(dataIso)}, ${pasto}. Nessun doppione creato.`);
      }else{
        weekPlan[giorno].push({ id: cryptoId(), recipeId: ricetta.id, mealType: pasto, time: ora || '' });
        saveWeek();
        righe.push(`Pianificata: ${giorno} ${dataBreve(dataIso)}, ${pasto}${ora ? ' alle ' + ora : ''}.`);
      }
      if(prima !== target) setPlanWeek(prima);
    }
    if(voleSpesa){
      const { aggiunte, sommate } = spesaAggiungiRighe(spesaRigheDiRicetta(ricetta, ricetta.servings), ricetta.name);
      righe.push(`Lista della spesa: ${aggiunte} nuovi ingredienti, ${sommate} sommati a righe esistenti.`);
    }
    ppSegnaDone(idOp, { piano: volePiano, spesa: voleSpesa });
    document.getElementById('pp-overlay').classList.remove('active');
    ppPacchetto = null;
    renderList(); renderPlanningDays();
    const apri = await confirmDialog({
      title: 'Fatto', message: righe.join('\n'),
      confirmText: volePiano ? 'Apri pianificazione' : 'Apri ricette', cancelText: 'Resta qui'
    });
    if(apri){
      if(volePiano){ setPlanWeek(target); switchView('planning'); renderPlanningDays(); }
      else switchView('recipes');
    }
  }
  (function setupPp(){
    const ov = document.getElementById('pp-overlay');
    const chiudi = ()=>{ ov.classList.remove('active'); ppPacchetto = null; };
    document.getElementById('pp-close').addEventListener('click', chiudi);
    document.getElementById('pp-annulla').addEventListener('click', chiudi);
    ov.addEventListener('click', e=>{ if(e.target === ov) chiudi(); });
    document.getElementById('pp-conferma').addEventListener('click', ppEsegui);
    document.getElementById('pp-piano').addEventListener('change', e=>{
      document.getElementById('pp-piano-campi').style.display = e.target.checked ? '' : 'none';
    });
    document.getElementById('pp-pasto').addEventListener('change', e=>{
      document.getElementById('pp-ora').value = MEAL_DEFAULT_TIME[e.target.value] || '';
    });
  })();
  // Legge e CONSUMA il frammento #pp=… (lo toglie dall'indirizzo, così un ricaricamento non riapre l'anteprima).
  function ppControllaIngresso(){
    const m = /^#pp=(.*)$/.exec(location.hash || '');
    if(!m) return;
    const payload = m[1];
    try{ history.replaceState(null, '', location.pathname + location.search); }catch(e){}
    try{
      if(!/^[A-Za-z0-9_\-]+={0,2}$/.test(payload)) throw new Error('caratteri non validi');
      ppApriPacchetto(ppDecodifica(payload));
    }
    catch(err){ ppErrore('Il collegamento non contiene un pacchetto leggibile (' + (err && err.message ? err.message : 'errore') + ').'); }
  }
  window.addEventListener('hashchange', ppControllaIngresso);

  // ---------- Init ----------
  (async function avviaApp(){
    await inizializzaStorageFileAllAvvio();
    loadRecipes();
    caricaCestino();
    await caricaFotoDaIdb();
    caricaRaccolte();
    refreshRaccolteUi();
    aggiornaVoceCestino();
    recipes = recipes.map(migrateRecipe);
    saveRecipes();
    migrateWeekPlan();
    planServingsInput.value = planServings;
    updatePantryPanelSub();
    refreshRicettarioSelects();
    switchView('today');
    aggiornaTopbarAlerts();
    aggiornaControlliMenuStorage();
    aggiornaBannerBackup();
    mostraSceltaStorageSeNecessario();
    ppControllaIngresso();
  })();
})();
