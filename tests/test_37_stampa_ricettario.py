"""Esportazione PDF A4 orizzontale (file scaricato direttamente, senza stampante) e stampa del browser dalla scheda."""
import re
from helpers import check, reset_app_state, dismiss_storage_choice

FOTO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABQAHgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCzRRRXzJ9QFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf//Z"


def ric(i, nome, cat="Primi", rb=None, arch=False, foto=None):
    d = {"id": i, "name": nome, "category": cat, "servings": 4, "time": 20, "ingredients": [{"name": "farina", "qty": 100, "unit": "g"}],
         "steps": [{"text": "Impasta."}], "tags": []}
    if rb: d["ricettarioId"] = rb
    if arch: d["archived"] = True
    if foto: d["photo"] = foto
    return d


async def scarica(page, click):
    async with page.expect_download(timeout=15000) as d:
        await click()
    dl = await d.value
    path = await dl.path()
    return dl.suggested_filename, open(path, "rb").read()


def pagine(pdf):
    return len(re.findall(rb"/Type /Page /Parent", pdf))


async def run(page):
    await reset_app_state(page)
    await page.evaluate("r=>localStorage.setItem('mc_ricettario_v1',JSON.stringify(r))",
                        [ric("a", "Arrosto", "Secondi", foto=FOTO), ric("b", "Bucatini"), ric("c", "Vecchia", arch=True), ric("d", "Dolce", "Dolci", rb="altro")])
    await page.evaluate("l=>localStorage.setItem('mc_ricettario_libri_v1',JSON.stringify(l))", [{"id": "default", "name": "Il Mio Ricettario", "cover": ""}, {"id": "altro", "name": "Altro", "cover": ""}])
    await page.reload(); await page.wait_for_timeout(1000); await dismiss_storage_choice(page)
    await page.evaluate("window.__stampe = 0; window.print = () => { window.__stampe++; }; 0")
    errori = []
    page.on("pageerror", lambda e: errori.append(str(e)))
    # ricettario: una ricetta per pagina
    await page.evaluate("document.getElementById('manage-ricettari-btn').click()")
    await page.locator('.ricettario-row[data-id="default"] .ricettario-row-print-btn').click()
    await page.locator("#layout-stampa-overlay.active").wait_for(timeout=3000)
    check(await page.is_checked('input[name="layout-stampa"][value="colonne"]'), "Predefinito: due colonne")
    await page.check('input[name="layout-stampa"][value="pagina"]')
    nome, pdf = await scarica(page, lambda: page.click("#layout-stampa-ok"))
    check(pdf.startswith(b"%PDF") and nome.endswith(".pdf"), f"File PDF scaricato: {nome}")
    check(pagine(pdf) == 2, f"Una ricetta per pagina: 2 pagine (solo attive del ricettario): {pagine(pdf)}")
    check(b"/MediaBox [0 0 841.89 595.28]" in pdf, "Pagina A4 orizzontale")
    check(b"DCTDecode" in pdf, "La foto è inclusa")
    check(await page.evaluate("window.__stampe") == 0, "Nessuna stampa: il file viene scaricato")
    # due colonne: ricordato, e due ricette nello stesso foglio
    await page.evaluate("document.getElementById('manage-ricettari-btn').click()")
    await page.locator('.ricettario-row[data-id="default"] .ricettario-row-print-btn').click()
    check(await page.is_checked('input[name="layout-stampa"][value="pagina"]'), "La scelta precedente è ricordata")
    await page.check('input[name="layout-stampa"][value="colonne"]')
    nome, pdf = await scarica(page, lambda: page.click("#layout-stampa-ok"))
    check(pagine(pdf) == 1, f"Due colonne: le 2 ricette stanno in un foglio: {pagine(pdf)}")
    # scheda singola
    await page.evaluate("document.getElementById('nav-recipes-btn').click()")
    await page.locator("#recipe-list h3", has_text="Bucatini").click()
    await page.locator("#view-overlay.active").wait_for()
    await page.evaluate("document.getElementById('view-export-menu-dropdown').classList.add('open')")
    nome, pdf = await scarica(page, lambda: page.click("#print-recipe-a4-btn"))
    check(nome == "bucatini-a4.pdf" and pagine(pdf) == 1, f"PDF della scheda: {nome}")
    # Ctrl/Cmd+P dalla scheda: scheda pulita
    await page.evaluate("window.dispatchEvent(new Event('beforeprint'))")
    titoli = await page.evaluate("[...document.querySelectorAll('#print-root .ps-title')].map(e=>e.textContent)")
    check(titoli == ["Bucatini"], f"Stampa del browser: scheda pulita: {titoli}")
    await page.evaluate("window.dispatchEvent(new Event('afterprint'))")
    check(not errori, f"Nessun errore: {errori}")
