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
  const BASE_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

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
   * verso le 19 categorie CREA già usate in Dispensa. Come per le altre
   * euristiche di categoria del sito: un default suggerito, mai
   * vincolante, sempre modificabile dall'utente dopo.
   */
  function mappaCategoria(categoriesTagsOrText) {
    const testo = normalize(
      Array.isArray(categoriesTagsOrText) ? categoriesTagsOrText.join(' ') : (categoriesTagsOrText || '')
    );
    const regole = [
      [/dessert|dolc|biscott|cake|pasticceria|cioccolat|chocolate|nutella|jam|marmalade|marmellat|honey|miele|gelato|ice.?cream|sorbet|wafer|cracker/, 'Dolci'],
      [/beer|birra|wine|vino|alcohol|alcolic|liquor|spirit/, 'Bevande alcoliche'],
      // Nota: CREA non ha una categoria "bevande" generica (solo quelle
      // alcoliche) — succhi, bibite, acqua, caffè e tè restano volutamente
      // su "Prodotti vari" (il default) invece di un'etichetta indovinata.
      [/fish|pesce|tuna|tonno|salmon|salmone|seafood|gambero|shrimp|calamar|polpo|octopus|cozz|mussel/, 'Prodotti della pesca'],
      [/egg|uov/, 'Uova'],
      [/cheese|formagg|latticin|mozzarella|ricotta|parmigian|grana/, 'Formaggi e latticini'],
      [/milk|latte|yogurt|yoghurt|kefir/, 'Latte e yogurt'],
      [/meat|carne|beef|manzo|pork|maiale|chicken|pollo|tacchino|turkey|salame|salumi|prosciutto|wurstel|sausage|bacon|pancetta|coniglio|rabbit/, 'Carni trasformate e conservate'],
      [/legum|bean|fagiol|lentil|lenticchi|cecio|ceci|chickpea|piselli|pea\b|hummus/, 'Legumi'],
      [/almond|mandorl|walnut|hazelnut|nocciol|pistacchio|pistachio|cashew|anacard|\bnut\b|\bnuts\b|\bnoc\b|seed|seme|semi\b/, 'Frutta secca a guscio e semi oleaginosi'],
      [/\boil\b|\boli[ov]\b|olive oil|olio|grass|butter|burro|margarina|margarine/, 'Oli e grassi'],
      [/fruit|frutt|mela|apple|banana|arancia|orange|pera\b|pear\b|uva\b|grape/, 'Frutta'],
      [/vegetable|verdur|ortagg|pomodoro|tomato|zucchin|carota|carrot|insalata|lettuce|spinaci|spinach/, 'Verdure e ortaggi'],
      [/cereal|pasta|rice|riso|bread|pane|flour|farina|couscous|orzo|farro|quinoa/, 'Cereali e derivati'],
      [/fast-food|fastfood|burger|pizza|kebab/, 'Fast-food a base di carne'],
    ];
    for (const [re, categoria] of regole) {
      if (re.test(testo)) return categoria;
    }
    return 'Prodotti vari';
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

  function normalizzaProdotto(p, barcodeFallback) {
    const n = p.nutriments || {};
    return {
      barcode: p.code || barcodeFallback || '',
      nome: p.product_name_it || p.product_name || '',
      marca: p.brands || '',
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
    const res = await fetch(`${BASE_PRODUCT_URL}${encodeURIComponent(codice)}.json?lc=it`);
    if (!res.ok) throw new Error(`Open Food Facts non raggiungibile (${res.status})`);
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null; // codice non in banca dati
    return normalizzaProdotto(data.product, codice);
  }

  /** Cerca prodotti per nome/testo libero, fino a `limite` risultati. */
  async function cercaTesto(query, limite = 10) {
    const q = (query || '').trim();
    if (q.length < 2) return [];
    const url = `${BASE_SEARCH_URL}?search_terms=${encodeURIComponent(q)}&json=true&page_size=${limite}&lc=it`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open Food Facts non raggiungibile (${res.status})`);
    const data = await res.json();
    return (data.products || [])
      .map(p => normalizzaProdotto(p))
      .filter(p => p.nome); // scarta risultati senza nemmeno un nome
  }

  return { cercaDaBarcode, cercaTesto, mappaCategoria, parseQuantita };
})();


/**
 * Collega un <input> di testo alla ricerca Open Food Facts con un menu a
 * tendina di risultati (nome, marca, miniatura), riusando lo stesso stile
 * dell'autocomplete CREA già presente nel sito. Debounce di 350ms per non
 * interrogare l'API a ogni singolo tasto premuto.
 *
 * @param {HTMLInputElement} inputEl
 * @param {Function} onSelect  callback(prodottoOFF) alla scelta di un risultato
 * @param {Function} [onError] callback(errore) se la ricerca fallisce
 */
function attachOffAutocomplete(inputEl, onSelect, onError) {
  const contenitore = document.createElement('div');
  contenitore.className = 'crea-autocomplete-wrapper';
  inputEl.parentNode.insertBefore(contenitore, inputEl);
  contenitore.appendChild(inputEl);

  const dropdown = document.createElement('ul');
  dropdown.className = 'crea-autocomplete-dropdown';
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
      voce.className = 'crea-autocomplete-item';
      const miniatura = prodotto.immagine
        ? `<img src="${prodotto.immagine}" alt="" style="width:28px;height:28px;object-fit:contain;border-radius:4px;margin-right:8px;">`
        : '';
      voce.innerHTML = `
        <span style="display:flex;align-items:center;">${miniatura}<span class="crea-autocomplete-nome">${prodotto.nome}</span></span>
        <span class="crea-autocomplete-dettagli">${prodotto.marca || ''}</span>
      `;
      voce.addEventListener('mousedown', (e) => {
        e.preventDefault();
        inputEl.value = prodotto.nome;
        chiudi();
        onSelect(prodotto);
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
    }, 350);
  });

  inputEl.addEventListener('blur', () => setTimeout(chiudi, 150));
  document.addEventListener('click', (e) => { if (!contenitore.contains(e.target)) chiudi(); });
}
