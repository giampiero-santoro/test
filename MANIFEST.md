# Manifest dei file

Elenco di tutti i file che devono essere caricati insieme su GitHub perché il sito funzioni correttamente. Non tiene uno storico delle versioni precedenti — la cronologia delle modifiche è già in [CHANGELOG.md](CHANGELOG.md); questo file mostra solo **la situazione attuale**, e va sovrascritto ogni volta che cambia l'elenco dei file coinvolti.

**Versione corrente: 4.3.1**

## File essenziali (senza uno di questi il sito non parte, o parte con funzioni mancanti)

| File | A cosa serve |
|---|---|
| `index.html` | La struttura delle pagine del sito |
| `style.css` | Tutto lo stile grafico del sito (barra laterale, card, tema chiaro/scuro) |
| `js/app.js` | Tutta la logica dell'app (ricette, dispensa, pianificazione, lista spesa, backup, temi) |
| `js/crea-nutrition.js` | Ricerca CREA (alimenti, ricette, scheda nutrizionale completa) — usato da ingredienti, Dispensa, "CREA Alimenti", "CREA Menù" |
| `js/off-integration.js` | Ricerca e scansione barcode su Open Food Facts, usato dal form Dispensa |
| `data/crea-alimenti.json` | Banca dati CREA "slim" (900 alimenti, 7 valori nutrizionali) — ricerca 🔎 su ingredienti/Dispensa |
| `data/crea-meta.json` | Metadati del dataset CREA slim (fonte, data di generazione) |
| `data/crea-alimenti-completo.json` | Profilo nutrizionale integrale (~129 proprietà/alimento) — usato dalla scheda "ℹ️" e da "CREA Alimenti" |
| `data/crea-nutrienti-schema.json` | Etichette italiane e unità di misura per la scheda completa |
| `data/crea-ricette.json` | Le 56 ricette ufficiali CREA — usato da "CREA Menù" e dall'importazione ricette CREA |
| `img/logo-clan-destino.png` | Logo mostrato in fondo alla barra laterale (il logo nei PDF esportati è incorporato direttamente in `js/app.js`, non dipende da questo file) |
| `manifest.json` | Rende il sito installabile come app sullo smartphone ("Aggiungi a Home") — nome, colori e icone usate una volta installato |
| `img/icon-192.png`, `img/icon-512.png` | Icona dell'app una volta installata (Android/desktop) |
| `img/icon-maskable-192.png`, `img/icon-maskable-512.png` | Variante dell'icona per gli "adaptive icon" di Android (sfondo pieno, senza angoli arrotondati propri) |
| `img/apple-touch-icon.png` | Icona mostrata sulla schermata Home di iPhone/iPad |
| `img/favicon-32.png`, `img/favicon-16.png` | Icona mostrata nella scheda del browser |

## Facoltativi (il sito funziona anche senza, ma mancano informazioni)

| File | A cosa serve |
|---|---|
| `README.md` | Presentazione del progetto (per chi visita il repository) |
| `GUIDA.md` | Istruzioni dettagliate per ogni funzione |
| `CHANGELOG.md` | Cronologia delle versioni |
| `MANIFEST.md` | Questo file |
| `LICENSE` | Licenza MIT del progetto, con nota sui termini dei dati nutrizionali CREA |

## Non necessari al sito pubblicato (solo per rigenerare i dati, se serve)

| File/cartella | A cosa serve |
|---|---|
| `scripts/build_crea_data.py` | Rigenera `crea-alimenti.json` + `crea-meta.json` dal CSV CREA originale |
| `scripts/build_crea_completo.py` | Rigenera `crea-alimenti-completo.json`, `crea-nutrienti-schema.json`, `crea-ricette.json` |
| `source-data/` (se presente) | Dataset grezzo scaricato da Kaggle, tenuto solo per poter rigenerare i dati in futuro |
| `tests/` | Suite di test automatici (Playwright) che verifica in un vero browser i flussi principali: ricette, dispensa, pianificazione/spesa, archiviazione/allergeni, menu mobile/modalità cucina. Vedi `tests/README.md` per come lanciarla. Non serve al sito pubblicato, solo a chi sviluppa |

## Come usarlo

Quando ricevi una modifica da Claude, controlla la sezione **"File essenziali"** qui sopra: se la consegna include uno di quei file, sostituiscilo *tutto*, non solo `index.html`. Se in futuro si aggiungono o cambiano file (una nuova integrazione, un nuovo script), questo elenco verrà aggiornato di conseguenza — la versione in cima al file dice sempre a quale versione del sito corrisponde.
