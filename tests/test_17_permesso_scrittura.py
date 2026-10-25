"""Scegliendo di nuovo il file, l'app chiede subito anche il permesso di SCRITTURA (altrimenti dopo il ricaricamento chiederebbe sempre 'Riconnetti')."""
import asyncio
from helpers import check


async def run(page):
    page.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
    await page.evaluate("""()=>{
      sessionStorage.removeItem('__perm');
      const dati = JSON.stringify({recipes:[{id:'p1',name:'Da file',servings:2,ingredients:[],steps:[]}]});
      window.showOpenFilePicker = async ()=>[{ name:'ricettario-backup.json', getFile: async()=>({ text: async()=>dati }),
        queryPermission: async()=>'prompt', requestPermission: async(o)=>{ sessionStorage.setItem('__perm', o.mode); return 'granted'; } }];
    }""")
    await page.evaluate("document.getElementById('file-reconnect-pick-btn').click()")
    await page.wait_for_function("sessionStorage.getItem('__perm')", timeout=5000)
    check(await page.evaluate("sessionStorage.getItem('__perm')") == "readwrite", "Chiede il permesso di scrittura (readwrite)")
    await page.wait_for_timeout(800)
    await page.evaluate("sessionStorage.removeItem('__perm')")
