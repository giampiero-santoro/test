"""Piano: ripeti la settimana su più settimane e lista della spesa per intervallo di date."""
from helpers import check, reset_app_state, dismiss_storage_choice


async def run(page):
    await reset_app_state(page)
    rec = [{"id": "rp1", "name": "Pasta Piano Test", "title": "Pasta Piano Test", "servings": 2,
            "ingredients": [{"name": "Farina Piano", "qty": 100, "unit": "g"}], "steps": [{"text": "Cuoci."}]}]
    await page.evaluate("""r=>{
      const d=new Date(); d.setHours(12); const m=new Date(d); m.setDate(d.getDate()-((d.getDay()+6)%7));
      const iso=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
      localStorage.setItem('mc_ricettario_v1',JSON.stringify(r));
      localStorage.setItem('mc_ricettario_settimane_v1',JSON.stringify({[iso(m)]:{plan:{'Lunedì':[{id:'e1',recipeId:'rp1',mealType:'Cena',time:''}]},notes:{}}}));
      window.__lun=iso(m);
    }""", rec)
    await page.reload(); await page.wait_for_timeout(800); await dismiss_storage_choice(page)
    await page.click("#nav-planning-btn")
    await page.locator("#repeat-week-btn").scroll_into_view_if_needed()
    await page.click("#repeat-week-btn")
    await page.locator("#repeat-week-overlay.active").wait_for(timeout=3000)
    await page.fill("#repeat-week-count", "2")
    prev = await page.locator("#repeat-week-preview").inner_text()
    check("2 settimane" in prev, f"Anteprima ripeti: {prev}")
    await page.click("#repeat-week-confirm")
    await page.locator("#repeat-week-overlay.active").wait_for(state="hidden", timeout=3000)
    n = await page.evaluate("Object.keys(JSON.parse(localStorage.getItem('mc_ricettario_settimane_v1'))).length")
    check(n == 3, f"Dopo 'ripeti' le settimane salvate sono 3 (trovate {n})")
    # ripetere di nuovo salta le settimane già piene
    await page.click("#repeat-week-btn")
    await page.fill("#repeat-week-count", "2")
    prev = await page.locator("#repeat-week-preview").inner_text()
    check("0 settimane" in prev or await page.locator("#repeat-week-confirm").is_disabled(), f"Settimane già piene saltate: {prev}")
    await page.click("#repeat-week-cancel")
    # lista per date: 3 settimane -> 3 lunedì
    await page.click("#range-shopping-btn")
    await page.evaluate("()=>{const f=document.getElementById('range-from'),t=document.getElementById('range-to');const d0=new Date();d0.setHours(12);const a=new Date(d0);a.setDate(d0.getDate()-((d0.getDay()+6)%7));const b=new Date(a);b.setDate(a.getDate()+14);const iso=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');f.value=iso(a);t.value=iso(b);t.dispatchEvent(new Event('input'));}")
    prev = await page.locator("#range-shopping-preview").inner_text()
    check(prev.startswith("3 ricette"), f"Intervallo di 15 giorni: {prev}")
    await page.click("#range-shopping-confirm")
    await page.locator("#shopping-overlay.active").wait_for(timeout=3000)
    txt = await page.locator("#shopping-list-items").inner_text()
    check("Farina Piano" in txt and "600" in txt, f"Ingredienti sommati sulle 3 settimane: {txt!r}")
