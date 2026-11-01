# Guida all'uso — Copione, editor per il teatro

Questa guida accompagna dalla prima apertura fino all'esportazione del copione. Per una panoramica e per la pubblicazione su GitHub vedi il [README](README.md).

**Indice**
1. [Primi passi](#1-primi-passi)
2. [Orientarsi nella schermata](#2-orientarsi-nella-schermata)
3. [Scrivere il copione](#3-scrivere-il-copione)
4. [I personaggi](#4-i-personaggi)
5. [Dettagli e note di ogni scena](#5-dettagli-e-note-di-ogni-scena)
6. [La libreria e la pagina iniziale](#6-la-libreria-e-la-pagina-iniziale)
7. [Salvare e non perdere il lavoro](#7-salvare-e-non-perdere-il-lavoro)
8. [Importare](#8-importare)
9. [Esportare e stampare](#9-esportare-e-stampare)
10. [Analisi del copione](#10-analisi-del-copione)
11. [Cercare e sostituire](#11-cercare-e-sostituire)
12. [Aspetto e comodità](#12-aspetto-e-comodità)
13. [Smartphone](#13-smartphone)
14. [Scorciatoie](#14-scorciatoie)
15. [Domande frequenti](#15-domande-frequenti)

---

## 1. Primi passi

1. Apri l'editor: https://giampiero-santoro.github.io/copione-teatrale/
2. All'avvio compare la domanda **«Dove vuoi salvare questo copione?»**:
   - **Collega un file sul mio computer** — consigliato: il copione viene salvato in un vero file (disponibile nei browser Chrome ed Edge da computer).
   - **Solo salvataggio automatico nel browser** — comodo, ma i dati si perdono se svuoti la cache o cambi dispositivo.
3. Dai un titolo all'opera e scrivi il tuo nome come autore, in alto.
4. Crea la prima scena e inizia a scrivere. Quando qualcosa è ancora vuoto (copione, scena, atto, elenco dei personaggi) l'editor te lo segnala con un messaggio e un pulsante per cominciare: «Crea la prima scena», «Battuta / Didascalia / Fuori scena», «Aggiungi il primo personaggio».

> **Regola d'oro:** anche se usi il salvataggio automatico, tieni sempre una copia in un file (`File → Scegli dove salvare` oppure `Pubblicazione → Salva progetto (.json)`).

## 2. Orientarsi nella schermata

Su uno schermo largo l'editor è diviso in tre pannelli.

| Zona | Cosa contiene |
|---|---|
| **In alto** | Logo, titolo e autore (si modificano cliccandoci sopra), menu **File · Analisi · Pubblicazione** e, a destra, il pulsante **Modalità prova e lettura** |
| **Barra strumenti** | Annulla, Ripristina, Cerca, dimensione del testo (A− A A+), Zoom e lo **stato del salvataggio** (la pillola verde: cliccala per salvare subito). Nuovo copione, apertura e salvataggio sono nel menu **File** |
| **Sinistra** | **Struttura del copione**: albero di atti e scene e ricerca rapida |
| **Centro** | Il foglio del copione, con il percorso «Atto › Scena» sopra |
| **Destra** | Schede **Personaggi**, **Note di regia**, **Dettagli scena** |
| **In basso** | Larghezza del testo, interlinea, carattere e schermo intero |

**Nascondere i pannelli.** Il pulsante accanto al «+» di *Struttura del copione* nasconde il menu di sinistra; il pulsante in fondo alle schede nasconde il pannello di destra. Quando un pannello è nascosto compare una piccola linguetta sul bordo dello schermo: cliccala per riaprirlo.

> Su schermi larghi meno di 1280 pixel (per esempio un portatile piccolo) il pannello di destra parte chiuso, per lasciare spazio al foglio: lo riapri con la linguetta sul bordo destro. Sugli schermi stretti (telefoni, tablet in verticale) il layout è quello classico con menu laterale e barra inferiore. Vedi [Smartphone](#13-smartphone).

## 3. Scrivere il copione

### Atti e scene
- Nella struttura a sinistra usa **«Nuovo atto»** per creare un atto e **«Nuova scena»** per aggiungere una scena all'atto in cui stai lavorando (il «+» accanto a ogni atto fa lo stesso su quell'atto).
- Ogni atto ha una **freccia** per comprimerlo o espanderlo e un numero che indica quante scene contiene. Lo stato (atti compressi o aperti) resta memorizzato; l'atto della scena aperta si riapre da solo.
- Il **pallino a destra di ogni scena** indica lo stato: passandoci sopra leggi *Bozza*, *Da rivedere* o *Definitiva*.
- Clicca una scena per aprirla; clicca il nome per rinominare atti e scene.
- Ogni scena ha una **riga del luogo** (es. «Cucina, sera»), subito sotto il titolo.

### I blocchi di testo
In fondo alla scena (e nei pulsanti flottanti) trovi tre tipi di blocco:

| Blocco | A cosa serve |
|---|---|
| **Battuta** | Nome del personaggio (in maiuscolo) + testo detto |
| **Didascalia** | Indicazioni di scena: azioni, movimenti, luci |
| **Fuori scena** | Voci o rumori che arrivano da fuori dal palco |

Altri strumenti:
- Sopra ogni battuta puoi aggiungere una **nota tra parentesi** (es. *«sorridendo»*) e una didascalia dopo la battuta.
- Passando il mouse su un blocco compaiono le frecce per spostarlo su o giù e il comando per eliminarlo.
- **`Ctrl/Cmd + Invio`** aggiunge subito una nuova battuta.

### Annullare un errore
`Ctrl/Cmd + Z` annulla, `Ctrl/Cmd + Maiusc + Z` ripristina (anche i pulsanti *Annulla* e *Ripristina* nella barra strumenti).

## 4. I personaggi

Nel pannello di destra, scheda **Personaggi**:

- **Elenco**: ogni personaggio ha un cerchio colorato con le iniziali, il nome e il ruolo. Il campo in alto filtra per nome.
- **Scheda**: cliccando un personaggio l'elenco lascia il posto alla sua scheda, che usa tutto il pannello (così si legge bene anche con tanti personaggi).
  - In alto: **‹ Personaggi** (oppure `Esc`) torna all'elenco; il contatore (per esempio *3 / 10*) dice dove sei; le **frecce** passano al personaggio precedente o successivo senza tornare all'elenco.
  - **Scheda**: età, ruolo (scelto da un elenco), attore, descrizione e gli atti in cui il personaggio compare. Il pulsante **Scheda completa** apre tutti gli altri campi (aspetto, costume, voce, obiettivo, conflitto, foto, colore…).
  - **Relazioni**: con chi è in rapporto e come (es. «madre di», «rivale di»). Il pulsante **Relazioni** in fondo all'elenco apre il diagramma.
  - **Note**: retroscena per l'attore e note di regia private.
  - La lente mostra **solo le scene** con quel personaggio, il cestino lo elimina (chiede conferma, rimuove anche le relazioni collegate e riporta all'elenco).
- **Nuovo personaggio** (in fondo all'elenco) lo aggiunge e apre subito la sua scheda.
- Quando scrivi una battuta scegli il personaggio dall'elenco: il nome compare sempre in maiuscolo.

## 5. Dettagli e note di ogni scena

Nel pannello di destra:

- **Dettagli scena**
  - **Stato**: *Bozza*, *Da rivedere* o *Definitiva* (il pallino colorato compare anche nella struttura a sinistra).
  - **Descrizione** della scena e **Scenografia e oggettistica**.
  - **Personaggi in scena**: seleziona chi c'è; «rileva dai dialoghi» li imposta in automatico. Alimenta il *Piano di scena*.
  - **Leggi le battute degli assenti**: una voce sintetica italiana legge le battute dei personaggi **non** segnati come presenti, così puoi provare la tua parte da solo. Dipende dal browser (funziona nei principali; se non è disponibile compare un avviso). Un secondo clic interrompe la lettura.
- **Note di regia**: appunti **privati** (luci, movimenti, idee). **Non** vengono incluse nelle esportazioni per gli attori.

## 6. La libreria e la pagina iniziale

La **Pagina iniziale** si apre dal pulsante in alto a sinistra (un secondo clic ti riporta al copione; oppure da *File → Pagina iniziale*, o dal pulsante «Inizio» su telefono). Contiene:

- il **logo** e la tua **libreria**: ogni copione è un libro su uno scaffale, con titolo, autore, atti, scene, minuti stimati e data dell'ultima modifica. Sopra lo scaffale puoi **cercare** per titolo o autore e **ordinare** per ultima modifica, titolo o lunghezza;
- il riepilogo del **copione aperto** (scene, personaggi, parole, minuti) con le azioni rapide e l'elenco delle scene.

Sui libri puoi:
- **Aprire** un copione cliccandolo (quello in uso viene messo da parte automaticamente);
- **Esportare** (icona di download): *Fountain* o *Progetto .json*;
- **Duplicare** (icona copia) per fare una variante;
- **Eliminare** (icona cestino, con conferma — l'operazione non si può annullare).

I due «libri» tratteggiati iniziali servono a creare un **Nuovo copione** e a **Importare un copione** da file.

> La libreria vive nel browser che stai usando. Telefono e computer hanno librerie separate: per spostare un copione esportalo e importalo di là.

## 7. Salvare e non perdere il lavoro

- **Salvataggio automatico**: avviene a ogni modifica; lo stato compare nella barra strumenti (es. «Tutte le modifiche salvate»).
- **Salva subito**: `Ctrl/Cmd + S`, la pillola dello stato nella barra strumenti, oppure *File → Salva*.
- **Collegare un file** (*File → Scegli dove salvare*, solo Chrome/Edge da computer): il copione viene scritto anche su un file del tuo computer.
- **Progetto `.json`** (*Pubblicazione → Salva progetto*): copia completa, funziona su qualunque browser.
- **Versioni** (*File → Versioni*): salva una **istantanea** con un nome, tornaci quando vuoi e **confronta** con il copione attuale (righe rosse = solo nella versione salvata, verdi = solo nell'attuale).

> Le versioni sono **separate per ogni copione**: nell'elenco vedi solo quelle del copione aperto, e il titolo in alto ti ricorda di quale. Eliminando un copione dalla libreria si eliminano anche le sue versioni. Le versioni create prima di questo aggiornamento sono state assegnate al copione che avevi aperto la prima volta che hai aperto l'elenco.

### Backup di tutta la libreria

Nella **Pagina iniziale**, sotto la libreria, c'è il riquadro **Backup della libreria** (lo trovi anche in *File → Backup di tutta la libreria*):

- **Scarica il backup**: salva un unico file `Copioni_backup_AAAA-MM-GG.json` con **tutti i copioni** e le loro **versioni**. Conservalo fuori dal browser (computer, cloud, chiavetta).
- **Ripristina da file**: scegli un file di backup; i copioni vengono aggiunti alla libreria. Quelli già presenti non vengono duplicati, e il copione aperto non viene toccato. Puoi usare lo stesso pulsante anche per importare un solo copione (`.json` o `.fountain`).
- **Promemoria**: se sono passati 7 giorni dall'ultimo backup (o dal primo utilizzo) il riquadro diventa rosato e ti avvisa. «Più tardi» lo rimanda di 3 giorni.

### Due schede aperte

Se apri l'editor in due schede e modifichi il copione in una, l'altra mostra una barra in alto e **mette in pausa il salvataggio** per non sovrascrivere le modifiche. Scegli *Ricarica la pagina* per vedere la versione più recente, oppure *Continua qui* se vuoi che questa scheda prevalga.

## 8. Importare

| Cosa | Come |
|---|---|
| **Testo già scritto altrove** | *File → Importa testo*, incolla. Le righe in **MAIUSCOLO** diventano nomi di personaggio, le righe tra **(parentesi)** didascalie, il resto battute. Viene creata una **nuova scena** |
| **Un copione come nuovo libro** | Nella Pagina iniziale: libro **«Importa copione»**. Accetta `.fountain`, `.txt` e `.json`, anche più file insieme. Non tocca il copione aperto |
| **Aggiungere un file Fountain al copione aperto** | *File → Aggiungi da .fountain* |
| **Sostituire il copione aperto con un progetto** | *File → Sostituisci da .json* |

Dai file `.fountain` titolo e autore vengono letti dall'intestazione; i personaggi sono ricavati dai nomi in maiuscolo delle battute.

## 9. Esportare e stampare

Tutto nel menu **Pubblicazione**:

- **Anteprima PDF** e **Anteprima live** (il PDF si aggiorna accanto al copione mentre scrivi).
- **Esporta PDF**: copione completo.
- **Impostazioni PDF**: formato (**A4** o **Letter**), **margini** (normali, stretti, ampi per annotazioni a mano), **copyright** facoltativo, link con QR code e l'opzione **Mostra il logo Clan Destino nella copertina** (attiva di default).
- **Per personaggio**: PDF con tutte le battute di un attore e le battute-imbeccata (cue) degli altri, ideale per studiare la parte.
- **Insieme**: vista d'insieme del copione.
- **Copia di lettura (HTML)**: versione di sola lettura da condividere.
- **Esporta `.fountain`**, **Esporta `.txt`**, **Copia testo**, **Salva progetto `.json`**.

> Il `.fountain` mantiene testo e struttura. Le **schede dei personaggi** e le **note di regia** si conservano solo nel `.json`.

## 10. Analisi del copione

Nel menu **Analisi**:
- **Statistiche**: tempo di lettura per atto, bilanciamento delle battute tra i personaggi, oggetti di scena.
- **Qualità**: una scansione rapida per non dimenticare nulla prima di stampare.
- **Piano scene**: chi è presente in ogni scena (basato su «Personaggi in scena» o, se non impostato, su chi parla).


## 11. Cercare e sostituire

- **Ricerca rapida** (campo nel menu di sinistra, `Ctrl/Cmd + K`): scrivi almeno due lettere e vedi scene, personaggi e battute; un clic ti porta al punto.
- **Cerca e sostituisci** (barra strumenti): sostituisce il testo in **tutto il copione** — battute, didascalie, note, nomi di personaggi e scene, note di regia — con l'opzione *Distingui maiuscole/minuscole*.

## 12. Aspetto e comodità

- **Aspetto**: l'editor ha un solo tema, chiaro e moderno (carta bianca, accento bordeaux, copione in carattere con le grazie).
- **Modalità prova** (pulsante in alto a destra): il foglio diventa di sola lettura e senza strumenti di modifica; cliccando una battuta la evidenzi come punto di lettura. Insieme a *Leggi le battute degli assenti* (vedi sotto) serve per provare la tua parte.
- **Modalità studio** (icona con l'occhio barrato, accanto alla modalità prova): serve per **imparare la propria parte a memoria**.
  1. Scegli il personaggio nella barra che compare sopra il foglio («Parte di…»).
  2. Le sue battute si coprono con un riquadro che indica quante parole sono.
  3. **Tocca una battuta**: al primo tocco vedi un **suggerimento** (l'iniziale di ogni parola, per esempio «N… è t… v…»); al secondo tocco la **rivela** per intero. Il piccolo occhio barrato in alto a destra la nasconde di nuovo.
  4. **Rivela tutto** e **Nascondi tutto** agiscono sulla scena aperta. Con **Nascondi le altre** si coprono invece le battute degli altri personaggi, per provare le tue con la battuta di richiamo.
  
  Non modifica il copione: è solo una vista. Per uscire premi **Esci dallo studio**; aprire la modalità prova chiude lo studio.
- **Foglio**: dalla barra in basso regola **larghezza del testo**, **interlinea** e **carattere**; dalla barra strumenti dimensione (A− A A+) e **Zoom**. Il pulsante in basso a destra attiva lo **schermo intero**.

## 13. Smartphone

Sotto circa 1000 pixel di larghezza l'editor usa un layout semplificato:
- barra in basso con **Inizio**, **Struttura**, **Personaggi** e **Strumenti**: in *Strumenti* trovi anche **Esporta e stampa** (anteprima e PDF, `.fountain`, progetto `.json`, copia del testo);
- i campi di descrizione, scenografia, stato e personaggi in scena sono nel riquadro **Dettagli della scena**, chiuso di default per lasciare spazio alle battute: toccalo per aprirlo;
- la barra con annulla, ripristina e dimensione del testo sta sopra il foglio, senza coprirlo;
- il menu laterale si apre come un cassetto: in cima la ricerca, poi le schede **Struttura** e **Personaggi**, e in fondo gli strumenti (nuovo copione, versioni, cerca e sostituisci, esporta e stampa);
- le finestre salgono dal basso come pannelli;
- pulsanti *Battuta / Didascalia / Fuori scena* sempre a portata di pollice.

### Aggiungerlo come app

L'editor ha un'icona (il logo Clan Destino) e può stare sulla schermata del telefono o del computer come una vera app, a schermo intero:

- **Android / Chrome**: apri il menu del browser → *Installa app* (o *Aggiungi a schermata Home*). Su computer, in Chrome ed Edge, usa la voce **File → Installa come app** quando compare, o l'icona di installazione nella barra degli indirizzi.
- **iPhone e iPad / Safari**: tocca il pulsante *Condividi* → *Aggiungi a Home*.

> Funziona solo quando l'editor è aperto dall'indirizzo web (GitHub Pages), non dal file salvato sul computer. Per aprirla anche senza connessione serve il file `sw.js` nel repository (vedi la sezione «Senza connessione» più sotto).

## 14. Scorciatoie

| Tasti | Azione |
|---|---|
| `Ctrl/Cmd + S` | Salva subito |
| `Ctrl/Cmd + Invio` | Nuova battuta |
| `Ctrl/Cmd + Z` | Annulla |
| `Ctrl/Cmd + Maiusc + Z` / `Ctrl/Cmd + Y` | Ripristina |
| `Ctrl/Cmd + K` | Ricerca rapida |
| `Esc` | Chiude la finestra aperta |

### Uso da tastiera e accessibilità

- **Tab** e **Maiusc + Tab** spostano da un comando all'altro; il comando attivo ha sempre un **contorno bordeaux** ben visibile. Il primo `Tab` dopo l'apertura offre il collegamento **«Vai al copione»**.
- **Menu in alto**: `Invio` apre il menu, `↓` e `↑` scorrono le voci, `Esc` lo chiude e riporta il cursore sul pulsante.
- **Scene a sinistra**: spostati sul titolo di una scena e premi `Invio` per aprirla.
- **Finestre**: quando si aprono il cursore va al primo campo, `Tab` resta dentro la finestra, `Esc` la chiude e il cursore torna dove eri.
- I pulsanti con sola icona e i campi hanno un nome leggibile dai **lettori di schermo**; lo stato delle scene (bozza, da rivedere, definitiva) viene letto a voce, non solo indicato dal colore.
- Su **telefono e tablet** i pulsanti hanno un'area di tocco di almeno 44 pixel e i campi di testo sono abbastanza grandi da non far ingrandire la pagina.
- Se il dispositivo ha attivato «riduci movimento», le animazioni si spengono; con «contrasto alto» bordi e testi grigi diventano più scuri.

### Informazioni e licenza

*File → Informazioni e licenza* (sul telefono: *Strumenti*) e la riga in fondo alla pagina iniziale mostrano chi ha creato l'editor, la licenza (**CC BY-NC-SA 4.0**: uso non commerciale, nome e logo da mantenere, stessa licenza per le versioni modificate) e il link al codice. I copioni che scrivi restano tuoi.

### Senza connessione

- **Dal file scaricato**: apri `index.html` con un doppio clic. Funziona tutto, anche creare PDF e codici QR, senza internet.
- **Dal sito (GitHub Pages)**: se nel repository c'è anche `sw.js`, dopo la prima visita l'editor si apre anche senza rete. Con la rete trova sempre l'ultima versione.
- Quando perdi la connessione compare un breve avviso («Sei offline…»): il lavoro continua e si salva sul tuo dispositivo come sempre.
- Il collegamento a un file del computer e i backup funzionano normalmente.

## 15. Domande frequenti

**Ho svuotato la cache e il copione è sparito.**
Il salvataggio automatico vive nella memoria del browser. Se avevi collegato un file o salvato un `.json`, riaprilo con *File → Apri* / *Importa copione*. Per il futuro tieni sempre una copia su file.

**Non vedo «Collega un file sul mio computer».**
Questa funzione esiste solo su Chrome ed Edge da computer. Altrove usa *Salva progetto (.json)* e importalo quando serve.

**Sul telefono non vedo i tre pannelli.**
È voluto: lo schermo è stretto e l'editor usa il layout a cassetto. I tre pannelli compaiono da circa 1000 pixel di larghezza.

**Un copione aperto da .fountain ha perso le schede dei personaggi.**
Il formato Fountain non le contiene. Per copiare tutto usa il `.json`.

**Come passo un copione dal telefono al computer?**
Dal libro in libreria: *esporta → Progetto (.json)*, invialo a te stesso, poi sul computer *Importa copione* dalla Pagina iniziale.

**Il carattere del foglio sembra diverso.**
I caratteri principali sono incorporati nell'editor, quindi dovrebbero apparire sempre uguali. Puoi cambiare il carattere del foglio dalla barra in basso (Noto Serif, Playfair, Courier Prime, Inter). Nella *copia di lettura (HTML)* da condividere i caratteri vengono caricati da internet: senza connessione chi la apre vede caratteri di riserva.

**Il copione è molto lungo: l'editor rallenta?**
L'editor è pensato per copioni teatrali interi (decine di scene). Alcuni accorgimenti per tenerlo veloce:
- Dividi in **scene di lunghezza ragionevole**: il foglio mostra una scena alla volta, quindi una scena da molte centinaia di battute si ridisegna più lentamente di tante scene brevi.
- Con copioni molto grandi il numero di passi di **Annulla** si riduce da solo (fino a 8) per non riempire la memoria.
- Il salvataggio automatico usa lo spazio del browser; se questo non basta (copione molto grande, tante versioni o foto) i dati vanno in automatico in un archivio più capiente del browser, senza che tu debba fare nulla. Il backup della libreria resta comunque consigliato.

**Ho trovato un problema.**
Apri una *Issue* nel repository GitHub indicando browser, dispositivo e i passaggi per riprodurlo.
