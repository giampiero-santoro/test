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
