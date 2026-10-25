"""File collegato: i selettori ricordano la cartella (id), e il banner offre 'Scegli di nuovo il file'."""
from helpers import check


async def run(page):
    check(await page.locator("#file-reconnect-pick-btn").count() == 1, "Il banner ha il pulsante 'Scegli di nuovo il file'")
    await page.evaluate("""()=>{window.__o=null;window.showSaveFilePicker=async o=>{window.__o=o;throw new DOMException('annullato','AbortError')}}""")
    await page.evaluate("document.getElementById('file-storage-link-btn').click()")
    await page.locator("#storage-choice-overlay.active").wait_for(timeout=3000)
    txt = await page.locator("#storage-choice-supportato").inner_text()
    check("Il Mio Ricettario" in txt and "cartella" in txt, "La finestra consiglia di creare la cartella")
    await page.click("#storage-choice-new-btn")
    await page.wait_for_function("window.__o")
    o = await page.evaluate("window.__o")
    check(o.get("id") == "il-mio-ricettario", f"Il selettore usa un id per ricordare la cartella: {o.get('id')}")
    await page.evaluate("document.getElementById('storage-choice-overlay').classList.remove('active')")
