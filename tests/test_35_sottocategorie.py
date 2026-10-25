"""Sottocategorie facoltative: elenco collegato alla categoria, salvataggio, filtro a chip."""
import json
from helpers import check, reset_app_state, dismiss_storage_choice


def ric(i, nome, cat, sub=None):
    d = {"id": i, "name": nome, "category": cat, "servings": 2, "ingredients": [], "steps": [], "tags": []}
    if sub: d["subcategory"] = sub
    return d


async def run(page):
    await reset_app_state(page)
    await page.evaluate("r=>localStorage.setItem('mc_ricettario_v1',JSON.stringify(r))", [
        ric("p1", "Carbonara", "Primi", "Pasta secca e fresca"), ric("p2", "Risotto allo zafferano", "Primi", "Risi e risotti"),
        ric("p3", "Pasta al pomodoro", "Primi"), ric("s1", "Polpette", "Secondi", "Carne rossa (manzo, vitello, maiale)")])
    await page.reload(); await page.wait_for_timeout(1000); await dismiss_storage_choice(page)
    await page.click("#nav-recipes-btn")
    await page.locator("#recipes-view").wait_for(state="visible")
    check(await page.locator("#subcategory-chips").is_hidden(), "Senza categoria scelta niente sottocategorie")
    await page.locator('#category-chips .chip[data-value="Primi"]').click()
    await page.locator("#subcategory-chips").wait_for(state="visible")
    chips = await page.locator("#subcategory-chips .chip").all_inner_texts()
    check(len(chips) == 6 and chips[0].startswith("Tutte"), f"Chip sottocategorie dei Primi: {chips}")
    await page.locator('#subcategory-chips .chip[data-value="Risi e risotti"]').click()
    testo = await page.inner_text("body")
    check("Risotto allo zafferano" in testo and "Carbonara" not in testo, "Il filtro mostra solo i risotti")
    await page.locator('#category-chips .chip[data-value="Secondi"]').click()
    chips = await page.locator("#subcategory-chips .chip").all_inner_texts()
    check(len(chips) == 6 and "Polpette" in await page.inner_text("body"), "Cambiando categoria il filtro sottocategoria si azzera")
    # modulo: elenco collegato, facoltativa
    await page.click("#new-recipe-btn")
    await page.locator("#edit-overlay").wait_for(state="visible")
    await page.select_option("#f-category", "Dolci")
    opts = await page.locator("#f-subcategory option").all_inner_texts()
    check(opts[0] == "— nessuna —" and "Torte e ciambelle" in opts and len(opts) == 6, f"Elenco dei Dolci: {opts}")
    await page.fill("#f-name", "Ciambella")
    await page.select_option("#f-subcategory", "Torte e ciambelle")
    await page.click("#save-recipe")
    await page.wait_for_timeout(500)
    sub = await page.evaluate("JSON.parse(localStorage.getItem('mc_ricettario_v1')).find(r=>r.name==='Ciambella').subcategory")
    check(sub == "Torte e ciambelle", f"Sottocategoria salvata: {sub}")
