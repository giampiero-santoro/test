"""Settimana a matrice (giorni in colonna, pasti in riga allineati) e menu laterale nascondibile."""
from helpers import check, reset_app_state, dismiss_storage_choice, aggiungi_pasto

FOTO = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="


async def run(page):
    await reset_app_state(page)
    rec = [{"id": "p1", "name": "Pasta Matrice", "title": "Pasta Matrice", "servings": 2, "category": "Primi", "time": 25,
            "photo": FOTO, "ingredients": [{"name": "Pasta", "qty": 200, "unit": "g"}], "steps": [{"text": "x"}]}]
    await page.evaluate("r=>localStorage.setItem('mc_ricettario_v1',JSON.stringify(r))", rec)
    await page.reload(); await page.wait_for_timeout(900); await dismiss_storage_choice(page)
    await page.evaluate("()=>{window.confirm=()=>false}")
    await page.click("#nav-planning-btn")
    await page.click("#plan-mode-week")
    await page.locator(".plan-matrix").wait_for(state="visible")

    # Lunedì: Pranzo e Cena; Martedì: solo Colazione
    await aggiungi_pasto(page, "Cena", 0)
    await aggiungi_pasto(page, "Pranzo", 0)
    await aggiungi_pasto(page, "Colazione", 1)
    labels = [x.strip().capitalize() for x in await page.locator(".plan-row-label").all_inner_texts()]
    check(labels == ["Colazione", "Pranzo", "Cena"], f"Righe della settimana in ordine di orario: {labels}")

    # allineamento: la Colazione di martedì sta alla stessa altezza della riga «Colazione»
    lab = await page.locator(".plan-row-label").nth(0).bounding_box()
    mar = await page.locator(".plan-week-row").nth(1).locator(".plan-meal-block").first.bounding_box()
    check(abs((mar["y"] + mar["height"] / 2) - (lab["y"] + lab["height"] / 2)) < 6, "La casella di martedì è allineata alla sua riga")
    vuote = await page.locator(".plan-week-row").nth(1).locator(".plan-slot-empty").count()
    check(vuote == 2, f"Martedì ha 2 caselle vuote (Pranzo, Cena): {vuote}")

    # etichetta in verticale
    w = await page.locator(".plan-row-label").first.bounding_box()
    check(w["height"] > w["width"] * 1.2, "L'etichetta del pasto è verticale")

    # toccando una casella vuota si crea il pasto con il suo orario
    await page.locator(".plan-week-row").nth(1).locator(".plan-slot-empty").first.click()
    await page.wait_for_timeout(300)
    names = await page.locator(".plan-week-row").nth(1).locator(".plan-slot-name").all_inner_texts()
    times = await page.locator(".plan-week-row").nth(1).locator(".plan-slot-time").evaluate_all("els=>els.map(e=>e.value)")
    check(names == ["Colazione", "Pranzo"] and times[1] == "13:00", f"Casella vuota → pasto creato: {names} {times}")

    # scheda con foto, tempo e kcal/tempo
    await page.locator(".plan-week-row").first.locator(".plan-meal-block", has=page.locator(".plan-slot-name", has_text="Pranzo")).locator(".plan-add-btn").click()
    await page.fill("#recipe-picker-search", "Pasta Matrice")
    await page.locator(".recipe-picker-item", has_text="Pasta Matrice").first.click()
    await page.wait_for_timeout(400)
    img = await page.locator(".plan-week-row").first.locator(".plan-entry-thumb img").count()
    meta = await page.locator(".plan-week-row").first.locator(".plan-entry-meta").inner_text()
    check(img == 1 and "25 min" in meta, f"Scheda con foto e tempo: {img} / {meta!r}")

    # menu laterale nascondibile
    sb = await page.locator("#app-sidebar").is_visible()
    check(sb, "Il menu è visibile all'inizio")
    wprima = (await page.locator(".plan-matrix").bounding_box())["width"]
    await page.click("#sidebar-toggle-btn")
    await page.wait_for_timeout(300)
    check(not await page.locator("#app-sidebar").is_visible(), "Il menu si nasconde")
    wdopo = (await page.locator(".plan-matrix").bounding_box())["width"]
    check(wdopo > wprima + 150, f"La settimana usa più spazio: {wprima} → {wdopo}")
    await page.reload(); await page.wait_for_timeout(900)
    check(not await page.locator("#app-sidebar").is_visible(), "La scelta resta dopo il ricaricamento")
    lab2 = await page.locator("#sidebar-toggle-btn").get_attribute("aria-label")
    check(lab2 == "Mostra il menu", f"Etichetta del pulsante: {lab2}")
    await page.click("#sidebar-toggle-btn")
    await page.wait_for_timeout(300)
    check(await page.locator("#app-sidebar").is_visible(), "Il menu si riapre")
