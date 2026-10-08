"""Crea, modifica, visualizza ed elimina una ricetta."""
from helpers import check, reset_app_state, confirm_dialog_accept

NOME_RICETTA = "Test Automatico Pasta al Pomodoro"
NOME_RICETTA_MOD = "Test Automatico Pasta al Pomodoro (modificata)"


async def run(page):
    await reset_app_state(page)

    # --- Creazione ---
    await page.click("#new-recipe-btn")
    await page.locator("#edit-overlay").wait_for(state="visible")
    await page.fill("#f-name", NOME_RICETTA)
    await page.fill("#f-time", "20")
    await page.fill("#f-servings", "4")

    await page.click("#add-ingredient")
    ing_row = page.locator(".ingredient-block").last
    await ing_row.locator(".ing-name").fill("Pasta")
    await ing_row.locator(".ing-qty").fill("320")
    await ing_row.locator(".ing-unit").fill("g")

    await page.click("#add-step")
    step_row = page.locator(".step-block").last
    await step_row.locator(".step-text").fill("Cuocere la pasta in acqua bollente salata.")

    await page.click("#save-recipe")
    await page.locator("#edit-overlay").wait_for(state="hidden", timeout=5000)

    # --- Verifica presenza in elenco ---
    await page.fill("#search", NOME_RICETTA)
    card = page.locator("#recipe-list .card", has_text=NOME_RICETTA)
    await card.first.wait_for(state="visible", timeout=5000)
    check(await card.count() >= 1, "La ricetta appena creata non compare nell'elenco dopo la ricerca")

    # --- Apertura scheda e verifica dati ---
    await card.first.click()
    await page.locator("#view-overlay").wait_for(state="visible")
    view_name = await page.locator("#view-name").inner_text()
    check(NOME_RICETTA in view_name, f"Nome ricetta nella scheda non corrisponde: {view_name}")
    ingredients_text = await page.locator("#view-ingredients").inner_text()
    check("Pasta" in ingredients_text, "L'ingrediente 'Pasta' non compare nella scheda ricetta")

    # --- Modifica ---
    await page.click("#view-edit-btn")
    await page.locator("#edit-overlay").wait_for(state="visible")
    await page.fill("#f-name", NOME_RICETTA_MOD)
    await page.click("#save-recipe")
    await page.locator("#edit-overlay").wait_for(state="hidden", timeout=5000)

    await page.fill("#search", NOME_RICETTA_MOD)
    card_mod = page.locator("#recipe-list .card", has_text=NOME_RICETTA_MOD)
    await card_mod.first.wait_for(state="visible", timeout=5000)

    # --- Eliminazione (il pulsante 'Elimina ricetta' è nella scheda di modifica;
    #     passa dal modale di conferma personalizzato) ---
    await card_mod.first.click()
    await page.locator("#view-overlay").wait_for(state="visible")
    await page.click("#view-edit-btn")
    await page.locator("#edit-overlay").wait_for(state="visible")
    await page.click("#delete-recipe-btn")
    await confirm_dialog_accept(page)
    await page.locator("#edit-overlay").wait_for(state="hidden", timeout=5000)

    await page.fill("#search", NOME_RICETTA_MOD)
    await page.wait_for_timeout(400)
    remaining = await page.locator("#recipe-list .card", has_text=NOME_RICETTA_MOD).count()
    check(remaining == 0, "La ricetta risulta ancora presente dopo l'eliminazione confermata")

    check(not page.collected_errors, f"Errori console inattesi: {page.collected_errors}")
