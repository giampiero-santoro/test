# 📖 Il Mio Ricettario

Un ricettario personale, digitale e privato, per organizzare le tue ricette da qualsiasi fonte. Nessun account, nessun server, nessun abbonamento: tutto resta sul tuo dispositivo.

## ✨ Caratteristiche

- **Passaggi con impostazioni robot facoltative**: scrivi ogni passaggio in modo normale; se usi un robot da cucina puoi aggiungere velocità, temperatura, tempo e modalità (Normale/Reverse/Turbo/Vapore) solo dove ti serve
- **Passaggi con impostazioni pentola a pressione facoltative**: pressione (con l'unità che preferisci: Bar, PSI o kPa), tipo di rilascio, durata del rilascio con timer dedicato e liquido minimo richiesto; le ricette che le usano si riconoscono da un'etichetta 🍲 automatica
- **Valori nutrizionali della ricetta facoltativi** (Kcal, proteine, grassi, carboidrati, fibre, zuccheri, sale), inseriti manualmente e sempre riferiti a una porzione. Non vengono calcolati sommando i valori degli ingredienti, perché la cottura può alterare peso e composizione del piatto.
- **Banca dati nutrizionale CREA integrata**: cerca un alimento tra i 900 della banca dati ufficiale del Centro di ricerca Alimenti e Nutrizione (CREA) direttamente dagli ingredienti o dai prodotti in Dispensa. Per ogni alimento collegato è disponibile una scheda completa con tutte le proprietà misurate dalla fonte (zuccheri singoli, minerali, vitamine, acidi grassi, aminoacidi e altri composti). I valori ufficiali delle ricette CREA restano riferiti al piatto finito e sono mostrati con la loro fonte.
- **🌾 CREA Alimenti**: una vista dedicata per sfogliare/cercare liberamente tutti i 900 alimenti della banca dati CREA, per categoria o per nome, con accesso diretto alla scheda nutrizionale completa di ciascuno — utile anche solo per consultazione, senza dover per forza essere dentro una ricetta
- **🇮🇹 CREA Menù**: una vista dedicata con le 56 ricette ufficiali CREA (Pizza Napoletana STG, Ragù alla bolognese, Falafel, Hummus, Cannoli siciliani...), sfogliabili con ricerca e filtro per categoria; ogni ricetta mostra ingredienti, preparazione e valori nutrizionali ufficiali del piatto finito, con un pulsante per importarla nel tuo Ricettario quando vuoi tenerla
- **Ingredienti duplicati**: se lo stesso ingrediente finisce per comparire due volte in una ricetta (stesso nome e unità), il ricettario te lo segnala al salvataggio e propone di unire le righe sommando le quantità
- **Importa ricette da testo**: incolla il testo o il sorgente di una pagina web e il ricettario prova a riconoscere automaticamente nome, ingredienti e passaggi (usa i dati strutturati della pagina quando disponibili), pronti da correggere prima di salvare
- **Importa ricette ufficiali CREA**: dallo stesso menu di importazione, scegli tra le 56 ricette CREA e aggiungile alla tua raccolta con un clic — categoria e porzioni assegnate automaticamente, sempre correggibili come qualunque altra ricetta
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
- **Pianificazione settimanale in una vista dedicata**: più ricette (o prodotti dalla dispensa) per giorno, organizzate in fasce personalizzabili (colazione, pranzo, cena, spuntino o quelle che preferisci) con orario facoltativo per ciascuna
- **Dashboard "Oggi"**: all'apertura riassume i pasti pianificati, i prodotti da consumare entro tre giorni e la lista della spesa, con scorciatoie alle sezioni corrispondenti
- **Conferma consumo pasto**: segna un pasto pianificato come consumato e prova ad aggiornare automaticamente le quantità in Dispensa, cercando un prodotto con nome identico o, se manca, uno con nome simile ma solo quando è candidato un unico prodotto, e scalando la quantità solo dove l'unità di misura coincide; un "↺" accanto permette di annullare, ripristinando in Dispensa quanto era stato tolto
- **Lista della spesa scalabile**: genera la lista per l'intera settimana pianificata, per un singolo giorno o per una singola ricetta, con le quantità adattate al numero di persone (o alle porzioni) che indichi e sommate quando lo stesso ingrediente compare più volte; per la settimana segnala anche gli ingredienti di una ricetta appena pianificata che non risultano in Dispensa, con conferma prima di aggiungerli come promemoria alla lista; spuntare un ingrediente lo aggiunge (o ne aumenta la quantità) anche in Dispensa
- **Controllo incrociato con la Dispensa**: se un ingrediente della lista della spesa è già segnato in Dispensa (anche con un nome simile, es. "Farina" e "Farina 00", quando il prodotto candidato è uno solo) un avviso lo mostra e, quando l'unità di misura coincide o è convertibile automaticamente (g/kg, ml/cl/l), un tocco su "Sottrai dalla lista" — o su "Sottrai tutto" per l'intera lista in una volta — toglie la quantità già disponibile da quella da acquistare (o segnala che non serve comprarne altro, se basta già quella in Dispensa); un "Annulla" permette di tornare indietro
- **Esportazione PDF**: una singola ricetta, la lista della spesa (settimana, giorno o singola ricetta) oppure l'intera settimana pianificata insieme alla lista della spesa
- **Backup**: esporta tutto (ricette, pianificazione, fasce pasto) in un file JSON e reimportalo quando vuoi; le voci nuove si aggiungono sempre, per quelle già presenti (stesso identificativo) puoi scegliere se sostituirle con la versione importata o lasciarle come sono
- **Importa/esporta CSV**: scarica le tue ricette in un file `.csv` apribile in Excel/Fogli Google, oppure importa ricette da un file CSV con lo stesso formato — anche qui, per i nomi già presenti puoi scegliere se sostituirli
- **Dispensa**: una sezione separata per tenere traccia di tutto quello che hai in casa e può servire per una ricetta — non solo freschi (frutta, verdura, uova, salumi, latticini), ma anche surgelati, pasta e cereali, legumi, farine, conserve, spezie, oli, bevande, snack e altro — con quantità, soglia minima, valori nutrizionali (anche qui recuperabili dalla banca dati CREA) e data di scadenza facoltativi; le scadenze vicine o passate e le quantità in esaurimento sono evidenziate, puoi cercare le ricette che usano prima ciò che scade entro tre giorni e ogni prodotto si può pianificare direttamente come pasto nella settimana
- **Salvataggio locale**: tutti i dati restano nel browser tramite `localStorage`, nessuna connessione richiesta; se lo spazio disponibile dovesse esaurirsi, un avviso te lo segnala invece di fallire in silenzio
- **Avviso modifiche non salvate**: se chiudi una ricetta o un prodotto Dispensa che stavi modificando (anche chiudendo la scheda del browser) senza aver salvato, un avviso te lo ricorda prima di buttare via il lavoro fatto

## 🚀 Come si usa

1. Pubblica la cartella su un normale spazio web (per esempio GitHub Pages) e apri il sito dal suo indirizzo. Per una prova locale usa un piccolo server web: l'apertura diretta di `index.html` può impedire il caricamento dei file CREA in alcuni browser.
2. Premi **"+ Nuova ricetta"** per scriverne una tua, oppure **"📋 Importa ricetta ▾"** per incollarla da un'altra fonte, importarla da file o scegliere tra le ricette ufficiali CREA
3. Clicca su una ricetta per vederla in dettaglio, scalare le porzioni e seguire i passaggi
4. Mentre scrivi gli ingredienti, usa **"🔎 Cerca su CREA"** e **"ℹ️"** per consultare e collegare la scheda completa dell'alimento. I valori della ricetta, se disponibili, vanno inseriti o importati da una fonte riferita al piatto finito: non sono calcolati dagli ingredienti.
5. Usa il pannello **"Cosa posso cucinare?"** per trovare ricette in base a quello che hai già in Dispensa (più eventuali altri ingredienti che scrivi a mano), ed **"Escludi ingredienti"** per filtrare quello che non vuoi usare
6. Passa alla vista **"📅 Pianificazione"** per organizzare la settimana pasto per pasto e generare la lista della spesa
7. Passa alla vista **"🥫 Dispensa"** per tenere traccia di cosa hai in frigo e in cucina (anche qui con ricerca CREA per i valori nutrizionali)
8. Esplora **"🌾 CREA Alimenti"** e **"🇮🇹 CREA Menù"** per consultare liberamente la banca dati e le ricette ufficiali CREA, indipendentemente dalle tue ricette
9. Prima di cambiare browser o dispositivo, usa **"Esporta backup"** per salvare un file JSON con tutti i tuoi dati

Nessuna installazione richiesta: nessun build, nessuna dipendenza da installare — `index.html` con lo stile in `style.css` e gli script in `js/`, più i file dati della banca dati CREA in `data/`. Consulta [GUIDA.md](GUIDA.md) per le istruzioni dettagliate su ogni funzione, [MANIFEST.md](MANIFEST.md) per l'elenco di tutti i file da tenere allineati quando aggiorni il sito, e [CHANGELOG.md](CHANGELOG.md) per la cronologia delle versioni.

## 🛠️ Tecnologie

- HTML, CSS, JavaScript vanilla (nessuna libreria esterna)
- `localStorage` per la persistenza dei dati
- Font Google: Cormorant Garamond e Crimson Pro
- Banca dati nutrizionale: [CREA](https://www.alimentinutrizione.it) — Centro di ricerca Alimenti e Nutrizione (Consiglio per la ricerca in agricoltura e l'analisi dell'economia agraria), tramite il dataset ["CREA Food Composition Tables"](https://www.kaggle.com/datasets/andreal2000/crea-food-composition-tables) su Kaggle

## 📌 Note

- I dati delle tue ricette, dispensa e pianificazione sono salvati solo nel browser in cui apri il file. Se cambi browser o dispositivo, non si sincronizzano automaticamente: usa la funzione di esportazione/importazione backup per trasferirli.
- Il riconoscimento automatico nell'importazione da testo è un aiuto, non una garanzia: controlla sempre i campi prima di salvare.
- Il formato CSV è pensato per uno scambio semplice (una riga per ricetta): per un backup completo con pianificazione e fasce pasto usa il backup JSON.
- I valori nutrizionali CREA sono forniti per 100 g di parte edibile, così come pubblicati dalla fonte ufficiale; le categorie e le porzioni assegnate automaticamente alle ricette importate sono un'euristica e vanno verificate.

## 📄 Licenza e dati

I dati nutrizionali CREA restano soggetti ai termini della fonte originale (alimentinutrizione.it) e del dataset Kaggle da cui sono stati derivati. Prima di distribuire pubblicamente il progetto, aggiungi un file di licenza che esprima le condizioni desiderate.

---

*Progetto personale, nato come ricettario per un robot da cucina e diventato un ricettario generale per organizzare ricette da qualsiasi fonte, con la banca dati nutrizionale ufficiale CREA integrata.*
