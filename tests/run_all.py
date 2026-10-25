#!/usr/bin/env python3
"""
Esegue tutti i test automatici di "Il Mio Ricettario" in un vero browser
(Chromium, via Playwright), uno dopo l'altro, su una copia del sito
servita in locale. Vedi tests/README.md per le istruzioni complete.

Uso:
    python3 run_all.py [--headed] [--base-url http://localhost:8000]

Se non viene passato --base-url, lo script avvia da solo un server HTTP
locale sui file del progetto (cartella superiore a tests/) su una porta
libera e lo chiude al termine.
"""
import argparse
import asyncio
import importlib
import os
import socket
import sys
import time
import http.server
import threading
import functools

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

TEST_MODULES = [
    "test_01_recipes_crud",
    "test_02_dispensa_crud",
    "test_03_planning_units_shopping",
    "test_04_archivio_allergeni_congelamento",
    "test_05_mobile_nav_cucina_conferme",
    "test_06_ricettari_volumi_pdf_piano",
    "test_07_lista_spesa_libera",
    "test_08_pwa_offline",
    "test_09_promemoria_backup",
    "test_10_condividi_lista",
    "test_11_cucina_ingredienti",
    "test_12_piano_ripeti_intervallo",
    "test_13_foto_indexeddb",
    "test_14_voti_raccolte",
    "test_15_foto_fotocamera",
    "test_16_cartella_file",
    "test_17_permesso_scrittura",
    "test_18_cestino",
    "test_19_annulla_importazione",
    "test_20_cambio_dispositivo",
    "test_21_preparata_scala_dispensa",
    "test_22_misure_pratiche",
    "test_23_cucina_timer_voce",
    "test_24_statistiche",
    "test_25_nessuna_chiamata_esterna",
    "test_26_pasti_a_piacere",
    "test_27_pagine_importa_backup",
    "test_28_orari_pasti",
    "test_29_temi",
    "test_30_matrice_menu",
    "test_31_giorno_timeline",
    "test_32_ricerca_off",
    "test_33_importa_nutrizionali",
    "test_38_pp_integrazione",
    "test_34_importa_destinazione",
    "test_35_sottocategorie",
    "test_36_ricetta_successiva",
    "test_37_stampa_ricettario",
]


def free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


def start_local_server(root_dir, port):
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root_dir)
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--headed", action="store_true", help="mostra il browser invece di eseguire in background")
    parser.add_argument("--base-url", default=None, help="URL già in esecuzione (es. http://localhost:8000); se omesso ne viene avviato uno locale")
    args = parser.parse_args()

    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("Playwright non è installato. Esegui prima:")
        print("    pip install playwright --break-system-packages")
        print("    python3 -m playwright install chromium --with-deps")
        sys.exit(1)

    httpd = None
    base_url = args.base_url
    if base_url is None:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        port = free_port()
        httpd = start_local_server(project_root, port)
        base_url = f"http://127.0.0.1:{port}"
        time.sleep(0.3)

    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=not args.headed)
        context = await browser.new_context()

        from helpers import new_page

        for mod_name in TEST_MODULES:
            mod = importlib.import_module(mod_name)
            print(f"▶ {mod_name} ...", end=" ", flush=True)
            start = time.time()
            page = None
            try:
                page = await new_page(context, base_url)
                await mod.run(page)
                elapsed = time.time() - start
                print(f"OK ({elapsed:.1f}s)")
                results.append((mod_name, True, None))
            except Exception as e:
                elapsed = time.time() - start
                print(f"FALLITO ({elapsed:.1f}s)")
                results.append((mod_name, False, str(e)))
            finally:
                if page is not None:
                    await page.close()

        await browser.close()

    if httpd is not None:
        httpd.shutdown()

    print("\n" + "=" * 60)
    passed = sum(1 for _, ok, _ in results if ok)
    for name, ok, err in results:
        status = "✅ OK" if ok else "❌ FALLITO"
        print(f"{status}  {name}")
        if not ok:
            print(f"        {err}")
    print("=" * 60)
    print(f"{passed}/{len(results)} test superati")

    if passed != len(results):
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
