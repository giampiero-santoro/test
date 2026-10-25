"""Temi di colore: pagina Tema sotto Gestione, sei temi, applicazione immediata, persistenza, migrazione del vecchio 'scuro'."""
from helpers import check, reset_app_state, dismiss_storage_choice


async def bg(page):
    return await page.evaluate("()=>getComputedStyle(document.body).backgroundColor")


async def run(page):
    await reset_app_state(page)
    await page.reload(); await page.wait_for_timeout(800); await dismiss_storage_choice(page)
    # la voce è nel gruppo Gestione, dopo la Guida illustrata
    voci = await page.locator(".app-sidebar .nav-group-label, .app-sidebar .view-nav-btn").evaluate_all(
        "els=>els.map(e=>e.classList.contains('nav-group-label')?'#'+e.textContent.trim():(e.id||''))")
    i_g = voci.index('#Gestione')
    check('nav-tema-btn' in voci[i_g:], f"Tema è sotto Gestione: {voci}")
    check(await page.locator("#tema-toggle").count() == 0, "Il vecchio interruttore non c'è più")
    check(await page.evaluate("()=>!document.documentElement.hasAttribute('data-tema')"), "Parte con Basilico")
    base = await bg(page)

    await page.click("#nav-tema-btn")
    await page.locator("#tema-grid .tema-card").first.wait_for(state="visible")
    check(await page.locator("#tema-grid .tema-card").count() == 6, "Sei temi")
    nomi = await page.locator("#tema-grid .tema-name").all_inner_texts()
    check(nomi == ["Basilico", "Pomodoro", "Zafferano", "Melanzana", "Oliva e lino", "Rame (scuro)"], f"Nomi: {nomi}")
    check(await page.locator("#tema-grid .tema-card.selected").count() == 1, "Uno solo selezionato")

    visti = {base}
    for k in ["pomodoro", "zafferano", "melanzana", "oliva", "rame"]:
        await page.click(f'[data-tema-scelta="{k}"]'); await page.wait_for_timeout(150)
        attr = await page.evaluate("()=>document.documentElement.getAttribute('data-tema')")
        check(attr == k, f"Tema {k} applicato: {attr}")
        visti.add(await bg(page))
        sel = await page.locator("#tema-grid .tema-card.selected .tema-name").inner_text()
        check(sel.lower().startswith(k[:4]), f"Scheda selezionata per {k}: {sel}")
    check(len(visti) == 6, f"Sei sfondi diversi: {visti}")
    check(await page.evaluate("()=>document.documentElement.classList.contains('bulma-theme-dark')"), "Rame è scuro")

    # persistenza
    await page.reload(); await page.wait_for_timeout(800)
    check(await page.evaluate("()=>document.documentElement.getAttribute('data-tema')") == "rame", "Il tema resta dopo il ricaricamento")

    # ritorno a Basilico
    await page.click("#nav-tema-btn")
    await page.click('[data-tema-scelta="basilico"]'); await page.wait_for_timeout(150)
    check(await page.evaluate("()=>!document.documentElement.hasAttribute('data-tema')"), "Basilico toglie l'attributo")
    check(not await page.evaluate("()=>document.documentElement.classList.contains('bulma-theme-dark')"), "Basilico è chiaro")

    # migrazione del vecchio tema scuro
    await page.evaluate("()=>localStorage.setItem('mc_ricettario_tema_v1','scuro')")
    await page.reload(); await page.wait_for_timeout(800)
    check(await page.evaluate("()=>document.documentElement.getAttribute('data-tema')") == "rame", "Il vecchio 'scuro' diventa Rame")

    # nessuna richiesta esterna dal CSS Bulma (file locale)
    check(await page.evaluate("()=>!!document.querySelector('link[href=\"css/bulma.css\"]')"), "Bulma è caricato in locale")
