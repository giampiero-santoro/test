"""Cambio dispositivo: riepilogo, schede, pulsante per scegliere il file."""
import asyncio
from helpers import check, reset_app_state


async def run(page):
    page.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
    await reset_app_state(page)
    await page.evaluate("document.getElementById('open-trasferimento-btn').click()")
    await page.locator("#trasferimento-overlay.active").wait_for(timeout=3000)
    t = await page.locator("#trasf-summary").inner_text()
    check("ricett" in t and "dispensa" in t and "foto" in t, f"Riepilogo di cosa verrà trasferito: {t}")
    check(await page.locator("#trasf-share-url-btn").is_enabled(), "Su http si può condividere l'indirizzo")
    await page.click("#trasf-tab-ricevi")
    check(await page.locator("#trasf-ricevi").is_visible() and await page.locator("#trasf-invia").is_hidden(), "La scheda 'Su questo dispositivo' si apre")
    async with page.expect_file_chooser(timeout=4000) as fc:
        await page.click("#trasf-import-btn")
    check(fc.value is not None, "Il pulsante apre la scelta del file di backup")
    await page.locator("#trasferimento-overlay.active").wait_for(state="hidden", timeout=3000)
