"""Importazione dei valori nutrizionali da testo incollato: parser, conversioni, anteprima, Dispensa e ricetta."""
from helpers import check, reset_app_state, dismiss_storage_choice

TABELLA = ("Valori nutrizionali\tper 100 g\tper porzione (30 g)\nEnergia\t1046 kJ / 250 kcal\t314 kJ / 75 kcal\n"
           "Grassi\t8,5 g\t2,6 g\ndi cui acidi grassi saturi\t3,2 g\t1,0 g\nCarboidrati\t38 g\t11,4 g\n"
           "di cui zuccheri\t12 g\t3,6 g\nFibre\t2,1 g\t0,6 g\nProteine\t6,5 g\t1,9 g\nSale\t0,9 g\t0,27 g")


async def run(page):
    await reset_app_state(page)
    await dismiss_storage_choice(page)
    # parser
    r = await page.evaluate("t => NutritionParser.interpreta(t)", TABELLA)
    v = r["valori"]
    check(r["base"] == "100g" and v["kcal"] == 250 and v["fat"] == 8.5 and v["carbs"] == 38 and v["sugar"] == 12 and v["salt"] == 0.9, f"Tabella a due colonne: usa 100 g {r}")
    check(r["porzioneGrammi"] == 30, "Porzione da 30 g riconosciuta")
    r = await page.evaluate("t => NutritionParser.interpreta(t)", "Serving size 30 g Calories 120 Total Fat 4g Saturated Fat 1g Sodium 150mg Total Carbohydrate 18g Dietary Fiber 2g Total Sugars 5g Protein 3g")
    check(r["base"] == "porzione" and r["valori"]["kcal"] == 120 and r["valori"]["salt"] == 0.38 and r["valori"]["fat"] == 4, f"Inglese, sodio->sale {r}")
    # Dispensa: da 100 g
    await page.click("#nav-dispensa-btn")
    await page.click("#new-dispensa-item-btn")
    await page.locator("#dispensa-edit-overlay").wait_for(state="visible", timeout=5000)
    await page.click("#dispensa-nutrition-import-btn")
    await page.fill("#nutri-import-text", "Per porzione (30 g): Energia 75 kcal, Grassi 2,6 g, Carboidrati 11,4 g, Proteine 1,9 g, Sale 0,27 g")
    await page.click("#nutri-import-analyze")
    check(await page.input_value("#nutri-p-kcal") == "250", "Porzione convertita a 100 g (kcal)")
    check(await page.input_value("#nutri-p-fat") == "8.7", "Grassi per 100 g")
    await page.fill("#nutri-p-kcal", "251")
    await page.click("#nutri-import-apply")
    check(await page.input_value("#d-kcal") == "251" and await page.input_value("#d-carbs") == "38", "Valori nel modulo Dispensa")
    check(await page.locator("#dispensa-nutrition-fields").evaluate("e => getComputedStyle(e).display") != "none", "Pannello aperto")
    # ricetta: da 100 g a porzione
    await page.click("#dispensa-edit-close")
    await page.click("#nav-recipes-btn")
    await page.locator("#recipes-view").wait_for(state="visible")
    await page.click("#new-recipe-btn")
    await page.locator("#edit-overlay").wait_for(state="visible", timeout=5000)
    await page.evaluate("document.getElementById('f-more').open = true")
    await page.click("#recipe-nutrition-import-btn")
    await page.fill("#nutri-import-text", "Per 100 g: Energia 200 kcal, Proteine 10 g, Grassi 10 g, Carboidrati 20 g")
    await page.click("#nutri-import-analyze")
    msg = await page.inner_text("#nutri-import-msg")
    check(await page.locator("#nutri-import-apply").is_hidden(), "Senza grammi non si applica")
    check("grammi" in msg, f"Chiede i grammi: {msg}")
    await page.fill("#nutri-import-grams", "150")
    await page.dispatch_event("#nutri-import-grams", "change")
    check(await page.input_value("#nutri-p-kcal") == "300", "100 g -> porzione da 150 g")
    await page.click("#nutri-import-apply")
    check(await page.input_value("#f-nutri-kcal") == "300" and await page.input_value("#f-nutri-protein") == "15", "Valori nel modulo ricetta")
    # testo senza valori
    await page.click("#recipe-nutrition-import-btn")
    await page.fill("#nutri-import-text", "ciao mondo")
    await page.click("#nutri-import-analyze")
    check("Non ho riconosciuto" in await page.inner_text("#nutri-import-msg"), "Messaggio se non trova nulla")

    # lettura da foto (OCR locale, nessuna richiesta esterna)
    esterne = []
    page.on("request", lambda rq: esterne.append(rq.url) if not rq.url.startswith(("http://localhost", "data:", "blob:")) else None)
    await page.click("#nutri-import-cancel")
    await page.click("#recipe-nutrition-import-btn")
    import os
    await page.fill("#nutri-import-grams", "100")
    await page.set_input_files("#nutri-import-photo", os.path.join(os.path.dirname(__file__), "etichetta_nutrizionale.png"))
    await page.locator("#nutri-import-apply").wait_for(state="visible", timeout=60000)
    check(await page.input_value("#nutri-p-kcal") == "250", "OCR: calorie lette dalla foto")
    check(await page.input_value("#nutri-p-carbs") == "38" and await page.input_value("#nutri-p-protein") == "6.5", "OCR: carboidrati e proteine (g letta come 9, riparata)")
    check("superano i 100 g" in await page.inner_text("#nutri-import-msg") or await page.input_value("#nutri-p-fat") == "8.5", "OCR: virgola persa nei grassi segnalata")
    check("controlla bene" in await page.inner_text("#nutri-import-msg"), "Avviso di controllare i numeri")
    check(not esterne, f"Nessuna richiesta esterna: {esterne}")
