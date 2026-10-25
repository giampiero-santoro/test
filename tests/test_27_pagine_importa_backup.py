"""Importa ricette e Backup ed esportazione: pagine dedicate al posto del menu a tendina."""
import asyncio
from helpers import check, reset_app_state, dismiss_storage_choice


async def run(page):
    await reset_app_state(page)
    rec = [{"id": "i1", "name": "Torta Import", "title": "Torta Import", "servings": 4, "category": "Dolci",
            "ingredients": [{"name": "Farina", "qty": 250, "unit": "g"}], "steps": [{"text": "x"}]}]
    await page.evaluate("r=>localStorage.setItem('mc_ricettario_v1',JSON.stringify(r))", rec)
    await page.reload(); await page.wait_for_timeout(900); await dismiss_storage_choice(page)

    # Importa ricette: pagina con le quattro modalita'
    await page.click("#nav-import-btn")
    await page.locator("#import-view").wait_for(state="visible")
    check(await page.locator("#import-view .tool-card").count() == 4, "Quattro schede nella pagina Importa ricette")
    for sel in ("#paste-import-btn", "#import-recipe-file-btn", "#import-csv-btn", "#import-btn"):
        check(await page.locator(sel).is_visible(), f"Pulsante visibile: {sel}")
    check(await page.locator("#csv-import-scope option").count() >= 1, "Il ricettario di destinazione del CSV e' scelto da un menu")
    check(await page.locator("#recipes-view").is_hidden(), "La lista ricette non e' mostrata insieme")
    check("active" in (await page.locator("#nav-import-btn").get_attribute("class")), "Voce di menu evidenziata")
    await page.click("#paste-import-btn")
    await page.locator("#paste-import-overlay.active").wait_for(timeout=3000)
    await page.keyboard.press("Escape"); await page.wait_for_timeout(300)

    # Backup ed esportazione
    await page.click("#nav-backup-btn")
    await page.locator("#backup-view").wait_for(state="visible")
    check(await page.locator("#backup-view .tool-card").count() == 4, "Quattro schede nella pagina Backup")
    for sel in ("#export-btn", "#backup-reminder-toggle-btn", "#file-storage-link-btn", "#export-csv-btn", "#export-all-pdf-btn", "#open-trasferimento-btn", "#csv-ricettario-scope"):
        check(await page.locator(sel).is_visible(), f"Visibile nella pagina Backup: {sel}")
    check((await page.locator("#backup-reminder-text").inner_text()).strip() != "", "Compare lo stato dell'ultimo backup")
    async with page.expect_download(timeout=8000) as dl:
        await page.click("#export-btn")
    check((await dl.value).suggested_filename.endswith(".json"), "L'esportazione del backup scarica un file .json")
    async with page.expect_download(timeout=8000) as dl2:
        await page.click("#export-csv-btn")
    check((await dl2.value).suggested_filename.endswith(".csv"), "L'esportazione CSV scarica un file .csv")
    await page.click("#open-trasferimento-btn")
    await page.locator("#trasferimento-overlay.active, #transfer-overlay.active, .overlay.active").first.wait_for(timeout=3000)
    await page.keyboard.press("Escape"); await page.wait_for_timeout(300)
    await page.click("#backup-goto-import")
    await page.locator("#import-view").wait_for(state="visible")

    # Il menu a tendina resta solo per le azioni sulle ricette e rimanda alle pagine
    await page.click("#nav-recipes-btn")
    await page.click("#more-menu-btn")
    check(await page.locator("#more-menu-dropdown #export-btn").count() == 0, "Il menu a tendina non contiene piu' il backup")
    await page.click("#more-goto-backup")
    await page.locator("#backup-view").wait_for(state="visible")
