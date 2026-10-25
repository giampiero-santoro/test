"""Foto in IndexedDB: escono dal salvataggio principale (limite ~5 MB), restano visibili dopo la riapertura."""
import asyncio
from helpers import check, reset_app_state, dismiss_storage_choice

JS_SEED = """n=>{
  const foto='data:image/jpeg;base64,'+'A'.repeat(250000);
  const r=[];for(let i=0;i<n;i++)r.push({id:'f'+i,name:'Foto Test '+i,title:'Foto Test '+i,servings:2,photo:foto+i,ingredients:[{name:'Farina',qty:1,unit:'g'}],steps:[{text:'x'}]});
  localStorage.setItem('mc_ricettario_v1',JSON.stringify(r));}"""


async def run(page):
    await reset_app_state(page)
    await page.evaluate(JS_SEED, 15)   # ~3,7 MB: quasi tutto lo spazio del browser
    await page.reload(); await page.wait_for_timeout(1500); await dismiss_storage_choice(page)
    for _ in range(20):
        sz = await page.evaluate("localStorage.getItem('mc_ricettario_v1').length")
        if sz < 200000: break
        await asyncio.sleep(0.3)
    check(sz < 200000, f"Dopo la migrazione il salvataggio principale è piccolo ({sz} caratteri)")
    n = await page.evaluate("""new Promise(res=>{const rq=indexedDB.open('mc_ricettario_foto_db',1);rq.onsuccess=()=>{const c=rq.result.transaction('foto').objectStore('foto').count();c.onsuccess=()=>res(c.result)}})""")
    check(n == 15, f"Le 15 foto sono in IndexedDB (trovate {n})")
    await page.reload(); await page.wait_for_timeout(1500); await dismiss_storage_choice(page)
    await page.click("#nav-recipes-btn")
    await page.locator("#recipe-list .card img.thumb").first.wait_for(timeout=5000)
    src = await page.locator("#recipe-list .card img.thumb").first.get_attribute("src")
    check(src.startswith("data:image/jpeg"), "Dopo la riapertura le foto si vedono ancora")
    raw = await page.evaluate("localStorage.getItem('mc_ricettario_v1')")
    check("data:image" not in raw and "@idb" in raw, "Nel salvataggio principale restano solo i segnaposto")
