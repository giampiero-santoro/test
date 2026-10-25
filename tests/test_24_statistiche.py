"""Statistiche: tessere, classifiche, 'da riscoprire', mai preparate, categorie, link, stato vuoto."""
import datetime
from helpers import check, reset_app_state, dismiss_storage_choice


def rec(i, name, cat="Primi", **kw):
    d = {"id": i, "name": name, "title": name, "servings": 2, "category": cat,
         "ingredients": [{"name": "x", "qty": 1, "unit": "g"}], "steps": [{"text": "x"}]}
    d.update(kw)
    return d


async def run(page):
    await reset_app_state(page)
    await page.reload(); await page.wait_for_timeout(800); await dismiss_storage_choice(page)
    await page.click("#nav-stats-btn")
    await page.locator("#stats-body").wait_for(state="visible")
    t = await page.locator("#stats-body").inner_text()
    check("Non hai ancora ricette" in t or "ricette" in t, "Stato vuoto gestito senza errori")

    vecchia = (datetime.date.today() - datetime.timedelta(days=200)).isoformat()
    recente = datetime.date.today().isoformat()
    dati = [
        rec("s1", "Carbonara Stat", timesMade=7, lastMade=recente, rating=5, time=25, favorite=True),
        rec("s2", "Lasagna Stat", timesMade=2, lastMade=vecchia, rating=3, time=90),
        rec("s3", "Tiramisù Stat", "Dolci", timesMade=0, lastMade=None, time=30),
        rec("s4", "Archiviata Stat", archived=True, timesMade=50, lastMade=recente),
    ]
    await page.evaluate("r=>localStorage.setItem('mc_ricettario_v1',JSON.stringify(r))", dati)
    await page.reload(); await page.wait_for_timeout(1000); await dismiss_storage_choice(page)
    await page.click("#nav-stats-btn")
    await page.locator(".stat-tile").first.wait_for(state="visible")
    tiles = await page.locator(".stat-tile").all_inner_texts()
    tiles = [" ".join(x.split()) for x in tiles]
    check(any(x.startswith("3 ricette") for x in tiles), f"3 ricette attive (archiviata esclusa): {tiles}")
    check(any(x.startswith("9 preparazioni") for x in tiles), f"9 preparazioni totali (7+2): {tiles}")
    check(any(x.startswith("1 preferite") for x in tiles), f"1 preferita: {tiles}")
    check(any(x.startswith("4,0") for x in tiles), f"Voto medio 4,0: {tiles}")
    check(any(x.startswith("2 pronte") for x in tiles), f"2 ricette pronte in 30 min: {tiles}")
    corpo = await page.locator("#stats-body").inner_text()
    check("Archiviata Stat" not in corpo, "Le archiviate non compaiono")
    cards = page.locator(".stat-card")
    primo = (await cards.nth(0).inner_text())
    check("Carbonara Stat" in primo and "7 volte" in primo, f"Più cucinata: {primo}")
    riscoprire = await cards.nth(2).inner_text()
    check("Lasagna Stat" in riscoprire and "Carbonara Stat" not in riscoprire, f"Da riscoprire: {riscoprire}")
    mai = await cards.nth(3).inner_text()
    check("Tiramisù Stat" in mai and "(1)" in mai, f"Mai preparate: {mai}")
    check(await page.locator(".stat-bar").count() == 2, "Due categorie nel grafico a barre")
    # clic su una ricetta apre la scheda
    await page.locator(".stat-link", has_text="Lasagna Stat").first.click()
    await page.locator("#view-overlay").wait_for(state="visible")
    check("Lasagna Stat" in await page.locator("#view-name").inner_text(), "Il link apre la scheda ricetta")
    await page.keyboard.press("Escape")
    # riquadro statistiche in Oggi, affiancato al titolo
    await page.click("#nav-today-btn")
    await page.locator(".today-stats-card").wait_for(state="visible")
    corpo = " ".join((await page.locator(".today-stats-card").inner_text()).split())
    check("3 ricette" in corpo, f"Oggi: il riquadro mostra 3 ricette (archiviata esclusa): {corpo}")
    check("9 preparazioni" in corpo, f"Oggi: 9 preparazioni: {corpo}")
    check("Carbonara Stat" in corpo, "Oggi: compare la ricetta più cucinata")
    stessa_riga = await page.evaluate("""()=>{const a=document.querySelector('.today-hero-row > .page-head').getBoundingClientRect();const b=document.querySelector('.today-stats-card').getBoundingClientRect();return b.left>=a.right-2 && Math.abs(a.top-b.top)<4;}""")
    check(stessa_riga, "Il riquadro statistiche è accanto al titolo Oggi")
    await page.click("#today-stats-btn")
    await page.locator(".stat-tile").first.wait_for(state="visible")
