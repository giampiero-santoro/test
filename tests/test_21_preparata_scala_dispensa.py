"""«Ho preparato questa oggi»: anteprima, scalo dalla Dispensa, Annulla; «Solo segna» non tocca la Dispensa."""
import asyncio
from helpers import check, reset_app_state, dismiss_storage_choice


async def apri(page):
    await page.click("#nav-recipes-btn")
    await page.fill("#search", "Pane Scala")
    await page.locator("#recipe-list .card", has_text="Pane Scala").first.click()
    await page.locator("#view-overlay").wait_for(state="visible")


async def run(page):
    page.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
    await reset_app_state(page)
    rec = [{"id": "s1", "name": "Pane Scala", "title": "Pane Scala", "servings": 2,
            "ingredients": [{"name": "Farina Scala", "qty": 500, "unit": "g"}, {"name": "Lievito Raro", "qty": 5, "unit": "g"}],
            "steps": [{"text": "Impasta."}]}]
    disp = [{"id": "d1", "name": "Farina Scala", "qty": "2", "unit": "kg", "category": "Dispensa"}]
    await page.evaluate("([r,d])=>{localStorage.setItem('mc_ricettario_v1',JSON.stringify(r));localStorage.setItem('mc_ricettario_dispensa_prodotti_v1',JSON.stringify(d))}", [rec, disp])
    await page.reload(); await page.wait_for_timeout(1000); await dismiss_storage_choice(page)

    await apri(page)
    await page.click("#mark-made-btn")
    await page.locator("#made-overlay.active").wait_for(timeout=3000)
    txt = await page.locator("#made-list").inner_text()
    check("Farina Scala" in txt and "Lievito" not in txt, f"Anteprima solo con i prodotti riconosciuti: {txt!r}")
    # Solo segna: Dispensa invariata
    await page.click("#made-solo-btn")
    q = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_dispensa_prodotti_v1'))[0].qty")
    check(str(q) == "2", f"«Solo segna» non tocca la Dispensa ({q})")
    # Segna e scala: la ricetta è per 2 porzioni, nella scheda ne mostra 2 -> 500 g = 0,5 kg
    await page.click("#mark-made-btn")
    await page.click("#made-scala-btn")
    await page.wait_for_timeout(300)
    q = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_dispensa_prodotti_v1'))[0].qty")
    check(float(q) == 1.5, f"Dispensa scalata da 2 a 1,5 kg ({q})")
    times = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_v1'))[0].timesMade")
    check(times == 2, f"La ricetta risulta preparata 2 volte ({times})")
    # Annulla
    await page.click("#undo-toast-btn")
    await page.wait_for_timeout(300)
    q = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_dispensa_prodotti_v1'))[0].qty")
    times = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_v1'))[0].timesMade")
    check(float(q) == 2 and times == 1, f"Annulla ripristina Dispensa e conteggio ({q}, {times})")
