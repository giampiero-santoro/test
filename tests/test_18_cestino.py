"""Cestino: eliminazione con Annulla, ripristino dal cestino (anche con foto), eliminazione definitiva."""
import asyncio
from helpers import check, reset_app_state, dismiss_storage_choice, confirm_dialog_accept

FOTO = "data:image/jpeg;base64," + "A" * 3000


async def elimina(page, nome):
    await page.fill("#search", nome)
    await page.locator("#recipe-list .card", has_text=nome).first.click()
    await page.locator("#view-overlay").wait_for(state="visible")
    await page.click("#view-edit-btn")
    await page.locator("#edit-overlay").wait_for(state="visible")
    await page.click("#delete-recipe-btn")
    await confirm_dialog_accept(page)
    await page.locator("#edit-overlay").wait_for(state="hidden", timeout=4000)


async def run(page):
    await reset_app_state(page)
    rec = [{"id": "c1", "name": "Torta Cestino", "title": "Torta Cestino", "servings": 2, "photo": FOTO,
            "ingredients": [{"name": "Farina", "qty": 1, "unit": "g"}], "steps": [{"text": "x"}]},
           {"id": "c2", "name": "Zuppa Cestino", "title": "Zuppa Cestino", "servings": 2,
            "ingredients": [{"name": "Acqua", "qty": 1, "unit": "g"}], "steps": [{"text": "x"}]}]
    await page.evaluate("r=>localStorage.setItem('mc_ricettario_v1',JSON.stringify(r))", rec)
    await page.reload(); await page.wait_for_timeout(1200); await dismiss_storage_choice(page)
    await page.click("#nav-recipes-btn")

    # 1) elimina + Annulla subito
    await elimina(page, "Zuppa Cestino")
    check(await page.locator("#undo-toast").is_visible(), "Compare il messaggio con Annulla")
    await page.click("#undo-toast-btn")
    await page.fill("#search", "")
    await page.wait_for_timeout(300)
    check(await page.locator("#recipe-list .card", has_text="Zuppa Cestino").count() == 1, "Annulla riporta la ricetta")

    # 2) elimina la ricetta con foto, poi ripristina dal cestino
    await elimina(page, "Torta Cestino")
    await page.wait_for_timeout(800)
    n = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_cestino_v1')).length")
    check(n == 1, f"La ricetta è nel cestino ({n})")
    await page.fill("#search", "")
    check(await page.locator("#recipe-list .card", has_text="Torta Cestino").count() == 0, "La ricetta non è più nell'elenco")
    # il cestino sopravvive alla ricarica, foto compresa
    await page.reload(); await page.wait_for_timeout(1500); await dismiss_storage_choice(page)
    await page.evaluate("document.getElementById('open-cestino-btn').click()")
    await page.locator("#cestino-overlay.active").wait_for(timeout=3000)
    check(await page.locator("#cestino-list .c-name", has_text="Torta Cestino").count() == 1, "Il cestino mostra la ricetta dopo la ricarica")
    await page.click("#cestino-list .c-restore")
    await page.wait_for_timeout(600)
    await page.click("#cestino-done")
    foto = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_v1')).find(r=>r.id==='c1')")
    check(foto is not None, "La ricetta è tornata tra le ricette")
    await page.reload(); await page.wait_for_timeout(1500); await dismiss_storage_choice(page)
    await page.click("#nav-recipes-btn")
    await page.locator("#recipe-list .card", has_text="Torta Cestino").first.click()
    await page.locator("#view-overlay").wait_for(state="visible")
    src = await page.locator("#view-photo").get_attribute("src")
    check(src == FOTO, "Dopo il ripristino la foto c'è ancora")
    await page.keyboard.press("Escape")

    # 3) elimina definitivamente dal cestino
    await elimina(page, "Torta Cestino")
    await page.evaluate("document.getElementById('open-cestino-btn').click()")
    await page.locator("#cestino-overlay.active").wait_for(timeout=3000)
    await page.click("#cestino-list .c-delete")
    await confirm_dialog_accept(page)
    check(await page.locator("#cestino-list li.empty").count() == 1, "Cestino vuoto dopo l'eliminazione definitiva")
