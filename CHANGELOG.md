# Changelog

Tutte le modifiche rilevanti al progetto sono documentate in questo file.

## [4.1.3] — Passaggi separati per le ricette importate da CREA

### Corretto
- Importando una ricetta da CREA (sia dalla lista "CREA Menù" sia dal pulsante "Importa nel Ricettario" nel dettaglio di una ricetta CREA), il procedimento arrivava come un unico passaggio enorme con tutto il testo attaccato. Ora viene suddiviso automaticamente in più passaggi numerati, uno per ogni frase del testo originale, così come appaiono nel sito CREA.

## [4.1.2] — Il contenuto ora riempie tutta la pagina

### Corretto
- Il pannello principale ("il libro") aveva una larghezza massima fissa (1180px) che risaliva al vecchio tema: su schermi larghi lasciava una fascia vuota a destra invece di usare tutto lo spazio disponibile, ad esempio nella griglia delle ricette. Ora il pannello occupa sempre tutta la larghezza della pagina; solo i testi lunghi di "Come funziona" restano a una larghezza comoda da leggere, invece di stirarsi per tutto lo schermo.

## [4.1.1] — Ricerca senza distinzione di accenti

### Corretto
- La ricerca di ricette e prodotti Dispensa (compresi i tre selettori usati in Pianificazione: cerca ricetta, cerca prodotto, "Cosa posso cucinare?" con prodotti dalla dispensa) ora ignora gli accenti, come già faceva la ricerca sugli alimenti CREA. Cercare "caffe" trova anche "Caffè", "perche" trova "perché", ecc.

## [4.1.0] — Accessibilità e barra laterale su tablet

### Aggiunto
- **Navigazione da tastiera**: le card di ricette e prodotti Dispensa (e le righe nei selettori di ricetta/prodotto) ora si raggiungono con Tab e si aprono con Invio o Spazio, non solo con il click del mouse
- **Contorno di messa a fuoco coerente** su tutti gli elementi interattivi (bottoni, link, campi, card) quando si naviga da tastiera, sia in tema chiaro sia scuro
- **Barra laterale "a sole icone" su tablet** (schermi tra 761px e 1000px, anche in orizzontale): invece di restare larga 252px togliendo spazio al contenuto, si restringe a una colonna di sole icone con il nome di ogni voce disponibile al passaggio del mouse e per chi usa un lettore di schermo. Sotto i 760px resta il cassetto a comparsa di prima, sopra i 1000px resta la barra larga con le etichette

## [4.0.2] — Altre due correzioni dalla nuova veste grafica

### Corretto
- **Modalità cucina**: lo sfondo era rimasto un gradiente marrone della veste precedente e il testo del passaggio quasi invisibile (colore chiaro/scuro che si invertiva con il tema, finendo a volte scuro su sfondo scuro). Ora la modalità cucina ha un proprio sfondo scuro fisso e testo sempre chiaro, leggibile con qualunque tema scelto per il resto del sito — comodo visto che in cucina può restare accesa a schermo intero anche con le mani sporche
- **Checkbox "Si congela bene"** nel modulo ricetta: veniva allargata al 100% della larghezza del campo, spingendo il testo dell'etichetta a capo sotto invece che restare accanto al quadratino

## [4.0.1] — Correzione tema scuro

### Corretto
- La scheda di una ricetta (e qualche altro pannello: menu a tendina, card del giorno in Pianificazione, badge di tempo/impostazioni robot) aveva ancora uno sfondo chiaro fisso ereditato dalla veste precedente: con il tema scuro attivo risultava quasi illeggibile. Ora segue correttamente il tema scelto

## [4.0.0] — Nuova veste grafica: barra laterale e tema chiaro/scuro

### Cambiato
- **Navigazione spostata in una barra laterale** a sinistra, sempre visibile su schermo grande, con marchio in cima e interruttore del tema in fondo. Su telefono diventa un cassetto a comparsa aperto dal pulsante **"☰"** in una barra sottile sempre in vista, con uno sfondo scurito dietro per chiuderlo toccando fuori
- **Nuova barra in cima al contenuto**, con la ricerca ricette sempre a portata di mano, una campanella **🔔** con il conteggio di prodotti in esaurimento/scadenza in Dispensa (porta dritto in Dispensa) e una scorciatoia **🧑‍🍳** verso "Come funziona"
- I **5 temi grafici** (Originale, Mediterranea, Bosco d'autunno, Trattoria moderna, Cantina) sono sostituiti da un'unica veste chiara e luminosa, in stile "pannello di controllo", con un solo interruttore **"🌙 Tema scuro"** per passare alla variante scura. Tipografia sans-serif (Inter) al posto dei font decorativi
- Le card delle ricette, i pannelli e i pulsanti hanno una nuova resa "a scheda": sfondo bianco (o grigio scuro in tema scuro), bordi sottili, ombre leggere, accento blu al posto dell'oro
- La vista **"☀️ Oggi"** si aggiorna alla nuova veste e guadagna quattro scorciatoie colorate verso "Cosa posso cucinare?", Dispensa, Lista della spesa e Pianificazione, oltre alle tre card già esistenti (pasti di oggi, scadenze, lista della spesa)

## [3.46.0] — Rifinitura visiva

### Aggiunto
- Le card delle ricette **senza foto** mostrano ora un'illustrazione al posto del vuoto: un riquadro sfumato nel colore della categoria con un piccolo simbolo (🍝 Primi, 🍖 Secondi, 🥣 Zuppe, 🍞 Impasti & Pane, 🫙 Salse & Sughi, 🍰 Dolci, 🍵 Infusi & Tisane, 🍽️ Altro), così l'elenco resta curato anche prima di aver caricato immagini
- La stellina dei preferiti nelle card ha ora un piccolo sfondo scuro semitrasparente, per restare leggibile sopra qualunque foto o colore
- Due piccoli angoli dorati sul pannello principale ("il libro"), come su una pagina miniata
- Grana sottilissima sullo sfondo della pagina, per una resa meno piatta
- Un piccolo simbolo ✦ sopra i messaggi "nessun risultato" (elenco ricette e dispensa vuoti)

## [3.45.0] — Suite di test automatici

### Aggiunto
- Nuova cartella `tests/` con una **suite di test automatici permanente** (Playwright), che sostituisce gli script usa-e-getta scritti ad ogni modifica durante lo sviluppo: apre l'app in un vero browser e verifica da zero i flussi principali — CRUD ricette, CRUD dispensa con soglia scorte minime, pianificazione → lista della spesa (conversione unità, raggruppamento per reparto, persistenza delle spunte), allergeni e suggerimento congelamento/porzione doppia, archiviazione e recupero ricette, menu ☰ di navigazione mobile, modalità cucina guidata, annullamento del modale di conferma
- `tests/run_all.py` esegue tutti i test in sequenza e stampa un riepilogo OK/FALLITO; avvia da solo un server locale sui file del progetto, non serve altro
- `tests/README.md` spiega come installare Playwright, lanciare la suite e aggiungere nuovi test in futuro

## [3.44.0] — Esportazione PDF di tutto il ricettario

### Aggiunto
- Nuova voce **"📖 Esporta tutto il ricettario (PDF)"** nel menu "📦 Backup e CSV": genera un unico file PDF con un indice iniziale e tutte le ricette, una per pagina, con lo stesso dettaglio (ingredienti, passaggi, valori nutrizionali, note) dell'esportazione di una singola ricetta. Le ricette archiviate restano escluse

## [3.43.0] — Ritaglio e rotazione della foto ricetta

### Aggiunto
- Appena scelta una foto per una ricetta, si apre ora un piccolo editor per **ritagliarla e ruotarla** prima di salvarla: un riquadro trascinabile e ridimensionabile sceglie l'area da mantenere, un pulsante **"⟲ Ruota"** gira l'immagine di 90° ad ogni tocco, e **"Reimposta"** torna all'originale. Funziona anche su una foto già salvata, tramite il nuovo pulsante **"✂️ Ritaglia/ruota"** accanto all'anteprima nel modulo di modifica. Nessuna libreria esterna: tutto fatto con canvas e gesti di trascinamento, compatibile anche su schermo touch

## [3.42.0] — Flusso Pianificazione/Dispensa/Spesa più lineare

### Aggiunto
- Scorciatoie dirette tra **Pianificazione** e **Dispensa**: un pulsante in ciascuna delle due viste porta subito all'altra, senza passare dal menu di navigazione in alto
- Accanto a **"🛒 Lista della spesa (settimana)"** compare ora un piccolo numero con quante voci ci sarebbero già da comprare, calcolato in automatico
- Nella lista della spesa, dopo aver spuntato un ingrediente e aggiornato la Dispensa, l'avviso di conferma include un link **"Vedi Dispensa →"** per passare subito a controllarla

### Risolto
- Cambiare **"Per quante persone stai pianificando?"** ora aggiorna subito i totali nutrizionali per pasto/giorno nella vista Pianificazione, invece di restare fermo al valore precedente fino al cambio di giorno

## [3.41.0] — Menu di navigazione ☰ su schermo piccolo

### Aggiunto
- Sotto i 760px di larghezza, la fila di 7 pulsanti di navigazione (uno piuttosto lungo: "🌾 Valori Alimenti dal sito CREA") viene sostituita da un pulsante **"☰"** che apre un menu a tendina con le stesse destinazioni, impilate e con un'area di tocco più generosa, invece di restare sempre visibile occupando molto spazio verticale sullo schermo del telefono. Il pulsante mostra sempre la vista in cui ti trovi, il menu si chiude da solo dopo aver scelto una voce, toccando fuori, o con il tasto Esc
- Verificata l'assenza di scorrimento orizzontale indesiderato su schermi stretti (360px) nelle viste principali e nel modulo ricetta

## [3.40.0] — Unità di misura uniformate

### Aggiunto
- I campi "Unità" (ricette, Dispensa, lista della spesa) propongono ora un menu a tendina con le unità più comuni (g, kg, ml, l, pz, cucchiaio/cucchiai, cucchiaino/cucchiaini, pizzico, tazza, fetta, spicchio, rametto, filetto, foglia), restando comunque testo libero

### Modificato
- Il sito ora riconosce come equivalenti le forme diverse della stessa unità (es. "g"/"grammi", "kg"/"g" con la conversione corretta, "cucchiaio"/"cucchiai"), e questo migliora diversi punti in cui prima un'unità scritta diversamente spezzava il confronto:
  - la **lista della spesa** ora somma in un'unica riga lo stesso ingrediente usato con unità diverse ma equivalenti in più ricette, invece di sdoppiarlo
  - spuntare un ingrediente della lista della spesa **aggiorna la Dispensa** sommando correttamente anche tra unità equivalenti diverse
  - segnare un pasto come **"consumato"** scala ora la Dispensa convertendo l'unità, invece di saltare l'aggiornamento per una differenza solo di scrittura

## [3.39.0] — Suggerimento porzione doppia/congelabile

### Aggiunto
- Nuova spunta **"❄️ Si congela bene"** nel modulo di modifica. Quando è attiva, nella vista della ricetta compare un avviso con il pulsante **"👯 Raddoppia le porzioni"**, che ricalcola subito le quantità per il doppio delle porzioni — comodo per preparare una porzione extra da congelare senza fare i conti a mano

## [3.38.0] — Allergeni distinti dai tag e archivio ricette

### Aggiunto
- Nuova sezione **"Allergeni contenuti"** nel modulo di modifica, separata dai tag dietetici: i 14 allergeni a dichiarazione obbligatoria nell'UE (Glutine, Crostacei, Uova, Pesce, Arachidi, Soia, Latte, Frutta a guscio, Sedano, Senape, Semi di sesamo, Anidride solforosa e solfiti, Lupini, Molluschi), selezionabili a mano. Compaiono nella scheda della ricetta come etichette rosse distinte dai tag, ed entrano anche nell'esportazione PDF e CSV
- Nuovo filtro nel pannello "Filtri" per **escludere dalla lista le ricette che contengono uno o più allergeni** scelti
- Possibilità di **archiviare una ricetta** ("📦 Archivia" nella vista) per nasconderla dall'elenco principale, dalla ricerca, dai filtri e da "Cosa posso cucinare?" senza eliminarla. Il pulsante **"📦 Mostra archiviate"** nella barra dei filtri permette di ritrovarla e ripristinarla ("📂 Disarchivia") in qualsiasi momento

## [3.37.0] — Avvisi più chiari prima di eliminare qualcosa

### Modificato
- Le azioni che non si possono annullare (eliminare una o più ricette, un prodotto dalla Dispensa, una voce o una fascia dalla pianificazione, svuotare la settimana, chiudere un modulo con modifiche non salvate) mostrano ora un avviso dedicato del sito, con un pulsante rosso per le eliminazioni, al posto del riquadro generico del browser. L'avviso spiega cosa sta per succedere e, dove utile, come recuperare i dati.

## [3.36.0] — "Aggiungi settimana scorsa" non sovrascrive più

### Modificato
- **"📋 Copia settimana scorsa"** è diventato **"➕ Aggiungi settimana scorsa"**: prima sostituiva del tutto la pianificazione attuale (rischiando di perdere quello che avevi già pianificato per questa settimana), ora le voci della settimana scorsa si aggiungono a quelle di oggi, giorno per giorno, senza cancellare nulla. Arrivano già segnate come "da consumare", senza ereditare la spunta ✓ della settimana precedente.

## [3.35.0] — Schermo acceso in modalità cucina

### Aggiunto
- La **modalità cucina** prova ora a impedire che lo schermo si spenga da solo mentre segui i passaggi di una ricetta (utile con le mani impegnate o sporche). Se il browser non supporta questa funzione, compare un piccolo avviso che lo spiega, invece di far credere che funzioni comunque.

## [3.34.0] — Pagina "Come funziona"

### Aggiunto
- Nuova voce di menu **"ℹ️ Come funziona"**: una pagina introduttiva che spiega come è organizzato il sito, cos'è il **CREA** (l'ente pubblico dietro la banca dati nutrizionale ufficiale usata nel sito) e cos'è **Open Food Facts** (la banca dati collaborativa usata per la scansione del codice a barre in Dispensa), con i link alle fonti originali.

## [3.33.0] — Ingredienti scelti, note settimanali, spesa per reparti

### Aggiunto
- In **"Cosa posso cucinare?"** è ora possibile scegliere con **"📋 Scegli prodotti"** solo alcuni prodotti della Dispensa da usare nella ricerca, invece di usarli tutti automaticamente — utile per simulare "se avessi solo questo cosa potrei fare?".
- Quando una ricetta risulta **"✓ Puoi farla"**, compare ora il promemoria *"Controllare le quantità effettive che hai a disposizione"*, perché il confronto resta una stima basata sui dati inseriti in Dispensa.
- Nella **Pianificazione**, ogni pasto ha ora un campo per una **nota libera** (es. "cena fuori", "avanzi", "preparare il giorno prima…), salvata automaticamente.
- La **lista della spesa** è ora raggruppata per **reparto** (frutta, verdura, pasta e cereali, ecc. — gli stessi reparti della Dispensa), nello stesso ordine in cui si trovano di solito al supermercato.
- Lo stato delle caselle spuntate nella lista della spesa è ora **persistente**: un ingrediente resta spuntato anche rigenerando la lista (es. dopo una modifica alla pianificazione), perché il promemoria è legato al nome dell'ingrediente e non alla singola lista generata.
- Aggiunto il file **LICENSE** (MIT, con nota sui dati nutrizionali CREA) in precedenza mancante dall'archivio.

### Corretto
- Un prodotto aggiunto in automatico alla Dispensa spuntando una voce della lista della spesa riceve ora un reparto indovinato dal nome (stessa logica di raggruppamento della lista spesa), invece di finire sempre genericamente in "Altro".

## [3.32.0] — Dispensa: prodotti in esaurimento

### Aggiunto
- Ogni prodotto può avere una quantità minima facoltativa. Quando la quantità disponibile raggiunge o scende sotto quella soglia, la relativa scheda viene evidenziata come **"In esaurimento"**.
- Nuovo filtro **"⚠ In esaurimento"** nella Dispensa, utile per controllare rapidamente cosa ricomprare.

### Corretto
- Il collegamento **"Usa prima ciò che scade"** dalla Dispensa apre ora correttamente il Ricettario con le ricette pertinenti.

## [3.31.0] — Dashboard Oggi

### Aggiunto
- Nuova schermata iniziale **"☀️ Oggi"**: riunisce i pasti pianificati per la giornata, i prodotti in scadenza entro tre giorni e un accesso diretto alla lista della spesa.
- Collegamenti rapidi a Pianificazione, Dispensa, Ricettario e lista della spesa, per raggiungere le azioni quotidiane senza passare dai menu.

## [3.30.0] — Usa prima ciò che scade

### Aggiunto
- Nella Dispensa il pulsante **"🍽 Usa prima ciò che scade"** si attiva quando ci sono prodotti con scadenza entro tre giorni. Apre il Ricettario e mostra le ricette che usano quei prodotti, dando precedenza a quelle che ne usano più di uno.
- I prodotti già scaduti non vengono proposti per la preparazione. Il pulsante **"Mostra tutte"** riporta alla normale ricerca per disponibilità.

## [3.29.2] — Chiarezza sui valori nutrizionali

### Corretto
- Il modulo di modifica chiarisce ora che i valori nutrizionali della ricetta sono facoltativi, riferiti a una porzione e **non** vengono calcolati automaticamente dagli ingredienti. Restano possibili sia i dati inseriti manualmente sia quelli ufficiali CREA del piatto finito.
- README e commenti tecnici sono stati allineati al comportamento effettivo dell'app. Rimossi inoltre i riferimenti a uno screenshot e a una licenza che non erano presenti nell'archivio.

## [3.29.1] — Filtro per tempo di preparazione

### Aggiunto
- Nuovo filtro **"Qualsiasi tempo"** nel Ricettario: entro 15/30/60 minuti, oppure "Con tempo indicato" per vedere solo le ricette a cui hai assegnato un tempo. Una ricetta senza tempo indicato non rientra in nessuna soglia — non viene considerata "veloce" solo perché il tempo non è stato scritto

## [3.29.0] — Menu riorganizzati ed etichette più chiare

### Modificato
- **Nuovo menu "🎨 Aspetto"**, separato da "📦 Backup e CSV": contiene solo la scelta del tema grafico, prima mescolata tra backup e CSV
- **"🔍 Filtri ▾" rinominato in "🔍 Cottura, tag ed esclusioni ▾"**, per capire subito cosa contiene senza doverlo aprire
- **"🌾 CREA Alimenti" rinominato in "🌾 Valori Alimenti dal sito CREA"**
- **"🇮🇹 CREA Menù" rinominato in "🇮🇹 Ricette dal sito CREA"**

## [3.28.0] — Eliminazione multipla e porzioni in "Cosa posso cucinare?"

### Aggiunto
- **Eliminazione di più ricette insieme**: il pulsante "☑️ Seleziona" nella barra del Ricettario attiva la selezione multipla, con "Seleziona tutte" (limitato alle ricette visibili con i filtri attivi), "Deseleziona tutte" e "🗑 Elimina selezionate". La conferma elenca i nomi, e le ricette eliminate vengono tolte anche dalla pianificazione settimanale
- **"Cosa posso cucinare?" ora chiede per quante porzioni**: le quantità della ricetta vengono riscalate su quel numero e confrontate con quelle in Dispensa. Oltre agli ingredienti mancanti compare un nuovo badge **"⚠ Quantità scarse"** per le ricette che hai tutte ma con qualche ingrediente che potrebbe non bastare, con il dettaglio di quanto serve e quanto ne hai
- Il controllo sulle quantità viene fatto solo quando entrambe le unità sono confrontabili automaticamente (g/kg, ml/l...): negli altri casi l'ingrediente resta considerato disponibile, invece di dare un giudizio su un confronto non attendibile

## [3.27.0] — Testi più leggibili su cellulare, importazione semplificata, avviso di riconnessione gestibile

### Modificato
- **Testi più grandi sugli schermi piccoli**: tutte le scritte di servizio (etichette, note, righe di dettaglio) sono state portate su quattro misure controllabili da un punto solo, e ingrandite sui cellulari. Anche i campi di inserimento ora sono di almeno 16px, la soglia sotto la quale i browser mobili ingrandiscono la pagina da soli quando ci si scrive dentro
- **Importazione da testo semplificata**: tolti i riferimenti all'incollare il codice sorgente delle pagine web. Ora la voce di menu si chiama semplicemente "📋 Da testo"
- Sottotitolo del sito accorciato in "Le tue ricette annotate, adattate, tramandate"

### Corretto
- **L'avviso di riconnessione al file di salvataggio ora si può chiudere**: prima offriva solo "Riconnetti", quindi su Chrome (che chiede la riconferma a ogni sessione, per sua scelta di sicurezza) ricompariva a ogni apertura senza alternative. Ora ci sono anche **"Non ora"** (nascondi per questa volta) e **"Non chiedere più"** (scollega il file e smetti di ricevere l'avviso; i dati restano nel browser). L'avviso spiega anche perché la richiesta arriva

## [3.26.0] — La logica dell'app ora è in un file separato

### Tecnico
- Tutto il JavaScript dell'app è stato spostato da dentro `index.html` a un nuovo file `js/app.js`. `index.html` passa da 235 KB a 37 KB e torna a essere leggibile come struttura di pagine
- Il codice **non** è stato spezzato internamente: resta un unico blocco, identico a prima, solo in un file proprio. Le sue 131 funzioni condividono tutte lo stesso ambito, quindi separarle davvero (es. "la Dispensa in un file suo") richiederebbe un lavoro di riscrittura ben più invasivo, con un rischio concreto di introdurre errori: non vale la pena finché il progetto funziona bene così
- Nessun cambiamento visibile o funzionale: stesso identico sito

## [3.25.0] — Il CSS ora è in un file separato

### Tecnico
- Tutto lo stile grafico (compresi i 5 temi selezionabili) è stato spostato da dentro `index.html` a un nuovo file `style.css`, collegato con un semplice `<link>`. `index.html` passa da 274 KB a 235 KB. Nessun cambiamento visibile: stesso identico aspetto, stessa identica funzionalità — solo un primo passo per rendere il progetto più leggero da mantenere man mano che cresce. `style.css` è ora tra i file essenziali elencati in [MANIFEST.md](MANIFEST.md)

## [3.24.1] — Correzione: categorie sbagliate per prodotti Open Food Facts

### Corretto
- Un prodotto come una crema spalmabile alle nocciole poteva finire classificato come "frutta secca" invece che tra i dolci/snack, quando il suo tag Open Food Facts era "hazelnut-spreads" senza un tag esplicito per il cioccolato: la regola per la frutta secca cercava semplicemente "nut" come sotto-stringa, che compare anche dentro "hazelnut". Aggiunta una regola dedicata a creme spalmabili, marmellate, miele e gelati, controllata prima di quella per la frutta secca
- Aggiunte più parole chiave per il riconoscimento automatico della categoria (pesce e frutti di mare, formaggi specifici, altre carni, legumi, frutta e verdura specifiche, cereali) — sempre un default suggerito, mai vincolante
- Completata la mappatura dalle 19 categorie CREA alle 15 categorie pratiche della Dispensa: alcune categorie CREA (es. "Carni fresche") non avevano una destinazione e cadevano sempre su "Altro" anche quando esisteva un abbinamento migliore disponibile

## [3.24.0] — Temi grafici selezionabili

### Aggiunto
- **5 temi grafici** selezionabili da "📦 Backup e CSV" → "🎨 Tema grafico": Originale (noce e oro, l'aspetto di sempre), Mediterranea (chiaro, terracotta e blu mare), Bosco d'autunno (verde bosco, crema, ruggine), Trattoria moderna (minimal, crema e rosso pomodoro), Cantina (scuro, vino e bordeaux)
- La scelta si applica a tutto il sito e resta salvata per le visite successive; i font aggiuntivi dei nuovi temi si scaricano solo la prima volta che vengono scelti, non all'avvio del sito

### Tecnico
- Tutti i colori "di struttura" del sito (sfondo pagina, testata, pulsanti di navigazione, ombreggiature della pergamena) sono stati portati su variabili CSS dedicate: i colori delle categorie di ricette/dispensa restano invece fissi in ogni tema, per continuità visiva

## [3.23.0] — Totali nutrizionali per pasto, giorno e settimana

### Aggiunto
- I valori nutrizionali delle voci pianificate (già introdotti nella versione precedente) ora si sommano automaticamente **per fascia pasto** e **per l'intera giornata**, mostrati direttamente nella scheda del giorno in Pianificazione
- Nuovo pulsante **"📊 Totali settimana"** che apre il riepilogo di Kcal/Proteine/Grassi/Carboidrati/Fibre/Zuccheri/Sale per ciascun giorno della settimana, più il totale complessivo
- In tutti e tre i livelli (pasto, giorno, settimana), le voci senza dati nutrizionali disponibili vengono escluse dalla somma invece di essere contate come zero: se manca un dato, il totale mostrato è quello di ciò che si sa per certo, non un numero che sembra completo ma non lo è

## [3.22.2] — Consiglio pratico quando il salvataggio su file non è disponibile

### Aggiunto
- Su Safari, Firefox e iOS (dove il collegamento a un file non è supportato), il pulsante "🗂️ Collega un file di salvataggio…" ora spiega perché non è disponibile e propone la via alternativa già pronta — un pulsante di scorciatoia **"⬇ Esporta backup ora"** — invece del semplice avviso generico di prima

## [3.22.1] — Correzione: errore poco chiaro nel collegare un file su browser non supportati

### Corretto
- Il pulsante "🗂️ Collega un file di salvataggio…" nel menu non controllava se il browser supportasse davvero questa funzione (lo fa già, correttamente, il popup automatico alla prima apertura): su Safari, Firefox o iOS portava sempre agli stessi due errori generici "Non è stato possibile creare/aprire il file", senza spiegare perché. Ora mostra subito un avviso chiaro che indica il limite del browser, senza nemmeno aprire la finestra che avrebbe comunque fallito
- Anche quando la finestra si apre, i messaggi d'errore ora distinguono, quando possibile, un browser non supportato da un blocco di sicurezza del contesto (es. sito aperto dentro un'altra app) da un errore generico

## [3.22.0] — Valori nutrizionali della ricetta (per porzione) e nella pianificazione

### Aggiunto
- **Valori nutrizionali per porzione inseribili a mano** su qualunque ricetta (Kcal, Proteine, Grassi, Carboidrati, Fibre, Zuccheri, Sale) — facoltativi, utili quando li conosci già da un'altra fonte. Restano un'informazione separata da quella ufficiale CREA (per 100 g del piatto), quando presente: possono comparire anche insieme
- **Valori nutrizionali nella Pianificazione settimanale**: ogni voce pianificata (ricetta o prodotto Dispensa) mostra ora Kcal/Proteine/Grassi/Carboidrati/Fibre/Zuccheri/Sale calcolati per quella voce — per una ricetta, sulla base di "per quante persone" impostato in Pianificazione; per un prodotto Dispensa, sulla quantità indicata per quel pasto (quando espressa in grammi o kg)

### Corretto
- Modificando una ricetta importata da "CREA Menù" (es. per aggiungere una nota), i suoi valori nutrizionali ufficiali non vengono più persi al salvataggio

## [3.21.0] — Salvataggio su un file a tua scelta

### Aggiunto
- **Collegamento a un file sul dispositivo** per il salvataggio di ricette, dispensa, pianificazione e lista della spesa, in aggiunta alla memoria del browser — utile per tenerli in una cartella sincronizzata con Google Drive, Dropbox o simili, o per portarli facilmente su un altro computer. Disponibile solo su Chrome, Edge e browser Chromium (limite della File System Access API, non supportata da Firefox/Safari)
- Alla prima apertura del sito (quando il browser lo supporta), una finestra chiede subito dove salvare: creare un nuovo file, aprirne uno esistente (stesso formato del backup JSON), oppure continuare solo con la memoria del browser
- Il file collegato si può cambiare o scollegare in qualsiasi momento da "📦 Backup e CSV"
- Se il browser richiede una riconferma d'accesso al file (misura di sicurezza standard), compare un avviso con un pulsante "Riconnetti"
- La memoria del browser resta comunque sempre aggiornata come rete di sicurezza, anche quando un file è collegato

## [3.20.1] — Correzione: finestra dello scanner bloccata senza fotocamera

### Corretto
- Se la fotocamera non era disponibile (permesso negato, dispositivo senza fotocamera...), il pulsante "×" per chiudere la finestra dello scanner non rispondeva più: `html5-qrcode` può lanciare un errore nel fermare uno scanner mai avviato con successo, e questo impediva al codice di chiudere la finestra. La chiusura ora avviene sempre, indipendentemente da eventuali errori nell'arresto dello scanner

## [3.20.0] — Ricerca prodotto da Open Food Facts in Dispensa

### Aggiunto
- **Scansione codice a barre da fotocamera** (libreria `html5-qrcode`, caricata solo quando la usi) e **campo per incollare il codice a barre a mano**, nel form "Nuovo prodotto" della Dispensa
- **Ricerca testuale su Open Food Facts** (banca dati collaborativa di prodotti confezionati), con anteprima di nome, marca, immagine e Nutri-Score
- Nome, categoria e valori nutrizionali per 100 g si compilano da soli nello stesso form già esistente — nessun secondo inventario, stessa scheda prodotto di sempre

### Nota tecnica
- Lo User-Agent personalizzato richiesto da Open Food Facts non è impostabile da JavaScript nel browser (limite di sicurezza dei browser stessi): le richieste usano lo User-Agent reale del browser

## [3.19.0] — Valori nutrizionali Dispensa per 100 g invece che per la quantità in giacenza

### Modificato
- **Valori nutrizionali della Dispensa ora per 100 g di prodotto**, non più per la quantità che hai in dispensa in quel momento: coerente con l'etichetta nutrizionale stampata sulle confezioni, e non cambia più ogni volta che consumi parte del prodotto. La ricerca "🔎 Cerca su CREA" ora compila i 7 valori direttamente dalla banca dati (senza più richiedere di inserire prima la quantità in grammi/kg per poterli calcolare)
- **La card del prodotto in Dispensa mostra tutti e 7 i valori** (Kcal, Proteine, Grassi, Carboidrati, Fibre, Zuccheri, Sale) invece della sola Kcal

## [3.18.0] — Frazioni da cucina per cucchiai, cucchiaini, pizzichi, pezzi...

### Aggiunto
- **Frazioni al posto dei decimali per le unità "a conteggio"**: scalando le porzioni, quando la quantità di un ingrediente misurato in cucchiaio/cucchiai, cucchiaino/cucchiaini, pizzico/pizzichi, pezzo/pezzi, tazza/tazze, fetta/fette, spicchio/spicchi, rametto/rametti, filetto/filetti o foglia/foglie scende sotto l'unità intera, ora viene mostrata come frazione da cucina (es. "1/2", "1/4 e 3/4" quando c'è anche una parte intera) invece che come decimale ("0.5"). Vale nella scheda ricetta, nel PDF, nella lista della spesa e negli avvisi di scarico dalla Dispensa. Grammi, ml, litri e unità simili restano invece decimali come prima

## [3.17.0] — Salvataggio su Drive/cloud da cellulare

### Aggiunto
- **Foglio di condivisione nativo su cellulare per backup/CSV/PDF**: su Android e iPhone/iPad, i pulsanti "Esporta" ora aprono il foglio di condivisione del telefono invece di scaricare direttamente nella cartella Download. Tra le app che compaiono c'è "Salva su Drive" (se hai Google Drive installato), oltre a Dropbox, Files, email, ecc. — quindi ora è possibile scegliere dove salvare, incluso il Cloud. Resta comunque possibile scegliere "Salva sul dispositivo"/"File" dal foglio se si preferisce tenerlo solo in locale. Su computer (Chrome/Edge) il comportamento resta quello di prima, con la finestra "Salva con nome"

## [3.16.1] — Corretto overflow del menu soglia su mobile

### Corretto
- **Il menu a tendina della soglia ingredienti mancanti usciva dal riquadro su mobile**: il `<select>` non si restringeva sotto la larghezza del suo testo più lungo ("Mancano al massimo 5 ingredienti"), sporgendo oltre il bordo del pannello sugli schermi stretti. Ora occupa correttamente tutta la larghezza disponibile; accorciate anche le etichette (es. "Mancano max 5 ingredienti")

## [3.16.0] — Soglia di ingredienti mancanti in "Cosa posso cucinare?"

### Aggiunto
- **Soglia ingredienti mancanti in "Cosa posso cucinare?"**: nuovo menu a tendina per scegliere quanti ingredienti possono mancare — da "Solo ricette già pronte" (0 mancanti) fino a 5, oppure "Qualsiasi risultato" (comportamento di prima, nessun limite). La scelta resta salvata. Prima venivano sempre mostrate tutte le ricette del ricettario, solo ordinate per numero di ingredienti mancanti, senza modo di nasconderle
- Confermato che "Trova ricette" funziona già anche lasciando vuoto il campo di testo, usando automaticamente solo i prodotti in Dispensa (funzionalità già presente, verificata con un test dedicato)

## [3.15.0] — Valori nutrizionali anche per porzione singola

### Modificato
- **Valori nutrizionali per porzione**: sia nella scheda ricetta sia nel PDF esportato, ora compare l'intero elenco (Kcal, Proteine, Grassi, Carboidrati, Fibre, Zuccheri, Sale) sia come **totale ricetta** sia come **per 1 porzione**, uno sotto l'altro. Prima il "per porzione" mostrava solo le Kcal in una riga a parte, tutti gli altri valori si vedevano solo come totale

## [3.14.0] — Metodo di cottura visibile a colpo d'occhio, corretto il riconoscimento di unità e frazioni

### Aggiunto
- **Badge del metodo di cottura sempre visibile**: prima solo la pentola a pressione aveva un'icona sulla card e nella scheda ricetta; ora compaiono anche **🤖 Robot** e **🔥 Tradizionale** (una ricetta senza passaggi robot né pentola mostra sempre "Tradizionale", così il metodo si capisce sempre al primo sguardo, anche nella vista "Cosa posso cucinare?"). Una ricetta che usa sia il robot sia la pentola a pressione mostra entrambe le icone insieme

### Corretto
- **Unità di misura testuali interpretate male durante l'importazione**: nel riconoscimento automatico da testo incollato/JSON-LD e nell'import CSV, unità al singolare come "cucchiaio", "cucchiaino", "tazza", "fetta", "spicchio", "rametto", "filetto" (e "cucchiaini" al plurale) venivano tagliate a metà, lasciando una lettera o sillaba incollata al nome dell'ingrediente (es. "1 cucchiaio di vaniglia" diventava nome ingrediente "o di vaniglia"). Riguardava anche il backup/ripristino CSV: esportare e reimportare una propria ricetta con queste unità la corrompeva silenziosamente
- **Quantità frazionarie tagliate**: quantità scritte come "1/2", "1/4", "3/4" venivano interpretate come solo la parte intera (es. "1/2 cucchiaino" diventava 1 invece di 0,5, raddoppiando l'ingrediente). Ora vengono convertite correttamente in decimale

## [3.13.0] — Import che aggiorna le voci esistenti, avviso modifiche non salvate, Annulla su "consumato", accessibilità

### Aggiunto
- **Backup e CSV possono aggiornare le voci già esistenti**: prima venivano sempre e solo aggiunte le novità. Ora, se il file importato contiene ricette (o prodotti Dispensa, per il backup) già presenti — stesso identificativo per il backup, stesso nome per il CSV — viene chiesto una volta se sostituirle con la versione importata o lasciarle come sono, con un riepilogo finale di quante sono state aggiunte, aggiornate o lasciate invariate. Utile soprattutto per il backup, dato che è il modo pensato per spostare i dati tra dispositivi: prima, una modifica fatta altrove e poi reimportata non sostituiva mai la versione già presente
- **Avviso prima di chiudere con modifiche non salvate**: se il modulo di una ricetta o di un prodotto Dispensa ha modifiche non ancora salvate, chiuderlo (con la "×", toccando fuori dal modulo, chiudendo la scheda del browser o navigando altrove) chiede prima conferma, invece di buttare via il lavoro fatto in silenzio
- **"↺ Annulla" sulla conferma "pasto consumato"**: ora è possibile tornare indietro, ripristinando in Dispensa (dove il prodotto esiste ancora) le quantità che erano state tolte — prima non era possibile, per scelta, tenerla semplice
- **Etichette di accessibilità**: aggiunto un testo alternativo alle foto delle ricette e un'etichetta ai pulsanti di chiusura "×" dei moduli, per chi naviga con uno screen reader

## [3.12.0] — Robustezza del salvataggio, coerenza dei confronti con la Dispensa, "Annulla", ingredienti duplicati

### Aggiunto
- **Compressione automatica delle foto**: le foto delle ricette vengono ridimensionate (max 1400 px sul lato lungo) e ricompresse in JPEG prima di essere salvate, per occupare molto meno spazio nel browser (una foto da cellulare passa tipicamente da qualche MB a poche centinaia di KB)
- **Avviso di spazio esaurito**: se `localStorage` esaurisce lo spazio disponibile e un salvataggio fallisce, ora compare un avviso chiaro (una sola volta a sessione, per non intasare di avvisi) invece che la modifica sparisca in silenzio alla riapertura. Riguarda tutti i salvataggi: ricette, pianificazione, Dispensa, promemoria della lista della spesa
- **"Annulla" nel controllo incrociato con la Dispensa**: dopo aver premuto "Sottrai dalla lista" su una voce, un link "Annulla" permette di tornare alla quantità originale
- **Segnalazione di ingredienti duplicati**: se nella stessa ricetta lo stesso ingrediente (nome e unità) compare più volte, il salvataggio lo segnala e propone di unire le righe sommando le quantità (e i valori nutrizionali, già intesi come totali per riga)

### Modificato
- **Coerenza nella corrispondenza con la Dispensa**: la conferma "pasto consumato" ora usa la stessa logica già introdotta per il controllo incrociato della lista della spesa — un nome identico, oppure uno simile solo se il candidato è unico. Se più prodotti in Dispensa hanno un nome simile a un ingrediente (es. "Farina 00" e "Farina integrale" per "Farina"), non ne sceglie più uno alla cieca: non tocca nessuno dei due e li elenca entrambi nella conferma, lasciando la scelta a te
- Il controllo incrociato della lista della spesa ora usa la stessa funzione di corrispondenza condivisa con la conferma "pasto consumato", invece di una logica duplicata

## [3.11.0] — Conversione unità, corrispondenza elastica e "Sottrai tutto" nella lista della spesa

### Aggiunto
- **Conversione automatica tra unità equivalenti** nel controllo incrociato con la Dispensa: se la ricetta richiede "500 g" e in Dispensa risulta "1 kg" (o viceversa, oppure ml/cl/l), la sottrazione ora scatta comunque, invece di richiedere unità scritte in modo identico
- **Corrispondenza per nome più elastica**: se non c'è un prodotto con lo stesso nome esatto, il controllo incrociato prova anche un confronto più tollerante (lo stesso usato da "Cosa posso cucinare?"), utile per varianti dello stesso ingrediente (es. "Farina" nella ricetta e "Farina 00" in Dispensa). Se i prodotti candidati sono più di uno, vengono solo elencati come promemoria, senza sottrazione automatica, per non rischiare un abbinamento sbagliato
- **"🥫 Sottrai tutto"** nel modal della lista della spesa: applica in un solo tocco tutte le sottrazioni disponibili in quel momento, invece di doverle confermare una per una

## [3.10.0] — Controllo incrociato con la Dispensa nella lista della spesa

### Aggiunto
- **Controllo incrociato con la Dispensa**: ogni voce della lista della spesa (settimana, giorno o singola ricetta) che corrisponde a un prodotto già segnato in Dispensa mostra ora un avviso sotto la riga
- Se l'unità di misura coincide, l'avviso include il pulsante **"Sottrai dalla lista"**: toglie dalla quantità da acquistare quella già disponibile in Dispensa, in modo da comprare solo quello che manca davvero. Se la Dispensa ne contiene già a sufficienza, la riga si aggiorna in "già in Dispensa" e la casella si disabilita
- Se l'unità di misura è diversa o la quantità in Dispensa non è indicata, l'avviso compare comunque come promemoria, ma senza sottrazione automatica (la conversione tra unità diverse resta manuale)

## [3.9.0] — Lista della spesa per giorno/ricetta, rimossa la stampa diretta

### Aggiunto
- **Lista della spesa per singola ricetta**: nuovo pulsante **"🛒 Lista della spesa"** nella scheda ricetta, con gli ingredienti scalati alle porzioni che si stanno visualizzando in quel momento
- **Lista della spesa per singolo giorno**: nuovo pulsante **"🛒 Lista della spesa del giorno"** sotto il titolo di ogni giorno nella vista Pianificazione, con solo le ricette assegnate a quel giorno (scalate in base a "per quante persone")
- Entrambe riusano lo stesso modal della lista della settimana (spunta ingredienti, sincronizzazione con la Dispensa, esportazione PDF); a differenza della lista settimanale, non includono i promemoria "dalla dispensa", non essendo legati a un giorno o a una ricetta specifica

### Corretto
- Rimossa la stampa diretta dal browser (pulsanti "🖨 Stampa", "🖨 Stampa settimana", "🖨 Stampa lista" e la relativa finestra di sistema): su alcuni dispositivi, in particolare mobile, produceva un foglio bianco invece del contenuto. L'esportazione PDF, già presente per ricetta/settimana/lista della spesa, resta l'unico modo per ottenere un documento stampabile ed è più affidabile, perché scarica direttamente un file senza passare dalla finestra di stampa del sistema

### Modificato
- Nella vista Pianificazione, il menu a tendina "⬇ Esporta ▾" della settimana (che conteneva solo "Stampa settimana" ed "Esporta PDF settimana") è tornato un unico pulsante diretto **"⬇ Esporta PDF settimana"**, ora che la stampa non c'è più
- Nella scheda ricetta, il menu "⬇ Esporta ▾" non include più "🖨 Stampa" (restano "⬇ Esporta PDF" ed "⬇ Esporta ricetta (.json)")
- Nel modal della lista della spesa non compare più "🖨 Stampa lista" (resta "⬇ Esporta PDF")

## [3.8.0] — Dispensa unificata, lista della spesa, ordinamento, duplica ricetta

### Aggiunto
- **"Cosa posso cucinare?"** ora usa automaticamente i prodotti della Dispensa, invece di un elenco scritto a mano separato; il campo di testo resta disponibile per aggiungere altri ingredienti non tracciati in Dispensa. L'elenco si aggiorna da solo quando la Dispensa cambia o quando torni sulla vista Ricette
- **Lista della spesa → Dispensa**: spuntando un ingrediente comprato viene aggiunto alla Dispensa (o la sua quantità aumentata, se già presente con la stessa unità di misura), con un piccolo avviso che conferma quanti prodotti sono stati aggiornati
- **Ordinamento della lista ricette**: nuovo menu a tendina con Nome (A-Z/Z-A), Aggiunta di recente, Ultima preparata, Più preparate — di base è per nome
- **"⧉ Duplica"** nella scheda ricetta: crea una copia (con "(copia)" nel nome) e la apre subito in modifica, senza toccare l'originale

### Modificato
- Nella scheda ricetta, "🖨 Stampa", "⬇ Esporta PDF" ed "⬇ Esporta ricetta" sono ora un unico menu a tendina "⬇ Esporta ▾", coerente con la riorganizzazione dei menu già fatta altrove


## [3.7.0] — Conferma consumo pasto

### Aggiunto
- Nuovo pulsante **"✓"** su ogni voce della Pianificazione settimanale, per segnarla come consumata
- Per i pasti aggiunti **"dalla dispensa"**: se era stata indicata una quantità nella stessa unità di misura del prodotto, viene tolta da quel prodotto in Dispensa
- Per i pasti da **ricetta**: gli ingredienti (scalati in base a "per quante persone" impostato in Pianificazione) vengono cercati tra i prodotti in Dispensa per nome, e la quantità viene tolta solo dove l'unità di misura coincide esattamente — altrimenti il prodotto resta invariato. In entrambi i casi viene sempre chiesta conferma, mostrando in anticipo cosa cambierà e cosa no
- Una volta confermato, il segno di spunta resta acceso per quella voce, per evitare di scalare la stessa quantità più di una volta

## [3.6.0] — Riorganizzazione dei menu

### Modificato
- **Lista ricette**: "📋 Importa ricetta" e "📄 Importa ricetta (file)" sono ora un unico menu a tendina "📋 Importa ricetta ▾", come già "📦 Backup e CSV"
- **Lista ricette**: i filtri "🍲 Solo pentola a pressione", "🤖 Solo robot" e "🔥 Solo tradizionale" si sono spostati dentro il pannello filtri (rinominato da "🔍 Altri filtri" a "🔍 Filtri"), in una sezione dedicata "Metodo di cottura" con lo stesso stile a "pillola" già usato per i tag dietetici; il pulsante del pannello mostra ora tra parentesi quanti filtri sono attivi
- **Pianificazione**: "🖨 Stampa settimana" ed "⬇ Esporta PDF settimana" sono ora un unico menu a tendina "⬇ Esporta ▾"
- Nessuna modifica al funzionamento dei filtri o delle esportazioni: solo alla loro organizzazione, per una toolbar meno affollata

## [3.5.0] — Controllo ingredienti mancanti dalla Dispensa

### Aggiunto
- Quando aggiungi una ricetta alla pianificazione settimanale (dalla ricerca in Pianificazione o dal pulsante "📅 Pianifica" nella scheda ricetta), il ricettario controlla i suoi ingredienti rispetto ai prodotti presenti in Dispensa
- Se uno o più ingredienti non risultano in Dispensa, viene mostrato un avviso con l'elenco e chiesta conferma prima di aggiungerli a un promemoria per la lista della spesa
- Questi ingredienti compaiono, con l'etichetta "dalla dispensa", nella lista della spesa generata dalla settimana, nella stampa e nel PDF — anche se per quella settimana non ripianifichi la stessa ricetta — finché non li spunti nella lista (a quel punto vengono rimossi definitivamente dal promemoria) o non risultano coperti da un'altra ricetta pianificata
- I promemoria sono inclusi nel backup JSON

## [3.4.0] — Quantità per i pasti dalla Dispensa

### Aggiunto
- Scegliendo un prodotto della Dispensa da aggiungere come pasto nella Pianificazione, ora viene chiesta una **quantità facoltativa** (precompilata con quella che hai in dispensa, ma modificabile) prima di confermare
- La quantità, se indicata, compare accanto al nome del prodotto nella vista Pianificazione, nella stampa e nel PDF della settimana

## [3.3.2] — Conferma prima di rimuovere un pasto pianificato

### Aggiunto
- Rimuovendo un pasto dalla Pianificazione settimanale (il pulsante "×" su una voce già assegnata a un giorno) viene ora chiesta conferma, con il nome della ricetta o del prodotto coinvolto — come già avveniva eliminando una ricetta dal ricettario o un prodotto dalla Dispensa

## [3.3.1] — Correzione: righe troppo lunghe nel PDF

### Corretto
- Nei PDF (ricetta singola, settimana e lista della spesa) le righe troppo lunghe uscivano dal bordo della pagina invece di andare a capo. Ora il testo viene misurato e spezzato automaticamente per stare nella larghezza della pagina
- I passaggi numerati e gli elenchi puntati (ingredienti, lista della spesa) mantengono un rientro sulle righe andate a capo, allineato al testo dopo il numero o il trattino, per restare leggibili

## [3.3.0] — Filtri "solo robot" e "solo tradizionale"

### Aggiunto
- Due nuovi pulsanti filtro nella lista ricette, accanto a "🍲 Solo pentola a pressione": **"🤖 Solo robot"** (almeno un passaggio con velocità, temperatura o una modalità diversa da Normale) e **"🔥 Solo tradizionale"** (nessun passaggio con impostazioni robot o pentola a pressione)
- I tre filtri per metodo di preparazione si possono combinare liberamente tra loro e con gli altri filtri già presenti (categoria, preferite, tag dietetici, esclusione ingredienti)

## [3.2.0] — Più categorie in Dispensa

### Aggiunto
- Nuove categorie nella Dispensa, per coprire non solo i freschi ma tutto quello che può servire per una ricetta: **Uova**, **Surgelati**, **Pasta, riso e cereali**, **Legumi**, **Farine, zucchero e lieviti**, **Conserve e scatolame**, **Spezie e condimenti**, **Oli, aceti e grassi**, **Bevande**, **Snack e dolciumi**

### Nota
- Le categorie esistenti (Frutta, Verdura, Salumi, Latticini e pronti, Altro) restano invariate: i prodotti già inseriti non cambiano categoria e non serve alcuna migrazione

## [3.1.0] — Valori nutrizionali in Dispensa e pasti dalla Dispensa nella Pianificazione

### Aggiunto
- Valori nutrizionali facoltativi anche per i prodotti della Dispensa (Kcal, Proteine, Grassi, Carboidrati, Fibre, Zuccheri, Sale), inseriti allo stesso modo delle ricette — riferiti alla quantità indicata, non ai 100g; le kcal, se presenti, compaiono anche nella card del prodotto
- Possibilità di aggiungere un prodotto della Dispensa direttamente come pasto nella Pianificazione settimanale: nuovo pulsante **"🥫 Dalla dispensa…"** accanto a "🔍 Cerca ricetta…" in ogni fascia pasto, con la stessa finestra di ricerca
- Le voci pianificate dalla Dispensa si riconoscono da un'etichetta 🥫 e, se toccate, aprono la scheda di modifica del prodotto invece della ricetta
- Le voci dalla Dispensa sono incluse nella stampa e nel PDF della settimana con il nome reale del prodotto

### Modificato
- Eliminando un prodotto dalla Dispensa, viene rimosso automaticamente anche dalla pianificazione settimanale (come già avveniva eliminando una ricetta)
- Il messaggio mostrato generando la lista della spesa senza ricette pianificate ora chiarisce che i prodotti dalla Dispensa non vengono conteggiati, dato che non richiedono acquisti

## [3.0.0] — Sezione Dispensa

### Aggiunto
- Nuova sezione **"🥫 Dispensa"**, separata dal ricettario, per tenere traccia di frutta, verdura, salumi e latticini/prodotti pronti che hai in casa
- Ogni prodotto ha nome, categoria, quantità e unità facoltative, data di scadenza facoltativa e note facoltative
- Le scadenze passate sono evidenziate in rosso, quelle entro 3 giorni in arancione; l'elenco si ordina da solo mettendo prima le scadenze più vicine
- Ricerca per nome e filtro per categoria, come nel ricettario
- I prodotti della Dispensa sono ora inclusi nel backup JSON

## [2.9.0] — Categoria Infusi & Tisane

### Aggiunto
- Nuova categoria **"Infusi & Tisane"**, disponibile nel modulo di modifica e nel filtro per categoria
- L'importazione da testo riconosce automaticamente questa categoria per ricette che parlano di tè, tisane, infusi o camomilla

## [2.8.3] — Tentativo di correzione sfondi bianchi su mobile

### Corretto
- Il sito ora dichiara esplicitamente al browser di essere pensato solo per il tema chiaro (`color-scheme: light`): su alcuni telefoni con la modalità scura attiva, senza questa dichiarazione il browser può applicare colori "di sistema" a pulsanti e campi invece di quelli del sito
- Rimosso l'effetto "flash" grigio/bianco che alcuni browser mobile mostrano di default quando si tocca un pulsante

## [2.8.2] — Correzione stile campo orario

### Corretto
- Il campo dell'orario nella pianificazione mostrava lo sfondo bianco predefinito del browser invece dei colori del sito, soprattutto visibile su cellulare. Ora segue lo stesso stile degli altri campi

## [2.8.1] — Pianificazione giorno per giorno

### Modificato
- La vista Pianificazione ora mostra **un giorno alla volta** come una scheda, invece di tutti e sette impilati: linguette in alto (Lun, Mar, Mer…) per saltare a un giorno preciso, frecce ‹ › per il giorno prima/dopo, si apre già sul giorno di oggi
- Rimossa la funzione "clicca per richiudere" i giorni, non più necessaria con la nuova vista

## [2.8.0] — Importa/esporta singola ricetta

### Aggiunto
- **"⬇ Esporta ricetta"** nella scheda di una ricetta: scarica quella sola ricetta come file `.json`
- **"📄 Importa ricetta (file)"** nella toolbar: legge un file esportato così e lo aggiunge alle tue ricette, ripartendo da zero su preferita, cronologia e contatore preparazioni
- Controllo dei doppioni per nome, e un messaggio dedicato se per sbaglio si prova a importare così un intero file di backup

## [2.7.2] — Scegliere dove salvare i file

### Aggiunto
- Su Chrome ed Edge da computer, esportare backup, CSV o PDF apre ora una finestra "Salva con nome" per scegliere cartella e nome del file, invece di scaricarlo automaticamente
- Su browser che non supportano questa funzione (Safari, Firefox, la maggior parte dei browser da cellulare), il comportamento resta quello di prima: scaricamento automatico nella cartella predefinita
- Nuova sezione nella GUIDA su dove vengono salvati e caricati i file

## [2.7.1] — Valori nutrizionali nel PDF

### Aggiunto
- **"⬇ Esporta PDF"** della singola ricetta ora include anche i valori nutrizionali (se presenti), scalati alle porzioni visualizzate, con la stessa nota su eventuali dati incompleti già vista nella scheda

## [2.7.0] — Valori nutrizionali

### Aggiunto
- **"🍎 Valori nutrizionali"**, facoltativi per ogni ingrediente: Kcal, Proteine, Grassi, Carboidrati, Fibre, Zuccheri, Sale — riferiti alla quantità usata nella ricetta, non per 100g
- Riepilogo nutrizionale nella scheda della ricetta, con totale e valore per porzione, che si ricalcola insieme al +/− delle porzioni
- Segnalazione quando i dati sono inseriti solo su parte degli ingredienti, per non far sembrare completo un totale parziale

### Nota
- Nessun database nutrizionale integrato: i valori vanno inseriti manualmente, per restare un'app offline senza servizi esterni

## [2.6.2] — Pianifica dalla scheda ricetta

### Aggiunto
- **"📅 Pianifica"** nella scheda di una ricetta: scegli giorno, fascia pasto e orario facoltativo e aggiungila alla pianificazione settimanale senza passare dalla vista Pianificazione. Il pannello resta aperto dopo ogni aggiunta, per assegnarla a più giorni di seguito

## [2.6.1] — Ricerca ricette nella pianificazione

### Modificato
- Nella vista Pianificazione, la tendina con tutte le ricette è stata sostituita da **"🔍 Cerca ricetta…"**: apre una finestra con ricerca per nome o ingrediente, comoda anche quando le ricette sono molte

## [2.6.0] — Gestione ricette per pentola a pressione

### Aggiunto
- **"🍲 Impostazioni pentola a pressione"**, facoltative per ogni passaggio come quelle del robot: pressione (valore numerico + unità a scelta tra Bar, PSI o kPa), tipo di rilascio (Naturale/Rapido/Misto), durata del rilascio e liquido minimo richiesto
- **Timer dedicato al rilascio**, separato da quello di cottura in pressione, sia nella scheda della ricetta sia in modalità cucina guidata
- Campo facoltativo **"Tipo pentola a pressione"** (Elettrica / A fornello) a livello di ricetta
- Etichetta **🍲** dedotta automaticamente su schede e vista ricetta quando almeno un passaggio ha impostazioni a pressione, senza bisogno di tag manuali
- Pulsante filtro **"🍲 Solo pentola a pressione"** nella lista ricette

### Nota
- Nessuna modifica alle ricette esistenti: tutti i nuovi campi sono facoltativi e non richiedono migrazione

## [2.5.0] — PDF ricetta, promemoria backup, copia settimana

### Aggiunto
- **"⬇ Esporta PDF"** anche per la singola ricetta, con ingredienti scalati alle porzioni visualizzate
- Promemoria discreto "Ultimo backup: X giorni fa" in cima al menu "📦 Backup e CSV", che segnala in rosso se sono passate più di due settimane
- **"📋 Copia settimana scorsa"** nella vista Pianificazione: prima di ogni "Svuota settimana" viene salvata automaticamente una copia della pianificazione, richiamabile con un click

## [2.4.0] — Esportazione PDF

### Aggiunto
- **"⬇ Esporta PDF settimana"** nella vista Pianificazione: scarica un PDF con il piano di tutti i giorni e la lista della spesa aggregata, senza passare dalla finestra di stampa del browser
- **"⬇ Esporta PDF"** nella lista della spesa: scarica la lista come PDF
- Generatore PDF scritto interamente in JavaScript vanilla (nessuna libreria esterna), multipagina, con supporto alle lettere accentate italiane

### Corretto
- "🖨 Stampa settimana" poteva non produrre nulla su alcuni browser mobili: l'esportazione PDF risolve il problema offrendo un file scaricabile che non dipende dalla finestra di stampa del browser

## [2.3.1] — Riordino dei menu

### Modificato
- La toolbar principale è stata riorganizzata per essere più leggibile, soprattutto su schermi piccoli: "Esporta/Importa backup" ed "Esporta/Importa CSV" sono ora raggruppati in un unico menu a tendina **"📦 Backup e CSV"**
- Il filtro per tag dietetico e il campo "Escludi ingredienti" sono stati spostati in un pannello **"🔍 Altri filtri"** richiudibile, nascosto di default per lasciare la pagina più snella

## [2.3.0] — Import/export CSV

### Aggiunto
- **Importa/esporta CSV**: esporta tutte le ricette in un file `.csv` (una riga per ricetta, apribile in Excel o Fogli Google) e importa ricette da un file con lo stesso formato, senza duplicare quelle già presenti con lo stesso nome

### Rimosso
- Il pulsante "Aggiungi ricette di esempio" e le 24 ricette tradizionali incluse nel codice. Il documento [ricette-tradizionali-ciociare.md](ricette-tradizionali-ciociare.md) resta disponibile come riferimento leggibile/stampabile, ma non è più importabile con un click dall'app

## [2.2.0] — Dispensa, filtri e rifiniture

### Aggiunto
- Dispensa salvata: la lista degli ingredienti scritta in "Cosa posso cucinare?" resta salvata tra una sessione e l'altra, senza doverla riscrivere ogni volta
- Filtro "Escludi ingredienti" per nascondere le ricette che contengono uno o più ingredienti indesiderati (es. allergie)
- Tag dietetici (Vegetariano, Vegano, Senza glutine, Senza lattosio, Piccante) assegnabili a ogni ricetta e filtrabili nella lista
- Un'impostazione "per quante persone" nella vista Pianificazione, che scala automaticamente le quantità della lista della spesa generata dalla settimana
- Contatore "quante volte preparata", accanto alla data dell'ultima preparazione
- "🖨 Stampa settimana": stampa in un unico foglio il piano di tutti i giorni insieme alla lista della spesa
- Giorni della pianificazione richiudibili con un click sul titolo, per una vista più compatta

## [2.1.0] — Pianificazione settimanale rinnovata

### Aggiunto
- La pianificazione settimanale è ora una vista dedicata, separata dal ricettario ("📅 Pianificazione")
- Più ricette per ogni giorno, organizzate in fasce pasto (di base: Colazione, Pranzo, Spuntino, Cena)
- Fasce pasto personalizzabili: se ne possono aggiungere di nuove o rimuovere quelle inutilizzate
- Orario facoltativo per ogni ricetta pianificata, con ordinamento automatico delle voci

### Modificato
- Lista della spesa e "Svuota settimana" si trovano ora nella vista Pianificazione
- Le pianificazioni fatte con il vecchio sistema (una ricetta per giorno) vengono convertite automaticamente al nuovo formato al primo avvio

## [2.0.0] — Ricettario generale

### Modificato
- Il ricettario non è più centrato sul robot da cucina Monsieur Cuisine: ogni passaggio ha ora impostazioni robot facoltative (velocità/temperatura/modalità), al posto del doppio elenco di passaggi "con/senza robot"
- Le ricette esistenti vengono convertite automaticamente al nuovo formato al primo avvio, senza perdite: il vecchio metodo "senza robot" confluisce nelle note della ricetta

### Aggiunto
- Importazione di ricette da testo incollato o dal sorgente di una pagina web, con riconoscimento automatico dei dati strutturati quando disponibili, sempre da rivedere prima di salvare
- 12 nuove ricette di esempio (per un totale di 24), a coprire meglio tutte le categorie

## [1.3.1] — Documentazione ricette

### Aggiunto
- Cartella `ricette/` con un documento markdown leggibile/stampabile contenente tutte le 12 ricette tradizionali, ciascuna con metodo Monsieur Cuisine e metodo senza robot

## [1.3.0] — Metodo senza robot

### Aggiunto
- **Doppio metodo di preparazione**: ogni ricetta può avere sia i passaggi con il Monsieur Cuisine sia un metodo alternativo scritto per fornelli/forno tradizionali
- Interruttore nella vista di lettura per passare dal metodo "Con Monsieur Cuisine" al metodo "Senza robot"
- La modalità cucina guidata ora segue il metodo selezionato (robot o manuale)
- Le 12 ricette tradizionali incluse ora hanno anche il metodo senza robot scritto per ciascuna

## [1.2.0] — Funzioni avanzate

### Aggiunto
- **Esportazione/importazione backup JSON**: scarica tutte le ricette in un file `.json` e ricaricale su un altro dispositivo o dopo aver svuotato la cache del browser
- **Modalità cucina guidata**: naviga i passaggi di una ricetta a schermo intero, un passaggio alla volta, con font grande e timer integrato per i tempi di cottura
- **Timer per i passaggi**: countdown visivo con avviso sonoro al termine, avviabile direttamente durante la modalità cucina guidata
- **Foto per ricetta**: possibilità di allegare un'immagine a ogni ricetta, salvata localmente
- **Ricette preferite**: stellina per contrassegnare le ricette del cuore, con filtro dedicato "Solo preferite"
- **Cronologia "ultima preparazione"**: pulsante "Ho preparato questa oggi" che salva la data, visibile nella card e nella vista dettagliata
- **Lista della spesa automatica**: seleziona più ricette tramite la pianificazione settimanale e genera una lista aggregata degli ingredienti, con caselle di spunta e stampa dedicata
- **Pianificazione settimanale**: assegna una ricetta a ciascun giorno della settimana, come base per la lista della spesa
- **Stampa ricetta singola**: layout dedicato per la stampa pulita di una ricetta, senza elementi di interfaccia superflui

## [1.1.0] — Ricerca per ingredienti

### Aggiunto
- Pannello "Cosa posso cucinare?": inserendo gli ingredienti disponibili, il ricettario mostra le ricette realizzabili subito e quelle a cui mancano pochi ingredienti, evidenziandoli
- Colori distinti per ogni categoria di ricetta

## [1.0.0] — Prima versione

### Aggiunto
- Creazione, modifica ed eliminazione di ricette
- Ingredienti con quantità scalabili in base alle porzioni
- Passaggi con impostazioni robot (velocità, temperatura, tempo, modalità Normale/Reverse/Turbo/Vapore)
- Ricerca per nome/ingrediente e filtro per categoria
- Set di 12 ricette tradizionali laziali/ciociare importabili con un click
- Salvataggio locale tramite `localStorage`, nessun account o server richiesto
