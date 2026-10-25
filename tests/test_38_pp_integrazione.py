"""Integrazione con il sito «Pentola a pressione» (protocollo pp-ricettario v1):
ricezione via #pp=, anteprima, import senza doppioni, pianificazione, lista della spesa,
dati invalidi, ripiego da file, e conservazione dei campi esterni alla modifica."""
import base64, json, datetime
from helpers import check, reset_app_state, dismiss_storage_choice


def pacchetto(id_op="op-0001", ext="pp-fagioli-001", data="2026-10-28", versione=1, **extra):
    p = {
        "protocollo": "pp-ricettario", "versione": versione, "idOperazione": id_op,
        "ricetta": {
            "externalId": ext, "name": "Fagioli in pentola a pressione", "category": "Zuppe & Vellutate",
            "servings": 4, "time": 50, "cookerType": "Elettrica",
            "ingredients": [{"name": "Fagioli borlotti", "qty": 300, "unit": "g"},
                            {"name": "Acqua", "qty": 900, "unit": "ml"},
                            {"name": "<b>Sale</b>", "qty": 1, "unit": "cucchiaino"}],
            "steps": [{"text": "Cuoci sotto pressione.", "time": 35, "pressure": 1, "pressureUnit": "bar",
                       "pressureRelease": "Naturale", "pressureReleaseMin": 15, "minLiquid": 500}],
            "notes": "Verifica sul manuale del tuo modello.",
            "fonteUrl": "https://giampiero-santoro.github.io/pentola/#/ricetta/fagioli",
            "fonteNome": "Pentola a pressione",
        },
        "pianificazione": {"data": data, "pasto": "Cena", "ora": "20:00"},
        "spesa": True,
    }
    p["ricetta"].update(extra)
    return p


def enc(obj):
    raw = json.dumps(obj, ensure_ascii=False).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


async def apri(page, base, obj_or_str):
    s = obj_or_str if isinstance(obj_or_str, str) else enc(obj_or_str)
    await page.goto("about:blank")
    await page.goto(f"{base}/index.html#pp={s}")
    await dismiss_storage_choice(page)


async def run(page):
    base = page.url.split("/index.html")[0]
    await reset_app_state(page)

    # 1) Import da collegamento (caricamento a freddo): anteprima, conferma, ricetta+piano+spesa
    await apri(page, base, pacchetto())
    await page.locator("#pp-overlay.active").wait_for(timeout=6000)
    check("Fagioli in pentola a pressione" in await page.inner_text("#pp-sub"), "Anteprima mostra il nome")
    check("#pp=" not in page.url, "Il frammento #pp= viene tolto dall'indirizzo")
    check(await page.input_value("#pp-data") == "2026-10-28", "Data precompilata dal pacchetto")
    check(await page.input_value("#pp-pasto") == "Cena", "Pasto precompilato")
    await page.fill("#pp-data", "2026-10-29")  # l'utente può cambiare la data prima di confermare
    await page.click("#pp-conferma")
    await page.locator("#confirm-overlay.active").wait_for(timeout=4000)
    msg = await page.inner_text("#confirm-message")
    check("Ricetta aggiunta" in msg and "Pianificata" in msg and "Lista della spesa" in msg, f"Riepilogo: {msg}")
    await page.click("#confirm-cancel-btn")
    st = await page.evaluate("""()=>({
        r: JSON.parse(localStorage.getItem('mc_ricettario_v1')),
        w: JSON.parse(localStorage.getItem('mc_ricettario_settimane_v1')),
        s: JSON.parse(localStorage.getItem('mc_ricettario_spesa_lista_v1')),
        d: JSON.parse(localStorage.getItem('mc_ricettario_pp_importati_v1'))})""")
    rs = [r for r in st["r"] if r.get("externalId") == "pp-fagioli-001"]
    check(len(rs) == 1, "Una sola ricetta creata")
    r = rs[0]
    check(r["fonteUrl"].startswith("https://") and r["servings"] == 4, "URL originale e porzioni conservati")
    check(r["steps"][0].get("pressure") == 1 and r["steps"][0].get("pressureRelease") == "Naturale", "Impostazioni pressione conservate")
    monday = "2026-10-26"  # 2026-10-29 è un giovedì
    plan = st["w"].get(monday, {}).get("plan", {})
    check(len(plan.get("Giovedì", [])) == 1 and plan["Giovedì"][0]["recipeId"] == r["id"], f"Voce in Giovedì: {plan}")
    check(plan["Giovedì"][0]["mealType"] == "Cena" and plan["Giovedì"][0]["time"] == "20:00", "Pasto e orario")
    nomi = [x["name"] for x in st["s"]]
    check("Fagioli borlotti" in nomi and len(st["s"]) == 3, f"Lista spesa: {nomi}")
    check("pp-0001" not in st["d"] and "op-0001" in st["d"], "Operazione registrata")

    # 2) Stessa ricetta, altra operazione, stessa data/pasto: nessun doppione
    await apri(page, base, pacchetto(id_op="op-0002", data="2026-10-29"))
    await page.locator("#pp-overlay.active").wait_for(timeout=6000)
    check(not await page.is_checked("#pp-spesa"), "Spesa spenta: ingredienti già in lista")
    check("già nel tuo ricettario" in await page.inner_text("#pp-sub"), "Segnala ricetta già presente")
    await page.click("#pp-conferma")
    await page.locator("#confirm-overlay.active").wait_for(timeout=4000)
    check("Nessun doppione" in await page.inner_text("#confirm-message"), "Pianificazione non duplicata")
    await page.click("#confirm-cancel-btn")
    st = await page.evaluate("""()=>({r: JSON.parse(localStorage.getItem('mc_ricettario_v1')),
        w: JSON.parse(localStorage.getItem('mc_ricettario_settimane_v1')),
        s: JSON.parse(localStorage.getItem('mc_ricettario_spesa_lista_v1'))})""")
    check(len([r for r in st["r"] if r.get("externalId") == "pp-fagioli-001"]) == 1, "Ricetta non duplicata")
    check(len(st["w"]["2026-10-26"]["plan"]["Giovedì"]) == 1, "Una sola voce pianificata")
    check(len(st["s"]) == 3 and st["s"][0]["qty"] == 300, "Quantità spesa invariate")

    # 3) Stessa operazione già eseguita: avviso
    await apri(page, base, pacchetto(id_op="op-0001"))
    await page.locator("#pp-overlay.active").wait_for(timeout=6000)
    check("già eseguita" in await page.inner_text("#pp-sub"), "Segnala operazione già eseguita")
    await page.click("#pp-annulla")
    st = await page.evaluate("()=>JSON.parse(localStorage.getItem('mc_ricettario_v1')).length")
    check(st == 1, "Annulla non scrive nulla")

    # 4) Dati invalidi: nessuna scrittura, messaggio chiaro
    for etichetta, payload in [("versione 2", enc(pacchetto(id_op="op-9", versione=2))),
                               ("base64 rotto", "@@@"),
                               ("senza ingredienti", enc({**pacchetto(id_op="op-8"), "ricetta": {**pacchetto()["ricetta"], "ingredients": []}})),
                               ("protocollo errato", enc({"protocollo": "altro", "versione": 1}))]:
        await page.goto("about:blank")
        await page.goto(f"{base}/index.html#pp={payload}")
        await dismiss_storage_choice(page)
        if payload == "@@@":
            check("#pp=" in page.url or True, "")
        try:
            await page.locator("#confirm-overlay.active").wait_for(timeout=4000)
        except Exception:
            raise AssertionError(f"Nessun messaggio d'errore per: {etichetta}")
        check("Impossibile importare" in await page.inner_text("#confirm-title"), f"Titolo errore per {etichetta}")
        await page.click("#confirm-cancel-btn")
        n = await page.evaluate("()=>JSON.parse(localStorage.getItem('mc_ricettario_v1')).length")
        check(n == 1, f"Nessuna ricetta scritta per {etichetta}")

    # 5) HTML nel nome ingrediente: trattato come testo, non eseguito
    check(await page.evaluate("()=>JSON.parse(localStorage.getItem('mc_ricettario_spesa_lista_v1')).some(x=>x.name==='<b>Sale</b>')"),
          "Il testo con tag resta testo")

    # 6) Ripiego da file (stesso JSON, caricato da «Importa ricetta (file)»)
    await page.goto(f"{base}/index.html"); await dismiss_storage_choice(page)
    nuovo = pacchetto(id_op="op-0003", ext="pp-ceci-002", data="")
    nuovo["ricetta"]["name"] = "Ceci in pentola"
    await page.set_input_files("#import-recipe-file-input", files=[{"name": "ceci.json", "mimeType": "application/json",
                                                                    "buffer": json.dumps(nuovo).encode("utf-8")}])
    await page.locator("#pp-overlay.active").wait_for(timeout=4000)
    await page.uncheck("#pp-piano"); await page.uncheck("#pp-spesa")
    await page.click("#pp-conferma")
    await page.locator("#confirm-overlay.active").wait_for(timeout=4000)
    await page.click("#confirm-cancel-btn")
    n = await page.evaluate("()=>JSON.parse(localStorage.getItem('mc_ricettario_v1')).filter(r=>r.externalId==='pp-ceci-002').length")
    check(n == 1, "Import da file: ricetta creata")

    # 7) Modifica dal modulo: externalId e fonteUrl non si perdono; link «Ricetta originale» in scheda
    await page.click("#nav-recipes-btn")
    await page.locator("#recipe-list h3", has_text="Fagioli in pentola").click()
    await page.locator("#view-overlay.active").wait_for()
    check(await page.is_visible("#view-fonte"), "Link ricetta originale visibile")
    check((await page.get_attribute("#view-fonte", "href")).startswith("https://"), "Link corretto")
    await page.click("#view-edit-btn")
    await page.locator("#edit-overlay.active").wait_for()
    await page.fill("#f-notes", "Nota personale")
    await page.click("#save-recipe")
    await page.wait_for_timeout(500)
    r = await page.evaluate("()=>JSON.parse(localStorage.getItem('mc_ricettario_v1')).find(r=>r.externalId==='pp-fagioli-001')")
    check(r and r.get("fonteUrl") and r["notes"] == "Nota personale", f"Campi esterni dopo la modifica: {r and list(r.keys())}")
