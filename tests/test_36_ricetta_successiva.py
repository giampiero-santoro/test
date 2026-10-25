"""Scheda ricetta: Precedente / Successiva seguendo l'elenco da cui si è aperta, anche con le frecce."""
from helpers import check, reset_app_state, dismiss_storage_choice


def ric(i, nome, cat="Primi"):
    return {"id": i, "name": nome, "category": cat, "servings": 2, "ingredients": [], "steps": [], "tags": []}


async def run(page):
    await reset_app_state(page)
    await page.evaluate("r=>localStorage.setItem('mc_ricettario_v1',JSON.stringify(r))",
                        [ric("a", "Arrosto", "Secondi"), ric("b", "Bucatini"), ric("c", "Cannelloni"), ric("d", "Dolce", "Dolci")])
    await page.reload(); await page.wait_for_timeout(1000); await dismiss_storage_choice(page)
    await page.click("#nav-recipes-btn")
    await page.locator('#category-chips .chip[data-value="Primi"]').click()
    await page.locator("#recipe-list h3", has_text="Bucatini").click()
    await page.locator("#view-overlay.active").wait_for()
    check(await page.inner_text("#view-name") == "Bucatini", "Aperta Bucatini")
    check(await page.inner_text("#view-seq-count") == "1 di 2", f"Contatore: {await page.inner_text('#view-seq-count')}")
    check(await page.locator("#view-prev-btn").is_disabled(), "Sulla prima 'Precedente' è disattivata")
    await page.click("#view-next-btn")
    check(await page.inner_text("#view-name") == "Cannelloni", "Successiva: Cannelloni (solo i Primi, come nell'elenco)")
    check(await page.locator("#view-next-btn").is_disabled(), "Sull'ultima 'Successiva' è disattivata")
    await page.keyboard.press("ArrowLeft")
    check(await page.inner_text("#view-name") == "Bucatini", "Freccia sinistra: torna a Bucatini")
    await page.keyboard.press("ArrowRight")
    check(await page.inner_text("#view-name") == "Cannelloni", "Freccia destra: Cannelloni")
    await page.click("#view-back-btn")
    await page.locator("#view-overlay.active").wait_for(state="detached" if False else "hidden")
    # aperta da un'altra pagina (statistiche/oggi): niente navigazione
    await page.evaluate("document.getElementById('nav-today-btn').click()")
    await page.evaluate("document.querySelector('[data-open-recipe]') && document.querySelector('[data-open-recipe]').click()")
