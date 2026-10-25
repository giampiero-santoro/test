# Manifest dei file

Elenco di tutti i file che devono essere caricati insieme su GitHub perché il sito funzioni correttamente. Non tiene uno storico delle versioni precedenti — la cronologia delle modifiche è già in [CHANGELOG.md](CHANGELOG.md); questo file mostra solo **la situazione attuale**, e va sovrascritto ogni volta che cambia l'elenco dei file coinvolti.

**Versione corrente: 5.47.0**

## File essenziali (senza uno di questi il sito non parte, o parte con funzioni mancanti)

| File | A cosa serve |
|---|---|
| `index.html` | La struttura delle pagine del sito |
| `guida.html` | Guida illustrata con screenshot (aperta dall'icona ? e dalla scheda in «Oggi»; contiene le immagini al suo interno) |
| `style.css` | Tutto lo stile grafico del sito (barra laterale, card, i sei temi di colore) |
| `css/bulma.css`, `css/LICENSE-bulma-MIT.txt` | Parti del framework Bulma 1.0 (prefisso `bulma-`, licenza MIT) usate in locale per colori dei temi e alcuni componenti |
| `js/app.js` | Tutta la logica dell'app (ricette, dispensa, pianificazione, lista spesa, backup, temi) |
| `js/off-integration.js` | Ricerca e scansione barcode su Open Food Facts, usato dal form Dispensa |
| `img/logo-clan-destino.png` | Logo mostrato in fondo alla barra laterale (il logo nei PDF esportati è incorporato direttamente in `js/app.js`, non dipende da questo file) |
| `sw.js` | Service worker: permette l'uso offline e l'installazione come app (cambia versione ad ogni release) |
| `manifest.json` | Rende il sito installabile come app sullo smartphone ("Aggiungi a Home") — nome, colori e icone usate una volta installato |
| `img/icon-192.png`, `img/icon-512.png` | Icona dell'app una volta installata (Android/desktop) |
| `img/icon-maskable-192.png`, `img/icon-maskable-512.png` | Variante dell'icona per gli "adaptive icon" di Android (sfondo pieno, senza angoli arrotondati propri) |
| `img/apple-touch-icon.png` | Icona mostrata sulla schermata Home di iPhone/iPad |
| `img/favicon-32.png`, `img/favicon-16.png` | Icona mostrata nella scheda del browser |

## Facoltativi (il sito funziona anche senza, ma mancano informazioni)

| File | A cosa serve |
|---|---|
| `README.md` | Presentazione del progetto (per chi visita il repository) |
| `PROTOCOLLO-pp-ricettario.md` | Formato del pacchetto che il ricettario accetta dal sito «Pentola a pressione» |
| `GUIDA.md` | Istruzioni dettagliate per ogni funzione |
| `CHANGELOG.md` | Cronologia delle versioni |
| `MANIFEST.md` | Questo file |

## Non necessari al sito pubblicato (solo per rigenerare i dati, se serve)

| File/cartella | A cosa serve |
|---|---|
| `tests/` | Suite di test automatici (Playwright) che verifica in un vero browser i flussi principali: ricette, dispensa, pianificazione/spesa, archiviazione/allergeni, menu mobile/modalità cucina. Vedi `tests/README.md` per come lanciarla. Non serve al sito pubblicato, solo a chi sviluppa |

## Come usarlo

Quando ricevi una modifica da Claude, controlla la sezione **"File essenziali"** qui sopra: se la consegna include uno di quei file, sostituiscilo *tutto*, non solo `index.html`. Se in futuro si aggiungono o cambiano file (una nuova integrazione, un nuovo script), questo elenco verrà aggiornato di conseguenza — la versione in cima al file dice sempre a quale versione del sito corrisponde.
