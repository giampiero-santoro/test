"""Pianificazione senza vincoli: giorni vuoti, menu «Aggiungi pasto», più pasti uguali, ordine, rimozione."""
import asyncio
from helpers import check, reset_app_state, dismiss_storage_choice, aggiungi_pasto, confirm_dialog_accept


async def run(page):
    await reset_app_state(page)
    rec = [{"id": "p1", "name": "Pasta Piano", "title": "Pasta Piano", "servings": 2, "category": "Primi",
            "ingredients": [{"name": "Pasta", "qty": 200, "unit": "g"}], "steps": [{"text": "x"}]}]
    await page.evaluate("r=>localStorage.setItem('mc_ricettario_v1',JSON.stringify(r))", rec)
    await page.reload(); await page.wait_for_timeout(900); await dismiss_storage_choice(page)
    page.on("dialog", lambda d: asyncio.ensure_future(d.accept("Aperitivo serale") if d.type == "prompt" else d.accept()))
    await page.click("#nav-planning-btn")
    await page.click("#plan-mode-week")
    await page.locator(".plan-grid").wait_for(state="visible")

    # giorni vuoti
    check(await page.locator(".plan-meal-block").count() == 0, "All'inizio nessun pasto deve essere imposto")
    check(await page.locator(".plan-add-meal-select").count() == 7, "Un menu «Aggiungi pasto» per ciascun giorno")
    opts = await page.locator(".plan-add-meal-select").first.locator("option").all_inner_texts()
    for nome in ("Colazione", "Spuntino", "Pranzo", "Merenda", "Cena", "Aperitivo"):
        check(nome in opts, f"Nel menu manca: {nome} ({opts})")

    # lunedì: 2 pasti; martedì: 8 pasti
    await aggiungi_pasto(page, "Cena", 0)
    await aggiungi_pasto(page, "Colazione", 0)
    names = await page.locator(".plan-week-row").first.locator(".plan-slot-name").all_inner_texts()
    check(names == ["Colazione", "Cena"], f"Ordine per orario tipico: {names}")
    for nome in ("Colazione", "Spuntino", "Pranzo", "Merenda", "Cena", "Spuntino", "Dopocena"):
        await aggiungi_pasto(page, nome, 1)
    names = await page.locator(".plan-week-row").nth(1).locator(".plan-slot-name").all_inner_texts()
    check(len(names) == 7 and "Spuntino 2" in names, f"Più pasti dello stesso tipo: {names}")
    await page.locator(".plan-add-meal-select").nth(1).select_option("__altro")
    await page.wait_for_timeout(300)
    names = await page.locator(".plan-week-row").nth(1).locator(".plan-slot-name").all_inner_texts()
    check(len(names) == 8 and "Aperitivo serale" in names, f"Pasto personalizzato (8 pasti in un giorno): {names}")
    check(await page.locator(".plan-week-row").first.locator(".plan-slot-name").count() == 2, "Lunedì resta con 2 pasti")

    # una ricetta in un pasto
    await page.locator(".plan-week-row").first.locator(".plan-meal-block").nth(1).locator(".plan-add-btn").click()
    await page.fill("#recipe-picker-search", "Pasta Piano")
    await page.locator(".recipe-picker-item", has_text="Pasta Piano").first.click()
    await page.wait_for_timeout(400)
    check(await page.locator(".plan-week-row").first.locator(".plan-meal-block.filled").count() == 1, "Il pasto con la ricetta risulta pieno")

    # persistenza
    await page.reload(); await page.wait_for_timeout(900)
    await page.click("#nav-planning-btn"); await page.locator(".plan-grid").wait_for(state="visible")
    n2 = await page.locator(".plan-week-row").nth(1).locator(".plan-slot-name").count()
    check(n2 == 8, f"I pasti aggiunti restano dopo il ricaricamento: {n2}")

    # rimozione: pasto vuoto subito, pasto con ricetta con conferma
    await page.locator(".plan-week-row").nth(1).locator(".slot-remove-btn").first.click()
    await page.wait_for_timeout(300)
    check(await page.locator(".plan-week-row").nth(1).locator(".plan-slot-name").count() == 7, "Rimosso un pasto vuoto")
    await page.locator(".plan-week-row").first.locator(".slot-remove-btn").nth(1).click()
    await confirm_dialog_accept(page)
    await page.wait_for_timeout(300)
    check(await page.locator(".plan-week-row").first.locator(".plan-slot-name").count() == 1, "Rimosso il pasto con ricetta dopo conferma")

    # vista giorno
    await page.click("#plan-mode-day")
    await page.locator(".plan-day-card").wait_for(state="visible")
    check(await page.locator(".plan-day-card .plan-add-meal-select").count() == 1, "Menu «Aggiungi pasto» anche nella vista giorno")
