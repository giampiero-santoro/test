# Test automatici — Il Mio Ricettario

Suite di test end-to-end che apre l'app in un vero browser (Chromium, via
[Playwright](https://playwright.dev/)) e simula un utente reale: crea,
modifica ed elimina ricette e prodotti in dispensa, pianifica la settimana,
genera la lista della spesa, usa la modalità cucina, archivia ricette, apre
e chiude il menu ☰ su schermo piccolo, ecc.

Non serve alcun server esterno, account o connessione a Internet (a parte
il download iniziale di Chromium): tutto gira in locale sui file del
progetto.

## Perché non pytest

Il progetto non ha `package.json` né altri strumenti di build: per
restare coerenti, anche i test non richiedono una dipendenza in più oltre
a Playwright stesso. Ogni file `test_NN_descrizione.py` espone una
funzione `async def run(page)`; `run_all.py` li scopre ed esegue in
ordine, stampando un riepilogo finale OK/FALLITO.

## Installazione (una tantum)

```bash
pip install playwright --break-system-packages
python3 -m playwright install chromium --with-deps
```

## Esecuzione

Dalla cartella `tests/`:

```bash
python3 run_all.py
```

Lo script avvia da solo un piccolo server HTTP locale sui file del
progetto (la cartella sopra `tests/`), esegue tutti i test in sequenza in
Chromium headless (senza finestra visibile) e lo richiude al termine.

Opzioni utili:

```bash
python3 run_all.py --headed                        # mostra il browser mentre i test girano
python3 run_all.py --base-url http://localhost:8000 # usa un server già avviato, invece di aprirne uno nuovo
```

In uscita, il codice di ritorno è `0` se tutti i test sono passati, `1`
altrimenti (utile per integrarlo in futuro in una pipeline CI, se mai se
ne aggiungesse una).

## Cosa copre la suite

| File | Verifica |
|---|---|
| `test_01_recipes_crud.py` | Creazione, modifica, visualizzazione ed eliminazione di una ricetta (passando dal modale di conferma) |
| `test_02_dispensa_crud.py` | Creazione prodotto dispensa, soglia scorte minime, badge e filtro "in esaurimento", eliminazione |
| `test_03_planning_units_shopping.py` | Flusso pianificazione → lista della spesa: conversione unità di misura (kg↔g) fra dispensa e ricetta, raggruppamento per reparto, persistenza delle spunte |
| `test_04_archivio_allergeni_congelamento.py` | Tag allergeni nella scheda ricetta, suggerimento "si congela bene" + raddoppio porzioni, archiviazione/recupero di una ricetta |
| `test_05_mobile_nav_cucina_conferme.py` | Apertura/chiusura del menu ☰ su viewport mobile, modalità cucina guidata (avanti/indietro fra i passaggi), modale di conferma annullato (Annulla non elimina nulla) |

`helpers.py` contiene le funzioni condivise (apertura pagina pulita,
chiusura dell'overlay di scelta salvataggio, reset dello stato,
conferma/annulla del modale).

## Aggiungere un nuovo test

1. Crea `tests/test_NN_descrizione.py` con una funzione `async def
   run(page)` che usa `from helpers import check, reset_app_state, ...`.
2. Usa `check(condizione, "messaggio se fallisce")` per le verifiche: se la
   condizione è falsa il test si interrompe e viene segnato come FALLITO
   con quel messaggio.
3. Aggiungi il nome del modulo (senza `.py`) alla lista `TEST_MODULES` in
   `run_all.py`, nell'ordine in cui vuoi che giri.
4. Chiudi ogni test con `check(not page.collected_errors, ...)` per
   assicurarti che non siano comparsi errori imprevisti in console.

## Nota su `showSaveFilePicker`

`helpers.new_page()` disabilita `window.showSaveFilePicker` prima di ogni
test: in Chromium headless il selettore nativo di salvataggio file resta
bloccato in attesa di un'interazione che non può arrivare, quindi i test
forzano il percorso alternativo con `<a download>` (quello usato
automaticamente anche nei browser che non supportano la File System
Access API).
