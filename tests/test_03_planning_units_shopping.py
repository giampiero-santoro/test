"""Verifica il flusso pianificazione -> lista della spesa:
 - conversione di unità di misura fra ricetta e dispensa (es. g <-> kg)
 - raggruppamento della lista della spesa per reparto
 - persistenza dello stato delle spunte della lista della spesa
"""
from helpers import check, reset_app_state, aggiungi_pasto

NOME_RICETTA = "Test Automatico Pane Fatto in Casa"
NOME_PRODOTTO = "Test Automatico Farina Manitoba"


async def _crea_ricetta(page):
    await page.click("#nav-recipes-btn")
    await page.locator("#recipes-view").wait_for(state="visible")
    await page.click("#new-recipe-btn")
    await page.locator("#edit-overlay").wait_for(state="visible")
    await page.fill("#f-name", NOME_RICETTA)
    await page.fill("#f-time", "180")
    await page.fill("#f-servings", "4")

    await page.click("#add-ingredient")
    ing_row = page.locator(".ingredient-block").last
    await ing_row.locator(".ing-name").fill(NOME_PRODOTTO)
    await ing_row.locator(".ing-qty").fill("500")
    await ing_row.locator(".ing-unit").fill("g")

    await page.click("#add-step")
    step_row = page.locator(".step-block").last
    await step_row.locator(".step-text").fill("Impastare e lasciare lievitare.")

    await page.click("#save-recipe")
    await page.locator("#edit-overlay").wait_for(state="hidden", timeout=5000)


async def _crea_prodotto_dispensa(page):
    await page.click("#nav-dispensa-btn")
    await page.locator("#dispensa-view").wait_for(state="visible")
    await page.click("#new-dispensa-item-btn")
    await page.locator("#dispensa-edit-overlay").wait_for(state="visible", timeout=5000)
    await page.fill("#d-name", NOME_PRODOTTO)
    await page.fill("#d-qty", "0.2")   # 0,2 kg = 200 g: unità diversa da quella della ricetta (g)
    await page.fill("#d-unit", "kg")
    await page.click("#dispensa-save-btn")
    await page.locator("#dispensa-edit-overlay").wait_for(state="hidden", timeout=5000)


async def _pianifica_ricetta(page):
    await page.click("#nav-planning-btn")
    await page.locator("#planning-view").wait_for(state="visible")
    await aggiungi_pasto(page, "Pranzo")
    first_add_btn = page.locator(".plan-add-btn").first
    await first_add_btn.click()
    await page.locator("#recipe-picker-overlay").wait_for(state="visible", timeout=5000)
    await page.fill("#recipe-picker-search", NOME_RICETTA)
    item = page.locator(".recipe-picker-item", has_text=NOME_RICETTA)
    await item.first.wait_for(state="visible", timeout=5000)
    page.next_dialog_action = "dismiss"  # non aggiungere extra alla lista spesa dal prompt nativo
    await item.first.click()
    await page.locator("#recipe-picker-overlay").wait_for(state="hidden", timeout=5000)
    # La griglia settimanale deve mostrare la cella riempita
    check(await page.locator(".plan-grid .plan-meal-block.filled").count() >= 1,
          "La griglia settimanale non mostra la ricetta pianificata")
    # La visualizzazione "Giorno" (usata su smartphone) deve restare disponibile
    await page.click("#plan-mode-day")
    await page.locator(".plan-day-shopping-btn").first.wait_for(state="visible", timeout=5000)
    await page.click("#plan-mode-week")
    await page.locator(".plan-grid").wait_for(state="visible", timeout=5000)


async def run(page):
    await reset_app_state(page)
    await _crea_ricetta(page)
    await _crea_prodotto_dispensa(page)
    await _pianifica_ricetta(page)

    # --- Genera la lista della spesa del giorno pianificato e verifica la conversione unità ---
    day_shopping_btn = page.locator(".plan-grid-day-shopping").first
    await day_shopping_btn.click()
    await page.locator("#shopping-overlay").wait_for(state="visible", timeout=5000)

    item_li = page.locator("#shopping-list-items li", has_text=NOME_PRODOTTO)
    await item_li.first.wait_for(state="visible", timeout=5000)
    pantry_note = item_li.first.locator(".shopping-pantry-note")
    await pantry_note.wait_for(state="visible", timeout=5000)
    note_text = await pantry_note.inner_text()
    check("200" in note_text or "0,2" in note_text or "0.2" in note_text,
          f"La nota dispensa non mostra la quantità convertita correttamente: '{note_text}'")

    # --- Raggruppamento per reparto: deve esserci almeno un'intestazione reparto ---
    reparto_headers = page.locator("#shopping-list-items .shopping-reparto-header")
    check(await reparto_headers.count() >= 1, "La lista della spesa non mostra intestazioni di reparto")

    # --- Persistenza checkbox: spunto la voce, chiudo e riapro la lista ---
    checkbox = item_li.first.locator("input[type=checkbox]")
    was_checked = await checkbox.is_checked()
    if not was_checked:
        await checkbox.check()
    await page.wait_for_timeout(200)
    await page.click("#shopping-close")
    await page.locator("#shopping-overlay").wait_for(state="hidden", timeout=5000)

    await day_shopping_btn.click()
    await page.locator("#shopping-overlay").wait_for(state="visible", timeout=5000)
    item_li2 = page.locator("#shopping-list-items li", has_text=NOME_PRODOTTO)
    await item_li2.first.wait_for(state="visible", timeout=5000)
    checkbox2 = item_li2.first.locator("input[type=checkbox]")
    check(await checkbox2.is_checked(), "Lo stato della spunta della lista della spesa non è persistito riaprendo la lista")
    await page.click("#shopping-close")

    # --- Modifica e rimozione di una singola voce, con ripristino ---
    await day_shopping_btn.click()
    await page.locator("#shopping-overlay").wait_for(state="visible", timeout=5000)
    rows = page.locator("#shopping-list-items li:has(.shopping-remove-btn)")
    n_prima = await rows.count()
    check(n_prima >= 1, "La lista della spesa non ha voci con i pulsanti modifica/rimuovi")
    check(await page.locator("#shopping-summary").is_visible(), "Manca il riepilogo da comprare / nel carrello")
    riga = rows.first
    await riga.locator(".shopping-edit-btn").click()
    await riga.locator(".shopping-edit-form input").fill("7")
    await riga.locator(".shopping-edit-form button[type=submit]").click()
    check("7" in (await riga.locator(".amt").inner_text()), "La quantità modificata non compare nella voce")
    await page.click("#shopping-close")
    await day_shopping_btn.click()
    await page.locator("#shopping-overlay").wait_for(state="visible", timeout=5000)
    check("7" in (await page.locator("#shopping-list-items li:has(.shopping-remove-btn)").first.locator(".amt").inner_text()),
          "La quantità modificata non è persistita")
    await page.locator("#shopping-list-items li:has(.shopping-remove-btn)").first.locator(".shopping-remove-btn").click()
    check(await rows.count() == n_prima - 1, "La voce non è stata tolta dalla lista")
    await page.locator(".shopping-hidden-note button").click()
    check(await page.locator("#shopping-list-items li:has(.shopping-remove-btn)").count() == n_prima, "Le voci tolte non sono state rimesse in lista")
    await page.click("#shopping-close")

    check(not page.collected_errors, f"Errori console inattesi: {page.collected_errors}")
