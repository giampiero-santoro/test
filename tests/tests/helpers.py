"""
Funzioni di supporto condivise dai test automatici di "Il Mio Ricettario".

Non richiede pytest: ogni modulo test_*.py espone una funzione async
run(page) che run_all.py scopre ed esegue. Vedi tests/README.md per
le istruzioni su come lanciare la suite.
"""
import re

# Errori di console da ignorare: restrizioni di rete del sandbox di test
# (font Google, ecc.), non collegati a bug dell'app.
IGNORED_CONSOLE_PATTERNS = [
    "ERR_TUNNEL_CONNECTION_FAILED",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
]


class AssertionFailed(Exception):
    pass


def check(condition, message):
    if not condition:
        raise AssertionFailed(message)


def is_ignorable_console_text(text):
    return any(p in text for p in IGNORED_CONSOLE_PATTERNS)


async def new_page(context, base_url):
    """Apre una pagina pulita sull'app, disabilita showSaveFilePicker
    (per evitare che il picker nativo si blocchi in Chromium headless,
    forzando il fallback <a download>) e raccoglie gli errori console
    rilevanti in page.collected_errors."""
    page = await context.new_page()
    page.collected_errors = []

    def on_console(msg):
        if msg.type == "error" and not is_ignorable_console_text(msg.text):
            page.collected_errors.append(msg.text)

    def on_pageerror(err):
        text = str(err)
        if not is_ignorable_console_text(text):
            page.collected_errors.append(text)

    page.on("console", on_console)
    page.on("pageerror", on_pageerror)

    # L'app usa ancora alcuni confirm()/alert() nativi del browser (oltre al modale
    # personalizzato #confirm-overlay). Di default li accettiamo (click su "OK"),
    # salvo che un test imposti page.next_dialog_action = "dismiss" prima dell'azione
    # che li innesca.
    page.next_dialog_action = "accept"

    def on_dialog(dialog):
        action = getattr(page, "next_dialog_action", "accept")
        if action == "dismiss":
            dialog.dismiss()
        else:
            dialog.accept()

    page.on("dialog", on_dialog)

    await page.add_init_script(
        "Object.defineProperty(window, 'showSaveFilePicker', "
        "{ value: undefined, writable: true, configurable: true });"
    )

    await page.goto(f"{base_url}/index.html")
    await dismiss_storage_choice(page)
    return page


async def dismiss_storage_choice(page):
    """Chiude l'overlay di scelta del salvataggio su file che appare al
    primo avvio, scegliendo 'continua solo con questo browser'."""
    try:
        skip_btn = page.locator("#storage-choice-skip-btn")
        await skip_btn.wait_for(state="visible", timeout=4000)
        await skip_btn.click()
        await page.locator("#storage-choice-overlay").wait_for(state="hidden", timeout=4000)
    except Exception:
        pass  # overlay già chiuso o non mostrato (dati già presenti in localStorage)


async def reset_app_state(page):
    """Svuota localStorage e ricarica, per partire da uno stato pulito
    prima di un test che non deve dipendere da dati creati da altri test."""
    await page.evaluate("() => localStorage.clear()")
    await page.reload()
    await dismiss_storage_choice(page)


async def confirm_dialog_accept(page, timeout=4000):
    """Attende il modale di conferma personalizzato e preme 'conferma'."""
    ok_btn = page.locator("#confirm-ok-btn")
    await ok_btn.wait_for(state="visible", timeout=timeout)
    await ok_btn.click()
    await page.locator("#confirm-overlay").wait_for(state="hidden", timeout=timeout)


async def confirm_dialog_cancel(page, timeout=4000):
    cancel_btn = page.locator("#confirm-cancel-btn")
    await cancel_btn.wait_for(state="visible", timeout=timeout)
    await cancel_btn.click()
    await page.locator("#confirm-overlay").wait_for(state="hidden", timeout=timeout)


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
