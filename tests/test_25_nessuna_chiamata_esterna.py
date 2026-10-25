"""Privacy: all'avvio nessuna richiesta a Google Fonts/unpkg; font locali caricati; pagina note legali."""
from helpers import check, reset_app_state, dismiss_storage_choice


async def run(page):
    esterne = []
    page.on("request", lambda r: esterne.append(r.url) if r.url.startswith("http") and "localhost" not in r.url and "127.0.0.1" not in r.url else None)
    await reset_app_state(page)
    await page.reload(); await page.wait_for_timeout(1500); await dismiss_storage_choice(page)
    vietate = [u for u in esterne if any(d in u for d in ("googleapis", "gstatic", "unpkg"))]
    check(not vietate, f"Nessuna richiesta a Google Fonts/unpkg: {vietate}")
    ok = await page.evaluate("document.fonts.ready.then(()=>document.fonts.check(\"16px 'DM Sans'\") && document.fonts.check(\"16px 'Lora'\"))")
    check(ok, "DM Sans e Lora caricati dai file locali")
    n = await page.evaluate("[...document.fonts].filter(f=>f.status==='loaded').length")
    check(n >= 2, f"Almeno due font locali effettivamente caricati: {n}")
    await page.click("#legal-link")
    await page.locator("#note-legali").wait_for(state="visible")
    t = await page.locator("#note-legali").inner_text()
    for parola in ("Privacy", "Open Food Facts", "allergeni", "html5-qrcode"):
        check(parola.lower() in t.lower(), f"Nelle note legali compare: {parola}")
    corpo = await page.evaluate("document.body.innerText + document.documentElement.innerHTML")
    check("CREA" not in corpo.replace("CREATE", ""), "Nessun riferimento a CREA nella pagina")
    check(not any("crea-" in u for u in esterne), "Nessun file dati CREA richiesto")
    await page.click("#nav-recipes-btn")
    await page.wait_for_timeout(300)
    check(await page.locator("#recipe-list .card").count() == 0, "Nessuna ricetta di esempio inclusa nell'app")
