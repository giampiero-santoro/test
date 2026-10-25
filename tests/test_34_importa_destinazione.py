"""Importazione di un backup in un ricettario scelto o nuovo; conferma prima di eliminare un ricettario."""
import asyncio, json
from helpers import check, reset_app_state, dismiss_storage_choice


def ric(i, nome, rb=None):
    d = {"id": i, "title": nome, "category": "Primi", "servings": 2, "ingredients": [], "steps": [], "tags": []}
    if rb: d["ricettarioId"] = rb
    return d


async def importa(page, backup):
    await page.set_input_files("#import-file-input", {"name": "nonna-maria.json", "mimeType": "application/json", "buffer": json.dumps(backup).encode()})
    await page.locator("#import-dest-overlay.active").wait_for(timeout=5000)


async def run(page):
    page.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
    await reset_app_state(page)
    await dismiss_storage_choice(page)
    backup = {"recipes": [ric("a1", "Ricetta A"), ric("a2", "Ricetta B")]}
    # annulla: non cambia nulla
    await importa(page, backup)
    await page.click("#import-dest-cancel")
    n = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_v1')||'[]').length")
    check(n == 0, "Annullando la scelta non si importa nulla")
    # nuovo ricettario
    await importa(page, backup)
    check(await page.input_value("#import-dest-new-name") == "nonna maria", "Nome proposto dal file")
    await page.check('input[name="import-dest"][value="nuovo"]')
    await page.fill("#import-dest-new-name", "Cucina di Nonna")
    await page.click("#import-dest-ok")
    await page.wait_for_timeout(500)
    info = await page.evaluate("""() => { const rb = JSON.parse(localStorage.getItem('mc_ricettario_libri_v1')); const r = JSON.parse(localStorage.getItem('mc_ricettario_v1'));
      const nuovo = rb.find(x => x.name === 'Cucina di Nonna'); return {ok: !!nuovo, tutte: nuovo && r.every(x => x.ricettarioId === nuovo.id), n: r.length}; }""")
    check(info["ok"] and info["tutte"] and info["n"] == 2, f"Ricette nel nuovo ricettario: {info}")
    # ricettario esistente (quello di partenza)
    backup2 = {"recipes": [ric("b1", "Ricetta C")]}
    await importa(page, backup2)
    await page.check('input[name="import-dest"][value="esistente"]')
    await page.select_option("#import-dest-existing", "default")
    await page.click("#import-dest-ok")
    await page.wait_for_timeout(500)
    rid = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_v1')).find(x=>x.id==='b1').ricettarioId")
    check(rid == "default", f"Ricetta nel ricettario scelto: {rid}")
    # conferma prima dell'eliminazione
    page.remove_listener("dialog", page.listeners("dialog")[0]) if False else None
    await page.evaluate("document.getElementById('undo-toast') && (document.getElementById('undo-toast').hidden = true)")
    await page.click("#manage-ricettari-btn") if await page.locator("#manage-ricettari-btn").is_visible() else await page.evaluate("document.getElementById('manage-ricettari-btn').click()")
    await page.locator("#ricettari-overlay.active").wait_for(timeout=5000)
    await page.fill("#ricettario-add-name", "Vuoto")
    await page.click("#ricettario-add-confirm-btn")
    riga = page.locator(".ricettario-row", has=page.locator('input[value="Vuoto"]'))
    await riga.locator(".ricettario-row-delete-btn").click()
    await page.locator("#confirm-overlay.active").wait_for(timeout=3000)
    await page.click("#confirm-cancel-btn")
    check(await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_libri_v1')).some(x=>x.name==='Vuoto')"), "Annullando la conferma il ricettario resta")
    await riga.locator(".ricettario-row-delete-btn").click()
    await page.locator("#confirm-overlay.active").wait_for(timeout=3000)
    await page.click("#confirm-ok-btn")
    await page.wait_for_timeout(300)
    check(not await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_libri_v1')).some(x=>x.name==='Vuoto')"), "Confermando il ricettario viene eliminato")
    # con ricette: elimina tutto chiede conferma
    riga = page.locator(".ricettario-row", has=page.locator('input[value="Cucina di Nonna"]'))
    await riga.locator(".ricettario-row-delete-btn").click()
    await riga.locator(".ricettario-delete-all-btn").click()
    await page.locator("#confirm-overlay.active").wait_for(timeout=3000)
    await page.click("#confirm-cancel-btn")
    check(await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_libri_v1')).some(x=>x.name==='Cucina di Nonna')"), "«Elimina ricette e volume» chiede conferma")
