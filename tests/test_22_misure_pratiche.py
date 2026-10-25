"""Misure pratiche: quantità scalate arrotondate (~), conversione g→kg, uova intere, interruttore."""
from helpers import check, reset_app_state, dismiss_storage_choice


async def run(page):
    await reset_app_state(page)
    rec = [{"id": "m1", "name": "Torta Misure", "title": "Torta Misure", "servings": 4, "category": "Dolci",
            "ingredients": [{"name": "Farina", "qty": 250, "unit": "g"}, {"name": "Latte", "qty": 500, "unit": "ml"},
                            {"name": "Uova", "qty": 3, "unit": ""}, {"name": "Zucchero", "qty": 100, "unit": "g"}],
            "steps": [{"text": "x"}]}]
    await page.evaluate("r=>{localStorage.setItem('mc_ricettario_v1',JSON.stringify(r));localStorage.removeItem('mc_ricettario_misure_pratiche_v1')}", rec)
    await page.reload(); await page.wait_for_timeout(1000); await dismiss_storage_choice(page)
    await page.click("#nav-recipes-btn")
    await page.locator("#recipe-list .card", has_text="Torta Misure").first.click()
    await page.locator("#view-overlay").wait_for(state="visible")
    async def righe():
        return await page.locator("#view-ingredients li").all_inner_texts()
    base = " | ".join(await righe())
    check("250" in base and "~" not in base, f"Alle porzioni originali nessun arrotondamento: {base}")
    # 4 -> 7 porzioni: farina 437,5 g, latte 875 ml, uova 5,25, zucchero 175 g
    for _ in range(3): await page.click("#servings-plus")
    t = " | ".join(await righe())
    check("~440" in t.replace(" ", "") or "440" in t, f"Farina arrotondata a 440 g: {t}")
    check("~" in t, "Compare il segno ~ sui valori arrotondati")
    # 4 -> 12 porzioni: farina 750 g, latte 1500 ml -> 1.5 l
    for _ in range(5): await page.click("#servings-plus")
    t = " | ".join(await righe())
    check("1.5" in t and "l" in t, f"Latte 1,5 l: {t}")
    # interruttore: valori esatti
    await page.click("#practical-toggle")
    t2 = " | ".join(await righe())
    check("1500" in t2.replace(" ", "") or "1500" in t2, f"Con l'interruttore spento i valori sono esatti: {t2}")
    await page.click("#practical-toggle")
