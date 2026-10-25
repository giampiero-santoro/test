# Changelog

Tutte le modifiche rilevanti al progetto sono documentate in questo file.

## [5.47.0] — Ricezione ricette dal sito «Pentola a pressione» (protocollo pp-ricettario v1)

### Aggiunto
- **Porta d'ingresso per ricette esterne**: il ricettario legge un pacchetto JSON versionato dal frammento `#pp=…` dell'indirizzo, oppure da un file caricato con «Importa ricetta (file)». Mostra un'anteprima, fa scegliere data, pasto e orario, e solo dopo la conferma aggiunge ricetta, voce di pianificazione e (a scelta) ingredienti alla lista della spesa.
- **Nessun doppione**: la ricetta è riconosciuta da `externalId` (non viene ricreata), la voce di pianificazione non si ripete per stessa ricetta/giorno/pasto, l'operazione è riconosciuta da `idOperazione`, e gli ingredienti già presenti in lista dalla stessa ricetta non vengono sommati due volte.
- **Validazione**: solo campi noti, lunghezze e intervalli limitati, URL solo http/https, testo sempre mostrato come testo. Pacchetti non validi mostrano un messaggio e non scrivono nulla.
- Nuovi campi facoltativi della ricetta: `externalId`, `fonteUrl`, `fonteNome`; nella scheda compare il link «↗ Ricetta originale». Il modulo di modifica li conserva.
- Test 38 (`tests/test_38_pp_integrazione.py`). Documentazione: `PROTOCOLLO-pp-ricettario.md`.

## [5.46.0] — PDF A4 orizzontale scaricato direttamente

### Modificato
- **Niente più stampante**: «PDF A4 orizzontale» (scheda ricetta, Gestisci ricettari, Esporta PDF) crea un vero file PDF vettoriale (testo selezionabile) e lo scarica subito. Layout a una ricetta per pagina (carattere adattato al foglio) o a due colonne con più ricette per foglio.
- **Ingredienti in alto**: la colonna di destra (ingredienti, valori nutrizionali, poi foto) parte dal margine alto del foglio, con i margini predefiniti (10 mm; 8 mm su due colonne).
- Il PDF usa Helvetica e non riporta le icone emoji. La stampa del browser (Ctrl/Cmd+P) dalla scheda resta disponibile.
- Test 37 riscritto (download, pagine, foto); guida illustrata e GUIDA.md aggiornate.

## [5.45.0] — Stampa: caratteri adattati e due colonne

### Aggiunto
- **Layout di stampa a due colonne**: più ricette per foglio A4 orizzontale, caratteri piccoli; le ricette brevi si impilano nella colonna e quelle lunghe continuano nella colonna successiva. Scelta chiesta quando si stampano più ricette e ricordata come predefinita.

### Modificato
- **Una ricetta per pagina**: il carattere si riduce da solo (da 13 a 7,5 pt) finché la ricetta sta in un foglio; se è lunghissima il procedimento passa su due colonne.
- La stampa del browser (Ctrl/Cmd+P) dalla scheda usa lo stesso adattamento. Test 37 esteso; guida illustrata e GUIDA.md aggiornate.

## [5.44.0] — Stampa A4 orizzontale del ricettario

### Aggiunto
- **🖨️ Stampa A4** su ogni riga di «Gestisci ricettari»: stampa tutte le ricette attive del ricettario, una per pagina, in A4 orizzontale.
- **Stampa del browser (Ctrl/Cmd+P)** con una scheda aperta: esce la scheda pulita in A4 orizzontale, senza menu né pulsanti («Modifica», «Modalità cucina», porzioni, ecc.).

### Modificato
- Il foglio A4 orizzontale usa caratteri e spazi più grandi, per riempire meglio la pagina e assomigliare alla scheda a schermo.
- Test 37; guida illustrata e GUIDA.md aggiornate (nuova sezione sulla stampa).

## [5.43.0] — Ricetta precedente / successiva

### Aggiunto
- Nella scheda ricetta, aperta dall'elenco, compaiono **‹ Precedente** e **Successiva ›** con la posizione («2 di 24»): si scorrono le ricette dell'elenco (con filtri e ordine attivi, anche in «Cosa posso cucinare?») senza tornare indietro.
- Scorciatoie: frecce ← → della tastiera e scorrimento laterale del dito su telefono.
- Aprendo la ricetta da Oggi, Statistiche o Pianificazione i pulsanti non compaiono. Test 36; guida illustrata e GUIDA.md aggiornate.

## [5.42.0] — Sottocategorie

### Aggiunto
- **Sottocategorie facoltative** per ognuna delle otto categorie (Primi, Secondi, Zuppe & Vellutate, Impasti & Pane, Salse & Sughi, Dolci, Infusi & Tisane, Altro).
- Nel modulo ricetta il campo **Sottocategoria** mostra solo le voci della categoria scelta; si può lasciare vuoto.
- Nell'elenco, scelta una categoria compare una seconda fila di chip con il conteggio; l'etichetta della ricetta mostra «Categoria · Sottocategoria».
- Salvate nelle ricette: viaggiano nei backup. Test 35. Guida illustrata e GUIDA.md aggiornate.

## [5.41.0] — Backup in un ricettario scelto, conferma all'eliminazione

### Aggiunto
- **Importa backup**: prima di importare, il ricettario chiede dove mettere le ricette — come nel backup, in un ricettario esistente o in un **nuovo ricettario** (nome proposto dal file). Si può annullare senza importare nulla.

### Modificato
- **Eliminare un ricettario chiede sempre conferma**, anche se è vuoto; con ricette dentro, conferma anche per «Sposta ed elimina» e «Elimina ricette e volume».
- Test 34; test 19 aggiornato. Guida illustrata e GUIDA.md aggiornate.

## [5.40.0] — Importa valori nutrizionali da foto

### Aggiunto
- **📷 Da foto dell'etichetta…** nella finestra «Importa valori…»: la tabella nutrizionale viene letta da una foto con un riconoscimento del testo (Tesseract.js, italiano e inglese) che gira **sul dispositivo**; nessuna immagine esce dal telefono o dal computer.
- Gli strumenti di lettura (circa 13 MB, in `js/vendor/ocr/`) si caricano solo al primo uso e restano nella memoria dell'app.
- Prima ingrandisce e schiarisce la foto, poi corregge gli errori tipici (la «g» letta come 9, «09» al posto di «0,9»); l'anteprima è sempre mostrata e avvisa se i numeri non tornano.
- Non disponibile nel file singolo (serve la versione completa del sito).
- Guida illustrata e GUIDA.md aggiornate; test 33 esteso con la lettura di una foto.

## [5.39.0] — Importa valori nutrizionali da testo

### Aggiunto
- Pulsante **📥 Importa valori…** nel modulo del prodotto (Dispensa, valori per 100 g) e in quello della ricetta (valori per porzione): incolla una tabella nutrizionale copiata da un sito, da un documento o scritta a mano.
- Riconosce energia (kcal o kJ), grassi, carboidrati, zuccheri, fibre, proteine e sale (o sodio, convertito in sale), in italiano e inglese, con la virgola decimale, «<0,5» e «tracce»; ignora saturi, amido, vitamine e percentuali.
- Conversione automatica tra «per 100 g» e «per porzione» (grammi della porzione riconosciuti o indicati a mano).
- Anteprima modificabile e avvisi di coerenza (macronutrienti oltre 100 g, zuccheri maggiori dei carboidrati, calorie che non tornano). Tutto sul dispositivo, nessuna richiesta esterna.
- Nuovo file `js/nutrition-import.js`, test 33. Guida illustrata e GUIDA.md aggiornate.

## [5.38.3] — Ricerca Open Food Facts riparata

### Corretto
- **«Errore nella ricerca su Open Food Facts (verifica la connessione)»** durante la ricerca per nome: la vecchia ricerca di Open Food Facts (`cgi/search.pl`) risponde spesso 503 «in manutenzione». La ricerca per nome ora usa il **nuovo motore ufficiale (Search-a-licious)**, con la vecchia ricerca solo come ripiego. Se il motore non include i valori nutrizionali, vengono recuperati con il codice a barre alla scelta del prodotto.
- La ricerca per codice a barre prova anche l'interfaccia v3 se la v2 non risponde.
- **Messaggi chiari**: «Open Food Facts non risponde in questo momento…» (servizio giù), «Troppe ricerche ravvicinate…» (limite di richieste), «Sei offline…».
- Il servizio limita le ricerche (circa 10 al minuto): la ricerca parte dopo 0,7 s dall'ultima lettera, da 3 lettere in su, e le ricerche già fatte sono ricordate.
- Note legali: indicato anche l'indirizzo `search.openfoodfacts.org`. Guida illustrata e GUIDA.md aggiornate.

### Test
- Nuovo `test_32` (risposte del servizio simulate: nuovo motore, cache, ripiego, errore, limite). Suite: 32/32.

## [5.38.2] — Persone da… a… nel riepilogo del giorno

### Cambiato
- In **«Venerdì in breve»** (e negli altri giorni) le **Persone** ora seguono le porzioni delle ricette del giorno: se un pasto è per 1 persona e un altro per 8 compare **«da 1 a 8»**; se sono tutte uguali, un solo numero. Senza ricette resta il valore «Persone» impostato in alto.
- «Questa settimana» (sotto la data) è **centrato**.
- Guida illustrata e GUIDA.md aggiornate. `test_31` esteso. Suite: 31/31.

## [5.38.1] — Pianificazione più pulita

### Cambiato
- Tolto il pulsante **Dispensa** dall'intestazione della Pianificazione (la Dispensa resta nel menu e nella barra in basso).
- L'etichetta della settimana ora è su due righe: **la data sopra** e **«Questa settimana»** (o «Prossima settimana», «Settimana scorsa») **sotto**, più leggibile soprattutto su telefono.
- Sul telefono, nella vista Giorno, l'orario del pasto non si sovrappone più al nome.
- Guida illustrata e GUIDA.md aggiornate, con nuove immagini.

## [5.38.0] — Vista Giorno a linea del tempo

### Cambiato
- **Vista «Giorno»**: niente più pasti a tutta larghezza. Gli orari stanno a sinistra su una linea verticale (si modificano da lì) e ogni pasto è una scheda di larghezza contenuta, con le ricette (foto, tempo di preparazione, porzioni) e la nota.
- **Riquadro «Lunedì in breve»** a lato (il nome segue il giorno): pasti, ricette, calorie, persone e totali nutrizionali, con i pulsanti per la lista della spesa del giorno e i totali della settimana, che prima erano sopra i pasti. Sotto i 1100 px e sul telefono il riquadro passa sotto le schede.
- Guida illustrata e GUIDA.md aggiornate, con nuove immagini.

### Test
- Nuovo `test_31` (riquadro «in breve», conteggi, posizione a lato, schede contenute, orari a sinistra). Suite: 31/31.

## [5.37.0] — Pianificazione a tabella e menu nascondibile

### Cambiato
- **Settimana a tabella**: i giorni sono le colonne e i pasti sono le righe, con il nome del pasto scritto in verticale a sinistra. Le righe sono allineate tra i giorni e ordinate per orario (media degli orari del pasto).
- **Schede con foto**: ogni ricetta pianificata è una piccola scheda con la foto, il nome, le porzioni e il tempo di preparazione (e le kcal, se note). Senza foto compare un segnaposto.
- Le caselle vuote tratteggiate con **＋** creano quel pasto nel giorno; il menu «＋ Aggiungi pasto…» resta in fondo a ogni colonna. I pulsanti Ricetta, Dispensa e Nota sono diventati icone per risparmiare spazio.
- La pagina Pianificazione usa tutta la larghezza disponibile.

### Aggiunto
- **Menu laterale nascondibile** (computer e tablet): pulsante in alto a sinistra, la scelta resta salvata sul dispositivo.

### Test
- Nuovo `test_30` (righe ordinate e allineate, etichetta verticale, casella vuota → pasto, scheda con foto e tempo, menu nascosto/riaperto e persistenza). Suite: 30/30.

## [5.36.0] — Sei temi di colore con Bulma

### Aggiunto
- **Pagina «Tema»** (menu laterale, in fondo al gruppo Gestione): sei temi con anteprima — **Basilico** (verde foglia, di partenza), **Pomodoro**, **Zafferano**, **Melanzana**, **Oliva e lino** e **Rame** (scuro). Il tema scelto si applica subito a tutto il sito e resta salvato.
- Framework **Bulma 1.0** incluso in locale (`css/bulma.css`, solo le parti usate, prefisso `bulma-`, licenza MIT): fornisce le variabili di colore dei temi e i componenti della pagina Tema. Nessun collegamento esterno.

### Cambiato
- Tutti i colori del sito (sfondi, pulsanti, etichette, ombre, banner di Oggi) dipendono dal tema; contrasti dei testi controllati (almeno 4,5:1).
- Il vecchio interruttore «Tema scuro» è sostituito dal tema **Rame**: chi aveva il tema scuro attivo lo ritrova.
- Guida illustrata, GUIDA.md e note legali (crediti Bulma) aggiornate; tutte le immagini della guida rifatte con i nuovi colori.

### Test
- Nuovo `test_29` (sei temi, scelta, persistenza, migrazione del vecchio tema scuro). Suite: 29/29.

## [5.35.0] — Orari dei pasti, settimana in verticale

### Cambiato
- **Ogni pasto ha il suo orario**, mostrato nel riquadro verde sotto il nome. Quando aggiungi un pasto viene proposto l'orario tipico (Colazione 07:30, Spuntino 10:30, Pranzo 13:00, Merenda 16:30, Aperitivo 18:30, Cena 20:00, Dopocena 22:00…), che puoi cambiare.
- **I pasti si posizionano nella giornata in base all'orario**: cambiando l'orario il pasto si sposta da solo. Le ricette del pasto prendono il suo orario (visibile in Oggi e nel PDF).
- **Settimana in verticale**: un giorno per colonna e i pasti uno sotto l'altro, invece che affiancati in orizzontale. Vale anche nella vista Giorno (ordine per orario).
- Guida illustrata e GUIDA.md aggiornate, con nuove immagini della pianificazione (settimana, giorno, telefono).

### Test
- Nuovo `test_28` (orari proposti, ordine, layout in colonne, ereditarietà dell'orario, persistenza, vista Giorno, rimozione); inserito in `run_all`. Suite: 28/28.

## [5.34.0] — Guida illustrata aggiornata

### Cambiato
- Tutte le immagini della **guida illustrata** sono state rifatte con l'aspetto attuale (tema Verde acqua, nuova pagina Oggi, pianificazione con pasti a piacere, pagine Importa e Backup).
- Capitoli aggiornati: Oggi (statistiche e riquadri), menu laterale, modalità cucina (timer multipli, lettura e comandi vocali), pianificazione («＋ Aggiungi pasto…»).
- Nuovi capitoli: **17 Statistiche**, **18 Misure pratiche, voti e raccolte**, **19 Cestino e annullare**, **20 Privacy, note legali e crediti**. Ora i capitoli sono 20.
- Guida e file singolo aggiornati; nessuna modifica alle funzioni.

## [5.33.0] — Pagine dedicate per Importa e Backup

### Cambiato
- **Importa ricette** e **Backup ed esportazione** non si aprono più come lunga tendina a destra: sono **due pagine vere**, raggiungibili dal menu laterale e dal menu ⋯, con una scheda per ogni azione e una breve spiegazione.
- **Importa ricette**: Da testo · Da file ricetta (.json) · Da foglio di calcolo (.csv, con scelta del ricettario di destinazione) · Da un backup completo.
- **Backup ed esportazione**: Backup (stato dell'ultimo backup, esporta, promemoria settimanale) · Salvataggio su file · Esporta le ricette (CSV e PDF, con scelta del ricettario) · Cambio dispositivo.
- Il menu ⋯ di «Le mie ricette» resta solo per le azioni sulle ricette (Seleziona ed elimina, Gestisci ricettari, Cestino) più due collegamenti alle nuove pagine.
- Le funzioni sono le stesse di prima, solo spostate e spiegate meglio. Guida illustrata e GUIDA.md aggiornate, con nuove immagini.

### Test
- Nuovo `test_27` (schede, pulsanti visibili, download del backup e del CSV, collegamenti dal menu ⋯); `test_06` aggiornato. Suite: 27/27.

## [5.32.0] — Pianificazione senza vincoli

### Cambiato
- **I giorni partono vuoti**: non ci sono più i quattro pasti fissi. In ogni giorno il menu a tendina **«＋ Aggiungi pasto…»** propone Colazione, Spuntino, Pranzo, Merenda, Cena, Brunch, Aperitivo, Dopocena, Pre-allenamento, Post-allenamento e **«Altro (scrivi il nome)…»** per un pasto personalizzato, che resta poi nel menu.
- Puoi avere giornate con 2 pasti e giornate con 8 o più. Lo stesso tipo di pasto si può aggiungere più volte nello stesso giorno («Spuntino», «Spuntino 2»).
- I pasti si ordinano da soli per orario (quello indicato o quello tipico del pasto). Con la **×** si rimuove un pasto: se contiene ricette viene chiesta conferma e le ricette restano nel ricettario.
- Vale nella vista Settimana e nella vista Giorno (anche su smartphone), e per Oggi, lista della spesa, totali nutrizionali, ripetizione su altre settimane ed esportazione PDF.
- Le pianificazioni già fatte restano com'erano.

### Test
- Nuovo `test_26` (giorni vuoti, menu, più pasti uguali, ordine, personalizzato, persistenza, rimozione con conferma, vista giorno). Suite: 26/26.

## [5.31.0] — Statistiche in Oggi

### Aggiunto
- In **Oggi**, accanto al banner del titolo, il riquadro **Le tue statistiche**: numero di ricette, preparazioni, voto medio, preferite e la ricetta più cucinata. «Vedi tutte →» apre la pagina Statistiche. Su telefono il riquadro va sotto il titolo.

### Test
- `test_24` controlla numeri, posizione accanto al titolo e collegamento alla pagina Statistiche. Suite: 25/25.

## [5.30.0] — Oggi più essenziale

### Cambiato
- In **Oggi** il riquadro **Meteo** è sostituito da **Le mie ricette** (numero di ricette e pulsante «Sfoglia le ricette»).
- Tolto **Accesso rapido** (Le mie ricette, Dispensa, Lista della spesa, Pianificazione): si raggiungono dal menu laterale e dalla barra in basso.

### Rimosso
- Il **meteo**: non viene più contattato Open-Meteo e l'app non chiede più la posizione. Aggiornate di conseguenza le note legali su privacy e crediti: ora l'unico servizio esterno è Open Food Facts.

### Test
- `test_06` controlla il riquadro Le mie ricette e l'assenza di Accesso rapido; `test_25` non cerca più Open-Meteo nelle note. Suite: 25/25.

## [5.29.0] — Oggi: Meteo, scadenze e spesa in alto

### Cambiato
- In **Oggi** i riquadri **Meteo**, **Da consumare prima** e **Lista della spesa** stanno ora subito sotto il titolo, sopra **I pasti di oggi**. Colori menta e pesca anche nel tema scuro.
- Tolta da Oggi la scheda **Guida illustrata**: la guida resta nel pulsante «Guida» in alto, nell'icona ? su telefono e nella voce del menu laterale.

### Test
- `test_06` controlla che la scheda guida non compaia più in Oggi, che il link nel menu esista e che i tre riquadri stiano sopra i pasti. Suite: 25/25.

## [5.28.0] — Nuovo tema «Verde acqua»

### Cambiato
- **Nuova palette**: verde acqua, sfondo azzurro chiarissimo, riquadri menta e pesca, angoli più morbidi e ombre più leggere. Il verde dei pulsanti è scelto per restare ben leggibile (contrasto 4,8:1 col bianco).
- **Oggi**: il titolo diventa un banner verde acqua con il pulsante «Organizza la settimana» in bianco; i riquadri «I pasti di oggi» e «Accesso rapido» alternano pesca e menta.
- **Tema scuro** ridisegnato con la stessa palette (verde acqua su fondo blu-verde scuro).
- Promemoria del backup in pesca, link «Note legali e crediti» nei colori del tema.
- Statistiche: tessere menta/pesca e righe delle classifiche allineate (prima il numero di volte o le stelle potevano andare a capo).

### Test
- Nessuna funzione cambiata. Suite: 25/25.

## [5.27.0] — Rimossi i dati e le ricette incluse

### Rimosso
- **Banca dati nutrizionale integrata**: tolti i file dati (`data/`), lo script di ricerca, le viste dedicate e i relativi pulsanti, la ricerca negli ingredienti e in Dispensa e il relativo stile.
- **Ricette incluse nell'app**: sia la raccolta di ricette di terzi sia la ricetta di esempio. Al primo avvio l'elenco è vuoto.
- Ogni riferimento a quella fonte è stato tolto da menu, testi, guida illustrata, guida (GUIDA.md), README, MANIFEST e LICENSE.

### Invariato
- Le **tue ricette, la Dispensa e i dati salvati** non cambiano: restano nel tuo browser o nel file di backup.
- Dispensa: scansione del codice a barre e ricerca prodotti con Open Food Facts, e valori nutrizionali inseribili a mano.
- Le 15 categorie della Dispensa restano le stesse.

### Test
- `test_25` ora controlla anche che nella pagina non compaia più la fonte rimossa, che non venga richiesto nessun file dati e che l'elenco ricette parta vuoto. `test_06` ora si aspetta 16 capitoli nella guida. Suite: 25/25.

## [5.26.1] — Pulizia legale e privacy

### Cambiato
- **Caratteri inclusi nell'app** (DM Sans e Lora, cartella `fonts/`): non si chiama più Google Fonts, quindi l'indirizzo IP dei visitatori non viene inviato a Google. Vale anche per la guida.
- **Lettore di codici a barre incluso nell'app** (html5-qrcode 2.3.8 con versione fissata, cartella `js/vendor/`): non si scarica più da unpkg.
- Il service worker mette in cache anche font e lettore, che funzionano offline.

### Aggiunto
- **Note legali, privacy e crediti** (menu «Come funziona» e link nel menu laterale): cosa resta sul dispositivo, cosa esce (Open Food Facts, Open-Meteo), avvertenza su nutrienti e allergeni, fonti e licenze (Open Food Facts ODbL/CC BY-SA, Open-Meteo CC BY 4.0, OFL, Apache 2.0, MIT).

### Test
- Nuovo `test_25`: nessuna richiesta a Google/unpkg all'avvio, font locali caricati, pagina note legali. Suite: 25/25.

## [5.26.0] — Statistiche

### Aggiunto
- Nuova sezione **Statistiche** nel menu: tessere con numero di ricette, preferite, preparazioni totali, voto medio, tempo medio e ricette pronte in 30 minuti.
- Classifiche **Le più cucinate** e **Le meglio votate**; **Da riscoprire** (ferme da 2 mesi o più); **Mai preparate**; grafico a barre **Per categoria**. Toccando una ricetta si apre la sua scheda.
- Tutto è calcolato al momento dai dati che hai già: nessun dato nuovo salvato. Le ricette archiviate non vengono contate. Il conteggio delle preparazioni parte da «Ho preparato questa oggi» o dal «Fine» della modalità cucina.

### Test
- Nuovo `test_24_statistiche`. Suite: 24/24.

## [5.25.0] — Cucina: timer multipli e voce

### Aggiunto
- **Timer multipli**: in modalità cucina puoi avere più timer insieme (pasta, forno, riposo). Restano attivi anche passando al passaggio successivo, hanno **+1′** e **✕**, e sono in alto sullo schermo. **⏱ + Timer** ne crea uno libero (minuti e nome, oppure 5′/10′/15′).
- **Allarme vero**: alla fine suona un segnale ripetuto (e vibra sul telefono) finché non tocchi **Ferma**. Prima il segnale era praticamente muto.
- **🔊 Leggi**: il telefono legge ad alta voce il passaggio con tempi e temperature.
- **🎤 Voce**: comandi vocali a mani libere — «avanti», «indietro», «ripeti», «ingredienti», «timer 10 minuti», «stop». Serve Chrome (o simili), il permesso del microfono e la connessione a internet; durante la lettura il microfono si mette in pausa.

### Test
- Nuovo `test_23` (riconoscimento vocale simulato). Suite: 23/23.

## [5.24.0] — Misure pratiche

### Aggiunto
- Cambiando le porzioni di una ricetta, le quantità vengono arrotondate a **misure comode da pesare**: 437.5 g di farina → ~440 g, 1500 ml di latte → 1.5 l, 5,25 uova → ~5. Le uova vanno a numeri interi, gli altri pezzi a mezzi; da 1000 g/ml in su si passa a kg/l.
- Il segno **~** indica che il valore è arrotondato. Il pulsante **≈ Misure pratiche** (sopra gli ingredienti) lo accende e lo spegne: spento mostra i valori esatti. La scelta resta salvata.
- Vale nella scheda ricetta e nel pannello ingredienti della modalità cucina. Alle porzioni originali le quantità restano esattamente quelle scritte; liste della spesa e Dispensa continuano a usare i valori esatti.

### Test
- Nuovo `test_22`. Suite: 22/22.

## [5.23.0] — La Dispensa si scala da sola

### Aggiunto
- **«Ho preparato questa oggi»** (scheda ricetta) e il **«Fine ✓» della modalità cucina** mostrano ora una finestra con l'anteprima di cosa verrebbe tolto dalla Dispensa, per le porzioni scelte (es. «Farina: −500 g, restano 1,5 kg»). Tre scelte: **Segna e scala dalla Dispensa**, **Solo segna come preparata**, **Annulla**.
- Dopo lo scalo compare **Annulla** per 12 secondi: ripristina le quantità in Dispensa e il conteggio «preparata».
- Prudenza: si scalano solo i prodotti riconosciuti con certezza e con unità convertibili (g↔kg, ml↔l…); quelli ambigui o senza quantità sono elencati ma non toccati.

### Test
- Nuovo `test_21`. Suite: 21/21.

## [5.22.0] — Cambio dispositivo guidato

### Aggiunto
- Menu ⋯ → **📲 Cambio dispositivo**: procedura guidata in due schede.
  - **Da questo dispositivo**: riepilogo di cosa verrà trasferito (ricette, foto, dispensa, settimane, raccolte), pulsante per creare il file di trasferimento (sul telefono si apre la condivisione) e pulsante per condividere l'indirizzo del sito.
  - **Su questo dispositivo**: pulsante per scegliere il file e istruzioni finali (installazione dell'app). Le ricette si aggiungono a quelle già presenti e l'importazione si può annullare.

### Test
- Nuovo `test_20`. Suite: 20/20.

## [5.21.0] — Annulla importazione

### Aggiunto
- Dopo aver importato un backup compare per 20 secondi **«Importazione completata · Annulla»**: tocca Annulla per tornare esattamente a come erano ricette, ricettari, raccolte, dispensa, liste e pianificazione prima dell'importazione. L'annulla vale finché non ricarichi la pagina.

### Test
- Nuovo `test_19`. Suite: 19/19.

## [5.20.0] — Cestino e «Annulla»

### Aggiunto
- **Cestino**: le ricette eliminate (singolarmente, da «Seleziona ed elimina» o insieme a un ricettario) non spariscono più: restano 30 giorni nel Cestino (menu ⋯ → 🗑 Cestino), con foto, e si possono **ripristinare** o eliminare per sempre. Un contatore accanto alla voce dice quante ce ne sono.
- **Annulla**: dopo un'eliminazione compare per qualche secondo il messaggio «… eliminata · Annulla», che rimette la ricetta e le sue voci nel piano della settimana.
- Il cestino è nel browser del dispositivo e non è incluso nei backup.

### Test
- Nuovo `test_18`. Suite: 18/18.

## [5.19.1] — Corretto: «Riconnetti» ricompariva sempre

### Corretto
- Scegliendo un file dati esistente («Apri un file dati che ho già» o «Scegli di nuovo il file») il browser concedeva solo il permesso di **lettura**: dopo il ricaricamento la pagina chiedeva di nuovo «Riconnetti» a ogni apertura, e le modifiche non venivano scritte nel file. Ora l'app chiede subito anche il permesso di **scrittura**: accettalo quando il browser lo propone (se compare «a ogni visita», scegli quella).

### Test
- Nuovo `test_17`. Suite: 17/17.

## [5.19.0] — Ritrovare il file dati

### Aggiunto
- Il banner di riconnessione ha ora **Scegli di nuovo il file**: se il browser non trova più il file dati (spostato, rinominato, collegamento perso) lo indichi a mano e l'app lo ricollega.
- I selettori di file (creare il file dati, aprirlo, salvare un backup) ricordano l'ultima cartella usata: se salvi sempre nella stessa cartella, la ritroverai già aperta.
- La finestra «Dove vuoi salvare i tuoi dati?» e la guida consigliano di creare una cartella «Il Mio Ricettario» (memoria del telefono, scheda SD o cloud).

### Test
- Nuovo `test_16`. Suite: 16/16.

## [5.18.0] — Foto con la fotocamera

### Aggiunto
- Nel modulo di una ricetta, su telefono e tablet compare **📷 Scatta una foto**: apre direttamente la fotocamera posteriore. La foto passa dal ritaglio/rotazione come le altre e viene ridimensionata e salvata (nello spazio delle foto, vedi 5.16.0). Su computer il pulsante non compare: resta la scelta del file.

### Test
- Nuovo `test_15` (telefono simulato). Suite: 15/15.

## [5.17.0] — Voti e raccolte

### Aggiunto
- **Voto a stelle** (1–5) nella scheda ricetta: tocca una stella, tocca di nuovo la stessa per togliere il voto. Il voto compare come ★ sulle card.
- Ordinamento **Voto più alto** e filtro **Voto** (3 o più, 4 o più, 5, senza voto) nel pannello Filtri.
- **Raccolte**: elenchi personali con un nome (es. «Cene veloci», «Natale»). Dalla scheda ricetta, **📂 Raccolte** permette di inserire la ricetta in una o più raccolte e di crearne di nuove; si eliminano da lì (le ricette restano). Nel pannello Filtri c'è il filtro **Raccolta**.
- Voti e raccolte sono inclusi in backup, importazione e file di salvataggio collegato.

### Test
- Nuovo `test_14`. Suite: 14/14.

## [5.16.0] — Tante ricette e tante foto

### Migliorato
- **Foto in uno spazio più grande**: il browser concede circa 5 MB al salvataggio normale, e bastavano poche decine di foto per riempirlo (e poi le modifiche non venivano più salvate). Ora le foto vengono conservate in IndexedDB, che ha centinaia di MB. La migrazione è automatica alla prima apertura: nessuna azione richiesta.
- Il backup, il file di salvataggio collegato e l'importazione continuano a contenere le foto come prima. Se il browser non permette IndexedDB, tutto funziona come prima (foto nel salvataggio normale).
- Misure con 2000 ricette: avvio ~0,5 s, ricerca ~20 ms (elenco già a blocchi di 48 card): nessuna modifica necessaria.

### Test
- Nuovo `test_13` (migrazione e riapertura). Suite: 13/13.

## [5.15.0] — Piano: ripeti la settimana e lista per date

### Aggiunto
- **Ripeti su altre settimane…** (in fondo alla pagina Pianificazione): copia la settimana mostrata, con le sue note, su 1–12 settimane successive. Di default salta quelle che hanno già delle ricette; anteprima prima di confermare.
- **🛒 Lista per date…**: lista della spesa per un intervallo a scelta (es. da oggi a domenica prossima), anche a cavallo di due settimane, con le quantità sommate.

### Test
- Nuovo `test_12`. Suite: 12/12.

## [5.14.0] — Ingredienti in modalità cucina

### Aggiunto
- Nella modalità cucina il pulsante **🧺 Ingredienti** apre un pannello con tutti gli ingredienti, già calcolati per le porzioni scelte, da spuntare man mano che li prepari.
- Sotto il testo di ogni passaggio compaiono, con le quantità, gli ingredienti citati in quel passaggio (es. «Mescola la farina…» mostra *Farina 200 g*).

### Corretto
- Il pacchetto 5.13.0 conteneva per errore `sw.js` e `MANIFEST.md` vuoti (l'uso offline non funzionava): ripristinati.

### Test
- Nuovo `test_11`. Suite: 11/11.

## [5.13.0] — Condividi la lista della spesa

### Aggiunto
- Pulsante **📤 Condividi testo** nella tua lista della spesa e nella lista della settimana. Sul telefono apre la condivisione (WhatsApp, note, messaggi…); sul computer copia il testo negli appunti.
- Il testo è diviso per reparto, con una casella ☐ per ogni articolo; quelli già spuntati non vengono inclusi.

### Test
- Nuovo `test_10`. Suite: 10/10.

## [5.12.0] — Promemoria settimanale di backup

### Aggiunto
- Un avviso in alto compare quando l'ultimo backup ha 7 o più giorni (o non ne hai mai fatto uno) e hai almeno una ricetta. Pulsanti: **Fai il backup** (su telefono si apre il foglio di condivisione: Drive, WhatsApp, e-mail…), **Domani** (rimanda di un giorno), **Non ricordarmelo**.
- Nel menu ⋯ → Backup e dati un interruttore **Promemoria settimanale** per riattivarlo o spegnerlo.

### Test
- Nuovo `test_09`. Suite: 9/9.

## [5.11.0] — Sito stabile, installabile e offline (PWA)

### Aggiunto
- **Uso offline**: nuovo `sw.js` (service worker). Dopo la prima apertura da indirizzo web (es. GitHub Pages) il ricettario funziona anche senza connessione; le versioni nuove si aggiornano da sole quando c'è rete.
- **Installa app**: dove il browser lo permette compare un invito a installare il ricettario sul telefono/computer.
- **Avviso copia locale**: se il sito è aperto come file (es. `content://` o `file://` sul telefono) compare un avviso con "Esporta backup", perché in quel caso il browser può non conservare i dati.
- Richiesta di archiviazione persistente al browser, per ridurre il rischio di cancellazione dei dati.

### Test
- Nuovo `test_08` (service worker, cache, banner). Suite: 8/8.

## [5.10.0] — «Le mie ricette»: barra compatta

### Cambiato
- La parte alta della pagina è stata riordinata, su telefono e su computer: **ricerca + pulsante "Filtri" + menu "⋯"** su una riga, poi le categorie, la scheda "Cosa posso cucinare?" in versione più compatta e, sopra l'elenco, il numero di ricette e l'ordinamento.
- **Filtri**: ricettario, tempo, solo preferite, archiviate, cottura, tag, allergeni ed esclusioni sono ora in un unico pannello (dal basso su telefono). Un numero accanto al pulsante dice quanti filtri sono attivi, **Azzera** li toglie tutti e il pulsante in fondo mostra quante ricette si vedranno.
- Su telefono: "Aggiungi ricetta" è un pulsante tondo in basso, il titolo doppio sparisce e le categorie scorrono di lato su una sola riga.
- Guida illustrata e screenshot aggiornati.

### Test
- `test_06` verifica il contatore dei filtri, Azzera e il menu ⋯; `test_04` e `test_06` usano i nuovi comandi. Suite: 7/7.

## [5.9.1] — Guida più facile da trovare

### Cambiato
- In **Oggi** il riquadro "Hai un dubbio? Apri la guida illustrata" è ora in alto, subito sotto il saluto (prima era in fondo alla pagina).
- In alto a destra il pulsante è ora **"❔ Guida"**, con la scritta, ben visibile in ogni pagina; su telefono l'icona **?** nella barra in alto è evidenziata.
- Nuova voce **"Guida illustrata"** in fondo al menu laterale (Gestione).
- La guida spiega i tre punti da cui si apre e come tornare al ricettario; screenshot aggiornati.

## [5.9.0] — Lista della spesa indipendente

### Aggiunto
- **Nuova pagina "Lista della spesa"** (voce del menu, scheda "Spesa" su telefono, tessera in "Oggi"): una lista tutta tua, che **non dipende dalla pianificazione**. Funziona anche se non hai pianificato nulla.
- **Ingredienti a mano**: scrivi nome, quantità e unità e premi Aggiungi. Lo stesso ingrediente con unità equivalenti (g/kg, ml/l…) si somma in una sola riga.
- **Ingredienti di una ricetta**: "Aggiungi gli ingredienti di una ricetta" (scegli ricetta e porzioni, puoi aggiungerne più di una di seguito) oppure, dalla scheda di una ricetta, **"Aggiungi alla spesa"** con le porzioni che stai vedendo. Ogni riga ricorda da dove viene ("da Pasta al pomodoro, Settimana").
- **Unisci con la lista della settimana**: somma alla tua lista gli ingredienti delle ricette pianificate (con riepilogo e conferma prima). La lista della settimana non cambia e **"Annulla ultima unione"** ripristina la tua lista.
- Righe raggruppate per reparto, con spunta, modifica (nome, quantità, unità) ed elimina; "Spuntati in Dispensa" li sposta in Dispensa, "Togli gli spuntati", "Svuota lista" e **Esporta PDF**.
- La lista è salvata nel browser e inclusa in backup e file di salvataggio collegato.

### Cambiato
- La voce "Lista della spesa" del menu apre ora la nuova pagina. La lista generata dalla settimana resta disponibile dal pulsante "Lista della settimana" (in questa pagina e nella Pianificazione) e funziona come prima.

### Test
- Nuovo `test_07_lista_spesa_libera`. Suite: 7/7.
- La **Guida illustrata** ha un capitolo 9 riscritto su questa nuova lista.

## [5.8.0] — Guida illustrata integrata

### Aggiunto
- **Guida illustrata** (`guida.html`): 13 capitoli passo dopo passo con screenshot (computer e telefono), pronta anche da stampare o salvare in PDF.
- In **Oggi** compare una scheda "Guida illustrata" sotto l'accesso rapido.
- Un'**icona "?"** sempre accessibile: nella barra in alto su computer/tablet e nella barra del telefono, da qualsiasi pagina. Dalla guida, "← Torna al ricettario" riporta all'app.
- Nel file unico la guida è incorporata e si apre in una nuova scheda.

### Nota
- Gli screenshot mostrano ricette di esempio; se l'aspetto dell'app cambia molto, la guida va rigenerata.

## [5.7.0] — Scheda ricetta come pagina

### Cambiato
- Su schermo largo e su tablet la scheda di una ricetta non è più una finestra scura sopra l'elenco: occupa l'area principale accanto alla barra laterale, come una pagina vera, con il pulsante "← Le mie ricette" in alto.
- Il tasto **indietro** del browser (e il gesto/tasto indietro del telefono) chiude la scheda e torna all'elenco, invece di uscire dal sito.
- Scegliendo una voce della barra laterale con la scheda aperta si passa subito alla nuova pagina.
- Su telefono la scheda era già a tutto schermo: resta uguale, con in più il tasto indietro.
- Esc e tutte le funzioni della scheda (Modifica, Modalità cucina, Pianifica, Esporta…) funzionano come prima.

## [5.6.0] — Note nella griglia della pianificazione

### Aggiunto
- Nella vista **Settimana** ogni casella ha ora un pulsante ✎ per scrivere (e poi modificare o cancellare) la nota di quel giorno e pasto direttamente nella griglia, senza passare alla vista "Giorno". Le note sono le stesse delle due viste e restano nei backup.

## [5.5.0] — Volumi: ordine, PDF e selettore del piano

### Aggiunto
- **Riordino dei volumi**: in "Gestisci ricettari" le frecce ↑ ↓ spostano un ricettario prima o dopo gli altri; l'ordine vale per la libreria di "Oggi" e per i menu.
- **Pianificazione**: nella finestra di scelta della ricetta, con più ricettari ogni voce mostra il volume di provenienza e la ricerca funziona anche per nome del volume.
- **PDF**: il nome del file e il titolo includono il ricettario (`ricettario_ricetta.pdf`; per le esportazioni multiple, se tutte le ricette sono di un solo volume).

### Test
- Nuovo `test_06_ricettari_volumi_pdf_piano` (riordino, etichetta nel selettore, nome del PDF). Suite: 6/6.

## [5.4.1] — Rifiniture delle finestre su smartphone

### Corretto
- Nel modulo ricetta, la barra con "Annulla / Salva" su telefono sporgeva di qualche pixel dal bordo destro dello schermo.
- Nel modulo "Nuovo prodotto" della Dispensa, su telefono Categoria/Quantità e Unità/Avvisa sotto sono ora affiancati a due a due: il modulo è molto più corto da scorrere.
- Verificato su 390 px che nessuna delle 18 finestre dell'app esce dallo schermo né genera scorrimento orizzontale.

## [5.4.0] — Categorie nei Preferiti

### Aggiunto
- Le pillole delle categorie mostrano ora **quante ricette contengono** con i filtri attuali: in "Preferiti" si vede subito in quali categorie ci sono ricette preferite (le categorie vuote sono attenuate). Il conteggio tiene conto anche di ricerca e altri filtri.
- Messaggi più chiari: "Non hai ancora ricette preferite…" se non ce ne sono, oppure "Nessuna ricetta preferita in questa categoria" scegliendo una categoria vuota. In "Preferiti" il sottotitolo della pagina lo dice esplicitamente.

## [5.3.0] — Accessibilità

### Aggiunto
- **Tastiera nelle finestre**: **Esc** chiude la finestra in primo piano (se un modulo ha modifiche non salvate chiede prima conferma), **Tab** resta dentro la finestra aperta senza "scappare" sulla pagina sottostante, e alla chiusura il focus torna all'elemento che l'aveva aperta. Le finestre sono ora dichiarate come "dialog" per gli screen reader, con il titolo come etichetta.

### Corretto
- Contrasto dei colori: il testo secondario su fondo verde chiaro e il testo terracotta su fondo terracotta chiaro erano appena sotto la soglia AA (4,3:1); sono stati leggermente scuriti (ora ≥ 4,7:1). Tutte le coppie testo/sfondo principali, in tema chiaro e scuro, risultano ora ≥ 4,5:1.
- Verificato che ogni elemento raggiungibile con Tab mostra un indicatore di focus visibile.

## [5.2.0] — Modulo ricetta riorganizzato

### Cambiato
- Il modulo "Nuova ricetta / Modifica ricetta" è diviso in sezioni chiare: **Informazioni** (nome, categoria, ricettario, porzioni, tempo), **Foto**, **Ingredienti**, **Passaggi** e **Note personali**.
- Tag dietetici, allergeni, "si congela bene", tipo di pentola e valori nutrizionali, tutti facoltativi, sono raccolti nel riquadro ripiegabile **"Altre informazioni"**: resta chiuso per le ricette nuove e si apre da solo se la ricetta ha già qualcuno di questi dati.
- I pulsanti **Annulla** e **Salva ricetta** restano sempre visibili in fondo, anche scorrendo un modulo lungo; su telefono i campi vanno in colonna singola. Il pulsante di scelta foto ha lo stile del resto dell'app.
- Nessuna modifica a campi, salvataggio o funzioni.

## [5.1.0] — Lista della spesa: modifica e rimozione delle singole voci

### Aggiunto
- Ogni voce della lista della spesa ha ora due icone: ✏️ per **cambiare la quantità** (campo con Salva/Annulla) e 🗑 per **toglierla dalla lista**. La quantità modificata resta anche chiudendo e riaprendo la lista, e viene usata se la voce viene poi spuntata e aggiunta alla Dispensa.
- Le voci tolte non vanno perse: in fondo compare "N voci tolte dalla lista" con **"Rimetti le voci in lista"**. Per i promemoria "dalla Dispensa" la rimozione chiede conferma ed è definitiva.
- In cima alla lista un riepilogo distingue **"da comprare"** (terracotta) e **"nel carrello"** (verde); le voci spuntate restano evidenziate e barrate.
- "Svuota lista" azzera anche voci tolte e quantità modificate.

## [5.0.0] — Nuova grafica "Cucina Naturale Contemporanea"

### Cambiato
- **Tutta l'interfaccia è stata ridisegnata**: sfondo avorio caldo, verde salvia come colore identificativo, terracotta solo per piccoli dettagli e azioni secondarie; font DM Sans (interfaccia) e Lora (titoli e ricette). Schede con angoli morbidi, ombre leggere, icone semplici a linea.
- **Oggi**: data, saluto discreto (in base all'ora, senza nomi inventati), "I pasti di oggi" con foto, "La mia settimana", "Accesso rapido" e "Le tue ricette preferite"; meteo, "Da consumare prima", lista della spesa e libreria dei ricettari restano più in basso.
- **Le mie ricette**: titolo, ricerca, categorie a pillole, ordinamento e griglia di schede con foto, categoria, tempo, porzioni e cuore (solo i dati presenti).
- **Dettaglio ricetta**: titolo in Lora, ingredienti in tabella con scala porzioni, procedimento a passi numerati, "Informazioni aggiuntive" e azioni sempre a portata.
- **Dispensa**: tabella ordinata (ingrediente, quantità, unità, categoria) con pallino di stato, segnalazione "In esaurimento"/scadenza e icone modifica/elimina su ogni riga.
- **Pianificazione**: nuova **griglia settimanale** (giorni × fasce pasto) su schermi larghi, con celle vuote/riempite ben distinguibili e giorno corrente evidenziato; interruttore Settimana/Giorno; su smartphone resta un giorno alla volta con navigazione tra i giorni. Aggiunta, rimozione, porzioni, ✓ consumato, lista della spesa del giorno e fasce pasto funzionano come prima.
- Icone dell'app (PWA, schermata Home, favicon) e colore del tema ricolorati in verde salvia.

### Corretto
- Il cassetto laterale chiuso su telefono lasciava un'ombra visibile sul bordo sinistro.
- L'icona di ricerca della barra superiore si sovrapponeva al testo.

### Invariato

## [4.4.0] — Più ricettari, come volumi di una libreria

### Aggiunto
- **Le ricette possono ora essere organizzate in più ricettari distinti** ("Ricette mie", "Ricette della nonna", "Ricette di Andrea"…), ciascuno con una copertina personalizzabile. Ogni ricetta appartiene a un solo ricettario per volta.
- Nuova sezione **"📚 La tua libreria"** nella pagina "Oggi": i ricettari compaiono come dorsi di libri affiancati, con copertina e numero di ricette; toccandone uno si apre il Ricettario già filtrato su quel volume.
- Nuovo pannello **"Gestisci ricettari"** (da Oggi o dal Ricettario): crea, rinomina, assegna una copertina (con lo stesso editor di ritaglio già usato per le foto delle ricette) o elimina un ricettario. Eliminando un ricettario non vuoto viene chiesto se spostare le sue ricette in un altro volume o eliminarle insieme ad esso.
- Nel Ricettario, un nuovo filtro permette di vedere "Tutti i ricettari" insieme oppure uno alla volta; una nuova ricetta parte già nel volume che si sta guardando. Pianificazione e "Cosa posso cucinare?" continuano a cercare su tutti i ricettari insieme.
- **Esportazione PDF**: la finestra "Esporta ricettario in PDF" permette ora di filtrare anche per ricettario; esportando ricette di più ricettari insieme, ogni pagina riporta sotto il titolo da quale volume viene.
- **CSV**: nuova colonna "Ricettario" nell'esportazione, più un menu per limitare l'esportazione a un solo volume; in importazione, un ricettario nominato nel CSV ma non ancora esistente viene creato al volo.
- **Backup JSON**: ricettari e relative copertine sono ora inclusi nell'esportazione/importazione del backup completo.

## [4.3.1] — Filtri nell'esportazione PDF del ricettario

### Aggiunto
- Nella finestra "Esporta ricettario in PDF" è ora possibile restringere l'elenco da cui scegliere con gli stessi filtri già disponibili nella vista Ricettario: metodo di cottura (pentola a pressione, robot, friggitrice ad aria, tradizionale), tag dietetici ed esclusione per allergeni. I filtri si possono combinare tra loro.
- Nuovo pulsante "Seleziona tutte (visibili)": seleziona solo le ricette che corrispondono ai filtri e alla ricerca attuali, non l'intero ricettario.
- Le ricette selezionate restano nella selezione anche cambiando o cancellando un filtro: un filtro serve solo a restringere cosa si vede nell'elenco, non fa sparire dalla selezione finale una ricetta scelta in precedenza.

## [4.3.0] — L'app si può installare sulla schermata Home

### Aggiunto
- **Il Mio Ricettario è ora installabile come un'app**, su telefono, tablet o computer: da Chrome/Edge/Safari compare la voce "Aggiungi a Home"/"Installa app", e una volta installata l'icona apre il sito a schermo intero, senza barra degli indirizzi, con la sua icona in home e nello switcher delle app.
- Aggiunta una nuova icona dedicata (la stessa pentola 🍲 su sfondo sfumato già presente in cima alla barra laterale, per restare coerenti con il resto dell'app), generata in più dimensioni: icona normale per Android/desktop, variante "adaptive" per Android (si adatta alla forma — tonda, squadrata, a goccia — scelta dal telefono) e icona dedicata per la schermata Home di iPhone/iPad.
- Aggiunta un'icona anche per la scheda del browser (favicon), che prima mancava.
- La barra di navigazione resta quella attuale (menu "☰" a comparsa): questa modifica riguarda solo l'installazione e l'icona, nessun'altra schermata è cambiata.

### File nuovi da caricare
- `manifest.json`
- `img/icon-192.png`, `img/icon-512.png`, `img/icon-maskable-192.png`, `img/icon-maskable-512.png`, `img/apple-touch-icon.png`, `img/favicon-32.png`, `img/favicon-16.png`

## [4.2.4] — Correzioni minori emerse da un controllo generale

### Corretto
- **Bug**: esportando le ricette in CSV e poi reimportandole, le impostazioni della friggitrice ad aria sui passaggi andavano perse silenziosamente (non venivano rilette in fase di importazione). Ora il giro esporta→importa conserva correttamente temperatura e preriscaldamento, anche per un passaggio che usa solo la friggitrice ad aria senza robot né pentola a pressione.
- Rimossa una regola di stile non più usata, rimasta dalla card Dispensa prima della sua recente semplificazione.

### Aggiunto
- I pulsanti della barra di navigazione laterale segnalano ora anche alla tecnologia assistiva (lettori di schermo) quale pagina è quella aperta al momento (attributo `aria-current`), non solo visivamente.

## [4.2.3] — "Oggi" come pagina iniziale, più dettagli in "Da consumare prima"

### Cambiato
- La pagina iniziale del sito è ora **☀️ Oggi** (prima si apriva sempre sul Ricettario).
- La card "Da consumare prima" nella pagina Oggi ora mostra, per ogni prodotto in scadenza: il pallino colorato della categoria, la quantità che ne hai, e quando scade in modo discorsivo ("Scade oggi", "Scade domani", "Scade tra N giorni") oltre alla data, con un colore più acceso per chi scade oggi o domani. Se i prodotti in scadenza sono più di 4 ora lo dice esplicitamente ("+ altri N prodotti…") invece di ometterli in silenzio.
- Aggiunto il pulsante "🧑‍🍳 Trova ricette" nella stessa card: porta dritto al Ricettario in modalità "Cosa posso cucinare?" già filtrata sui prodotti in scadenza, così da trovare subito una ricetta che li usi.

## [4.2.2] — Corretto il contrasto col tema scuro in alcuni riquadri

### Corretto
- I riquadri "Valori nutrizionali" (sia della scheda prodotto in Dispensa sia degli ingredienti in Ricetta), i riquadri dei passaggi di preparazione (compresi quelli con le impostazioni robot/pentola a pressione/friggitrice ad aria) e il campo note dei pasti in Pianificazione avevano uno sfondo chiaro fisso che, col tema scuro, diventava un grigio poco leggibile su testo anch'esso grigio chiaro. Ora lo sfondo di questi riquadri segue il tema come il resto del sito.

## [4.2.1] — Card Dispensa in stile ricetta, quadrate

### Cambiato
- Le card della Dispensa ora usano la stessa griglia a riquadri delle card Ricettario (prima erano un elenco a tutta larghezza): stessa illustrazione segnaposto colorata per categoria (o la foto del prodotto se trovata su Open Food Facts), stessa etichetta categoria, stesso stile del titolo.
- La card continua a mostrare a colpo d'occhio quantità, eventuale avviso "in esaurimento" e scadenza.

## [4.2.0] — Friggitrice ad aria come nuovo metodo di cottura

### Aggiunto
- Nuovo metodo di cottura "🌀 Friggitrice ad aria", al pari di robot e pentola a pressione: ogni passaggio della ricetta può ora avere temperatura (fino a 230°C) e preriscaldamento.
- Nuovo badge 🌀 sulle card e nella scheda ricetta, nuovo filtro "🌀 Friggitrice ad aria" tra i filtri avanzati, e comparsa automatica nella riga "Cottura:" dei PDF (anche in combinazione con altri metodi, es. "Robot da cucina + Friggitrice ad aria").
- Il dettaglio di temperatura/preriscaldamento compare anche nel testo del passaggio esportato (PDF e CSV).
- Una ricetta è ora "🔥 Tradizionale" solo se non usa robot, pentola a pressione né friggitrice ad aria.

## [4.1.9] — Tipo di cottura nel PDF delle ricette

### Aggiunto
- Nel PDF di ogni ricetta (sia l'export della singola ricetta sia il ricettario completo) ora compare la riga "Cottura: …" con il metodo rilevato automaticamente dai passaggi della ricetta: 🔥 Tradizionale, 🤖 Robot da cucina, 🍲 Pentola a pressione, oppure la combinazione di più metodi se la ricetta li usa entrambi (es. "Robot da cucina + Pentola a pressione"). Prima questa informazione era visibile solo come badge a schermo, non nella stampa.

## [4.1.8] — Logo e firma dell'autore nei PDF

### Aggiunto
- Il logo "Clan Destino" e la firma "Giampiero Santoro" (già presenti in fondo alla barra laterale del sito) ora compaiono anche in calce a ogni pagina di tutti i PDF esportati: la singola ricetta, il ricettario completo, la lista della spesa e la pianificazione settimanale.

## [4.1.7] — Categorie nel PDF e ricette ripetute nel sottotitolo

### Corretto
- Esportando la lista della spesa in PDF, le intestazioni di reparto (es. "Frutta", "Verdura") sparivano: restava solo il pallino colorato, senza il nome. Ora compaiono correttamente, come nella lista a schermo.
- Se la stessa ricetta era pianificata più volte nella settimana (o nello stesso giorno), il suo nome compariva ripetuto nel sottotitolo della lista della spesa. Ora compare una sola volta, con accanto in rosso quante volte è stata pianificata (es. "Carbonara risottata (x2 volte questa settimana)"); le quantità nella lista restano già sommate come prima.

## [4.1.6] — Doppioni nella lista della spesa e modo per svuotarla

### Corretto
- I promemoria "dalla dispensa" nella lista della spesa (ingredienti segnalati mancanti quando pianifichi una ricetta) potevano accumularsi come doppioni nel tempo — es. "Sale" o "Olio di semi" ripetuti due volte — e non venivano ripuliti da soli. Ora, all'apertura del sito, i doppioni già presenti vengono uniti automaticamente.

### Aggiunto
- Nuovo bottone **"🗑 Svuota lista"** nella finestra della lista della spesa: toglie tutte le spunte e tutti i promemoria "dalla dispensa" accumulati, per poter ripartire puliti e rigenerare la lista in base al giorno o alla settimana che serve (le ricette pianificate restano, solo spunte e promemoria vengono azzerati).

## [4.1.5] — Testo del bottone "Seleziona"

### Cambiato
- Nel Ricettario, il bottone "Seleziona" ora si chiama "Elimina ricette", coerente con quello che effettivamente fa: entrando in quella modalità l'unica azione possibile sulle ricette scelte è eliminarle.

## [4.1.4] — Sfondo a quadretti

### Cambiato
- Lo sfondo della pagina ora ha una leggerissima trama a quadretti (stile tovaglia da cucina), al posto della grana a puntini di prima. È tinta con lo stesso colore delle parti evidenziate del sito, quindi si adatta da sola sia al tema chiaro sia a quello scuro.

## [4.1.3] — Passaggi separati per le ricette importate

### Corretto

## [4.1.2] — Il contenuto ora riempie tutta la pagina

### Corretto
- Il pannello principale ("il libro") aveva una larghezza massima fissa (1180px) che risaliva al vecchio tema: su schermi larghi lasciava una fascia vuota a destra invece di usare tutto lo spazio disponibile, ad esempio nella griglia delle ricette. Ora il pannello occupa sempre tutta la larghezza della pagina; solo i testi lunghi di "Come funziona" restano a una larghezza comoda da leggere, invece di stirarsi per tutto lo schermo.

## [4.1.1] — Ricerca senza distinzione di accenti

### Corretto

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

## [3.33.0] — Ingredienti scelti, note settimanali, spesa per reparti

### Aggiunto
- In **"Cosa posso cucinare?"** è ora possibile scegliere con **"📋 Scegli prodotti"** solo alcuni prodotti della Dispensa da usare nella ricerca, invece di usarli tutti automaticamente — utile per simulare "se avessi solo questo cosa potrei fare?".
- Quando una ricetta risulta **"✓ Puoi farla"**, compare ora il promemoria *"Controllare le quantità effettive che hai a disposizione"*, perché il confronto resta una stima basata sui dati inseriti in Dispensa.
- Nella **Pianificazione**, ogni pasto ha ora un campo per una **nota libera** (es. "cena fuori", "avanzi", "preparare il giorno prima…), salvata automaticamente.
- La **lista della spesa** è ora raggruppata per **reparto** (frutta, verdura, pasta e cereali, ecc. — gli stessi reparti della Dispensa), nello stesso ordine in cui si trovano di solito al supermercato.
- Lo stato delle caselle spuntate nella lista della spesa è ora **persistente**: un ingrediente resta spuntato anche rigenerando la lista (es. dopo una modifica alla pianificazione), perché il promemoria è legato al nome dell'ingrediente e non alla singola lista generata.

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
- README e commenti tecnici sono stati allineati al comportamento effettivo dell'app. Rimossi inoltre i riferimenti a uno screenshot e a una licenza che non erano presenti nell'archivio.

## [3.29.1] — Filtro per tempo di preparazione

### Aggiunto
- Nuovo filtro **"Qualsiasi tempo"** nel Ricettario: entro 15/30/60 minuti, oppure "Con tempo indicato" per vedere solo le ricette a cui hai assegnato un tempo. Una ricetta senza tempo indicato non rientra in nessuna soglia — non viene considerata "veloce" solo perché il tempo non è stato scritto

## [3.29.0] — Menu riorganizzati ed etichette più chiare

### Modificato
- **Nuovo menu "🎨 Aspetto"**, separato da "📦 Backup e CSV": contiene solo la scelta del tema grafico, prima mescolata tra backup e CSV
- **"🔍 Filtri ▾" rinominato in "🔍 Cottura, tag ed esclusioni ▾"**, per capire subito cosa contiene senza doverlo aprire

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
- **Valori nutrizionali nella Pianificazione settimanale**: ogni voce pianificata (ricetta o prodotto Dispensa) mostra ora Kcal/Proteine/Grassi/Carboidrati/Fibre/Zuccheri/Sale calcolati per quella voce — per una ricetta, sulla base di "per quante persone" impostato in Pianificazione; per un prodotto Dispensa, sulla quantità indicata per quel pasto (quando espressa in grammi o kg)

### Corretto

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
