"""Foto da fotocamera: su dispositivo touch compare 'Scatta una foto' e la foto scattata passa dal ritaglio."""
import base64, io
from helpers import check, new_page, reset_app_state

def png_bytes():
    import struct, zlib
    w = h = 64
    raw = b"".join(b"\x00" + bytes([200, 80, 40] * w) for _ in range(h))
    def chunk(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b"")


async def run(page):
    base = page.url.rsplit("/index.html", 1)[0]
    # desktop: niente pulsante fotocamera
    await page.click("#nav-recipes-btn"); await page.click("#new-recipe-btn")
    await page.locator("#edit-overlay").wait_for(state="visible")
    check(await page.locator("#f-photo-camera-btn").is_hidden(), "Su computer il pulsante fotocamera è nascosto")
    await page.click("#cancel-edit")
    # telefono
    ctx = await page.context.browser.new_context(viewport={"width": 390, "height": 800}, is_mobile=True, has_touch=True)
    m = await new_page(ctx, base)
    await m.evaluate("localStorage.setItem('mc_ricettario_scelta_storage_saltata_v1','1')")
    await m.click("#tab-recipes")
    await m.click("#recipes-fab")
    await m.locator("#edit-overlay").wait_for(state="visible")
    btn = m.locator("#f-photo-camera-btn")
    check(await btn.is_visible(), "Su telefono compare 'Scatta una foto'")
    check(await m.locator("#f-photo-camera").get_attribute("capture") == "environment", "Apre la fotocamera posteriore")
    await m.set_input_files("#f-photo-camera", {"name": "scatto.png", "mimeType": "image/png", "buffer": png_bytes()})
    await m.locator("#photo-crop-overlay.active").wait_for(timeout=5000)
    await m.click("#photo-crop-apply-btn")
    await m.locator("#f-photo-preview").wait_for(state="visible", timeout=5000)
    check((await m.locator("#f-photo-preview").get_attribute("src")).startswith("data:image/jpeg"), "La foto scattata diventa l'anteprima")
    await ctx.close()
