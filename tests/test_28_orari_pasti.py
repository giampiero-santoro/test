"""Orari dei pasti: ogni pasto ha un orario, la giornata si ordina di conseguenza; settimana a colonne con pasti in verticale."""
from helpers import check, reset_app_state, dismiss_storage_choice, aggiungi_pasto


async def run(page):
    await reset_app_state(page)
    rec = [{"id": "p1", "name": "Pasta Orari", "title": "Pasta Orari", "servings": 2, "category": "Primi",
            "ingredients": [{"name": "Pasta", "qty": 200, "unit": "g"}], "steps": [{"text": "x"}]}]
    await page.evaluate("r=>localStorage.setItem('mc_ricettario_v1',JSON.stringify(r))", rec)
    await page.reload(); await page.wait_for_timeout(900); await dismiss_storage_choice(page)
    await page.click("#nav-planning-btn")
    await page.click("#plan-mode-week")
    await page.locator(".plan-grid").wait_for(state="visible")

    await aggiungi_pasto(page, "Cena", 0)
    await aggiungi_pasto(page, "Colazione", 0)
    row = page.locator(".plan-week-row").first
    times = await row.locator(".plan-slot-time").evaluate_all("els=>els.map(e=>e.value)")
    check(times == ["07:30", "20:00"], f"Orari proposti per Colazione e Cena: {times}")

    # layout: giorni in colonna, pasti in verticale
    r0 = await page.locator(".plan-week-row").nth(0).bounding_box()
    r1 = await page.locator(".plan-week-row").nth(1).bounding_box()
    check(r1["x"] > r0["x"] + 50 and abs(r1["y"] - r0["y"]) < 5, "I giorni sono affiancati (colonne)")
    b = await row.locator(".plan-meal-block").evaluate_all("els=>els.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y]})")
    check(len(b) == 2 and abs(b[0][0] - b[1][0]) < 3 and b[1][1] > b[0][1], f"I pasti di un giorno sono uno sotto l'altro: {b}")

    # cambio orario: la cena passa prima della colazione
    await row.locator(".plan-slot-time").nth(1).fill("06:00")
    await page.wait_for_timeout(400)
    names = await page.locator(".plan-week-row").first.locator(".plan-slot-name").all_inner_texts()
    check(names == ["Cena", "Colazione"], f"Con l'orario cambiato l'ordine si aggiorna: {names}")

    # ricetta nel pasto: eredita l'orario e compare in Oggi con quell'orario
    await page.locator(".plan-week-row").first.locator(".plan-meal-block").first.locator(".plan-add-btn").click()
    await page.fill("#recipe-picker-search", "Pasta Orari")
    await page.evaluate("()=>{window.confirm=()=>false}")
    await page.locator(".recipe-picker-item", has_text="Pasta Orari").first.click()
    await page.wait_for_timeout(400)
    plan = await page.evaluate("()=>{const w=JSON.parse(localStorage.getItem('mc_ricettario_settimane_v1')||'{}');const k=Object.keys(w)[0];return w[k].plan['Lunedì']}")
    check(plan and plan[0]["time"] == "06:00", f"La ricetta eredita l'orario del pasto: {plan}")
    await page.locator(".plan-week-row").first.locator(".plan-slot-time").first.fill("07:15")
    await page.wait_for_timeout(400)
    plan = await page.evaluate("()=>{const w=JSON.parse(localStorage.getItem('mc_ricettario_settimane_v1')||'{}');const k=Object.keys(w)[0];return w[k].plan['Lunedì']}")
    check(plan[0]["time"] == "07:15", f"Cambiando l'orario del pasto si aggiornano le sue ricette: {plan}")

    # persistenza
    await page.reload(); await page.wait_for_timeout(900)
    await page.click("#nav-planning-btn"); await page.locator(".plan-grid").wait_for(state="visible")
    names = await page.locator(".plan-week-row").first.locator(".plan-slot-name").all_inner_texts()
    times = await page.locator(".plan-week-row").first.locator(".plan-slot-time").evaluate_all("els=>els.map(e=>e.value)")
    check(names == ["Cena", "Colazione"] and times == ["07:15", "07:30"], f"Orari e ordine restano dopo il ricaricamento: {names} {times}")

    # vista giorno: stesso orario e stesso ordine
    await page.locator(".plan-grid-day-open").first.click()
    await page.locator(".plan-day-card").wait_for(state="visible")
    dt = await page.locator(".plan-day-card .plan-slot-time").evaluate_all("els=>els.map(e=>e.value)")
    check(dt == ["07:15", "07:30"], f"Orari anche nella vista giorno: {dt}")

    # rimozione del pasto: nessun errore e orario dimenticato
    await page.click("#plan-mode-week")
    await page.locator(".plan-week-row").first.locator(".slot-remove-btn").nth(1).click()
    await page.wait_for_timeout(300)
    n = await page.locator(".plan-week-row").first.locator(".plan-meal-block").count()
    check(n == 1, "Pasto rimosso")
    await aggiungi_pasto(page, "Colazione", 0)
    times = await page.locator(".plan-week-row").first.locator(".plan-slot-time").evaluate_all("els=>els.map(e=>e.value)")
    check("07:30" in times, f"Un pasto rimesso riparte dall'orario tipico: {times}")
