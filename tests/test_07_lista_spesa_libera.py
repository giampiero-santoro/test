"""Lista della spesa indipendente: ingredienti a mano, ricette, unione con la settimana, annulla."""
import asyncio
from helpers import check, reset_app_state, aggiungi_pasto


async def righe(page):
    return await page.locator("#spesa-items li:not(.shopping-reparto-header):not(.shopping-empty)").evaluate_all(
        "els=>els.map(e=>[e.querySelector('.spesa-name').childNodes[0].textContent.trim(), e.querySelector('.amt').textContent.trim()])")


async def run(page):
    # il sito chiede con confirm() nativo se aggiungere gli ingredienti mancanti: accettiamo davvero
    page.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
    await reset_app_state(page)
    # ricetta di prova
    await page.click("#nav-recipes-btn")
    await page.click("#new-recipe-btn")
    await page.locator("#edit-overlay").wait_for(state="visible")
    await page.fill("#f-name", "Sugo Test Spesa")
    await page.fill("#f-servings", "2")
    await page.click("#add-ingredient")
    b = page.locator(".ingredient-block").last
    await b.locator(".ing-name").fill("Farina Test")
    await b.locator(".ing-qty").fill("200")
    await b.locator(".ing-unit").fill("g")
    await page.click("#save-recipe")
    await page.locator("#edit-overlay").wait_for(state="hidden", timeout=5000)

    # lista libera vuota, indipendente dalla pianificazione
    await page.click("#nav-shopping-btn")
    await page.locator("#spesa-view").wait_for(state="visible")
    check(len(await righe(page)) == 0, "La lista libera dovrebbe partire vuota")

    # ingrediente a mano
    await page.fill("#spesa-add-name", "Latte Test")
    await page.fill("#spesa-add-qty", "2")
    await page.fill("#spesa-add-unit", "l")
    await page.click("#spesa-add-form button[type=submit]")
    # stesso ingrediente di una ricetta: si somma (g + kg)
    await page.fill("#spesa-add-name", "Farina Test")
    await page.fill("#spesa-add-qty", "1")
    await page.fill("#spesa-add-unit", "kg")
    await page.click("#spesa-add-form button[type=submit]")
    check(len(await righe(page)) == 2, f"Attese 2 righe: {await righe(page)}")

    # ingredienti di una ricetta, per 4 porzioni (doppio): 400 g si sommano a 1 kg
    await page.click("#spesa-add-recipe-btn")
    await page.fill("#spesa-recipe-search", "Sugo Test")
    await page.locator("#spesa-recipe-list .recipe-picker-item").first.click()
    await page.fill("#spesa-recipe-servings", "4")
    await page.click("#spesa-recipe-add-btn")
    await page.click("#spesa-recipe-close")
    r = dict(await righe(page))
    check(r.get("Farina Test", "").startswith("1,4") or r.get("Farina Test", "").startswith("1.4"), f"Somma farina errata: {r}")

    # pianifico la ricetta nella settimana e unisco le due liste: farina +200 g (porzioni 4 di default -> 400 g)
    await page.click("#nav-planning-btn")
    await page.click("#plan-mode-week")
    await aggiungi_pasto(page, "Pranzo")
    await page.locator(".plan-add-btn").first.click()
    await page.fill("#recipe-picker-search", "Sugo Test")
    await page.locator("#recipe-picker-list .recipe-picker-item").first.click()
    await page.wait_for_timeout(300)
    # la lista libera non cambia con la pianificazione
    await page.click("#nav-shopping-btn")
    before = await righe(page)
    check(len(before) == 2, f"La pianificazione non deve modificare la lista libera: {before}")
    await page.click("#spesa-merge-btn")
    await page.click("#confirm-ok-btn")
    after = dict(await righe(page))
    check(after["Farina Test"] != dict(before)["Farina Test"], f"L'unione non ha sommato la farina: {before} -> {after}")
    check(await page.locator("#spesa-undo-btn").is_visible(), "Manca il pulsante Annulla unione")
    await page.click("#spesa-undo-btn")
    check(await righe(page) == before, "Annulla unione non ha ripristinato la lista")

    # spunta -> Dispensa
    await page.locator("#spesa-items li:not(.shopping-reparto-header) input[type=checkbox]").first.check()
    await page.click("#spesa-to-dispensa-btn")
    await page.click("#confirm-ok-btn")
    check(len(await righe(page)) == 1, "La voce spuntata doveva sparire dalla lista")
    await page.click("#nav-dispensa-btn")
    check(await page.locator("#dispensa-view").is_visible(), "Dispensa non visibile")

    # persistenza dopo ricarica
    await page.reload()
    await page.click("#nav-shopping-btn")
    check(len(await righe(page)) == 1, "La lista libera non è persistita dopo il ricaricamento")
