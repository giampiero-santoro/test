# Guida completa — Il Mio Ricettario

Questa guida spiega passo passo come usare tutte le funzioni del ricettario.

## Indice

1. [ℹ️ Come funziona](#ℹ️-come-funziona)
2. [Avvio](#avvio)
3. [Aggiungere una ricetta](#aggiungere-una-ricetta)
4. [📚 Più ricettari](#-più-ricettari)
5. [Importare una ricetta da testo](#importare-una-ricetta-da-testo)
6. [Esportare e importare una singola ricetta](#esportare-e-importare-una-singola-ricetta)
7. [Impostazioni robot per i passaggi (facoltative)](#impostazioni-robot-per-i-passaggi-facoltative)
8. [Impostazioni pentola a pressione (facoltative)](#impostazioni-pentola-a-pressione-facoltative)
9. [Valori nutrizionali della ricetta](#valori-nutrizionali-della-ricetta)
10. [Tag dietetici e allergeni](#tag-dietetici-e-allergeni)
11. [Visualizzare e scalare le porzioni](#visualizzare-e-scalare-le-porzioni)
12. [Ricerca, filtri ed esclusione ingredienti](#ricerca-filtri-ed-esclusione-ingredienti)
13. [Cosa posso cucinare?](#cosa-posso-cucinare)
14. [Preferite, cronologia e contatore preparazioni](#preferite-cronologia-e-contatore-preparazioni)
15. [Modalità cucina guidata e timer](#modalità-cucina-guidata-e-timer)
16. [Pianificazione settimanale](#pianificazione-settimanale)
17. [Lista della spesa](#lista-della-spesa)
18. [Backup: esportazione e importazione](#backup-esportazione-e-importazione)
19. [Esportazione PDF](#esportazione-pdf)
20. [Esportare e importare CSV](#esportare-e-importare-csv)
21. [Modificare, eliminare e archiviare](#modificare-eliminare-e-archiviare)
22. [Dispensa](#dispensa)
23. [Unità di misura](#unità-di-misura)
24. [Temi di colore](#tema-grafico)
25. [Salvataggio dei dati](#salvataggio-dei-dati)
26. [Salvataggio su un file a tua scelta (facoltativo)](#salvataggio-su-un-file-a-tua-scelta-facoltativo)
27. [Dove vengono salvati e caricati i file](#dove-vengono-salvati-e-caricati-i-file)
28. [Domande frequenti](#domande-frequenti)

## 📖 Guida illustrata

La **Guida illustrata** (`guida.html`) spiega tutte le funzioni con screenshot. Si apre dal pulsante **"Guida"** in alto a destra (su telefono, l'icona **?** nella barra in alto), dalla voce **"Guida illustrata"** del menu laterale. Ha un pulsante "← Torna al ricettario" e si può stampare o salvare in PDF dal browser. Ha **20 capitoli** (dalla prima apertura fino a Statistiche, misure pratiche, Cestino e note legali) e tutte le immagini corrispondono all'aspetto attuale del sito.

## ℹ️ Come funziona

Il pulsante **"ℹ️ Come funziona"** nella barra laterale apre una pagina introduttiva pensata per chi apre il sito per la prima volta (o vuole un promemoria): spiega in breve come sono organizzate le varie viste, cos'è **Open Food Facts**, la banca dati collaborativa usata per la scansione del codice a barre in Dispensa. È solo testo informativo, non richiede alcuna configurazione.

## Avvio

Apri il file `index.html` con un doppio click, oppure trascinalo in una finestra del browser. Non serve installare nulla né avere una connessione internet (a parte il primo caricamento dei font, che comunque non è obbligatorio per il funzionamento).

La navigazione (Oggi, Ricettario, Pianificazione, Dispensa…) è una barra laterale sulla sinistra, sempre visibile su schermo grande. Su schermo piccolo (telefono) la barra laterale si nasconde e viene sostituita da una fila sottile in cima con un pulsante **"☰"**: toccandolo si apre come un cassetto a comparsa con tutte le destinazioni e l'interruttore del tema, con uno sfondo scurito dietro per poterlo chiudere toccando fuori. Il cassetto si chiude da solo dopo aver scelto una voce.

## Aggiungere una ricetta

Il modulo è diviso in sezioni (Informazioni, Foto, Ingredienti, Passaggi, Note). Tag dietetici, allergeni, congelamento, tipo di pentola e valori nutrizionali sono nel riquadro **"Altre informazioni"**: toccalo per aprirlo (si apre da solo se la ricetta ha già questi dati). Annulla e Salva restano sempre visibili in fondo.

1. Premi **"+ Nuova ricetta"** in alto
2. Compila nome, categoria, porzioni base e tempo totale
3. Se vuoi, seleziona i **tag dietetici** pertinenti e carica una **foto** — appena scelta si apre un piccolo editor per **ritagliarla e ruotarla** (utile per le foto scattate storte col cellulare, o per inquadrare meglio il piatto): trascina il riquadro dorato per spostarlo, trascina un angolo per ridimensionarlo, e **"⟲ Ruota"** gira l'immagine di 90° ad ogni tocco (**"Reimposta"** annulla rotazione e ritaglio e riparte dall'originale). Premi **"Applica"** per confermare, oppure **"Annulla"** per rinunciare alla foto appena scelta. Una volta salvata, **"✂️ Ritaglia/ruota"** accanto all'anteprima permette di ritoccarla di nuovo in qualsiasi momento. L'immagine finale viene comunque ridimensionata e compressa automaticamente, per occupare meno spazio nel browser
4. Aggiungi gli **ingredienti** uno per uno. Se lo stesso ingrediente (nome e unità di misura) finisce per comparire due volte, al momento di salvare il ricettario te lo segnala e propone di unire le righe sommando le quantità
5. Aggiungi i **passaggi** della preparazione (vedi sotto per le impostazioni robot facoltative)
6. Scrivi eventuali **note personali**
7. Premi **"Salva ricetta"**

Se chiudi il modulo (con la "×" o toccando fuori) mentre hai scritto qualcosa senza aver ancora salvato, il ricettario chiede conferma prima di buttare via le modifiche — capita anche provando a chiudere la scheda del browser o a navigare altrove. Vale anche per il modulo dei prodotti in Dispensa.

> **Note nella griglia:** nella vista Settimana il pulsante ✎ in ogni casella apre un campo per scrivere la nota del pasto; il testo si salva da solo e compare anche nella vista Giorno.

> **La scheda ricetta è una pagina:** si apre nell'area principale; per tornare all'elenco usa "← Le mie ricette", Esc oppure il tasto indietro del browser o del telefono.

## 📚 Più ricettari

Le ricette possono essere organizzate in più "volumi" distinti — ad esempio "Ricette mie", "Ricette della nonna", "Ricette di Andrea" — invece di stare tutte in un unico elenco. Ogni ricetta appartiene a **un solo ricettario per volta**.

- Nella pagina **"☀️ Oggi"**, la sezione **"📚 La tua libreria"** mostra tutti i tuoi ricettari come dorsi di libri affiancati, ciascuno con il numero di ricette che contiene. Toccandone uno vai dritto al Ricettario già filtrato su quel volume
- **"Gestisci ricettari"** (sotto la libreria in Oggi, oppure il pulsante omonimo in cima al Ricettario) apre il pannello dove puoi:
  - **rinominare** un ricettario (modifica direttamente il nome e premi fuori dal campo per salvare)
  - assegnargli una **copertina** personalizzata: premi "📷 Copertina", scegli una foto e ritagliala con lo stesso editor usato per le foto delle ricette — senza copertina viene mostrata un'icona 📚 su sfondo colorato
  - **eliminarlo**: viene sempre chiesta conferma. Se contiene ancora ricette, ti viene chiesto se spostarle in un altro ricettario (restano tutte, solo cambiano "scaffale") oppure eliminarle insieme al volume. Deve sempre restare almeno un ricettario
  - **cambiare l'ordine** dei volumi con le frecce ↑ ↓: l'ordine si riflette nella libreria di "Oggi" e nei menu
  - crearne uno **nuovo**: scrivi il nome (e, se vuoi, scegli una copertina prima di premere "+ Aggiungi")
- **Importare un backup in un ricettario**: quando importi un backup, il ricettario chiede dove mettere le ricette — **come nel backup** (ognuna nel suo volume), **in un ricettario che hai già** oppure **in un nuovo ricettario** (nome a scelta, proposto dal nome del file). Puoi annullare e non importare nulla.
- **Sottocategorie** (facoltative): ogni categoria ha le sue — ad esempio i Primi si dividono in pasta secca e fresca, risi e risotti, gnocchi e chicchi, primi al forno e lasagne, pasta ripiena. Nel modulo della ricetta il campo **"Sottocategoria"** mostra solo le voci della categoria scelta (puoi lasciarlo su "nessuna"). Nell'elenco, scelta una categoria compare una seconda fila di chip per filtrare per sottocategoria, con il conteggio; cambiando categoria il filtro si azzera. Le sottocategorie viaggiano nei backup.
- Nel modulo di una ricetta, il campo **"Ricettario"** accanto alla categoria indica dove salvarla — una nuova ricetta parte già nel volume che stai guardando in quel momento, se ne hai aperto uno specifico dalla libreria
- Nella vista Ricettario, il menu a tendina accanto a quello della categoria **filtra per ricettario** ("Tutti i ricettari" mostra tutto insieme, come prima). La Pianificazione e "Cosa posso cucinare?" continuano invece a cercare sempre su **tutti i ricettari insieme**, per non perdere di vista nessuna ricetta mentre pianifichi la settimana
- Nella finestra "Cerca ricetta" della Pianificazione, con più ricettari ogni ricetta mostra l'etichetta del suo volume e la ricerca trova anche per nome del volume
- I **PDF** portano il nome del ricettario: una ricetta singola si salva come `nome-ricettario_nome-ricetta.pdf`; l'esportazione di più ricette, se sono tutte dello stesso volume, ne usa nome e titolo
- Quando esiste più di un ricettario, ogni card e la scheda dettagliata mostrano una piccola etichetta 📚 con il nome del volume a cui appartiene la ricetta

## Importare una ricetta da testo

1. Premi **"📋 Importa ricetta ▾"** e scegli **"Da testo"**
2. Incolla il testo di una ricetta — copiato da un sito, trascritto da un libro, o scritto di tuo pugno
3. Premi **"Analizza e compila"**: il ricettario prova a riconoscere nome, ingredienti e passaggi dal testo
4. Si apre il modulo di modifica già precompilato: **controlla e correggi ogni campo** — soprattutto quantità e categoria — prima di premere "Salva ricetta". Il riconoscimento automatico è un aiuto, non è mai perfetto

## Esportare e importare una singola ricetta

A differenza del backup e del CSV, che riguardano tutte le ricette insieme, puoi anche scambiare **una ricetta alla volta** come file — comodo per mandarla a qualcuno che usa anche lui questo ricettario:

- Dalla scheda di una ricetta, **"⬇ Esporta ▾" → "⬇ Esporta ricetta (.json)"** scarica un file `.json` con solo quella ricetta
- **"📋 Importa ricetta ▾" → "Da file (.json)"** legge un file esportato così e lo aggiunge alle tue ricette
- Chi riceve la ricetta parte "pulito": preferita, cronologia e contatore delle preparazioni non vengono copiati da chi l'ha esportata
- Se hai già una ricetta con lo stesso nome, l'importazione si ferma per evitare doppioni — rinominala prima di riprovare

## Impostazioni robot per i passaggi (facoltative)

Ogni passaggio si scrive in modo normale, come faresti per qualsiasi ricetta. Se in quel passaggio usi un robot da cucina, premi **"🤖 Impostazioni robot"** sotto il testo del passaggio per aggiungere:

- **Velocità** (0-10)
- **Temperatura** in °C (0-130)
- **Modalità**: Normale, Reverse (mescola senza tritare), Turbo (sminuzza alla massima velocità), Vapore

Il campo **Durata (min)** è invece sempre visibile: serve anche da timer nella modalità cucina guidata, che tu usi un robot oppure no.

## Impostazioni pentola a pressione (facoltative)

Come per il robot, se in un passaggio usi la pentola a pressione premi **"🍲 Impostazioni pentola a pressione"** sotto il testo del passaggio per aggiungere:

- **Pressione**: un numero, con l'unità che preferisci (Bar, PSI o kPa) — puoi usare unità diverse per ricette diverse, il ricettario non fa conversioni tra loro
- **Rilascio**: Naturale, Rapido, oppure Misto (un po' naturale e poi rapido)
- **Durata rilascio (min)**: quanto dura il rilascio naturale — non compare se scegli "Rapido", perché in quel caso non c'è attesa. Questa durata alimenta un **timer separato** da quello della cottura in pressione, sia nella scheda della ricetta sia in modalità cucina guidata
- **Liquido minimo (ml)**: promemoria della quantità minima di liquido necessaria per fare pressione — non è un ingrediente della ricetta, è un avviso tecnico

Nel modulo di modifica trovi anche, accanto a porzioni e tempo, un campo facoltativo **"Tipo pentola a pressione"** (Elettrica / A fornello) valido per l'intera ricetta.

Le ricette mostrano automaticamente un'etichetta del metodo di cottura, nella lista e nella scheda, dedotta dai passaggi — non serve spuntare nulla a mano: **🍲** se c'è almeno un passaggio a pressione, **🤖** se c'è almeno un passaggio con impostazioni robot, **🔥 Tradizionale** se non ne ha nessuno dei due. Una ricetta che usa entrambi i metodi mostra sia 🍲 sia 🤖.

## Valori nutrizionali della ricetta

Il ricettario **non calcola** i valori nutrizionali di una ricetta sommando quelli dei singoli ingredienti crudi: la cottura altera acqua, grassi e altri valori in modo imprevedibile (la pasta assorbe acqua, un fritto assorbe olio...), quindi una somma "a crudo" darebbe un numero preciso ma sbagliato.

I valori nutrizionali compaiono nella scheda di una ricetta solo se li inserisci tu:

- Nel modulo di modifica, premi **"🍎 Valori nutrizionali (per porzione)"** per scrivere Kcal, Proteine, Grassi, Carboidrati, Fibre, Zuccheri e Sale — facoltativi, utili quando li conosci già da un'altra fonte (un'etichetta, un sito). Sono sempre riferiti a **una singola porzione**

**Importare da un testo.** Accanto al pulsante dei valori nutrizionali (nel modulo della ricetta e in quello del prodotto in Dispensa) c'è **"📥 Importa valori…"**: incolla la tabella copiata da un sito o da un documento. Il ricettario riconosce energia, grassi, carboidrati, zuccheri, fibre, proteine e sale (anche il sodio, convertito in sale), in italiano e inglese, e converte da solo tra "per 100 g" e "per porzione" indicando i grammi della porzione. Vedi un'anteprima modificabile con eventuali avvisi di coerenza prima di usare i valori.

**Importare da una foto.** Dalla stessa finestra, **"📷 Da foto dell'etichetta…"** legge la tabella da una foto, interamente sul dispositivo (nessuna immagine viene inviata). La prima volta carica circa 13 MB di strumenti di lettura, poi li ricorda. La lettura può sbagliare, soprattutto le virgole: controlla sempre l'anteprima. Non disponibile nel file singolo.

Una ricetta scritta a mano senza questi valori semplicemente non mostra quella sezione — non viene inventato nulla.

## Tag dietetici e allergeni

Nel modulo di modifica trovi due sezioni distinte, perché rispondono a domande diverse:

- **Tag dietetici** — Vegetariano, Vegano, Senza glutine, Senza lattosio, Piccante — indicano **per chi** è adatta la ricetta (una scelta, non un'analisi degli ingredienti). Si possono usare come filtro nella lista (vedi sezione successiva).
- **Allergeni contenuti** — i 14 allergeni a dichiarazione obbligatoria nell'UE (Glutine, Crostacei, Uova, Pesce, Arachidi, Soia, Latte, Frutta a guscio, Sedano, Senape, Semi di sesamo, Anidride solforosa e solfiti, Lupini, Molluschi) — indicano invece **cosa contiene davvero** la ricetta, da segnalare a chi la mangia. Sono facoltativi e vanno selezionati a mano in base agli ingredienti usati.

Entrambi compaiono nella scheda della ricetta come etichette colorate (gli allergeni in rosso, sotto la scritta "⚠ Contiene:"). Nel pannello filtri avanzati puoi anche **escludere dalla lista le ricette che contengono uno o più allergeni** scelti, oltre a filtrare per tag dietetico.

## PDF A4 orizzontale (senza stampante)

Dal menu **Esporta ▾** della scheda, **"📄 PDF A4 orizzontale"** scarica direttamente un file PDF, senza passare dalla stampante. La ricetta ha lo stesso impianto della scheda: titolo e procedimento a sinistra, **ingredienti in alto a destra a partire dal margine alto del foglio** (sotto, valori nutrizionali e foto), senza menu né pulsanti come "Modifica". I margini sono quelli predefiniti (10 mm; 8 mm nel layout a due colonne).

**Layout del PDF.** Quando esporti più ricette ti viene chiesto come: **una ricetta per pagina** (il carattere si riduce da solo finché la ricetta sta in un foglio) oppure **due colonne con più ricette per foglio** (caratteri piccoli, le ricette brevi si impilano nella colonna). La scelta resta come predefinita.

Per un ricettario intero: in **Gestisci ricettari** usa **"📄 PDF A4"** sulla riga del ricettario, oppure scegli le ricette da **Esporta PDF → PDF A4 orizzontale**. La stampa del browser (Ctrl/Cmd+P) a scheda aperta stampa comunque la scheda pulita. Il PDF usa caratteri standard (Helvetica) e non include le icone emoji.

## Visualizzare e scalare le porzioni

**Ricetta precedente / successiva.** Aprendo una ricetta dall'elenco compaiono in alto **"‹ Precedente"** e **"Successiva ›"** con la posizione (es. "2 di 3"): scorri le ricette dell'elenco — con i filtri e l'ordine attivi — senza tornare indietro. Funziona anche con le frecce ← → della tastiera e, su telefono, trascinando il dito di lato. Aprendo la ricetta da altre pagine (Oggi, Statistiche, Pianificazione) i pulsanti non compaiono.

Cliccando su una ricetta si apre la vista di lettura, con ingredienti, passaggi numerati e un controllo **+/−** per aumentare o diminuire le porzioni: le quantità si ricalcolano automaticamente in proporzione. Per le unità "a conteggio" — cucchiaio/cucchiai, cucchiaino/cucchiaini, pizzico/pizzichi, pezzo/pezzi, tazza/tazze, fetta/fette, spicchio/spicchi, rametto/rametti, filetto/filetti, foglia/foglie — quando il ricalcolo scende sotto l'unità intera, al posto del decimale compare la frazione da cucina più vicina (es. 2 cucchiai scalati a un quarto delle porzioni diventano "1/2 cucchiai" invece di "0.5"; se resta una parte intera, es. "1 e 1/2"). Per grammi, ml, litri e simili resta invece il numero decimale, più preciso per queste unità.

### Porzione doppia e congelamento

Nel modulo di modifica puoi spuntare **"❄️ Si congela bene"** per le ricette che si conservano bene in freezer (sughi, zuppe, polpette, lasagne…). Quando è attivo, nella vista della ricetta compare un avviso con il pulsante **"👯 Raddoppia le porzioni"**: un tocco e le quantità degli ingredienti si ricalcolano per il doppio delle porzioni indicate, così prepari una porzione in più da congelare senza dover ricalcolare nulla a mano. È una spunta manuale — valuta tu, ricetta per ricetta, se si presta davvero al congelamento.

## Ricerca, filtri ed esclusione ingredienti

**Barra compatta (novità 5.10):** in cima a "Le mie ricette" ci sono solo la ricerca, il pulsante **Filtri** (con un numero quando hai filtri attivi), il menu **⋯** (collegamenti a Importa ricette e Backup ed esportazione, Seleziona ed elimina, Gestisci ricettari, Cestino) e le categorie. L'ordinamento e il numero di ricette stanno sopra l'elenco. Su telefono "Aggiungi ricetta" diventa un pulsante tondo in basso.

- Il campo di ricerca cerca sia nel nome della ricetta sia negli ingredienti
- Il menu a tendina filtra per categoria
- Se hai più di un ricettario, un altro menu a tendina filtra per ricettario (vedi [📚 Più ricettari](#-più-ricettari)) — "Tutti i ricettari" mostra tutto insieme
- Il menu a tendina accanto alla categoria cambia l'ordine della lista: Nome (A-Z o Z-A), Aggiunta di recente, Ultima preparata, Più preparate — di base è per nome (A-Z)
- **Il menu "Qualsiasi tempo"** filtra per tempo di preparazione: entro 15 min, entro 30 min, entro 1 ora, oppure "Con tempo indicato" (mostra solo le ricette a cui hai effettivamente assegnato un tempo, qualunque esso sia). Una ricetta senza tempo indicato non compare in nessuna delle soglie, comprese "entro 15/30/60 min" — non viene considerata "veloce" solo perché non sai quanto ci vuole
- **"★ Solo preferite"** (dentro il pannello **"Filtri"**) mostra solo le ricette con la stellina
- Nel pannello **"Filtri"** trovi anche cottura, tag ed esclusioni: con altre opzioni, tenute nascoste di default per non affollare la pagina — il pulsante mostra tra parentesi quanti filtri sono attivi (es. "🔍 Cottura, tag ed esclusioni (2)"):
  - **Metodo di cottura**: "🍲 Pentola a pressione" (almeno un passaggio a pressione), "🤖 Robot" (almeno un passaggio con velocità, temperatura o una modalità diversa da Normale), "🔥 Tradizionale" (nessuna impostazione robot né pressione) — si possono combinare liberamente tra loro
  - **"Escludi ingredienti"**, che nasconde le ricette contenenti uno o più ingredienti scritti lì (separati da virgola) — utile per allergie o cose che non vuoi usare in quel momento
  - le "pillole" per il tag dietetico (puoi selezionarne più di una insieme)

## Cosa posso cucinare?

Usa automaticamente i prodotti che hai già in **Dispensa** — non serve più riscriverli a mano:

1. Se vuoi, scrivi nel campo anche altri ingredienti che hai ma non sono in Dispensa (es. erbe fresche, avanzi), separati da virgola — la lista resta salvata anche se chiudi e riapri il ricettario
2. Se preferisci usare solo **alcuni** prodotti della Dispensa invece di tutti (es. per vedere cosa potresti cucinare con solo quello che ti avanza, o prima della spesa), premi **"📋 Scegli prodotti"**: si apre un elenco con una casella per ciascun prodotto, già tutte selezionate. Deseleziona quelle che non vuoi considerare (oppure usa "Deseleziona tutti" e scegli solo quelle che ti servono) e premi **"Applica selezione"**. Finché la selezione è parziale, il pannello lo ricorda ("Usi solo N prodotti selezionati…"); selezionando di nuovo tutti i prodotti si torna al comportamento automatico predefinito
3. Indica **per quante porzioni** vuoi cucinare: le quantità di ogni ricetta vengono riscalate su quel numero e confrontate con le quantità che hai in Dispensa
4. Scegli dal menu a tendina quanti ingredienti possono mancare: **"Solo ricette già pronte"** (zero mancanti), fino a un massimo di 1/2/3/5, oppure **"Qualsiasi risultato"** per non applicare limiti — la scelta resta salvata
5. Premi **"Trova ricette"** (funziona anche a campo vuoto, se hai già qualcosa in Dispensa)
6. Le ricette che rispettano la soglia scelta si ordinano per numero di ingredienti mancanti, con tre possibili badge: verde **"✓ Puoi farla"**, giallo **"⚠ Quantità scarse"** (hai tutti gli ingredienti, ma per quel numero di porzioni qualcuno potrebbe non bastare — sotto la ricetta trovi quali, con quanto serve e quanto ne hai) e arancione **"Manca X ingr."**. Sotto il badge verde compare sempre il promemoria *"Controllare le quantità effettive che hai a disposizione"*, perché il confronto resta una stima basata su quanto hai segnato in Dispensa
7. Premi **"Mostra tutte"** per tornare alla visualizzazione normale

Il confronto sui nomi riconosce varianti semplici (es. "pomodoro" riconosce "pomodori pelati"), ma è un controllo testuale di base. Il controllo sulle **quantità** viene fatto solo quando è affidabile: servono una quantità e un'unità confrontabile (g/kg, ml/l...) sia nella ricetta sia nel prodotto in Dispensa. Se mancano, l'ingrediente viene considerato semplicemente disponibile, invece di dare un giudizio su un confronto non attendibile. Se aggiorni la Dispensa mentre questa vista è attiva, l'elenco delle ricette si aggiorna da solo.

## Preferite, cronologia e contatore preparazioni

Dalla barra laterale, **Preferiti** mostra solo le ricette con il cuore; le pillole delle categorie in alto (Primi, Secondi…) indicano quante ricette ci sono in ciascuna e funzionano anche qui, per vedere solo i primi preferiti, i dolci preferiti e così via.

- La stellina ★ contrassegna una ricetta come preferita; il pulsante **"★ Solo preferite"** filtra rapidamente
- Nella vista dettagliata, **"Ho preparato questa oggi"** registra la data e aggiorna il contatore di quante volte hai preparato quella ricetta, entrambi visibili nella card e nella vista

## Modalità cucina guidata e timer

1. Apri una ricetta e premi **"👩‍🍳 Modalità cucina"**
2. Un passaggio alla volta, a caratteri grandi
3. **"← Indietro"** / **"Avanti →"** per navigare
4. Se il passaggio ha una durata, premi **"Avvia timer"**: countdown visivo con avviso sonoro al termine
5. Se il passaggio ha anche un rilascio pressione con una durata (Naturale o Misto), compare un secondo pulsante **"Avvia timer rilascio"**, con il proprio countdown indipendente dal primo
6. **"Esci ✕"** per tornare alla vista normale

Mentre la modalità cucina è aperta, il sito prova a **impedire allo schermo di spegnersi da solo** (utile quando hai le mani impegnate o sporche), finché non esci o non cambi scheda/app a lungo. Su un browser che non supporta questa funzione, compare un piccolo avviso sotto il titolo del passaggio: lo schermo potrebbe comunque spegnersi secondo le normali impostazioni del dispositivo, e basterà riaccenderlo per continuare da dove eri rimasto.

## Pianificazione settimanale

La pianificazione è una vista separata dal ricettario: premi **"📅 Pianificazione"** nella barra laterale per aprirla. La Dispensa è sempre a un tocco nella barra laterale (o nella barra in basso sul telefono), comodo mentre decidi cosa cucinare e vuoi controllare cosa hai già in casa. Sopra la settimana, la data dell'intervallo mostra sotto la scritta **«Questa settimana»** (o «Prossima settimana», «Settimana scorsa»).

Puoi anche saltare la ricerca e pianificare al volo mentre guardi una ricetta: nella sua scheda, premi **"📅 Pianifica"** per scegliere giorno, fascia e orario facoltativo senza uscire dalla vista. Il pannello resta aperto dopo ogni aggiunta, così puoi assegnare la stessa ricetta a più giorni di seguito.

- Su computer e tablet largo la pianificazione si apre come **tabella della settimana**: i **giorni sono le colonne**, i **pasti sono le righe** (nome in verticale a sinistra, in ordine di orario). Ogni ricetta è una scheda con foto, nome, porzioni e tempo. Le caselle tratteggiate con **＋** creano quel pasto nel giorno; se aggiungi un pasto in un solo giorno, la sua riga compare per tutta la settimana. Il giorno di oggi è evidenziato.
- Il pulsante in alto a sinistra (riquadro con barra laterale) **nasconde o mostra il menu laterale** per dare più spazio alla settimana; la scelta resta salvata. Vale su computer e tablet.
- Con l'interruttore **"Settimana / Giorno"** puoi passare alla vista **un giorno alla volta** (la scelta si ricorda): usa le linguette in alto (Lun, Mar, Mer…) o le frecce ‹ › per cambiare giorno. Su smartphone e schermi stretti si usa sempre questa vista, perché la griglia non sarebbe leggibile. Orario e note per fascia si modificano nella vista "Giorno"
- La vista **Giorno** è una **linea del tempo**: gli orari a sinistra (modificabili da lì), ogni pasto in una scheda con le ricette (foto, tempo, porzioni) e la nota. A lato il riquadro **«Lunedì in breve»** (il nome segue il giorno) con numero di pasti e ricette, calorie, persone (se i pasti hanno porzioni diverse, per esempio «da 1 a 8»), totali nutrizionali e i pulsanti **Lista della spesa del giorno** e **Totali settimana**. Su telefono il riquadro va sotto le schede.
- **Ogni giorno parte vuoto**: i pasti li aggiungi tu, quanti ne servono (anche solo 2 in una giornata e 8 o più in un'altra). Dal menu a tendina **"＋ Aggiungi pasto…"** scegli tra Colazione, Spuntino, Pranzo, Merenda, Cena, Brunch, Aperitivo, Dopocena, Pre-allenamento, Post-allenamento, oppure **"Altro (scrivi il nome)…"** per un pasto tutto tuo (resta poi nel menu)
- Puoi aggiungere **più pasti dello stesso tipo** nello stesso giorno (compaiono come "Spuntino" e "Spuntino 2"). I pasti si dispongono da soli in ordine di orario (usando l'orario che indichi o quello tipico del pasto) e ciascuno può contenere più ricette
- La **×** su un pasto lo rimuove: se contiene ricette ti chiede conferma, e le ricette restano nel ricettario. Le pianificazioni già fatte restano com'erano
- Per aggiungere una ricetta: nel pasto premi **"🔍 Cerca ricetta…"** — si apre una finestra dove puoi cercare per nome o ingrediente e toccare quella che vuoi, invece di scorrere un elenco lungo
- Quando aggiungi una ricetta alla pianificazione (da qui o dal pulsante "📅 Pianifica" nella sua scheda), il ricettario controlla i suoi ingredienti rispetto a quello che hai segnato nella Dispensa: se qualcosa manca, te lo segnala e ti chiede conferma prima di aggiungerlo a un promemoria per la lista della spesa
- Per aggiungere invece un prodotto della Dispensa come pasto (es. uno yogurt a colazione, della frutta come spuntino): nel pasto premi **"🥫 Dalla dispensa…"** — si apre una finestra di ricerca sui prodotti che hai in dispensa, allo stesso modo di quella delle ricette. Scelto il prodotto, viene chiesta una **quantità facoltativa** per quel pasto (precompilata con quella che hai in dispensa, ma modificabile): se la indichi, compare accanto al nome nella pianificazione
- Ogni fascia pasto ha anche un campo per una **nota libera facoltativa** (es. "cena fuori", "avanzi", "preparare il giorno prima…), utile per promemoria che non sono legati a una ricetta precisa. Si salva da sola appena esci dal campo
- **Orario dei pasti**: ogni pasto ha il suo orario (riquadro verde sotto il nome), proposto in base al tipo di pasto (Colazione 07:30, Pranzo 13:00, Cena 20:00…) e modificabile. I pasti del giorno si mettono da soli in ordine di orario, in settimana, in vista Giorno e in Oggi; le ricette del pasto ne prendono l'orario.
- Se una ricetta ha valori nutrizionali per porzione, o un prodotto Dispensa ha valori per 100 g, sotto la voce pianificata compare una riga con Kcal/Proteine/Grassi/Carboidrati/Fibre/Zuccheri/Sale calcolati per quella voce: per una ricetta, moltiplicati per "per quante persone" impostato in cima alla Pianificazione; per un prodotto Dispensa, sulla quantità indicata per quel pasto (solo se espressa in grammi o kg — altre unità come "pz" non permettono un calcolo affidabile, e in quel caso la riga non compare). Gli stessi valori si sommano automaticamente anche **per fascia pasto** (sotto l'elenco di ogni fascia) e **per l'intera giornata** (in cima alla scheda del giorno) — un pasto o un giorno senza nessun dato disponibile non compare come "zero", semplicemente non genera una riga
- **"📊 Totali settimana"**, accanto a "🛒 Lista della spesa del giorno", apre una finestra con il totale nutrizionale di ciascun giorno della settimana e il totale complessivo — sempre calcolato solo sulle voci che hanno dati disponibili
- Clicca sul nome di una voce pianificata per aprirne la scheda: quelle con l'etichetta 🥫 aprono la scheda del prodotto in Dispensa, le altre la scheda della ricetta
- **"✓"** su una voce pianificata la segna come consumata e prova ad aggiornare la Dispensa di conseguenza (chiede sempre conferma, mostrando cosa sta per cambiare):
  - per un pasto aggiunto **"dalla dispensa"**, se avevi indicato una quantità nella stessa unità di misura del prodotto, quella quantità viene tolta dal prodotto
  - per un pasto da **ricetta**, il ricettario cerca tra i prodotti in Dispensa un nome identico agli ingredienti, oppure — se non c'è — un nome simile ma solo quando è candidato un unico prodotto (le quantità sono scalate in base a "per quante persone" impostato in Pianificazione), e toglie la quantità usata dove l'unità di misura coincide o è equivalente (convertita automaticamente, es. ricetta in "g" e prodotto in "kg") — altrimenti lascia il prodotto invariato e te lo segnala. Se i prodotti con un nome simile sono più di uno (es. "Farina 00" e "Farina integrale" per l'ingrediente "Farina"), non ne tocca nessuno e te li elenca entrambi, per lasciare a te la scelta
  - una volta confermato, il segno di spunta resta acceso e accanto compare **"↺"**: lo tocchi per annullare, il che riporta il pasto a "da consumare" e ripristina in Dispensa (dove il prodotto esiste ancora) quanto era stato tolto
- **"Svuota settimana"** cancella tutta la pianificazione, tutti i giorni compresi (chiede conferma) — prima di farlo, il ricettario salva automaticamente una copia come "settimana scorsa"
- **"➕ Aggiungi settimana scorsa"** aggiunge quella copia alla pianificazione attuale, senza cancellare nulla di quello che hai già pianificato per questa settimana: le voci della settimana scorsa si sommano a quelle di oggi, giorno per giorno, e arrivano già segnate come "da consumare" (non ereditano la spunta ✓ che avevi messo). Non è legata a un calendario reale: è semplicemente l'ultima pianificazione che avevi prima dell'ultima volta che hai premuto "Svuota settimana". Se lo premi più volte, le voci si aggiungono ogni volta — usalo quindi una volta sola, o elimina a mano i doppioni che non ti servono

## Lista della spesa

Il menu **"Lista della spesa"** (su telefono la scheda **Spesa**) apre **la tua lista, indipendente dalla pianificazione**:

- Scrivi un ingrediente, la quantità e l'unità (facoltative) e premi **Aggiungi**. Lo stesso ingrediente con unità equivalenti si somma in una sola riga.
- **"Aggiungi gli ingredienti di una ricetta"**: scegli la ricetta e le porzioni. Dalla scheda di una ricetta lo stesso si fa con **"Aggiungi alla spesa"**.
- **"Unisci con la lista della settimana"** somma alla tua lista gli ingredienti delle ricette pianificate. La lista della settimana non cambia; **"Annulla ultima unione"** ripristina la tua lista.
- Spunta ciò che compri; **"Spuntati in Dispensa"** li sposta in Dispensa. Con ✏️ modifichi una riga, con 🗑 la togli. **"Svuota lista"** e **"Esporta PDF"** sono in fondo.
- La lista della settimana, generata dalle ricette pianificate, resta disponibile dal pulsante **"Lista della settimana"**.

### Lista generata dalla pianificazione

**Modificare o togliere una voce (novità 5.1):** su ogni riga, ✏️ cambia la quantità e 🗑 toglie la voce dalla lista; in fondo "Rimetti le voci in lista" annulla le rimozioni. In cima, il riepilogo mostra quante voci sono ancora "da comprare" e quante già "nel carrello" (spuntate). Le modifiche valgono per la lista della settimana e dei singoli giorni, e si azzerano con "Svuota lista".

Puoi generare la lista della spesa a tre livelli diversi, a seconda di cosa ti serve in quel momento:

- **Per l'intera settimana pianificata**: nella vista Pianificazione, imposta prima **"Per quante persone stai pianificando?"** — le quantità verranno scalate di conseguenza rispetto alle porzioni base di ogni ricetta — poi premi **"🛒 Lista della spesa (settimana)"**. Il ricettario somma gli ingredienti di tutte le ricette pianificate nei sette giorni, raggruppandoli per nome e unità. I prodotti aggiunti dalla Dispensa non vengono conteggiati, dato che li hai già in casa. Compaiono anche gli ingredienti segnalati come mancanti dalla Dispensa quando hai pianificato una ricetta (etichetta "dalla dispensa"), anche se per questa settimana non hai ripianificato quella ricetta — restano come promemoria finché non li spunti, oppure finché un ingrediente con lo stesso nome non compare già tra quelli di un'altra ricetta pianificata per la settimana in corso. Accanto al pulsante compare un piccolo numero (es. "· 7") con quante voci ci sarebbero già da comprare, così non serve aprire la lista solo per scoprire se manca qualcosa
- **Per un singolo giorno**: nella vista Pianificazione, apri il giorno che ti interessa con le linguette o le frecce ‹ ›, poi premi **"🛒 Lista della spesa del giorno"** sotto al titolo del giorno. Include solo le ricette assegnate a quel giorno (scalate sempre in base a "per quante persone"), senza i promemoria dalla Dispensa, che non sono legati a un giorno preciso
- **Per una singola ricetta**: apri la ricetta e premi **"🛒 Lista della spesa"** nella sua scheda. Include solo gli ingredienti di quella ricetta, scalati alle porzioni che stai visualizzando in quel momento (indipendenti da "per quante persone" della Pianificazione)

In tutti e tre i casi si apre la stessa finestra: gli ingredienti sono raggruppati per **reparto** (frutta, verdura, pasta e cereali, latticini, ecc. — gli stessi reparti della Dispensa), nell'ordine in cui si trovano di solito al supermercato, per spuntarli più rapidamente mentre fai la spesa. Spunta gli ingredienti man mano che li acquisti ed ognuno viene anche aggiunto alla Dispensa (o la sua quantità aumentata, se già presente con la stessa unità di misura o una equivalente) — un piccolo avviso conferma quanti prodotti sono stati aggiornati, con un link **"Vedi Dispensa →"** per passare subito a controllarla, utile a spesa finita. Per quelli con l'etichetta "dalla dispensa" (presenti solo nella lista della settimana), spuntarli li toglie anche definitivamente dal promemoria. Togliere la spunta non annulla l'aggiornamento in Dispensa. Lo stato delle spunte resta **salvato per nome ingrediente**: se rigeneri la lista (es. dopo aver cambiato la pianificazione), ciò che avevi già spuntato resta spuntato. Premi **"⬇ Esporta PDF"** per scaricarla come file.

Ogni ingrediente che compare più volte (anche da ricette diverse, se pianifichi più ricette nella stessa lista) viene sommato in un'unica riga, purché il nome coincida e le unità siano uguali o equivalenti (vedi [Unità di misura](#unità-di-misura)) — altrimenti resta su righe separate.

**Controllo incrociato con la Dispensa**: se un ingrediente della lista corrisponde a un prodotto che hai già segnato in Dispensa, sotto la riga compare un avviso. Il ricettario cerca prima un prodotto con lo stesso nome; se non lo trova, prova anche una corrispondenza più elastica come quella di "Cosa posso cucinare?" (utile per varianti dello stesso ingrediente, es. "Farina" nella ricetta e "Farina 00" in Dispensa) — ma solo quando è candidato un unico prodotto: se ce ne sono più di uno possibile, ti vengono elencati ma senza sottrazione automatica, per non rischiare di sbagliare
- Se la quantità in Dispensa è nella stessa unità di misura (oppure in un'unità equivalente convertibile automaticamente: grammi/chilogrammi, millilitri/centilitri/litri) compare **"Sottrai dalla lista"**: un tocco toglie quella quantità da quella da acquistare, così compri solo quello che ti manca davvero. Se quello che hai in Dispensa basta o avanza, la riga si aggiorna con "già in Dispensa" e la casella si disabilita, perché non serve comprarne altro
- Dopo aver sottratto, compare **"Annulla"** al posto di "Sottrai dalla lista": riporta la riga alla quantità originale, comodo se hai premuto per sbaglio o hai cambiato idea
- Se l'unità di misura non è convertibile automaticamente (es. "pezzi" contro "grammi") o la quantità in Dispensa non è indicata, compare comunque un avviso che te lo ricorda, ma senza sottrazione automatica: la conversione resta a te
- **"🥫 Sottrai tutto"**, sopra "⬇ Esporta PDF", applica in un solo tocco tutte le sottrazioni disponibili in quel momento nella lista, senza doverle confermare una per una


## Backup: esportazione e importazione

Le funzioni di backup, esportazione e importazione hanno **due pagine dedicate** nel menu laterale: **Importa ricette** (da testo, da file .json, da CSV, da un backup completo) e **Backup ed esportazione** (backup, salvataggio su file, esportazione CSV e PDF, cambio dispositivo). Ci arrivi anche dal menu **⋯** di "Le mie ricette". In cima a "Backup" trovi un promemoria ("Ultimo backup: X giorni fa") che diventa rosso dopo due settimane senza backup.

- **Esporta backup**: scarica un file `.json` con tutte le ricette (con il ricettario a cui appartengono), i ricettari stessi con le loro copertine, la pianificazione settimanale, le fasce pasto personalizzate e i promemoria di ingredienti mancanti dalla Dispensa. Fallo periodicamente, o prima di cancellare i dati del browser
- **Importa backup**: seleziona un file `.json` esportato in precedenza per ricaricare i dati. Le ricette e i prodotti Dispensa nuovi (identificativo non già presente) vengono sempre aggiunti; se il backup contiene anche voci già presenti (stesso identificativo — capita importando un backup più recente esportato da un altro dispositivo), ti viene chiesto una volta se sostituirle con la versione dal backup oppure lasciarle come sono. Alla fine un riepilogo ti dice quante ne sono state aggiunte, aggiornate o lasciate invariate

## Esportazione PDF

- Dalla vista di una ricetta, il menu **"⬇ Esporta ▾"** offre **"⬇ Esporta PDF"** per scaricarla come file (con ingredienti già scalati alle porzioni che stai visualizzando)
- Dalla lista della spesa (settimana, giorno o singola ricetta), **"⬇ Esporta PDF"** scarica la lista come file
- Dalla vista Pianificazione, **"⬇ Esporta PDF settimana"** scarica un file con il piano di tutti i giorni insieme alla lista della spesa aggregata
- Per stampare o portare con te **tutto il ricettario**: **Backup ed esportazione → "📖 Esporta ricettario in PDF…"**. Scarica un unico file con un indice iniziale (i nomi di tutte le ricette, nell'ordine in cui le hai ordinate nell'elenco) seguito da ogni ricetta su una pagina nuova, alle sue porzioni base, con ingredienti, passaggi, valori nutrizionali e note come nell'esportazione di una singola ricetta. Le ricette **archiviate** restano escluse, come nel resto del sito
- Nella stessa finestra puoi scegliere **quali ricette includere**: cerca per nome, spunta singole ricette o intere categorie, oppure apri **"🔍 Filtra per cottura, tag o allergeni"** per restringere l'elenco anche per metodo di cottura, tag dietetici, allergeni esclusi e **ricettario** (filtri combinabili). "Seleziona tutte (visibili)" seleziona solo ciò che risulta dai filtri correnti, senza perdere una selezione fatta in precedenza con un filtro diverso
- Se esporti ricette di **più ricettari insieme**, sotto il titolo di ogni ricetta (e accanto al suo nome nell'indice) compare da quale ricettario viene — superfluo, e quindi omesso, quando filtri su un solo volume alla volta
- Il PDF è generato interamente dal ricettario stesso (nessun servizio esterno): supporta più pagine e le lettere accentate italiane; eventuali emoji o simboli non standard nel testo vengono sostituiti con "?"
- Non è più disponibile la stampa diretta dal browser (la finestra "Stampa" di sistema): su alcuni dispositivi, in particolare mobile, produceva un foglio vuoto. L'esportazione PDF sostituisce completamente questa funzione ed è più affidabile, perché genera un file scaricabile senza passare dalla finestra di stampa

## Esportare e importare CSV

Oltre al backup JSON completo, puoi scambiare le ricette in formato CSV (una riga per ricetta), comodo per aprirle in Excel o Fogli Google:

- **"⬇ Esporta CSV"** scarica un file `.csv` con le tue ricette: nome, categoria, **ricettario**, porzioni, tempo, tag, allergeni, ingredienti e passaggi sono ciascuno in una colonna. Dentro la stessa cella, più ingredienti o passaggi sono separati da " | ". Il menu a tendina **"Ricettario per CSV/PDF singoli"**, appena sopra i pulsanti CSV, limita l'esportazione a un solo ricettario invece di tutti insieme — utile per scambiare, ad esempio, solo le "Ricette della nonna" con qualcun altro
- **"⬆ Importa CSV"** legge un file con lo stesso formato (le colonne Nome, Ingredienti e Passaggi sono obbligatorie) e aggiunge le ricette che non hai già (il confronto è per nome). Per quelle che invece corrispondono a un nome già presente, ti viene chiesto una volta se sostituirle con la versione dal CSV o lasciarle come sono — se scegli di sostituirle, foto, preferita e cronologia della ricetta esistente restano invariate, dato che il CSV non le contiene
- Se il CSV ha una colonna **Ricettario**, ogni riga va a finire in quel ricettario (creato al volo se non esiste ancora, cercandolo per nome); le righe senza quella colonna, o con la cella vuota, usano il ricettario scelto nel menu a tendina sopra i pulsanti CSV
- Il riconoscimento di quantità/unità negli ingredienti e delle impostazioni robot nei passaggi è automatico ma approssimativo, soprattutto se modifichi il CSV a mano: controlla sempre le ricette importate

## Modificare, eliminare e archiviare

- Dalla vista di una ricetta, **"Modifica"** per aprirla in modalità editing
- **"⧉ Duplica"** crea una copia della ricetta (con "(copia)" nel nome) e la apre subito in modifica, senza toccare l'originale — comodo per creare varianti, es. una versione vegetariana, senza riscrivere tutto da capo
- **"Elimina ricetta"** la rimuove definitivamente (chiede conferma) e la toglie automaticamente anche dalla pianificazione settimanale
- Per eliminarne **più di una insieme**, premi **"☑️ Seleziona"** nella barra in alto al Ricettario: ogni ricetta mostra una casella, tocca quelle che vuoi eliminare (si evidenziano con un bordo dorato) e premi **"🗑 Elimina selezionate"**. Trovi anche **"Seleziona tutte"** — che seleziona le ricette attualmente visibili, cioè quelle che passano ricerca e filtri, non l'intera raccolta — e **"Annulla"** per uscire senza eliminare nulla. Viene chiesta conferma con l'elenco dei nomi, e anche qui le ricette eliminate spariscono dalla pianificazione

Tutte le azioni che non si possono annullare (eliminare una o più ricette, un prodotto dalla Dispensa, svuotare la settimana, chiudere un modulo con modifiche non salvate…) mostrano un avviso dedicato, non il riquadro generico del browser: spiega cosa sta per succedere e, dove utile, come recuperare i dati (es. "Svuota settimana" ricorda che una copia resta disponibile con "➕ Aggiungi settimana scorsa"). Il pulsante di conferma è rosso per le eliminazioni vere e proprie, dorato per le altre conferme.

### Archiviare una ricetta (nasconderla senza eliminarla)

Se c'è una ricetta che non prepari più spesso ma non vuoi perdere (una versione superata, una ricetta stagionale, un esperimento), puoi **archiviarla** invece di eliminarla: dalla vista della ricetta premi **"📦 Archivia"**. La ricetta resta salvata con tutti i suoi dati, ma:

- non compare più nell'elenco principale del Ricettario, nella ricerca o nei filtri
- non viene più proposta da "Cosa posso cucinare?"

Per ritrovarla, apri **"Filtri"** e premi **"Mostra archiviate"**: l'elenco mostra solo le ricette archiviate, con un avviso dedicato nella loro scheda. Da lì puoi riaprirla e premere **"📂 Disarchivia"** per farla tornare visibile come prima, oppure eliminarla definitivamente se non serve più. Premi di nuovo "📂 Mostra attive" per tornare all'elenco normale.

## Dispensa

La Dispensa è una sezione separata dal ricettario, per tenere traccia di quello che hai in casa — non ricette, ma prodotti veri e propri come frutta, verdura, salumi, yogurt: premi **"🥫 Dispensa"** nella barra laterale per aprirla.

1. Premi **"+ Nuovo prodotto"**
2. Scrivi il nome e scegli una categoria tra quelle disponibili: dai freschi (Frutta, Verdura, Uova, Salumi, Latticini e pronti) ai Surgelati, fino alla dispensa vera e propria (Pasta/riso e cereali, Legumi, Farine/zucchero e lieviti, Conserve e scatolame, Spezie e condimenti, Oli/aceti e grassi, Bevande, Snack e dolciumi), oppure Altro per tutto il resto
3. Quantità, unità, **"Avvisa sotto"** (la soglia minima), data di scadenza e note sono tutte facoltative. Se indichi una soglia, il prodotto viene segnalato come "In esaurimento" quando la quantità la raggiunge o scende sotto di essa
4. Se vuoi, premi **"🍎 Valori nutrizionali"** per aggiungere Kcal, Proteine, Grassi, Carboidrati, Fibre, Zuccheri e Sale, riferiti a **100 g di prodotto** (non alla quantità che hai in dispensa in quel momento) — coerente con l'etichetta nutrizionale che trovi sulla confezione. Puoi scriverli a mano, per un prodotto confezionato specifico usare **"📷 Scansiona codice a barre"** o **"🔎 Cerca su Open Food Facts"**: nome, categoria e valori nutrizionali si compilano da soli dalla banca dati collaborativa Open Food Facts, insieme a marca, immagine e Nutri-Score quando disponibili. Se il prodotto non si trova, resta comunque possibile compilare tutto a mano
5. Premi **"Salva prodotto"**

**Ricerca su Open Food Facts.** Nel modulo puoi cercare un prodotto per nome o con il codice a barre: nome, categoria e valori nutrizionali si compilano da soli. Open Food Facts è un servizio gratuito gestito da volontari e a volte è in manutenzione, sovraccarico o limita le ricerche ravvicinate: il sito lo segnala con un messaggio chiaro (per esempio "Open Food Facts non risponde in questo momento"). Aspetta qualche secondo e riprova, oppure compila il prodotto a mano. La ricerca per nome usa il nuovo motore di Open Food Facts (con la vecchia ricerca come ripiego) e ricorda le ricerche già fatte.

L'elenco è una tabella ordinata (ingrediente, quantità, unità, categoria) con le icone ✏️ per modificare e 🗑 per eliminare su ogni riga; un pallino colorato indica lo stato (verde normale, arancione in esaurimento, rosso scaduto). I prodotti si ordinano da soli mettendo prima quelli in esaurimento e poi quelli con la scadenza più vicina: le scadenze già passate sono evidenziate in rosso, quelle entro 3 giorni in arancione. Il filtro **"⚠ In esaurimento"** mostra solo le quantità che hanno raggiunto la soglia impostata. Se hai inserito i valori nutrizionali, compaiono tutti (Kcal, Proteine, Grassi, Carboidrati, Fibre, Zuccheri, Sale) nella card, sempre per 100 g di prodotto. Cerca per nome o filtra per categoria con i controlli in alto. Clicca su un prodotto per modificarlo o eliminarlo.

Quando ci sono prodotti con scadenza entro 3 giorni, il pulsante **"🍽 Usa prima ciò che scade"** diventa disponibile: apre il Ricettario e propone solo le ricette che usano quegli alimenti, mettendo in alto quelle che ne usano di più. I prodotti già scaduti non vengono suggeriti per la preparazione. Premi **"Mostra tutte"** per tornare alla ricerca normale in base a ciò che hai in Dispensa.

Un prodotto della Dispensa si può anche pianificare direttamente come pasto nella Pianificazione settimanale (vedi sezione successiva) — comodo per cose semplici come uno yogurt a colazione o della frutta come spuntino, senza dover creare una ricetta apposta.

I prodotti della Dispensa sono inclusi nel backup JSON, insieme alle ricette e alla pianificazione.

Lo scanner da fotocamera richiede l'autorizzazione del browser e funziona solo in pagine servite in HTTPS (GitHub Pages lo è di default) — se la fotocamera non è disponibile, resta sempre utilizzabile il campo per incollare il codice a barre a mano.

## Unità di misura

I campi "Unità" (negli ingredienti di una ricetta, in Dispensa, nella lista della spesa) restano testo libero — puoi scrivere quello che vuoi — ma ora suggeriscono, in un menu a tendina, un elenco di unità standard: **g, kg, ml, l, pz, cucchiaio/cucchiai, cucchiaino/cucchiaini, pizzico, tazza/tazze, fetta/fette, spicchio/spicchi, rametto, filetto, foglia**. Usarle aiuta a tenere tutto coerente tra Ricette, Dispensa e Lista della spesa.

Soprattutto, il sito ora **riconosce come equivalenti** le forme più comuni della stessa unità, anche se scritte in modo diverso — per peso e volume con la conversione numerica corretta (es. "500 g" e "0,5 kg" sono la stessa quantità), per le unità a conteggio tra singolare e plurale (es. "cucchiaio" e "cucchiai"):

- Nella **lista della spesa**, due ricette che usano lo stesso ingrediente con unità diverse ma equivalenti (una in grammi, l'altra in chilogrammi) vengono **sommate in un'unica riga**, invece di comparire separate
- Quando **spunti un ingrediente** della lista della spesa, la quantità si somma correttamente a quella già presente in Dispensa anche se le unità sono scritte in modo diverso
- Quando segni un pasto come **"consumato"**, la quantità tolta dalla Dispensa viene convertita nell'unità del prodotto, invece di essere ignorata per una differenza solo di scrittura
- In **"Cosa posso cucinare?"**, il confronto "quantità scarse" riconosce le stesse equivalenze

Questo riconoscimento resta comunque limitato alle unità elencate sopra (più qualche sinonimo: gr/grammo/grammi, kg/kilo/chilo, ml/millilitro, l/litro/lt…): un'unità del tutto diversa o inventata (es. "confezione", "vasetto") resta un'unità a sé, senza conversioni automatiche non affidabili.

## Tema grafico

Il sito ha **sei temi di colore**, da scegliere nella pagina **Tema** (menu laterale, in fondo al gruppo Gestione; su telefono nel cassetto ☰): **Basilico** (verde foglia con accenti pomodoro, quello di partenza), **Pomodoro** (rosso mattone su crema), **Zafferano** (ambra e oro), **Melanzana** (viola), **Oliva e lino** (verde oliva su beige) e **Rame**, il tema scuro per la sera. Ogni tema ha un'anteprima: tocca la scheda e i colori cambiano subito in tutto il sito; la scelta resta salvata su questo dispositivo. Il vecchio interruttore "Tema scuro" non c'è più: è diventato il tema Rame (chi lo aveva attivo lo ritrova).

I colori si basano sul framework CSS **Bulma** (incluso nel sito, nessun collegamento esterno). Font: DM Sans per l'interfaccia e Lora per i titoli. La barra laterale raggruppa le sezioni (Organizza, Gestione); su telefono diventa una barra a schede in basso (Oggi, Ricette, Piano, Dispensa, Spesa) più il menu ☰.

## Uso da tastiera

Tutta l'app si usa anche con la tastiera: **Tab** / **Maiusc+Tab** per spostarsi (l'elemento attivo ha un contorno verde), **Invio** o **Spazio** per attivare schede e pulsanti, **Esc** per chiudere la finestra aperta. Dentro una finestra il Tab non esce finché non la chiudi.

## Salvataggio dei dati

Tutto è salvato nel `localStorage` del browser che stai usando:

- Non serve connessione internet per salvare o leggere i dati
- I dati **non si sincronizzano** automaticamente tra browser o dispositivi diversi — usa il backup per trasferirli
- Se cancelli i dati di navigazione del browser (cache, cookie, dati dei siti), tutto viene perso
- Lo spazio disponibile non è illimitato (di solito qualche MB): le foto delle ricette vengono ridimensionate e compresse automaticamente per occuparne meno. Se nonostante questo lo spazio dovesse esaurirsi, un avviso ti informa che il salvataggio non è andato a buon fine, invece di fallire senza dirtelo — a quel punto conviene esportare subito un backup e liberare un po' di spazio (es. riducendo il numero di foto)

## La Dispensa si scala quando cucini
Con **«Ho preparato questa oggi»** (o al «Fine ✓» della modalità cucina) l'app mostra cosa toglierebbe dalla Dispensa per le porzioni scelte. Scegli **Segna e scala dalla Dispensa**, **Solo segna come preparata** oppure **Annulla**. Dopo lo scalo hai 12 secondi per toccare «Annulla». Si scalano solo i prodotti riconosciuti con certezza e con unità compatibili; gli altri vengono elencati ma non modificati.

## Aspetto e temi
L'aspetto del sito si cambia dalla pagina **Tema** (vedi "Tema grafico"): sei temi, tra cui **Rame** come versione scura con gli stessi componenti su fondo carbone.

## Note legali e crediti
In **Come funziona**, in fondo (o dal link nel menu laterale), trovi privacy, avvertenze su nutrienti e allergeni, fonti e licenze dei dati usati.

## Statistiche
Dal menu **Statistiche** vedi come usi il ricettario: quante ricette hai, le più cucinate, le meglio votate, quelle ferme da due mesi o più («Da riscoprire»), quelle mai preparate e la ripartizione per categoria. Toccando un nome si apre la ricetta. Il conteggio delle preparazioni cresce quando usi «Ho preparato questa oggi» o chiudi la modalità cucina con «Fine».

## Timer multipli e voce in cucina
In modalità cucina i timer sono in alto e restano attivi cambiando passaggio: **Avvia timer** usa il tempo del passaggio, **⏱ + Timer** ne crea di liberi. Quando finiscono suona un allarme (e vibra) finché non tocchi **Ferma**; **+1′** aggiunge un minuto. **🔊 Leggi** legge il passaggio ad alta voce. **🎤 Voce** attiva i comandi: «avanti», «indietro», «ripeti», «ingredienti», «timer 10 minuti», «stop» (richiede il permesso del microfono e internet; non funziona su tutti i browser).

## Misure pratiche
Quando cambi le porzioni, le quantità si arrotondano a valori comodi da pesare (437.5 g → ~440 g, 1500 ml → 1.5 l, le uova a numeri interi). Il segno **~** indica un valore arrotondato. Il pulsante **≈ Misure pratiche** sopra gli ingredienti lo spegne per vedere i valori esatti. Liste della spesa e Dispensa usano sempre i valori esatti.

## Cambio dispositivo
**Backup ed esportazione → Cambio dispositivo**. Sul vecchio dispositivo, scheda «Da questo dispositivo»: crea il file di trasferimento (sul telefono lo invii a te stesso con la condivisione) e, se usi il sito, condividi l'indirizzo. Sul nuovo, apri lo stesso indirizzo, poi «Cambio dispositivo» → «Su questo dispositivo» → scegli il file. Le ricette si aggiungono a quelle presenti e puoi annullare subito l'importazione. Il file contiene anche le foto.

## Annullare un'importazione
Dopo l'importazione di un backup compare per 20 secondi «Annulla»: ripristina i dati come erano prima. Dopo aver ricaricato la pagina non è più possibile: se ti serve, esporta un backup prima di importare.

## Cestino e Annulla
Quando elimini una ricetta (o più ricette, o un ricettario con le sue ricette) compare per qualche secondo «Annulla». In ogni caso la ricetta resta 30 giorni nel **Cestino** (menu ⋯ → 🗑 Cestino), dove puoi **Ripristinarla** (con la sua foto) o eliminarla per sempre. Il cestino sta nel browser di questo dispositivo e non è nei backup.

## Ritrovare il file dati (cartella «Il Mio Ricettario»)
Consiglio: crea una cartella «Il Mio Ricettario» sul telefono, sulla scheda SD o su un cloud e salva sempre lì il file dati e i backup: il selettore si riapre nell'ultima cartella usata. Se all'apertura compare «Il file … ha bisogno di conferma» e **Riconnetti** non lo trova, tocca **Scegli di nuovo il file** e indica il file nella cartella. Il sito non può leggere il percorso di una cartella da solo: è sempre il browser a chiedere di scegliere il file. Quando scegli un file esistente, il browser chiede il permesso di **modificarlo**: accettalo (se compare «a ogni visita», scegli quella) altrimenti «Riconnetti» tornerà a ogni apertura. Aprendo il ricettario dall'indirizzo del sito (GitHub Pages) invece che come file del telefono, il collegamento resta molto più affidabile.

## Foto con la fotocamera
Sul telefono, nel modulo della ricetta, **📷 Scatta una foto** apre la fotocamera; dopo lo scatto puoi ritagliare e ruotare. Per usare una foto già presente scegli il file con il campo sopra. Il browser può chiedere il permesso di usare la fotocamera la prima volta.

## Voti e raccolte
Nella scheda di una ricetta puoi dare da 1 a 5 stelle (tocca di nuovo la stessa stella per toglierla). Con **📂 Raccolte** inserisci la ricetta in elenchi personali con un nome, come «Cene veloci» o «Natale»: una ricetta può stare in più raccolte. Dal pannello **Filtri** filtri per voto o per raccolta, e dall'ordinamento scegli «Voto più alto». Le raccolte sono diverse dai ricettari (i «libri») e dai tag: sono pensate per scelte tue, trasversali.

## Foto e spazio del browser
Le foto delle ricette sono conservate a parte (IndexedDB), così puoi averne centinaia senza esaurire lo spazio. Al primo avvio dopo l'aggiornamento le foto già presenti vengono spostate da sole. Esporta comunque un backup ogni tanto: contiene anche le foto.

## Salvataggio su un file a tua scelta (facoltativo)

Oltre alla memoria del browser, puoi collegare un file sul tuo dispositivo dove ricette, dispensa, pianificazione e lista della spesa si salvano automaticamente — utile se vuoi tenerli in una cartella sincronizzata con Google Drive, Dropbox o simili, o semplicemente preferisci vederli come un file vero e proprio invece che nascosti nel browser. **Disponibile solo su Chrome, Edge e browser basati su Chromium** (non su Firefox o Safari, per un limite di quei browser).

- Alla prima apertura del sito (se il browser lo supporta) compare subito una finestra che chiede dove salvare: puoi **creare un nuovo file**, **aprirne uno che hai già** (ad esempio un backup esportato in precedenza — usa lo stesso formato), oppure **continuare solo con la memoria del browser** senza essere interpellato di nuovo
- Una volta collegato, ogni modifica si salva automaticamente anche lì, in aggiunta alla memoria del browser (che resta sempre aggiornata come rete di sicurezza: se il file diventasse irraggiungibile, non perdi nulla)
- Alla riapertura del sito, il browser chiede di **riconfermare l'accesso al file**: comparirà un avviso in alto alla pagina con tre scelte — **"Riconnetti"** (concedi di nuovo l'accesso), **"Non ora"** (nascondi l'avviso per questa volta, il file resta collegato) e **"Non chiedere più"** (scollega il file e smetti di ricevere l'avviso; i dati restano comunque nel browser).
  Questa richiesta è una misura di sicurezza dei browser stessi, non qualcosa che dipende dal sito: i browser concedono l'accesso a un file solo finché la scheda resta aperta, quindi la riconferma va data a ogni nuova sessione. Se ti dà fastidio, "Non chiedere più" è la scelta giusta: continuerai a usare il sito normalmente, salvando nella memoria del browser, e potrai esportare un backup quando vuoi
- Puoi cambiare file o tornare al solo browser in qualsiasi momento da **Backup ed esportazione → "🗂️ Collega/Cambia file di salvataggio"** o **"🔌 Scollega"**

## Dove vengono salvati e caricati i file

- **Caricare un file** (Importa backup, Importa CSV): si apre sempre la finestra di scelta file del tuo dispositivo, dove puoi navigare in qualsiasi cartella o servizio collegato (es. Google Drive, iCloud Drive) per scegliere il file da importare
- **Salvare un file** (backup, CSV, PDF): su Chrome o Edge da computer, si apre una finestra "Salva con nome" dove scegli tu la cartella e il nome del file. **Su cellulare (Android o iPhone/iPad)** si apre invece il **foglio di condivisione nativo** del telefono, con tutte le app installate tra cui scegliere — inclusa "Salva su Drive" se hai l'app Google Drive, oppure Dropbox, Files, WhatsApp, email, ecc.; tra le opzioni del foglio c'è anche "Salva sul dispositivo"/"File", quindi puoi comunque tenerlo solo in locale se preferisci. Su Firefox in generale, questo non è ancora possibile per limiti del browser stesso: il file viene scaricato automaticamente nella cartella "Download" predefinita del dispositivo, da cui potrai comunque spostarlo o condividerlo in un secondo momento

## Ripetere la settimana e lista della spesa per date
In fondo a Pianificazione: **Ripeti su altre settimane…** copia la settimana mostrata sulle prossime (da 1 a 12; puoi saltare quelle già piene). **🛒 Lista per date…** crea la lista della spesa per un intervallo di giorni a tua scelta, anche a cavallo di due settimane.

## Ingredienti in modalità cucina
Durante la modalità cucina, **🧺 Ingredienti** (in alto a sinistra) apre l'elenco con le quantità per le porzioni scelte: tocca un ingrediente per spuntarlo quando l'hai preparato. Sotto ogni passaggio vedi anche gli ingredienti citati in quel passaggio.

## Condividere la lista della spesa
In "La mia lista della spesa" e nella lista della settimana il pulsante **Condividi testo** manda la lista (per reparto, senza gli articoli già spuntati) a WhatsApp, note o messaggi; sul computer la copia negli appunti.

## Promemoria di backup
Ogni 7 giorni (se hai ricette) compare un avviso: "Fai il backup" salva il file (su telefono lo condividi su Drive, WhatsApp, e-mail); "Domani" lo rimanda; "Non ricordarmelo" lo spegne. Si riattiva da Backup ed esportazione → Promemoria settimanale.

## Usare il ricettario dal telefono (consigliato)
1. Pubblica la cartella su GitHub Pages e apri l'indirizzo `https://TUONOME.github.io/NOMEREPO/` con Chrome.
2. Se la copia vecchia (file aperto dal telefono) contiene ricette: aprila, **Backup ed esportazione → Esporta backup**.
3. Nella copia dal sito: **Importa ricette → Da un backup completo** → scegli il file di backup.
4. Dal menu di Chrome scegli **Installa app / Aggiungi a schermata Home**. Da quel momento funziona anche offline.
Nota: i dati di ogni indirizzo sono separati; l'aggiornamento dei file su GitHub richiede Ctrl+F5 (o riapertura dell'app).

## Domande frequenti

**Posso usarlo su più dispositivi?**
Sì, ma ogni dispositivo/browser avrà il proprio set di dati salvati localmente, non sincronizzato — usa esporta/importa backup per spostarli.

**Il riconoscimento automatico nell'importazione da testo funziona sempre?**
No: funziona meglio con pagine di ricette che includono dati strutturati (la maggior parte dei blog di cucina seri li ha). Con testo libero il riconoscimento è più approssimativo. In ogni caso, controlla sempre i campi prima di salvare.

**Posso aggiungere altre categorie o altri tag dietetici?**
Le categorie e i tag disponibili sono fissi nel codice. Se vuoi personalizzarli, puoi modificare gli elenchi nel file `index.html` (cerca `CATEGORY_COLORS` per le categorie delle ricette, `PANTRY_CATEGORY_COLORS` per quelle della Dispensa, e `TAG_OPTIONS` per i tag dietetici). Le **fasce pasto** della pianificazione, invece, si possono già aggiungere e rimuovere direttamente dall'app, senza toccare il codice.
