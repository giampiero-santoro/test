# 📖 Il Mio Ricettario

Un ricettario personale, digitale e privato, per organizzare le tue ricette da qualsiasi fonte. Nessun account, nessun server, nessun abbonamento: tutto resta sul tuo dispositivo.

## ✨ Caratteristiche

- **Passaggi con impostazioni robot facoltative**: scrivi ogni passaggio in modo normale; se usi un robot da cucina puoi aggiungere velocità, temperatura, tempo e modalità (Normale/Reverse/Turbo/Vapore) solo dove ti serve
- **Passaggi con impostazioni pentola a pressione facoltative**: pressione (con l'unità che preferisci: Bar, PSI o kPa), tipo di rilascio, durata del rilascio con timer dedicato e liquido minimo richiesto; le ricette che le usano si riconoscono da un'etichetta 🍲 automatica
- **Valori nutrizionali della ricetta facoltativi** (Kcal, proteine, grassi, carboidrati, fibre, zuccheri, sale), inseriti manualmente e sempre riferiti a una porzione. Non vengono calcolati sommando i valori degli ingredienti, perché la cottura può alterare peso e composizione del piatto.
- **Ingredienti duplicati**: se lo stesso ingrediente finisce per comparire due volte in una ricetta (stesso nome e unità), il ricettario te lo segnala al salvataggio e propone di unire le righe sommando le quantità
- **Importa ricette da testo**: incolla il testo o il sorgente di una pagina web e il ricettario prova a riconoscere automaticamente nome, ingredienti e passaggi (usa i dati strutturati della pagina quando disponibili), pronti da correggere prima di salvare
- **Porzioni scalabili**: apri una ricetta e ricalcola automaticamente le quantità con un semplice +/−
- **Categorie colorate**: Primi, Secondi, Zuppe & Vellutate, Impasti & Pane, Salse & Sughi, Dolci, Infusi & Tisane, Altro
- **Tag dietetici**: Vegetariano, Vegano, Senza glutine, Senza lattosio, Piccante — assegnabili e filtrabili
- **Ricerca, filtri e ordinamento**: per nome, ingrediente, categoria, tag dietetici, metodo di preparazione (pentola a pressione, robot, tradizionale) ed escludendo ingredienti che non vuoi usare; ordina per nome, data di aggiunta, ultima preparata o più preparate
- **"Cosa posso cucinare?"**: usa automaticamente i prodotti che hai in Dispensa (più eventuali altri ingredienti che scrivi a mano) e mostra subito quali ricette puoi fare
- **Duplica ricetta**: crea una copia di una ricetta già pronta in modifica, comoda per varianti senza riscrivere tutto da capo
- **Ricette preferite**: stellina per le ricette del cuore, con filtro dedicato
- **Cronologia di preparazione**: data dell'ultima volta e contatore di quante volte l'hai preparata
- **Foto per ricetta**, ridimensionata e compressa automaticamente per occupare meno spazio
- **Modalità cucina guidata**: schermo intero, un passaggio alla volta, con timer integrato
- **Pianificazione settimanale in una vista dedicata**: più ricette (o prodotti dalla dispensa) per giorno, con giorni che partono vuoti e pasti aggiunti a piacere dal menu «Aggiungi pasto» (colazione, spuntino, pranzo, merenda, cena, aperitivo… quanti ne servono) con orario facoltativo per ciascuna
- **Dashboard "Oggi"**: all'apertura riassume i pasti pianificati, i prodotti da consumare entro tre giorni e la lista della spesa, con scorciatoie alle sezioni corrispondenti
- **Conferma consumo pasto**: segna un pasto pianificato come consumato e prova ad aggiornare automaticamente le quantità in Dispensa, cercando un prodotto con nome identico o, se manca, uno con nome simile ma solo quando è candidato un unico prodotto, e scalando la quantità solo dove l'unità di misura coincide; un "↺" accanto permette di annullare, ripristinando in Dispensa quanto era stato tolto
- **Lista della spesa scalabile**: genera la lista per l'intera settimana pianificata, per un singolo giorno o per una singola ricetta, con le quantità adattate al numero di persone (o alle porzioni) che indichi e sommate quando lo stesso ingrediente compare più volte; per la settimana segnala anche gli ingredienti di una ricetta appena pianificata che non risultano in Dispensa, con conferma prima di aggiungerli come promemoria alla lista; spuntare un ingrediente lo aggiunge (o ne aumenta la quantità) anche in Dispensa
- **Controllo incrociato con la Dispensa**: se un ingrediente della lista della spesa è già segnato in Dispensa (anche con un nome simile, es. "Farina" e "Farina 00", quando il prodotto candidato è uno solo) un avviso lo mostra e, quando l'unità di misura coincide o è convertibile automaticamente (g/kg, ml/cl/l), un tocco su "Sottrai dalla lista" — o su "Sottrai tutto" per l'intera lista in una volta — toglie la quantità già disponibile da quella da acquistare (o segnala che non serve comprarne altro, se basta già quella in Dispensa); un "Annulla" permette di tornare indietro
- **Esportazione PDF**: una singola ricetta, la lista della spesa (settimana, giorno o singola ricetta) oppure l'intera settimana pianificata insieme alla lista della spesa
- **Backup**: esporta tutto (ricette, pianificazione, fasce pasto) in un file JSON e reimportalo quando vuoi; le voci nuove si aggiungono sempre, per quelle già presenti (stesso identificativo) puoi scegliere se sostituirle con la versione importata o lasciarle come sono
- **Importa/esporta CSV**: scarica le tue ricette in un file `.csv` apribile in Excel/Fogli Google, oppure importa ricette da un file CSV con lo stesso formato — anche qui, per i nomi già presenti puoi scegliere se sostituirli
- **Dispensa**: una sezione separata per tenere traccia di tutto quello che hai in casa e può servire per una ricetta — non solo freschi (frutta, verdura, uova, salumi, latticini), ma anche surgelati, pasta e cereali, legumi, farine, conserve, spezie, oli, bevande, snack e altro — con quantità, soglia minima, valori nutrizionali e data di scadenza facoltativi; le scadenze vicine o passate e le quantità in esaurimento sono evidenziate, puoi cercare le ricette che usano prima ciò che scade entro tre giorni e ogni prodotto si può pianificare direttamente come pasto nella settimana
- **Salvataggio locale**: tutti i dati restano nel browser tramite `localStorage`, nessuna connessione richiesta; se lo spazio disponibile dovesse esaurirsi, un avviso te lo segnala invece di fallire in silenzio
- **Avviso modifiche non salvate**: se chiudi una ricetta o un prodotto Dispensa che stavi modificando (anche chiudendo la scheda del browser) senza aver salvato, un avviso te lo ricorda prima di buttare via il lavoro fatto

## 🚀 Come si usa

1. Pubblica la cartella su un normale spazio web (per esempio GitHub Pages) e apri il sito dal suo indirizzo. Per una prova locale usa un piccolo server web: `python3 -m http.server`.
2. Premi **"+ Nuova ricetta"** per scriverne una tua, oppure **"📋 Importa ricetta ▾"** per incollarla da un'altra fonte, oppure importarla da file
3. Clicca su una ricetta per vederla in dettaglio, scalare le porzioni e seguire i passaggi
4. Se vuoi, per ogni ricetta puoi inserire a mano i valori nutrizionali per porzione.
5. Usa il pannello **"Cosa posso cucinare?"** per trovare ricette in base a quello che hai già in Dispensa (più eventuali altri ingredienti che scrivi a mano), ed **"Escludi ingredienti"** per filtrare quello che non vuoi usare
6. Passa alla vista **"📅 Pianificazione"** per organizzare la settimana pasto per pasto e generare la lista della spesa
7. Passa alla vista **"🥫 Dispensa"** per tenere traccia di cosa hai in frigo e in cucina
9. Prima di cambiare browser o dispositivo, usa **"Esporta backup"** per salvare un file JSON con tutti i tuoi dati

Nessuna installazione richiesta: nessun build, nessuna dipendenza da installare — `index.html` con lo stile in `style.css` e gli script in `js/`. Consulta [GUIDA.md](GUIDA.md) per le istruzioni dettagliate su ogni funzione, [MANIFEST.md](MANIFEST.md) per l'elenco di tutti i file da tenere allineati quando aggiorni il sito, e [CHANGELOG.md](CHANGELOG.md) per la cronologia delle versioni.

## 🛠️ Tecnologie

- HTML, CSS, JavaScript vanilla (nessuna libreria esterna)
- `localStorage` per la persistenza dei dati
- Font DM Sans e Lora inclusi nell'app (SIL Open Font License), nessuna chiamata a Google
- Dati prodotti: [Open Food Facts](https://world.openfoodfacts.org) (ODbL / CC BY-SA), consultato solo quando usi la scansione o la ricerca prodotti in Dispensa

## 📌 Note

- I dati delle tue ricette, dispensa e pianificazione sono salvati solo nel browser in cui apri il file. Se cambi browser o dispositivo, non si sincronizzano automaticamente: usa la funzione di esportazione/importazione backup per trasferirli.
- Il riconoscimento automatico nell'importazione da testo è un aiuto, non una garanzia: controlla sempre i campi prima di salvare.
- Il formato CSV è pensato per uno scambio semplice (una riga per ricetta): per un backup completo con pianificazione e fasce pasto usa il backup JSON.

## 📄 Licenza e dati

I dettagli su fonti, licenze e privacy sono nella pagina «Note legali e crediti» dell'app (menu «Come funziona»).

---

*Progetto personale, nato come ricettario per un robot da cucina e diventato un ricettario generale per organizzare ricette da qualsiasi fonte.*
