"""Verifica il menu ☰ di navigazione mobile, la modalità cucina guidata
e che il modale di conferma possa essere annullato (Annulla non elimina nulla)."""
from helpers import check, reset_app_state

NOME_RICETTA = "Test Automatico Minestrone della Nonna"


async def _crea_ricetta_con_passaggi(page):
    await page.click("#new-recipe-btn")
    await page.locator("#edit-overlay").wait_for(state="visible")
    await page.fill("#f-name", NOME_RICETTA)
    await page.fill("#f-time", "40")
    await page.fill("#f-servings", "4")

    await page.click("#add-ingredient")
    ing_row = page.locator(".ingredient-block").last
    await ing_row.locator(".ing-name").fill("Verdure miste")
    await ing_row.locator(".ing-qty").fill("600")
    await ing_row.locator(".ing-unit").fill("g")

    for testo in ["Pulire e tagliare le verdure.", "Cuocere in pentola per 30 minuti."]:
        await page.click("#add-step")
        step_row = page.locator(".step-block").last
        await step_row.locator(".step-text").fill(testo)

    await page.click("#save-recipe")
    await page.locator("#edit-overlay").wait_for(state="hidden", timeout=5000)


async def run(page):
    await reset_app_state(page)

    # --- Menu mobile ☰: su viewport stretto deve aprire/chiudere la lista delle viste ---
    await page.set_viewport_size({"width": 390, "height": 844})
    hamburger = page.locator("#nav-hamburger-btn")
    check(await hamburger.is_visible(), "Il pulsante ☰ non è visibile su viewport mobile")

    view_nav = page.locator("#view-nav")
    check(not await view_nav.evaluate("el => el.classList.contains('open')"),
          "Il menu di navigazione risulta già aperto prima del click")
    await hamburger.click()
    check(await view_nav.evaluate("el => el.classList.contains('open')"),
          "Il menu ☰ non si apre al click")

    await page.click("#nav-planning-btn")
    await page.wait_for_timeout(200)
    check(not await view_nav.evaluate("el => el.classList.contains('open')"),
          "Il menu ☰ non si chiude dopo aver scelto una vista")
    check(await page.locator("#planning-view").is_visible(), "La vista Pianificazione non è visibile dopo la selezione dal menu ☰")

    # --- Torna a viewport desktop per il resto del test ---
    await page.set_viewport_size({"width": 1280, "height": 900})
    await page.click("#nav-recipes-btn")
    await page.locator("#recipes-view").wait_for(state="visible")

    await _crea_ricetta_con_passaggi(page)

    # --- Apertura ricetta ed eliminazione ANNULLATA: la ricetta deve restare ---
    await page.fill("#search", NOME_RICETTA)
    card = page.locator("#recipe-list .card", has_text=NOME_RICETTA)
    await card.first.wait_for(state="visible", timeout=5000)
    await card.first.click()
    await page.locator("#view-overlay").wait_for(state="visible")

    await page.click("#view-edit-btn")
    await page.locator("#edit-overlay").wait_for(state="visible")
    await page.click("#delete-recipe-btn")
    cancel_btn = page.locator("#confirm-cancel-btn")
    await cancel_btn.wait_for(state="visible", timeout=4000)
    await cancel_btn.click()
    await page.locator("#confirm-overlay").wait_for(state="hidden", timeout=4000)
    check(await page.locator("#edit-overlay").is_visible(), "La scheda di modifica si è chiusa anche se l'eliminazione è stata annullata")

    # --- Riapri la scheda vista dall'elenco, per passare alla modalità cucina ---
    await page.click("#cancel-edit")
    await page.locator("#edit-overlay").wait_for(state="hidden", timeout=5000)
    await page.fill("#search", NOME_RICETTA)
    card2 = page.locator("#recipe-list .card", has_text=NOME_RICETTA)
    await card2.first.wait_for(state="visible", timeout=5000)
    await card2.first.click()
    await page.locator("#view-overlay").wait_for(state="visible", timeout=5000)

    # --- Modalità cucina guidata ---
    await page.click("#cook-mode-btn")
    await page.locator("#cook-overlay").wait_for(state="visible", timeout=5000)
    step1_text = await page.locator("#cook-step-text").inner_text()
    check("Pulire e tagliare" in step1_text, f"Il primo passaggio in modalità cucina non corrisponde: '{step1_text}'")

    await page.click("#cook-next-btn")
    await page.wait_for_timeout(200)
    step2_text = await page.locator("#cook-step-text").inner_text()
    check("Cuocere in pentola" in step2_text, f"Il secondo passaggio in modalità cucina non corrisponde: '{step2_text}'")

    await page.click("#cook-prev-btn")
    await page.wait_for_timeout(200)
    step1_again = await page.locator("#cook-step-text").inner_text()
    check("Pulire e tagliare" in step1_again, "Il pulsante 'Indietro' in modalità cucina non torna al passaggio precedente")

    await page.click("#cook-exit-btn")
    await page.locator("#cook-overlay").wait_for(state="hidden", timeout=5000)

    check(not page.collected_errors, f"Errori console inattesi: {page.collected_errors}")
