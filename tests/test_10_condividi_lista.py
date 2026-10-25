"""Condividi la lista della spesa come testo (foglio di condivisione simulato)."""
from helpers import check, reset_app_state


async def run(page):
    await reset_app_state(page)
    await page.click("#nav-shopping-btn")
    await page.locator("#spesa-view").wait_for(state="visible")
    await page.evaluate("window.__shared=null; navigator.share=async d=>{window.__shared=d}")
    await page.click("#share-spesa-btn", timeout=3000) if False else None
    # lista vuota: avviso, nessuna condivisione
    page.once("dialog", lambda d: d.accept())
    await page.click("#share-spesa-btn")
    check(await page.evaluate("window.__shared") is None, "Lista vuota: nulla da condividere")
    for nome, q, u in [("Latte Test", "2", "l"), ("Pane Test", "", "")]:
        await page.fill("#spesa-add-name", nome); await page.fill("#spesa-add-qty", q); await page.fill("#spesa-add-unit", u)
        await page.click("#spesa-add-form button[type=submit]")
    await page.locator("#spesa-items li input[type=checkbox]").last.check()
    await page.click("#share-spesa-btn")
    await page.wait_for_function("window.__shared")
    t = await page.evaluate("window.__shared.text")
    check("Lista della spesa" in t and "☐" in t, f"Testo condiviso con titolo e caselle: {t!r}")
    check(t.count("☐") == 1, "Gli articoli già spuntati non vengono condivisi")
