# Pressione in Cucina

Sito statico in italiano dedicato a ricette per Instant Pot, multicooker a pressione e pentole a pressione tradizionali. Pensato per GitHub Pages: non richiede build, server o registrazione.

## Avvio

Aprire `index.html` nel browser oppure pubblicare l'intera cartella su un repository GitHub Pages. I file sono relativi e non richiedono framework. I caratteri tipografici Google sono un miglioramento facoltativo; se non disponibili, il sito usa font di sistema.

## Funzioni incluse

- Archivio ricette dimostrative con filtri per ricerca, categoria, difficoltà e apparecchio.
- Inserimento, modifica e salvataggio locale delle ricette.
- Preferiti.
- Modalità passo-passo durante la preparazione.
- Guide per principianti, trucchi per problemi comuni e tabella di riferimento.
- Backup JSON ed importazione con validazione preliminare.
- Esportazione di una ricetta in formato compatibile con il backup di **Il Mio Ricettario** e, facoltativamente, di una voce di pianificazione giornaliera.

## Collegamento con Il Mio Ricettario

Il progetto è stato predisposto prendendo come riferimento l'archivio `il-mio-ricettario-v5_46_0-pdf-diretto.zip`. Il sito principale non viene modificato da questo progetto.

Per trasferire una ricetta:

1. Aprire la ricetta in Pressione in Cucina e scegliere **Prepara per Il Mio Ricettario**.
2. Selezionare la ricetta e, facoltativamente, la data, il pasto e l'orario.
3. Scaricare il file JSON.
4. Prima di importarlo nel ricettario principale, eseguire un backup aggiornato del ricettario.
5. Aprire Il Mio Ricettario e usare la sua funzione di importazione del backup JSON. Controllare la destinazione proposta e verificare la ricetta e il piano dopo l'importazione.

Il pacchetto usa la struttura `recipes` con campi compatibili con la struttura osservata nella versione 5.46.0. Se viene inclusa la pianificazione, usa `planWeeks` indicizzato dalla data del lunedì, con i giorni in italiano e voci `{id, recipeId, mealType, time}`. L'importatore del sito principale ha mostrato di unire ricette nuove e settimane pianificate; tuttavia, poiché il ricettario principale è in fase di modifica, il comportamento va verificato sulla versione aggiornata prima di affidargli dati importanti. Non è prevista scrittura diretta in `localStorage` del sito principale, per evitare modifiche silenziose e conflitti con le tue correzioni in corso.

### Limiti del trasferimento

- Il trasferimento avviene tramite file JSON, non in tempo reale.
- Le proprietà specifiche della pentola (programma, pressione, rilascio, fonte e verifica) vengono conservate nelle note della ricetta importata, perché il modello del ricettario principale non ha campi dedicati a tutti questi parametri.
- Il formato di importazione può cambiare nelle versioni future. Prova sempre prima con una copia/backup.
- Le ricette dimostrative hanno tempi e parametri segnalati come da verificare: non usarli come istruzioni universali. Verifica modello, manuale, quantità di liquido, riempimento e rilascio.

## Dati e privacy

Le ricette e i preferiti sono salvati in `localStorage` sul browser corrente. Non vengono sincronizzati automaticamente tra dispositivi. Esporta regolarmente un backup JSON.

## Test

- `node --check js/app.js` verifica la sintassi JavaScript.
- `python3 tests/smoke_test.py` verifica la presenza dei componenti principali e alcuni contratti di integrazione statici.
- Il progetto non dichiara superati test browser end-to-end se non sono stati eseguiti in un browser reale.
