/**
 * nutrition-import.js
 * -------------------------------------------------------------------------
 * Legge una tabella nutrizionale incollata come testo (da un'etichetta,
 * da una pagina web copiata, da un documento) e ne ricava i sette valori
 * usati dal ricettario: kcal, proteine, grassi, carboidrati, fibre,
 * zuccheri, sale. Tutto avviene sul dispositivo: nessuna richiesta esterna.
 *
 * Capisce italiano e inglese, la virgola come separatore decimale,
 * «kJ / kcal», il sodio in mg (convertito in sale) e le tabelle a due
 * colonne «per 100 g» e «per porzione».
 */
const NutritionParser = (() => {

  const CAMPI = ['kcal', 'protein', 'fat', 'carbs', 'fiber', 'sugar', 'salt'];

  // Ordine importante: le voci «da ignorare» (saturi, amido, vitamine…) vengono prima, così i loro numeri
  // non finiscono per errore sotto grassi o carboidrati.
  const ETICHETTE = [
    ['skip', /(?:di cui\s+)?(?:acidi\s+grassi\s+)?(?:mono|poli)?insaturi|(?:di cui\s+)?(?:acidi\s+grassi\s+)?saturi|saturated(?:\s+fat)?|mono-?unsaturated|poly-?unsaturated|trans\s*fat|polioli|polyols?|amido|starch|colesterolo|cholesterol|potassio|potassium|calcio|calcium|ferro\b|iron\b|fosforo|magnesio|vitamin\w*|sodio\s*\(?\s*%|omega\s*-?\d/],
    ['kcal', /valore\s+energetico|energia|energy|calories|calorie|kcal/],
    ['fat', /grassi\s+totali|total\s+fat|grassi|lipidi|\bfat\b/],
    ['sugar', /zuccheri|sugars?/],
    ['fiber', /fibre\s+alimentari|dietary\s+fib(?:er|re)|fibre|fibra|fiber/],
    ['carbs', /carboidrati|glucidi|total\s+carbohydrates?|carbohydrates?|carbs/],
    ['protein', /proteine|proteins?|protidi/],
    ['sodium', /sodio|sodium/],
    ['salt', /\bsale\b|\bsalt\b/],
  ];

  function num(s) { return parseFloat(String(s).replace(',', '.')); }

  function pulisci(testo) {
    return String(testo || '')
      .replace(/ /g, ' ')
      .replace(/[‒-―]/g, '-')
      .replace(/\t/g, '  ')
      .toLowerCase();
  }

  /**
   * Cerca di capire a cosa sono riferiti i valori: per 100 g/ml, per porzione, o entrambi (due colonne).
   * Restituisce { colonne: ['100g','porzione'] (nell'ordine in cui compaiono), porzioneGrammi }.
   */
  function rilevaBase(t) {
    const re100 = /(?:per|pro|per\s+100|ogni)?\s*100\s*(?:g|gr|ml)\b|per\s+100\b/g;
    const rePor = /(?:per|pro)\s+(?:porzione|portion|serving)|porzione\s*(?:da|di|:)?\s*\(?\s*\d|(?:serving|portion)\s+size|per\s+serving|per\s+portion|(?:%|valore)\s*per\s+porzione/g;
    const m100 = t.search(/100\s*(?:g|gr|ml)\b/);
    const mPor = t.search(rePor === null ? /x/ : /per\s+(?:porzione|portion|serving)|porzione|serving\s+size|per\s+serving/);
    let colonne = [];
    if (m100 >= 0 && mPor >= 0) colonne = m100 < mPor ? ['100g', 'porzione'] : ['porzione', '100g'];
    else if (m100 >= 0) colonne = ['100g'];
    else if (mPor >= 0) colonne = ['porzione'];
    let porzioneGrammi = null;
    const mg = /(?:porzione|portion|serving)[^\d\n]{0,25}?(\d+(?:[.,]\d+)?)\s*(?:g|gr|ml)\b/.exec(t);
    if (mg) porzioneGrammi = num(mg[1]);
    return { colonne, porzioneGrammi };
  }

  function toglieIntestazioni(t) {
    return t
      .replace(/(?:per|pro|ogni)?\s*100\s*(?:g|gr|ml)\b/g, ' ')
      .replace(/(?:per|pro)\s+(?:porzione|portion|serving)(?:\s*(?:da|di|:)?\s*\(?\s*\d+(?:[.,]\d+)?\s*(?:g|gr|ml)\)?)?/g, ' ')
      .replace(/(?:porzione|portion|serving\s+size)\s*(?:da|di|:)?\s*\(?\s*\d+(?:[.,]\d+)?\s*(?:g|gr|ml)\)?/g, ' ')
      .replace(/\b(?:porzione|portion|serving)\b/g, ' ');
  }

  /** Per ogni etichetta trova i numeri che la seguono, fino all'etichetta successiva. */
  function estraiNumeri(t) {
    const unite = new RegExp(ETICHETTE.map(e => '(' + e[1].source + ')').join('|'), 'g');
    const trovati = [];
    let m;
    while ((m = unite.exec(t)) !== null) {
      let k = -1;
      for (let i = 1; i < m.length; i++) if (m[i] !== undefined) { k = i - 1; break; }
      if (k < 0) { if (m[0].length === 0) unite.lastIndex++; continue; }
      trovati.push({ chiave: ETICHETTE[k][0], inizio: m.index, fine: m.index + m[0].length });
    }
    const out = {};
    trovati.forEach((tr, i) => {
      if (tr.chiave === 'skip') return;
      const fineSegmento = i + 1 < trovati.length ? trovati[i + 1].inizio : t.length;
      const segmento = t.slice(tr.fine, fineSegmento);
      const valori = [];
      const re = /(<|<=|≤|meno di\s*)?\s*(\d+(?:[.,]\d+)?)\s*(kj|kcal|mg|µg|mcg|g|%)?/g;
      let n;
      while ((n = re.exec(segmento)) !== null) {
        const unita = n[3] || '';
        if (unita === '%') continue;       // percentuale del fabbisogno: non è un valore
        valori.push({ v: num(n[2]), u: unita });
      }
      if (/\btracce\b|\btrace\b|\bnil\b/.test(segmento) && !valori.length) valori.push({ v: 0, u: 'g' });
      if (!out[tr.chiave]) out[tr.chiave] = [];
      out[tr.chiave].push(...valori);
    });
    return out;
  }

  /**
   * Interpreta il testo. Restituisce:
   * { valori: {kcal,protein,fat,carbs,fiber,sugar,salt}, base: '100g'|'porzione'|null,
   *   porzioneGrammi: n|null, trovati: n, note: [] }
   * I valori sono riferiti a `base`. Se il testo ha due colonne si usa quella «per 100 g».
   */
  /** Rimedia agli errori tipici del riconoscimento da foto: «g» letta come 9 a fine riga, «0,9» letto «09». */
  function riparaOcr(testo) {
    return String(testo || '').split('\n').map(r => {
      let x = r.replace(/\b0(\d)(?=\s*g\b|\s*$)/g, '0,$1');
      if (!/(kcal|kj|mg|%)\s*$/i.test(x) && !/\bg\s*$/i.test(x)) x = x.replace(/(\d+[.,]\d)9\s*$/, '$1 g').replace(/(\d{2,})9\s*$/, (m, d) => d + ' g');
      return x;
    }).join('\n');
  }

  function interpreta(testo, opzioni) {
    if (opzioni && opzioni.ocr) testo = riparaOcr(testo);
    const t0 = pulisci(testo);
    const note = [];
    const { colonne, porzioneGrammi } = rilevaBase(t0);
    const t = toglieIntestazioni(t0);
    const num_ = estraiNumeri(t);

    let base = null;
    let indice = 0;
    if (colonne.length === 2) { base = '100g'; indice = colonne.indexOf('100g'); }
    else if (colonne.length === 1) base = colonne[0];

    const valori = {};
    const prendi = (lista, unitaPreferite) => {
      if (!lista || !lista.length) return null;
      const adatti = lista.filter(x => unitaPreferite.includes(x.u));
      const pool = adatti.length ? adatti : lista.filter(x => x.u !== 'kj');
      if (!pool.length) return null;
      return (colonne.length === 2 && pool.length > indice) ? pool[indice] : pool[0];
    };

    const kc = num_.kcal;
    if (kc && kc.length) {
      const conKcal = kc.filter(x => x.u === 'kcal');
      let scelto = null;
      if (conKcal.length) scelto = (colonne.length === 2 && conKcal.length > indice) ? conKcal[indice] : conKcal[0];
      else {
        const senzaUnita = kc.filter(x => x.u === '');
        const soloKj = kc.filter(x => x.u === 'kj');
        if (senzaUnita.length) scelto = (colonne.length === 2 && senzaUnita.length > indice) ? senzaUnita[indice] : senzaUnita[0];
        else if (soloKj.length) { scelto = { v: Math.round(soloKj[0].v / 4.184), u: 'kcal' }; note.push('Le calorie sono state ricavate dai kJ (1 kcal = 4,184 kJ).'); }
      }
      if (scelto) valori.kcal = Math.round(scelto.v);
    }
    const grammi = (chiave, campo) => {
      const x = prendi(num_[chiave], ['g', '']);
      if (x) valori[campo] = x.u === 'mg' ? x.v / 1000 : x.v;
    };
    grammi('protein', 'protein'); grammi('fat', 'fat'); grammi('carbs', 'carbs'); grammi('fiber', 'fiber'); grammi('sugar', 'sugar');
    const sale = prendi(num_.salt, ['g', '']);
    if (sale) valori.salt = sale.v;
    else {
      const sodio = prendi(num_.sodium, ['mg', 'g', '']);
      if (sodio) {
        const g = sodio.u === 'mg' ? sodio.v / 1000 : (sodio.u === 'g' ? sodio.v : sodio.v / 1000);
        valori.salt = Math.round(g * 2.5 * 100) / 100;
        note.push('Il sale è stato calcolato dal sodio (sodio × 2,5).');
      }
    }
    // Se mancano base e porzione ma ci sono valori, lascia decidere a chi chiama (di solito per 100 g).
    return { valori, base, porzioneGrammi: porzioneGrammi || null, trovati: Object.keys(valori).length, note };
  }

  /** Converte i valori tra «per 100 g» e «per porzione» (grammi della porzione). */
  function converti(valori, da, a, grammiPorzione) {
    if (da === a || !da || !a) return Object.assign({}, valori);
    if (!grammiPorzione || grammiPorzione <= 0) return null;
    const f = da === '100g' ? grammiPorzione / 100 : 100 / grammiPorzione;
    const out = {};
    CAMPI.forEach(k => { if (valori[k] !== undefined && valori[k] !== null) out[k] = valori[k] * f; });
    return out;
  }

  function arrotonda(valori) {
    const out = {};
    CAMPI.forEach(k => {
      const v = valori[k];
      if (v === undefined || v === null || !Number.isFinite(v)) return;
      out[k] = k === 'kcal' ? Math.round(v) : (k === 'salt' ? Math.round(v * 100) / 100 : Math.round(v * 10) / 10);
    });
    return out;
  }

  /** Controlli di coerenza: restituisce un elenco di avvisi (vuoto se tutto torna). */
  function controlla(valori, base) {
    const av = [];
    const P = valori.protein || 0, F = valori.fat || 0, C = valori.carbs || 0, fib = valori.fiber || 0;
    if (base === '100g' && P + F + C > 101) av.push('Proteine, grassi e carboidrati insieme superano i 100 g: controlla i numeri.');
    if (valori.sugar !== undefined && valori.carbs !== undefined && valori.sugar > valori.carbs + 0.05) av.push('Gli zuccheri sono più dei carboidrati totali: gli zuccheri dovrebbero esserne una parte.');
    if (valori.fiber !== undefined && valori.carbs !== undefined && valori.fiber > valori.carbs + 0.05) av.push('Le fibre sono più dei carboidrati totali: controlla i numeri (nelle foto la virgola può andare persa).');
    if (valori.kcal !== undefined && (valori.protein !== undefined || valori.fat !== undefined || valori.carbs !== undefined)) {
      const calc = 4 * P + 9 * F + 4 * C + 2 * fib;
      if (calc > 20 && Math.abs(calc - valori.kcal) / Math.max(calc, valori.kcal) > 0.3) {
        av.push(`Le calorie (${valori.kcal}) non tornano con i macronutrienti (calcolo: circa ${Math.round(calc)} kcal): controlla i valori.`);
      }
    }
    return av;
  }

  return { CAMPI, interpreta, converti, arrotonda, controlla };
})();
