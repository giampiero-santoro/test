"""Modalità cucina: timer multipli che restano tra i passaggi, allarme/Ferma, comandi vocali (riconoscimento simulato)."""
from helpers import check, reset_app_state, dismiss_storage_choice


async def run(page):
    await reset_app_state(page)
    rec = [{"id": "t1", "name": "Sugo Timer", "title": "Sugo Timer", "servings": 2, "category": "Primi",
            "ingredients": [{"name": "Pomodoro", "qty": 400, "unit": "g"}],
            "steps": [{"text": "Soffriggi la cipolla.", "time": 5}, {"text": "Aggiungi il pomodoro."}, {"text": "Servi."}]}]
    await page.evaluate("""r=>{localStorage.setItem('mc_ricettario_v1',JSON.stringify(r));
      window.__rec=null;
      window.webkitSpeechRecognition=class{constructor(){window.__rec=this}start(){this.started=true}stop(){this.started=false;this.onend&&this.onend()}};}""", rec)
    await page.reload(); await page.wait_for_timeout(1000); await dismiss_storage_choice(page)
    await page.evaluate("""()=>{window.__rec=null;window.webkitSpeechRecognition=class{constructor(){window.__rec=this}start(){this.started=true}stop(){this.started=false}};window.SpeechRecognition=undefined}""")
    await page.click("#nav-recipes-btn")
    await page.locator("#recipe-list .card", has_text="Sugo Timer").first.click()
    await page.locator("#view-overlay").wait_for(state="visible")
    await page.click("#cook-mode-btn")
    await page.locator("#cook-overlay").wait_for(state="visible")
    # timer del passaggio
    await page.click("#cook-timer-btn")
    check(await page.locator("#cook-timers .ct").count() == 1, "Il timer del passaggio compare")
    check("05:0" in await page.locator("#cook-timers .ct .t").first.inner_text() or "04:5" in await page.locator("#cook-timers .ct .t").first.inner_text(), "Parte da 5 minuti")
    await page.click("#cook-next-btn")
    check(await page.locator("#cook-timers .ct").count() == 1, "Il timer resta attivo cambiando passaggio")
    # timer libero breve + allarme
    await page.click("#cook-add-timer-btn")
    await page.fill("#cook-add-timer-min", "0.05")
    await page.fill("#cook-add-timer-name", "Pasta")
    await page.click("#cook-add-timer-form button[type=submit]")
    check(await page.locator("#cook-timers .ct").count() == 2, "Due timer insieme")
    await page.locator("#cook-timers .ct.done").wait_for(timeout=9000)
    check("Pasta" in await page.locator("#cook-timers .ct.done").inner_text(), "Il timer 'Pasta' suona alla fine")
    await page.click("#cook-timers .ct.done button[data-act=stop]")
    check(await page.locator("#cook-timers .ct").count() == 1, "Ferma toglie solo il timer finito")
    # comandi vocali
    await page.click("#cook-voice-btn")
    check(await page.evaluate("!!window.__rec && window.__rec.started"), "Il riconoscimento vocale parte")
    async def di(frase):
        await page.evaluate("t=>window.__rec.onresult({resultIndex:0,results:[Object.assign([{transcript:t}],{isFinal:true})]})", frase)
    await di("avanti")
    check("Servi" in await page.locator("#cook-step-text").inner_text(), "«avanti» passa al passaggio successivo")
    await di("indietro")
    check("pomodoro" in (await page.locator("#cook-step-text").inner_text()).lower(), "«indietro» torna indietro")
    await di("timer 10 minuti")
    check(await page.locator("#cook-timers .ct").count() == 2, "«timer 10 minuti» avvia un timer")
    await di("ingredienti")
    check(await page.locator("#cook-ingr-panel").is_visible(), "«ingredienti» apre il pannello")
    await page.click("#cook-ingr-close")
    await page.click("#cook-exit-btn")
    check(await page.locator("#cook-timers .ct").count() == 0, "Uscendo i timer si azzerano")
