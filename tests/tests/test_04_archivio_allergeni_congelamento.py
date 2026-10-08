"""Verifica archiviazione ricette, tag allergeni e suggerimento
porzione doppia/congelamento."""
from helpers import check, reset_app_state

NOME_RICETTA = "Test Automatico Lasagne al Forno"


async def run(page):
    await reset_app_state(page)

    # --- Creazione ricetta con allergeni e 'si congela bene' ---
    await page.click("#new-recipe-btn")
    await page.locator("#edit-overlay").wait_for(state="visible")
    await page.fill("#f-name", NOME_RICETTA)
    await page.fill("#f-time", "90")
    await page.fill("#f-servings", "4")

    await page.click("#add-ingredient")
    ing_row = page.locator(".ingredient-block").last
    await ing_row.locator(".ing-name").fill("Besciamella")
    await ing_row.locator(".ing-qty").fill("500")
    await ing_row.locator(".ing-unit").fill("g")

    await page.click("#add-step")
    step_row = page.locator(".step-block").last
    await step_row.locator(".step-text").fill("Comporre gli strati e infornare.")

    # Tag allergene: latte (checkbox dentro #f-allergens-wrap)
    latte_check = page.locator("#f-allergens-wrap input[type=checkbox]").filter(has_text="Latte")
    if await latte_check.count() == 0:
        # fallback: alcune build usano label con testo accanto, non has_text sul checkbox stesso
        latte_label = page.locator("#f-allergens-wrap label", has_text="Latte")
        await latte_label.first.locator("input[type=checkbox]").check()
    else:
        await latte_check.first.check()

    await page.locator("#f-freezable").check()

    await page.click("#save-recipe")
    await page.locator("#edit-overlay").wait_for(state="hidden", timeout=5000)

    # --- Apertura scheda: verifica tag allergene visibile e suggerimento congelamento ---
    await page.fill("#search", NOME_RICETTA)
    card = page.locator("#recipe-list .card", has_text=NOME_RICETTA)
    await card.first.wait_for(state="visible", timeout=5000)
    await card.first.click()
    await page.locator("#view-overlay").wait_for(state="visible")

    allergen_chip = page.locator("#view-overlay .allergen-chip")
    check(await allergen_chip.count() >= 1, "Il tag allergene 'Latte' non compare nella scheda ricetta")

    suggestion = page.locator("#freezable-suggestion")
    check(await suggestion.is_visible(), "Il suggerimento 'si congela bene' non è visibile per una ricetta marcata come congelabile")

    # --- Raddoppia porzioni dal suggerimento ---
    servings_before = await page.locator("#view-servings-count").inner_text()
    await page.click("#double-servings-btn")
    await page.wait_for_timeout(300)
    servings_after = await page.locator("#view-servings-count").inner_text()
    check(servings_before != servings_after, "Il pulsante 'Raddoppia le porzioni' non ha modificato le porzioni visualizzate")

    # --- Archiviazione (il modale resta aperto e mostra la nota) ---
    await page.click("#archive-toggle-btn")
    archived_note = page.locator("#view-archived-note")
    await archived_note.wait_for(state="visible", timeout=4000)

    await page.click("#view-close")
    await page.locator("#view-overlay").wait_for(state="hidden", timeout=5000)

    # Una ricetta archiviata non deve comparire nell'elenco principale (ricerca di default)
    await page.fill("#search", NOME_RICETTA)
    await page.wait_for_timeout(300)
    visible_cards = await page.locator("#recipe-list .card", has_text=NOME_RICETTA).count()
    check(visible_cards == 0, "Una ricetta archiviata compare ancora nell'elenco principale")

    # --- Il filtro 'Mostra archiviate' deve farla ricomparire ---
    await page.click("#archived-filter-btn")
    await page.wait_for_timeout(300)
    archived_cards = page.locator("#recipe-list .card", has_text=NOME_RICETTA)
    check(await archived_cards.count() >= 1, "Il filtro 'Mostra archiviate' non mostra la ricetta archiviata")
    await page.click("#archived-filter-btn")  # disattiva il filtro

    check(not page.collected_errors, f"Errori console inattesi: {page.collected_errors}")
