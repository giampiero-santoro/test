/**
 * crea-nutrition.js
 * -------------------------------------------------------------------------
 * Modulo per "Il Mio Ricettario": ricerca degli alimenti nella banca dati
 * CREA e consultazione dei valori nutrizionali degli alimenti.
 *
 * Nessuna dipendenza esterna. Pensato per essere incluso con:
 *   <script src="js/crea-nutrition.js"></script>
 * (oppure copiato dentro il <script> del file index.html, se si preferisce
 * mantenere un unico file: vedi nota in fondo alla guida).
 *
 * Espone l'oggetto globale `CreaDB` con:
 *   - CreaDB.init(path)              carica e mette in cache il dataset
 *   - CreaDB.isReady()               true se i dati sono gia' caricati
 *   - CreaDB.search(query, limit)    ricerca full-text semplice
 *   - CreaDB.getByCode(codice)       recupero diretto per food_code
 *   - CreaDB.scale(alimento, grammi) valori dell'alimento scalati ai grammi
 *   - CreaDB.sumIngredients(list)    utilità per eventuali consultazioni
 *     alimentari; non è usata per calcolare i valori delle ricette
 *   - attachCreaAutocomplete(input, onSelect) collega un <input> di testo
 *     a un menu a tendina di risultati, stile "Il Mio Ricettario"
 */

const CreaDB = (() => {
  let alimenti = null;        // array completo in memoria dopo il caricamento
  let meta = null;
  let loadingPromise = null;

  let alimentiCompleto = null;   // dizionario {codice: record} caricato SOLO su richiesta
  let schemaEtichette = null;    // etichette/unità dei ~129 nutrienti, caricate una sola volta
  let loadingCompletoPromise = null;

  /** Rimuove accenti/maiuscole per una ricerca "contains" tollerante. */
  function normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Carica il dataset (una sola volta, poi resta in memoria per tutta la
   * sessione). Il file e' statico e servito dallo stesso dominio GitHub
   * Pages: il browser lo mette gia' in cache HTTP, quindi non serve una
   * cache manuale aggiuntiva in localStorage.
   */
  function init(dataPath = 'data/crea-alimenti.json', metaPath = 'data/crea-meta.json') {
    if (loadingPromise) return loadingPromise;

    loadingPromise = Promise.all([
      fetch(dataPath).then(r => {
        if (!r.ok) throw new Error(`Impossibile caricare ${dataPath} (${r.status})`);
        return r.json();
      }),
      fetch(metaPath).then(r => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([alimentiData, metaData]) => {
      alimenti = alimentiData;
      meta = metaData;
      return { alimenti, meta };
    });

    return loadingPromise;
  }

  function isReady() {
    return Array.isArray(alimenti);
  }

  /**
   * Ricerca semplice "contains" sulla chiave_ricerca pre-normalizzata.
   * Con 900 alimenti una scansione lineare e' istantanea (< 1ms):
   * non serve un indice piu' sofisticato.
   */
  function search(query, limit = 15) {
    if (!isReady() || !query || !query.trim()) return [];
    const q = normalize(query);
    const risultati = [];
    for (const a of alimenti) {
      if (a.chiave_ricerca.includes(q)) {
        risultati.push(a);
        if (risultati.length >= limit) break;
      }
    }
    return risultati;
  }

  function getByCode(codice) {
    if (!isReady()) return null;
    return alimenti.find(a => a.codice === codice) || null;
  }

  /**
   * Scala i valori nutrizionali (definiti per 100g) alla quantita' reale
   * in grammi di un ingrediente. Ritorna un nuovo oggetto, senza mutare
   * l'alimento originale.
   */
  function scale(alimento, grammi) {
    const fattore = grammi / 100;
    const campi = ['kcal', 'proteine', 'grassi', 'carboidrati', 'fibre', 'zuccheri', 'sale'];
    const risultato = {
      codice: alimento.codice,
      nome: alimento.nome,
      grammi,
    };
    for (const campo of campi) {
      const v = alimento[campo];
      risultato[campo] = v === null || v === undefined ? null : Math.round(v * fattore * 100) / 100;
    }
    return risultato;
  }

  /**
   * Somma i valori nutrizionali di una lista di ingredienti gia' scalati
   * (uscita di `scale`). I valori nulli/mancanti vengono ignorati nella
   * somma (non trattati come zero "reale", per non nascondere dati mancanti
   * quando si mostra il totale all'utente: vedi `datiIncompleti`).
   */
  function sumIngredients(listaScalata) {
    const campi = ['kcal', 'proteine', 'grassi', 'carboidrati', 'fibre', 'zuccheri', 'sale'];
    const totale = {};
    let datiIncompleti = false;
    for (const campo of campi) {
      let somma = 0;
      for (const ing of listaScalata) {
        if (ing[campo] === null || ing[campo] === undefined) {
          datiIncompleti = true;
        } else {
          somma += ing[campo];
        }
      }
      totale[campo] = Math.round(somma * 100) / 100;
    }
    totale.datiIncompleti = datiIncompleti;
    return totale;
  }

  /** Divide un totale (vedi sumIngredients) per il numero di porzioni. */
  function perPorzione(totale, porzioni) {
    const n = Math.max(1, porzioni || 1);
    const campi = ['kcal', 'proteine', 'grassi', 'carboidrati', 'fibre', 'zuccheri', 'sale'];
    const risultato = { datiIncompleti: totale.datiIncompleti };
    for (const campo of campi) {
      risultato[campo] = Math.round((totale[campo] / n) * 100) / 100;
    }
    return risultato;
  }

  function getMeta() {
    return meta;
  }

  /** Ritorna l'array completo degli alimenti (dataset slim, già in memoria
   * dopo init()) — utile per sfogliare/filtrare per categoria, non solo
   * per la ricerca testuale di search(). */
  function tutti() {
    return alimenti || [];
  }

  /**
   * Carica (solo la prima volta che serve, non all'avvio) il profilo
   * nutrizionale COMPLETO — circa 129 proprietà per alimento (zuccheri
   * singoli, minerali, vitamine, acidi grassi, aminoacidi, altri composti),
   * oltre ai 7 valori macro già gestiti da `scale`/`sumIngredients`.
   * File più pesante (alcuni MB): per questo viene caricato solo quando
   * l'utente apre davvero una "scheda completa", non all'avvio del sito.
   */
  function initCompleto(dataPath = 'data/crea-alimenti-completo.json', schemaPath = 'data/crea-nutrienti-schema.json') {
    if (loadingCompletoPromise) return loadingCompletoPromise;

    loadingCompletoPromise = Promise.all([
      fetch(dataPath).then(r => {
        if (!r.ok) throw new Error(`Impossibile caricare ${dataPath} (${r.status})`);
        return r.json();
      }),
      fetch(schemaPath).then(r => {
        if (!r.ok) throw new Error(`Impossibile caricare ${schemaPath} (${r.status})`);
        return r.json();
      }),
    ]).then(([dati, schema]) => {
      alimentiCompleto = dati;
      schemaEtichette = schema;
      return { alimentiCompleto, schemaEtichette };
    });

    return loadingCompletoPromise;
  }

  function isCompletoReady() {
    return alimentiCompleto !== null && schemaEtichette !== null;
  }

  function getCompletoByCode(codice) {
    if (!isCompletoReady()) return null;
    return alimentiCompleto[codice] || null;
  }

  /**
   * Costruisce l'HTML (categorizzato: Macronutrienti, Zuccheri, Minerali,
   * Vitamine, Acidi grassi, Aminoacidi, Altri composti) per la "scheda
   * completa" di un alimento. Mostra solo i valori effettivamente presenti
   * nella fonte (non nasconde le sezioni vuote di proposito: se CREA non
   * ha misurato un valore, è un'informazione a sua volta, resa come "–").
   * Richiede che initCompleto() sia già stato completato.
   */
  function renderSchedaCompletaHTML(record) {
    if (!record || !schemaEtichette) return '';
    const sezioni = [
      ['macronutrienti', 'Macronutrienti'],
      ['zuccheri', 'Zuccheri (dettaglio)'],
      ['minerali', 'Minerali'],
      ['vitamine', 'Vitamine'],
      ['acidi_grassi', 'Acidi grassi'],
      ['aminoacidi', 'Aminoacidi (g/100g, salvo diversa indicazione della fonte)'],
      ['altri_composti', 'Altri composti'],
    ];

    let html = `<div class="crea-scheda-completa">`;
    html += `<h3 class="crea-scheda-titolo">${record.nome}</h3>`;
    if (record.nome_scientifico || record.nome_inglese) {
      html += `<div class="crea-scheda-sottotitolo">`;
      if (record.nome_scientifico) html += `<em>${record.nome_scientifico}</em>`;
      if (record.nome_inglese) html += ` · ${record.nome_inglese}`;
      html += `</div>`;
    }

    for (const [chiaveSezione, titoloSezione] of sezioni) {
      const valori = record.nutrienti[chiaveSezione] || {};
      const etichette = schemaEtichette[chiaveSezione] || [];
      const righe = etichette
        .map(e => ({ ...e, valore: valori[e.chiave] }))
        .filter(e => e.valore !== null && e.valore !== undefined);
      if (righe.length === 0) continue;

      html += `<div class="crea-scheda-sezione">`;
      html += `<h4>${titoloSezione}</h4>`;
      html += `<table class="crea-scheda-tabella">`;
      for (const r of righe) {
        const unita = r.unita && r.unita !== 'n.d.' ? ` ${r.unita}` : '';
        html += `<tr><td>${r.etichetta}</td><td>${r.valore}${unita}</td></tr>`;
      }
      html += `</table></div>`;
    }

    html += `<div class="crea-scheda-fonte">
      Fonte: <strong>CREA</strong> — Centro di ricerca Alimenti e Nutrizione, via
      <a href="https://www.alimentinutrizione.it" target="_blank" rel="noopener">alimentinutrizione.it</a>.
      Valori per 100&nbsp;g di parte edibile.
    </div>`;
    html += `</div>`;
    return html;
  }

  return {
    init, isReady, search, getByCode, scale, sumIngredients, perPorzione, getMeta, tutti,
    initCompleto, isCompletoReady, getCompletoByCode, renderSchedaCompletaHTML,
  };
})();


/**
 * CreaRicette
 * -------------------------------------------------------------------------
 * Le 56 ricette ufficiali CREA (crea_recipes.json), pronte per essere
 * sfogliate e importate come nuove ricette in "Il Mio Ricettario".
 */
const CreaRicette = (() => {
  let ricette = null;
  let loadingPromise = null;

  function init(path = 'data/crea-ricette.json') {
    if (loadingPromise) return loadingPromise;
    loadingPromise = fetch(path)
      .then(r => {
        if (!r.ok) throw new Error(`Impossibile caricare ${path} (${r.status})`);
        return r.json();
      })
      .then(dati => { ricette = dati; return ricette; });
    return loadingPromise;
  }

  function isReady() {
    return Array.isArray(ricette);
  }

  function all() {
    return ricette || [];
  }

  function getById(id) {
    if (!isReady()) return null;
    return ricette.find(r => r.id === id) || null;
  }

  /**
   * Converte una ricetta CREA nel formato dati usato da "Il Mio Ricettario".
   * I valori nutrizionali NON vengono più calcolati sommando gli ingredienti
   * crudi (la cottura li altera in modo imprevedibile): la ricetta importata
   * porta con sé `nutrizioneCrea`, i valori ufficiali che CREA ha misurato
   * sul piatto finito, per 100 g — mostrati così come sono, non ricalcolati.
   */
  function convertiInRicettaApp(ricettaCrea, cryptoId) {
    return {
      id: cryptoId(),
      name: ricettaCrea.nome,
      category: ricettaCrea.categoria_suggerita || 'Altro',
      servings: ricettaCrea.porzioni_numero || 4,
      time: 0,
      cookerType: '',
      favorite: false, photo: '', lastMade: null, timesMade: 0,
      tags: [],
      ingredients: ricettaCrea.ingredienti.map(ing => ({
        name: ing.nome,
        qty: ing.quantita ?? '',
        unit: ing.unita || '',
      })),
      nutrizioneCrea: ricettaCrea.valori_nutrizionali_100g_piatto || null,
      steps: [{ text: ricettaCrea.preparazione || '' }],
      notes: [
        ricettaCrea.porzioni_testo ? `Porzioni indicate dalla fonte: ${ricettaCrea.porzioni_testo}` : '',
        ricettaCrea.tempo_cottura ? `Tempo di cottura: ${ricettaCrea.tempo_cottura}` : '',
        ricettaCrea.tipo_cottura ? `Tipo di cottura: ${ricettaCrea.tipo_cottura}` : '',
        'Ricetta ufficiale CREA (alimentinutrizione.it) — categoria e porzioni assegnate automaticamente: verificale e correggile se necessario.',
      ].filter(Boolean).join('\n'),
    };
  }

  return { init, isReady, all, getById, convertiInRicettaApp };
})();


/**
 * Collega un campo di testo a un menu a tendina con i risultati della
 * ricerca CREA, in stile coerente con "Il Mio Ricettario" (classi CSS
 * .crea-autocomplete-* definite in crea-nutrition.css).
 *
 * @param {HTMLInputElement} inputEl   campo di testo dove l'utente digita
 * @param {Function} onSelect          callback(alimentoCompleto) chiamata
 *                                     quando l'utente sceglie un risultato
 */
function attachCreaAutocomplete(inputEl, onSelect) {
  const contenitore = document.createElement('div');
  contenitore.className = 'crea-autocomplete-wrapper';
  inputEl.parentNode.insertBefore(contenitore, inputEl);
  contenitore.appendChild(inputEl);

  const dropdown = document.createElement('ul');
  dropdown.className = 'crea-autocomplete-dropdown';
  dropdown.hidden = true;
  contenitore.appendChild(dropdown);

  let timeoutId = null;

  function chiudi() {
    dropdown.hidden = true;
    dropdown.innerHTML = '';
  }

  function mostraRisultati(risultati) {
    dropdown.innerHTML = '';
    if (!risultati.length) {
      chiudi();
      return;
    }
    for (const alimento of risultati) {
      const voce = document.createElement('li');
      voce.className = 'crea-autocomplete-item';
      voce.innerHTML = `
        <span class="crea-autocomplete-nome">${alimento.nome}</span>
        <span class="crea-autocomplete-dettagli">${alimento.categoria} · ${alimento.kcal ?? '–'} kcal/100g</span>
      `;
      voce.addEventListener('mousedown', (e) => {
        // mousedown (non click) per non perdere il focus prima del blur
        e.preventDefault();
        inputEl.value = alimento.nome;
        chiudi();
        onSelect(alimento);
      });
      dropdown.appendChild(voce);
    }
    dropdown.hidden = false;
  }

  inputEl.addEventListener('input', () => {
    clearTimeout(timeoutId);
    const valore = inputEl.value;
    // piccolo debounce: la ricerca e' comunque istantanea, ma evita
    // ricalcoli/render inutili a ogni singolo tasto premuto
    timeoutId = setTimeout(() => {
      if (!CreaDB.isReady()) return;
      mostraRisultati(CreaDB.search(valore));
    }, 120);
  });

  inputEl.addEventListener('blur', () => {
    // ritardo per permettere al mousedown sulla voce di essere gestito prima
    setTimeout(chiudi, 150);
  });

  document.addEventListener('click', (e) => {
    if (!contenitore.contains(e.target)) chiudi();
  });
}
