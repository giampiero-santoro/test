# Elenco delle modifiche

Tutte le novità dell'editor, raggruppate per argomento. L'ultimo aggiornamento è del 17 ottobre 2026.

## Aspetto e uso
- **Un solo tema, chiaro**: carta bianca, accento bordeaux, copione in carattere con le grazie. Rimossi gli altri stili e il tema scuro.
- **Struttura a tre pannelli** su schermi larghi: menu in alto (File, Analisi, Pubblicazione), barra strumenti, struttura a sinistra, pannello di destra con Personaggi, Note di regia e Dettagli scena, barra inferiore con larghezza del testo, interlinea e carattere. I pannelli laterali si possono nascondere.
- **Interlinea, larghezza del testo, carattere e zoom** ora riadattano subito l'altezza delle caselle di testo: nessuna riga viene più tagliata.
- **Albero della struttura** con atti comprimibili, icone, contatore di scene e indicatore di stato (bozza, da rivedere, definitiva).
- **Pagina iniziale** con il logo, la libreria dei copioni a scaffali e il riepilogo del copione aperto.
- **Icone coerenti** al posto delle emoji, avvisi e conferme nello stile dell'app, messaggi per gli stati vuoti, animazioni leggere.
- **Telefono**: barra di navigazione in basso, dettagli di scena in un riquadro richiudibile, esportazione nel pannello Strumenti.
- **Installabile come app** sulla schermata Home, con icona Clan Destino.
- **Accessibilità**: uso completo da tastiera, contorno di focus, etichette per i lettori di schermo, contrasti più alti, bersagli di tocco ampi, rispetto di «riduci movimento».

## Licenza
- Licenza **CC BY-NC-SA 4.0** (file `LICENSE`), con richiesta di mantenere nome e logo.
- Finestra **Informazioni e licenza** (menu File, strumenti da telefono, riga in fondo alla pagina iniziale) e avviso di copyright in testa a `index.html`.
- `THIRD_PARTY_LICENSES.md` con le licenze dei componenti incorporati (jsPDF, qrcodejs, caratteri).

## Offline
- **Librerie e caratteri incorporati** nel file: l'editor funziona senza internet, anche per creare PDF e QR code. Il file ora pesa circa 1,1 MB.
- **`sw.js` (facoltativo)**: permette di aprire anche il sito pubblicato senza connessione; avviso quando si perde e si ritrova la rete.

## Correzioni
- Il pulsante dello stato scena selezionato («Da rivedere» ecc.) ora è leggibile.
- Campi e pulsanti delle finestre (Cerca e sostituisci, Versioni, Impostazioni PDF, Importa testo) con lo stesso stile del resto dell'editor.
- Il confronto tra versioni si apre sopra l'elenco delle versioni.
- Sul copione vuoto non compaiono più i pulsanti Battuta, Didascalia, Fuori scena.
- Su schermi larghi meno di 1280 pixel il pannello di destra parte chiuso e il menu di sinistra è più stretto, così il foglio resta leggibile.
- Menu da telefono: prima la ricerca e l'albero (o i personaggi), poi gli strumenti; tolte le statistiche, già presenti nella pagina iniziale.
- Singolare e plurale corretti («1 minuto stimato», «1 blocco», «1 scena»).

## Personaggi
- Nuovo elenco con cerchi colorati e ruolo; scheda con tre sezioni (Scheda, Relazioni, Note) modificabile direttamente.
- Con molti personaggi la scheda occupa tutto il pannello: si passa dall'elenco alla scheda e viceversa, con frecce per scorrere i personaggi e `Esc` per tornare indietro.

## Libreria e dati
- **Più copioni** nella libreria: aprire, duplicare, eliminare, cercare, ordinare.
- **Versioni separate per ogni copione.**
- **Backup di tutta la libreria** in un solo file, ripristino senza duplicati, promemoria settimanale.
- **Avviso se il copione è aperto in due schede**, con salvataggio in pausa per non sovrascrivere.
- **Archivio di riserva** nel browser per copioni molto lunghi o quando manca spazio.

## Importare ed esportare
- Importazione ed esportazione in **`.fountain`** e **`.json`**, anche di più copioni insieme.
- **Copertina del PDF con il logo** (si può disattivare nelle Impostazioni PDF).

## Strumenti per le prove
- **Modalità studio**: nasconde le battute di un personaggio, con suggerimento a iniziali e rivelazione a tocco.
- **Lettura a voce delle battute degli assenti**, raggiungibile dal pannello Dettagli scena.

## Prestazioni
- Il numero di passi di Annulla si adatta alla lunghezza del copione per non riempire la memoria.
- Salvataggi più leggeri e lavori non urgenti rimandati ai tempi morti.
