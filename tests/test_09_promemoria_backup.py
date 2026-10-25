"""Promemoria settimanale di backup: appare dopo 7 giorni, 'Domani' lo rimanda, 'Non ricordarmelo' lo spegne."""
import json, time
from helpers import check, reset_app_state, dismiss_storage_choice


async def stato(page):
    return await page.evaluate("getComputedStyle(document.getElementById('backup-weekly-banner')).display")


async def run(page):
    await reset_app_state(page)
    old = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime(time.time() - 9 * 86400))
    rec = [{"id": "r1", "title": "Prova", "name": "Prova", "ingredients": [], "steps": [], "servings": 2}]
    await page.evaluate("([r,o])=>{localStorage.setItem('mc_ricettario_v1',JSON.stringify(r));localStorage.setItem('mc_ricettario_ultimo_backup_v1',o);localStorage.removeItem('mc_ricettario_backup_snooze_v1');localStorage.removeItem('mc_ricettario_backup_promemoria_off_v1')}", [rec, old])
    await page.reload(); await page.wait_for_timeout(800)
    await dismiss_storage_choice(page)
    check(await stato(page) == "flex", "Il promemoria compare dopo 9 giorni dall'ultimo backup")
    await page.click("#backup-weekly-later-btn")
    check(await stato(page) == "none", "'Domani' nasconde il promemoria")
    await page.reload(); await page.wait_for_timeout(800); await dismiss_storage_choice(page)
    check(await stato(page) == "none", "Dopo 'Domani' non riappare subito")
    await page.evaluate("localStorage.removeItem('mc_ricettario_backup_snooze_v1')")
    await page.reload(); await page.wait_for_timeout(800); await dismiss_storage_choice(page)
    check(await stato(page) == "flex", "Senza rinvio riappare")
    await page.click("#backup-weekly-off-btn")
    await page.reload(); await page.wait_for_timeout(800); await dismiss_storage_choice(page)
    check(await stato(page) == "none", "'Non ricordarmelo' lo disattiva")
    await page.evaluate("localStorage.setItem('mc_ricettario_ultimo_backup_v1', new Date().toISOString());localStorage.removeItem('mc_ricettario_backup_promemoria_off_v1')")
    await page.reload(); await page.wait_for_timeout(800); await dismiss_storage_choice(page)
    check(await stato(page) == "none", "Con un backup di oggi il promemoria non compare")
