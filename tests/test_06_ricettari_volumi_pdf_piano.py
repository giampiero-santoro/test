"""Volumi: riordino, etichetta del ricettario nel selettore del piano, nome file PDF."""
from helpers import check, reset_app_state, aggiungi_pasto


async def run(page):
    await reset_app_state(page)
    await page.click("#nav-recipes-btn")
    await page.locator("#recipes-view").wait_for(state="visible")

    # Seconda raccolta
    await page.click("#more-menu-btn")
    await page.click("#manage-ricettari-btn")
    await page.locator("#ricettari-manage-list").wait_for(state="visible")
    await page.fill("#ricettario-add-name", "Ricette della nonna")
    await page.click("#ricettario-add-confirm-btn")
    names = await page.locator(".ricettario-row-name").evaluate_all("els=>els.map(e=>e.value)")
    check(len(names) == 2, f"Attesi 2 ricettari, trovati {names}")
    # Riordino: sposta il secondo prima del primo
    await page.locator(".ricettario-row").nth(1).locator(".ricettario-row-up-btn").click()
    after = await page.locator(".ricettario-row-name").evaluate_all("els=>els.map(e=>e.value)")
    check(after == names[::-1], f"Riordino non riuscito: {names} -> {after}")
    await page.keyboard.press("Escape")

    # Ricetta nel volume "Ricette della nonna"
    await page.click("#new-recipe-btn")
    await page.locator("#edit-overlay").wait_for(state="visible")
    await page.fill("#f-name", "Zuppa Test Nonna")
    await page.select_option("#f-ricettario", label="Ricette della nonna")
    await page.click("#add-ingredient")
    await page.locator(".ingredient-block").last.locator(".ing-name").fill("Acqua")
    await page.click("#save-recipe")
    await page.locator("#edit-overlay").wait_for(state="hidden", timeout=5000)

    # PDF singola ricetta: nome file con il volume
    await page.fill("#search", "Zuppa Test Nonna")
    await page.locator("#recipe-list .card", has_text="Zuppa Test Nonna").first.click()
    await page.locator("#view-overlay").wait_for(state="visible")
    await page.click("#view-export-menu-btn")
    async with page.expect_download(timeout=8000) as dl:
        await page.click("#export-recipe-pdf-btn")
    fn = (await dl.value).suggested_filename
    check(fn.endswith(".pdf") and "nonna" in fn.lower() and "zuppa" in fn.lower(), f"Nome PDF inatteso: {fn}")
    await page.keyboard.press("Escape")

    # Selettore del piano: etichetta del volume
    await page.click("#nav-planning-btn")
    await page.locator("#planning-view").wait_for(state="visible")
    await aggiungi_pasto(page, "Pranzo")
    btn = page.locator("#planning-days .plan-add-btn").first
    await btn.click()
    await page.locator("#recipe-picker-overlay.active").wait_for(timeout=5000)
    book = await page.locator("#recipe-picker-list .recipe-picker-item", has_text="Zuppa Test Nonna").locator(".picker-book").first.inner_text()
    check("nonna" in book.lower(), f"Etichetta del volume mancante nel selettore: {book}")

    # Note direttamente nella griglia
    await page.keyboard.press("Escape")
    await page.click("#nav-planning-btn")
    await page.click("#plan-mode-week")
    await page.locator(".plan-grid").wait_for(state="visible", timeout=5000)
    blk = page.locator(".plan-grid .plan-meal-block").first
    await blk.locator(".plan-add-note-btn").click()
    inp = blk.locator(".plan-grid-note-input")
    check(await inp.is_visible(), "Il campo nota non compare dopo il clic su Nota")
    await inp.fill("cena fuori")
    await inp.press("Tab")
    await page.reload()
    await page.click("#nav-planning-btn")
    await page.locator(".plan-grid").wait_for(state="visible", timeout=5000)
    val = await page.locator(".plan-grid .plan-meal-block").first.locator(".plan-grid-note-input").input_value()
    check(val == "cena fuori", f"Nota non salvata nella griglia: {val!r}")

    # Scheda ricetta come pagina: "indietro" del browser e menu laterale la chiudono
    await page.click("#nav-recipes-btn")
    await page.fill("#search", "Zuppa Test Nonna")
    await page.locator("#recipe-list .card", has_text="Zuppa Test Nonna").first.click()
    await page.locator("#view-overlay.active").wait_for(timeout=5000)
    check(await page.evaluate("!!(history.state && history.state.ricetta)"), "La scheda non apre una voce nella cronologia")
    await page.go_back()
    await page.locator("#view-overlay.active").wait_for(state="hidden", timeout=5000)
    await page.locator("#recipe-list .card", has_text="Zuppa Test Nonna").first.click()
    await page.locator("#view-overlay.active").wait_for(timeout=5000)
    await page.click("#nav-today-btn")
    await page.locator("#view-overlay.active").wait_for(state="hidden", timeout=5000)
    check(await page.locator("#today-view").is_visible(), "Il menu laterale non porta a Oggi dalla scheda ricetta")

    # Guida illustrata: icona nella barra, scheda in "Oggi", pagina raggiungibile
    await page.click("#nav-today-btn")
    check(await page.locator("#topbar-guide-link[href='guida.html']").count() == 1, "Manca l'icona della guida nella barra")
    check(await page.locator("#today-content a.guide-card").count() == 0, "La scheda Guida non deve comparire in Oggi")
    check(await page.locator("#nav-guide-link[href='guida.html']").count() == 1, "Manca il link alla guida nel menu laterale")
    ordine = await page.evaluate("""()=>{const c=document.getElementById('today-content');const w=c.querySelector('.today-grid');const m=c.querySelector('.today-layout');return !!(w&&m&&(w.compareDocumentPosition(m)&Node.DOCUMENT_POSITION_FOLLOWING));}""")
    check(await page.locator('#today-content .quick-grid').count() == 0, 'Accesso rapido non deve comparire in Oggi')
    check(await page.locator('#today-quick-pantry-btn').count() == 1, 'Manca il riquadro Le mie ricette in Oggi')
    check(ordine, "Ricette, scadenze e spesa devono stare sopra I pasti di oggi")
    await page.goto(page.url.rsplit("/", 1)[0] + "/guida.html")
    n = await page.locator("section h2").count()
    check(n >= 20, f"La guida ha {n} capitoli, attesi almeno 20")
    imgs = await page.evaluate("document.images.length")
    check(imgs >= 30, f"Immagini nella guida: {imgs}")

    # Barra compatta di "Le mie ricette": filtri con contatore, azzera, menu "⋯"
    await page.go_back()
    await page.locator("#nav-recipes-btn").wait_for(state="visible", timeout=5000)
    await page.click("#nav-recipes-btn")
    await page.fill("#search", "")
    await page.click("#filters-open-btn")
    await page.locator("#filters-overlay.active").wait_for(timeout=3000)
    await page.select_option("#time-filter", "15")
    await page.keyboard.press("Escape")
    await page.locator("#filters-overlay.active").wait_for(state="hidden", timeout=3000)
    check(await page.locator("#filters-badge").is_visible(), "Il contatore dei filtri attivi non compare")
    await page.click("#filters-open-btn")
    await page.click("#filters-reset-btn")
    await page.click("#filters-apply-btn")
    check(not await page.locator("#filters-badge").is_visible(), "Azzera non ha tolto i filtri")
    await page.click("#more-menu-btn")
    check(await page.locator("#more-goto-backup").is_visible(), "Il menu ⋯ non porta al backup")
    check(await page.locator("#more-goto-import").is_visible(), "Il menu ⋯ non porta all'importazione")
    await page.keyboard.press("Escape")
