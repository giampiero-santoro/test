"""Ricerca prodotti su Open Food Facts: nuovo motore (Search-a-licious), ripiego sulla vecchia ricerca,
messaggi chiari in caso di errore. Le risposte del servizio sono simulate."""
import json
from helpers import check, reset_app_state, dismiss_storage_choice

HIT = {"code": "5000159407236", "product_name": "Mars", "brands": ["Mars"], "quantity": "51 g",
       "categories_tags": ["en:snacks", "en:chocolate-candies"],
       "nutriments": {"energy-kcal_100g": 449, "proteins_100g": 4.1, "fat_100g": 17, "carbohydrates_100g": 70, "sugars_100g": 59, "salt_100g": 0.4}}


async def apri_form(page):
    await page.click("#nav-dispensa-btn")
    await page.click("#new-dispensa-item-btn")
    await page.locator("#dispensa-edit-overlay").wait_for(state="visible", timeout=5000)


async def cerca(page, testo):
    await page.fill("#off-text-search", "")
    await page.fill("#off-text-search", testo)
    await page.wait_for_timeout(1200)


async def run(page):
    await reset_app_state(page)
    await dismiss_storage_choice(page)
    visti = []

    async def sal_ok(route):
        visti.append("sal"); await route.fulfill(status=200, content_type="application/json", headers={"access-control-allow-origin": "*"}, body=json.dumps({"hits": [HIT], "count": 1}))
    async def classica_ok(route):
        visti.append("classica"); await route.fulfill(status=200, content_type="application/json", headers={"access-control-allow-origin": "*"}, body=json.dumps({"products": [HIT]}))
    async def giu(route):
        visti.append("giu"); await route.fulfill(status=503, content_type="text/html", headers={"access-control-allow-origin": "*"}, body="manutenzione")

    # 1) il nuovo motore risponde
    await page.route("https://search.openfoodfacts.org/search*", sal_ok)
    await page.route("https://world.openfoodfacts.org/cgi/search.pl*", giu)
    await apri_form(page)
    await cerca(page, "mars")
    voci = await page.locator(".ricerca-ac-item").all_inner_texts()
    check(len(voci) == 1 and "Mars" in voci[0], f"Risultato dal nuovo motore: {voci}")
    check(visti == ["sal"], f"Una sola richiesta, al nuovo motore: {visti}")
    await page.locator(".ricerca-ac-item").first.dispatch_event("mousedown")
    await page.wait_for_timeout(500)
    nome = await page.input_value("#d-name")
    check(nome == "Mars", f"Prodotto applicato al modulo: {nome!r}")
    kcal = await page.evaluate("()=>Array.from(document.querySelectorAll('#dispensa-edit-overlay input')).some(i=>i.value==='449')")
    check(kcal, "Valori nutrizionali compilati")

    # 2) stessa ricerca ripetuta: nessuna nuova richiesta (cache)
    n = len(visti)
    await cerca(page, "mars")
    check(len(visti) == n, f"Ricerca ripetuta dalla memoria: {visti}")

    # 3) nuovo motore giù -> ripiego sulla vecchia ricerca
    await page.unroute("https://search.openfoodfacts.org/search*"); await page.unroute("https://world.openfoodfacts.org/cgi/search.pl*")
    await page.route("https://search.openfoodfacts.org/search*", giu)
    await page.route("https://world.openfoodfacts.org/cgi/search.pl*", classica_ok)
    visti.clear()
    await cerca(page, "snickers")
    voci = await page.locator(".ricerca-ac-item").all_inner_texts()
    check(len(voci) == 1 and visti == ["giu", "classica"], f"Ripiego sulla ricerca classica: {voci} {visti}")

    # 4) tutto giù -> messaggio chiaro
    await page.unroute("https://world.openfoodfacts.org/cgi/search.pl*")
    await page.route("https://world.openfoodfacts.org/cgi/search.pl*", giu)
    await cerca(page, "twix")
    msg = await page.inner_text("#off-status")
    check("non risponde" in msg and "verifica la connessione" not in msg, f"Messaggio di errore chiaro: {msg!r}")

    # 5) troppe richieste (429)
    async def troppe(route):
        await route.fulfill(status=429, content_type="text/html", headers={"access-control-allow-origin": "*"}, body="slow down")
    await page.unroute("https://search.openfoodfacts.org/search*")
    await page.route("https://search.openfoodfacts.org/search*", troppe)
    await cerca(page, "bounty")
    msg = await page.inner_text("#off-status")
    check("Troppe ricerche" in msg, f"Messaggio per troppe richieste: {msg!r}")
