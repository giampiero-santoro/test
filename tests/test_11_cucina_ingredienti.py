"""Modalità cucina: pannello ingredienti scalato, spunte, ingredienti citati nel passaggio."""
from helpers import check, reset_app_state, dismiss_storage_choice


async def run(page):
    await reset_app_state(page)
    rec = [{"id": "rc1", "name": "Pasta Cucina Test", "title": "Pasta Cucina Test", "servings": 2,
            "ingredients": [{"name": "Farina", "qty": 200, "unit": "g"}, {"name": "Uova", "qty": 2, "unit": ""}, {"name": "Sale", "qty": 0, "unit": ""}],
            "steps": [{"text": "Mescola la farina con il sale."}, {"text": "Impasta fino a ottenere una palla."}]}]
    await page.evaluate("r=>localStorage.setItem('mc_ricettario_v1',JSON.stringify(r))", rec)
    await page.reload(); await page.wait_for_timeout(800); await dismiss_storage_choice(page)
    await page.click("#nav-recipes-btn")
    await page.fill("#search", "Pasta Cucina Test")
    await page.locator("#recipe-list .card", has_text="Pasta Cucina Test").first.click()
    await page.locator("#view-overlay").wait_for(state="visible")
    await page.click("#cook-mode-btn")
    await page.locator("#cook-overlay").wait_for(state="visible")
    chips = await page.locator("#cook-step-ingr span").all_inner_texts()
    check(any("Farina" in c and "200" in c for c in chips) and any("Sale" in c for c in chips), f"Ingredienti citati nel passaggio 1: {chips}")
    await page.click("#cook-next-btn")
    check(await page.locator("#cook-step-ingr").is_hidden(), "Nel passaggio 2 nessun ingrediente citato")
    await page.click("#cook-ingr-btn")
    check(await page.locator("#cook-ingr-list li").count() == 3, "Il pannello elenca tutti gli ingredienti")
    await page.locator("#cook-ingr-list li").first.click()
    check(await page.locator("#cook-ingr-list li.done").count() == 1, "Un ingrediente si può spuntare")
    await page.click("#cook-ingr-close")
    check(await page.locator("#cook-ingr-panel").is_hidden(), "Il pannello si chiude")
    await page.click("#cook-exit-btn")
