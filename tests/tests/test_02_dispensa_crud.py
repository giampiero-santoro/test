"""Crea un prodotto in dispensa, verifica la soglia scorte minime e
il filtro 'In esaurimento', poi elimina il prodotto."""
from helpers import check, reset_app_state, confirm_dialog_accept

NOME_PRODOTTO = "Test Automatico Farina 00"


async def run(page):
    await reset_app_state(page)
    await page.click("#nav-dispensa-btn")
    await page.locator("#dispensa-view").wait_for(state="visible")

    # --- Creazione prodotto con scorta sotto la soglia minima ---
    await page.click("#new-dispensa-item-btn")
    await page.locator("#dispensa-edit-overlay").wait_for(state="visible", timeout=5000)

    await page.fill("#d-name", NOME_PRODOTTO)
    await page.fill("#d-qty", "1")
    await page.fill("#d-unit", "kg")
    await page.fill("#d-min-qty", "2")  # soglia minima superiore alla quantità -> in esaurimento
    await page.click("#dispensa-save-btn")
    await page.locator("#dispensa-edit-overlay").wait_for(state="hidden", timeout=5000)

    # --- Verifica presenza e badge 'in esaurimento' ---
    await page.fill("#dispensa-search", NOME_PRODOTTO)
    card = page.locator("#dispensa-list .card", has_text=NOME_PRODOTTO)
    await card.first.wait_for(state="visible", timeout=5000)
    low_stock_badge = card.locator(".dispensa-low-stock")
    check(await low_stock_badge.count() >= 1, "Il badge 'in esaurimento' non compare per un prodotto sotto soglia")

    # --- Filtro 'In esaurimento' ---
    await page.fill("#dispensa-search", "")
    await page.click("#dispensa-low-stock-filter-btn")
    await page.wait_for_timeout(300)
    filtered = page.locator("#dispensa-list .dispensa-low-stock")
    check(await filtered.count() >= 1, "Il filtro 'In esaurimento' non mostra alcun prodotto sotto soglia")
    await page.click("#dispensa-low-stock-filter-btn")  # disattiva il filtro

    # --- Eliminazione ---
    await page.fill("#dispensa-search", NOME_PRODOTTO)
    row2 = page.locator("#dispensa-list .card", has_text=NOME_PRODOTTO).first
    await row2.click()
    await page.locator("#dispensa-edit-overlay").wait_for(state="visible", timeout=5000)
    await page.click("#dispensa-delete-btn")
    await confirm_dialog_accept(page)
    await page.locator("#dispensa-edit-overlay").wait_for(state="hidden", timeout=5000)

    await page.fill("#dispensa-search", NOME_PRODOTTO)
    await page.wait_for_timeout(300)
    remaining = await page.locator("#dispensa-list .card", has_text=NOME_PRODOTTO).count()
    check(remaining == 0, "Il prodotto risulta ancora presente in dispensa dopo l'eliminazione")

    check(not page.collected_errors, f"Errori console inattesi: {page.collected_errors}")
