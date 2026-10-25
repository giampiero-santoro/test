# Protocollo pp-ricettario v1

Come il sito «Pentola a pressione» consegna una ricetta a *Il Mio Ricettario*. Nessun server: i dati viaggiano nell'indirizzo (frammento `#`, mai inviato in rete) oppure in un file.

## Trasporto
1. **Collegamento (preferito)**: `https://giampiero-santoro.github.io/Il-Mio-Ricettario/#pp=<base64url(JSON UTF-8)>`. Il ricettario legge il frammento all'avvio e al cambio di indirizzo, **lo toglie subito dall'URL** (un ricaricamento non riapre l'anteprima) e mostra un'anteprima. Limite: 90.000 caratteri.
2. **File (ripiego)**: lo stesso JSON salvato come `.json` e caricato da «Importa ricetta (file)». Serve se il collegamento è troppo lungo o se il ricettario è installato come app separata.

Perché non lo storage condiviso: i due siti hanno lo stesso origin, quindi lo stesso `localStorage`, ma il ricettario tiene i dati in memoria e li riscrive a ogni salvataggio: una scrittura esterna andrebbe persa o sovrascritta. Per questo il passaggio avviene solo tramite importazione controllata.

## Pacchetto
```json
{
  "protocollo": "pp-ricettario",
  "versione": 1,
  "idOperazione": "op-2026-10-25-001",
  "ricetta": {
    "externalId": "pp-fagioli-001",
    "name": "Fagioli in pentola a pressione",
    "category": "Zuppe & Vellutate",
    "servings": 4, "time": 50, "cookerType": "Elettrica",
    "ingredients": [{ "name": "Fagioli borlotti", "qty": 300, "unit": "g" }],
    "steps": [{ "text": "…", "time": 35, "pressure": 1, "pressureUnit": "bar",
                "pressureRelease": "Naturale", "pressureReleaseMin": 15, "minLiquid": 500 }],
    "notes": "…", "tags": ["Vegetariano"],
    "fonteUrl": "https://…", "fonteNome": "Pentola a pressione"
  },
  "pianificazione": { "data": "2026-10-29", "pasto": "Cena", "ora": "20:00" },
  "spesa": true
}
```
- `idOperazione` (3–80 caratteri `A-Za-z0-9_.:-`) identifica **questa consegna**; `externalId` identifica **la ricetta** e resta stabile nel tempo.
- `category`: una tra Primi, Secondi, Zuppe & Vellutate, Impasti & Pane, Salse & Sughi, Dolci, Infusi & Tisane, Altro (altrimenti «Altro»).
- `pressureUnit`: `bar`, `psi`, `kpa`. `pressureRelease`: `Naturale`, `Rapido`, `Misto`. `cookerType`: `Elettrica`, `A fornello`.
- `pianificazione` è solo un suggerimento: data, pasto e orario si possono cambiare nell'anteprima.

## Comportamento del ricettario
- **Validazione**: `protocollo` e `versione` devono coincidere; ricetta con nome e almeno un ingrediente; campi fuori elenco scartati; numeri limitati a intervalli ragionevoli; `fonteUrl` solo http/https; ogni testo è mostrato come testo.
- **Errori**: messaggio chiaro, nessuna scrittura.
- **Conferma**: nulla viene salvato prima del tasto «Conferma»; al termine un riepilogo dice cosa è stato fatto.
- **Duplicati**: ricetta già presente con lo stesso `externalId` → riusata, non ricreata (non viene sovrascritta); stessa ricetta nello stesso giorno e pasto → nessuna seconda voce; lista della spesa → casella spenta se gli ingredienti di quella ricetta ci sono già o se l'`idOperazione` l'aveva già fatto; altrimenti le quantità si sommano con le regole già esistenti (g/kg, ml/l).
- **Compatibilità**: i nuovi campi (`externalId`, `fonteUrl`, `fonteNome`) sono facoltativi, viaggiano nei backup JSON esistenti e i backup vecchi si importano come prima. Registro delle operazioni eseguite: chiave `mc_ricettario_pp_importati_v1` (ultime 200, non incluso nel backup).
- **Limite noto**: se il pianificatore del ricettario non ha il pasto indicato, viene comunque usato come testo libero.
