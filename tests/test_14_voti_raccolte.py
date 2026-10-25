"""Voto a stelle (con filtro e ordinamento) e raccolte di ricette."""
from helpers import check, reset_app_state, dismiss_storage_choice


async def run(page):
    await reset_app_state(page)
    rec = [{"id": f"v{i}", "name": f"Ricetta Voto {n}", "title": f"Ricetta Voto {n}", "servings": 2,
            "ingredients": [{"name": "Farina", "qty": 1, "unit": "g"}], "steps": [{"text": "x"}]} for i, n in enumerate("ABC")]
    await page.evaluate("r=>localStorage.setItem('mc_ricettario_v1',JSON.stringify(r))", rec)
    await page.reload(); await page.wait_for_timeout(800); await dismiss_storage_choice(page)
    await page.click("#nav-recipes-btn")
    # voto a B (5 stelle) e C (3 stelle)
    for nome, stelle in (("Ricetta Voto B", 5), ("Ricetta Voto C", 3)):
        await page.locator("#recipe-list .card", has_text=nome).first.click()
        await page.locator("#view-overlay").wait_for(state="visible")
        await page.click(f"#view-rating button[data-n='{stelle}']")
        check(await page.locator("#view-rating button.on").count() == stelle, f"{stelle} stelle accese")
        if nome.endswith("B"):
            # raccolta
            await page.click("#view-raccolte-btn")
            await page.fill("#raccolte-new-name", "Cene Test")
            await page.click("#raccolte-new-form button[type=submit]")
            check(await page.locator("#raccolte-list input:checked").count() == 1, "Ricetta inserita nella nuova raccolta")
            await page.click("#raccolte-done")
            check("Cene Test" in await page.locator("#view-raccolte").inner_text(), "La raccolta compare nella scheda")
        await page.keyboard.press("Escape")
        await page.locator("#view-overlay").wait_for(state="hidden")
    check("★ 5" in await page.locator("#recipe-list .card", has_text="Ricetta Voto B").inner_text(), "Il voto compare sulla card")
    # ordinamento per voto
    await page.select_option("#sort-select", "rating")
    primo = await page.locator("#recipe-list .card h3").first.inner_text()
    check("Voto B" in primo, f"Ordinando per voto la prima è B (trovata: {primo})")
    # filtro voto >= 4
    await page.click("#filters-open-btn")
    await page.select_option("#rating-filter", "4")
    check(await page.locator("#recipe-list .card").count() == 1, "Filtro '4 o più': una sola ricetta")
    check((await page.locator("#filters-badge").inner_text()) == "1", "Il filtro è contato nel badge")
    await page.click("#filters-reset-btn")
    check(await page.locator("#recipe-list .card").count() == 3, "Azzera riporta tutte le ricette")
    # filtro raccolta
    await page.select_option("#raccolta-filter", label="Cene Test")
    check(await page.locator("#recipe-list .card").count() == 1, "Filtro raccolta: una ricetta")
    # le raccolte sono nei dati salvati
    ok = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_raccolte_v1')).length")
    check(ok == 1, "La raccolta è salvata")
