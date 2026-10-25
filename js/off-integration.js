/**
 * off-integration.js
 * -------------------------------------------------------------------------
 * Integrazione con Open Food Facts (OFF) per "Il Mio Ricettario": ricerca
 * per nome e per codice a barre, per precompilare la STESSA scheda
 * prodotto già usata in Dispensa (nome, categoria, quantità, valori
 * nutrizionali) — non un inventario separato.
 *
 * Nota tecnica: i browser bloccano la modifica dell'header User-Agent da
 * JavaScript per motivi di sicurezza (è tra i "forbidden header names"
 * della Fetch spec). Le richieste qui sotto usano quindi lo User-Agent
 * reale del browser, che il client invia comunque in automatico: non è
 * possibile impostarne uno personalizzato da un sito statico senza un
 * server intermedio.
 *
 * Nessuna dipendenza esterna per le chiamate API (fetch nativo). Lo
 * scanner da fotocamera (html5-qrcode) viene caricato a parte, solo
 * quando l'utente lo apre davvero — vedi index.html.
 */

const OffIntegration = (() => {

  const BASE_PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product/';
  const BASE_PRODUCT_V3_URL = 'https://world.openfoodfacts.org/api/v3/product/';
  // Ricerca per testo: il motore ufficiale oggi è «Search-a-licious»; la vecchia ricerca
  // (cgi/search.pl) risponde spesso 503 «in manutenzione», quindi resta solo come ripiego.
  const SEARCH_URL = 'https://search.openfoodfacts.org/search';
  const BASE_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
  const TIMEOUT_MS = 12000;

  function numOrNull(v) {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Mappa (euristica, per parole chiave) le categorie OFF — che arrivano
   * come tag tipo "en:breakfast-cereals" o testo libero in più lingue —
   * verso le categorie di Dispensa. Come per le altre
   * euristiche di categoria del sito: un default suggerito, mai
   * vincolante, sempre modificabile dall'utente dopo.
   */
  function mappaCategoria(categoriesTagsOrText) {
    const testo = normalize(
      Array.isArray(categoriesTagsOrText) ? categoriesTagsOrText.join(' ') : (categoriesTagsOrText || '')
    );
    const regole = [
      [/dessert|dolc|biscott|cake|pasticceria|cioccolat|chocolate|nutella|jam|marmalade|marmellat|honey|miele|gelato|ice.?cream|sorbet|wafer|cracker/, 'Snack e dolciumi'],
      [/beer|birra|wine|vino|alcohol|alcolic|liquor|spirit/, 'Bevande'],
      // Succhi, bibite, acqua, caffè e tè restano volutamente su "Altro"
      // (il default) invece di un'etichetta indovinata.
      [/fish|pesce|tuna|tonno|salmon|salmone|seafood|gambero|shrimp|calamar|polpo|octopus|cozz|mussel/, 'Altro'],
      [/egg|uov/, 'Uova'],
      [/cheese|formagg|latticin|mozzarella|ricotta|parmigian|grana/, 'Latticini e pronti'],
      [/milk|latte|yogurt|yoghurt|kefir/, 'Latticini e pronti'],
      [/meat|carne|beef|manzo|pork|maiale|chicken|pollo|tacchino|turkey|salame|salumi|prosciutto|wurstel|sausage|bacon|pancetta|coniglio|rabbit/, 'Salumi'],
      [/legum|bean|fagiol|lentil|lenticchi|cecio|ceci|chickpea|piselli|pea\b|hummus/, 'Legumi'],
      [/almond|mandorl|walnut|hazelnut|nocciol|pistacchio|pistachio|cashew|anacard|\bnut\b|\bnuts\b|\bnoc\b|seed|seme|semi\b/, 'Snack e dolciumi'],
      [/\boil\b|\boli[ov]\b|olive oil|olio|grass|butter|burro|margarina|margarine/, 'Oli, aceti e grassi'],
      [/fruit|frutt|mela|apple|banana|arancia|orange|pera\b|pear\b|uva\b|grape/, 'Frutta'],
      [/vegetable|verdur|ortagg|pomodoro|tomato|zucchin|carota|carrot|insalata|lettuce|spinaci|spinach/, 'Verdura'],
      [/cereal|pasta|rice|riso|bread|pane|flour|farina|couscous|orzo|farro|quinoa/, 'Pasta, riso e cereali'],
      [/fast-food|fastfood|burger|pizza|kebab/, 'Altro'],
    ];
    for (const [re, categoria] of regole) {
      if (re.test(testo)) return categoria;
    }
    return 'Altro';
  }

  /**
   * "500 g" -> {numero: 500, unita: 'g'}; "1 L" -> {numero: 1, unita: 'l'};
   * se non riconosce un numero in testa, ritorna null (l'utente inserirà
   * la quantità a mano, come già previsto dal form).
   */
  function parseQuantita(testo) {
    if (!testo) return null;
    const m = /^\s*([\d]+(?:[.,]\d+)?)\s*([a-zA-Zµ]*)/.exec(testo.trim());
    if (!m || !m[1]) return null;
    return { numero: parseFloat(m[1].replace(',', '.')), unita: (m[2] || '').toLowerCase() };
  }

  // Alcuni campi possono arrivare come testo, come elenco o come oggetto per lingua.
  function testoDa(v) {
    if (v === undefined || v === null) return '';
    if (Array.isArray(v)) return v.filter(Boolean).join(', ');
    if (typeof v === 'object') return String(v.it || v.main || v.en || Object.values(v).find(x => typeof x === 'string') || '');
    return String(v);
  }

  async function fetchJson(url) {
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT_MS) : null;
    try {
      const res = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
      if (!res.ok) { const e = new Error(`Open Food Facts non raggiungibile (${res.status})`); e.status = res.status; throw e; }
      return await res.json();
    } finally { if (timer) clearTimeout(timer); }
  }

  function normalizzaProdotto(p, barcodeFallback) {
    const n = p.nutriments || {};
    return {
      barcode: p.code || barcodeFallback || '',
      nome: p.product_name_it ? testoDa(p.product_name_it) : testoDa(p.product_name),
      marca: testoDa(p.brands),
      immagine: p.image_front_small_url || p.image_small_url || p.image_url || '',
      nutriscore: (p.nutriscore_grade || '').toUpperCase(),
      categoria: mappaCategoria(p.categories_tags || p.categories || ''),
      quantitaTesto: p.quantity || '',
      kcal100: numOrNull(n['energy-kcal_100g']),
      proteine100: numOrNull(n['proteins_100g']),
      grassi100: numOrNull(n['fat_100g']),
      carboidrati100: numOrNull(n['carbohydrates_100g']),
      zuccheri100: numOrNull(n['sugars_100g']),
      fibre100: numOrNull(n['fiber_100g']),
      sale100: numOrNull(n['salt_100g']),
    };
  }

  /** Cerca un prodotto per codice a barre esatto (EAN/UPC). */
  async function cercaDaBarcode(barcode) {
    const codice = (barcode || '').trim();
    if (!codice) return null;
    let ultimoErrore = null;
    for (const base of [BASE_PRODUCT_URL, BASE_PRODUCT_V3_URL]) {
      try {
        const data = await fetchJson(`${base}${encodeURIComponent(codice)}.json?lc=it`);
        const trovato = data.status === 1 || data.status === 'success';
        if (!trovato || !data.product) return null; // codice non in banca dati
        return normalizzaProdotto(data.product, codice);
      } catch (e) { ultimoErrore = e; }
    }
    throw ultimoErrore || new Error('Open Food Facts non raggiungibile');
  }

  const cacheRicerche = new Map(); // stessa ricerca ripetuta: nessuna nuova richiesta (il servizio limita le ricerche)

  async function cercaConSearchALicious(q, limite) {
    const url = `${SEARCH_URL}?q=${encodeURIComponent(q)}&page_size=${limite}&langs=it`;
    const data = await fetchJson(url);
    return Array.isArray(data.hits) ? data.hits : (data.products || []);
  }
  async function cercaConRicercaClassica(q, limite) {
    const url = `${BASE_SEARCH_URL}?search_terms=${encodeURIComponent(q)}&json=true&page_size=${limite}&lc=it`;
    const data = await fetchJson(url);
    return data.products || [];
  }

  /** Cerca prodotti per nome/testo libero, fino a `limite` risultati. */
  async function cercaTesto(query, limite = 10) {
    const q = (query || '').trim();
    if (q.length < 3) return [];
    const chiave = q.toLowerCase() + '|' + limite;
    if (cacheRicerche.has(chiave)) return cacheRicerche.get(chiave);
    let grezzi, errore = null;
    try { grezzi = await cercaConSearchALicious(q, limite); }
    catch (e) {
      errore = e;
      if (e && e.status === 429) throw e; // troppe richieste: inutile insistere con l'altro servizio
      try { grezzi = await cercaConRicercaClassica(q, limite); errore = null; }
      catch (e2) { errore = e2; }
    }
    if (errore) throw errore;
    const risultati = grezzi
      .map(p => normalizzaProdotto(p))
      .filter(p => p.nome); // scarta risultati senza nemmeno un nome
    cacheRicerche.set(chiave, risultati);
    return risultati;
  }

  return { cercaDaBarcode, cercaTesto, mappaCategoria, parseQuantita };
})();


/**
 * Collega un <input> di testo alla ricerca Open Food Facts con un menu a
 * tendina di risultati (nome, marca, miniatura), riusando lo stesso stile
 * dell'autocompletamento del sito. Debounce di 350ms per non
 * interrogare l'API a ogni singolo tasto premuto.
 *
 * @param {HTMLInputElement} inputEl
 * @param {Function} onSelect  callback(prodottoOFF) alla scelta di un risultato
 * @param {Function} [onError] callback(errore) se la ricerca fallisce
 */
function attachOffAutocomplete(inputEl, onSelect, onError) {
  const contenitore = document.createElement('div');
  contenitore.className = 'ricerca-ac-wrapper';
  inputEl.parentNode.insertBefore(contenitore, inputEl);
  contenitore.appendChild(inputEl);

  const dropdown = document.createElement('ul');
  dropdown.className = 'ricerca-ac-dropdown';
  dropdown.hidden = true;
  contenitore.appendChild(dropdown);

  let timeoutId = null;
  let richiestaCorrenteId = 0;

  function chiudi() {
    dropdown.hidden = true;
    dropdown.innerHTML = '';
  }

  function mostraRisultati(risultati) {
    dropdown.innerHTML = '';
    if (!risultati.length) { chiudi(); return; }
    for (const prodotto of risultati) {
      const voce = document.createElement('li');
      voce.className = 'ricerca-ac-item';
      const miniatura = prodotto.immagine
        ? `<img src="${prodotto.immagine}" alt="" style="width:28px;height:28px;object-fit:contain;border-radius:4px;margin-right:8px;">`
        : '';
      voce.innerHTML = `
        <span style="display:flex;align-items:center;">${miniatura}<span class="ricerca-ac-nome">${prodotto.nome}</span></span>
        <span class="ricerca-ac-dettagli">${prodotto.marca || ''}</span>
      `;
      voce.addEventListener('mousedown', (e) => {
        e.preventDefault();
        inputEl.value = prodotto.nome;
        chiudi();
        // Il nuovo motore di ricerca può non includere i valori nutrizionali: in quel caso li
        // chiediamo con il codice a barre (se fallisce si usa comunque il risultato trovato).
        if (prodotto.kcal100 === null && prodotto.barcode) {
          OffIntegration.cercaDaBarcode(prodotto.barcode)
            .then(completo => onSelect(completo ? Object.assign({}, prodotto, completo, { nome: completo.nome || prodotto.nome }) : prodotto))
            .catch(() => onSelect(prodotto));
        } else {
          onSelect(prodotto);
        }
      });
      dropdown.appendChild(voce);
    }
    dropdown.hidden = false;
  }

  inputEl.addEventListener('input', () => {
    clearTimeout(timeoutId);
    const valore = inputEl.value;
    const mioId = ++richiestaCorrenteId;
    timeoutId = setTimeout(() => {
      OffIntegration.cercaTesto(valore)
        .then(risultati => { if (mioId === richiestaCorrenteId) mostraRisultati(risultati); })
        .catch(err => { if (onError) onError(err); });
    }, 700);
  });

  inputEl.addEventListener('blur', () => setTimeout(chiudi, 150));
  document.addEventListener('click', (e) => { if (!contenitore.contains(e.target)) chiudi(); });
}
