"""Importazione di un backup: «Annulla importazione» ripristina lo stato precedente."""
import asyncio, json
from helpers import check, reset_app_state, dismiss_storage_choice


def ric(i, nome):
    return {"id": i, "name": nome, "title": nome, "servings": 2, "ingredients": [{"name": "Farina", "qty": 1, "unit": "g"}], "steps": [{"text": "x"}]}


async def run(page):
    page.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
    await reset_app_state(page)
    await page.evaluate("r=>localStorage.setItem('mc_ricettario_v1',JSON.stringify(r))", [ric("i1", "Ricetta Uno Import")])
    await page.reload(); await page.wait_for_timeout(1000); await dismiss_storage_choice(page)
    backup = {"recipes": [ric("i2", "Ricetta Due Import"), ric("i3", "Ricetta Tre Import")]}
    await page.set_input_files("#import-file-input", {"name": "b.json", "mimeType": "application/json", "buffer": json.dumps(backup).encode()})
    await page.locator("#import-dest-ok").click()
    await page.locator("#undo-toast:not([hidden])").wait_for(timeout=5000)
    n = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_v1')).length")
    check(n == 3, f"Dopo l'importazione le ricette sono 3 ({n})")
    await page.click("#undo-toast-btn")
    await page.wait_for_timeout(500)
    ids = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_v1')).map(r=>r.id)")
    check(ids == ["i1"], f"Annulla riporta lo stato precedente: {ids}")
