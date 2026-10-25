"""PWA: service worker registrato e attivo, cache offline, nessun banner 'copia locale' su http."""
import asyncio
from helpers import check


async def run(page):
    await page.wait_for_function("navigator.serviceWorker && navigator.serviceWorker.ready.then(()=>true)", timeout=10000)
    await page.evaluate("navigator.serviceWorker.ready")
    for _ in range(20):
        n = await page.evaluate("caches.keys().then(k=>k.length)")
        if n: break
        await asyncio.sleep(0.3)
    check(n >= 1, "Il service worker ha creato la cache")
    has = await page.evaluate("caches.open((await caches.keys())[0]).then(c=>c.match('js/app.js').then(r=>!!r))" if False else
                              "(async()=>{const k=(await caches.keys())[0];const c=await caches.open(k);return !!(await c.match('js/app.js'))&&!!(await c.match('style.css'))})()")
    check(has, "app.js e style.css sono in cache per l'uso offline")
    vis = await page.evaluate("getComputedStyle(document.getElementById('origin-banner')).display")
    check(vis == "none", "Su http il banner 'copia locale' è nascosto")
