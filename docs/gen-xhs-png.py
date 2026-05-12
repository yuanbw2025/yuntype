#!/usr/bin/env python3
"""
Generate XHS portrait PNGs (1080x1440 @ 2x) from HTML promo files.
Each HTML is a 540x720 portrait card → one full-page screenshot.
Output: 1080x1440px per image (XHS recommended resolution, crisp on Retina).
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

DOCS = Path(__file__).parent
OUT  = DOCS / "xhs-images"
OUT.mkdir(exist_ok=True)

FILES = [
    "xhs-promo-01.html",
    "xhs-promo-02.html",
    "xhs-promo-03.html",
    "xhs-promo-04.html",
    "xhs-promo-05.html",
    "xhs-promo-06.html",
    "xhs-promo-07.html",
]

SCALE = 2   # deviceScaleFactor: CSS 540x720 → physical 1080x1440

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx  = await browser.new_context(
            viewport={"width": 540, "height": 720},
            device_scale_factor=SCALE,
        )
        page = await ctx.new_page()

        for fname in FILES:
            fpath = DOCS / fname
            stem  = fpath.stem
            url   = fpath.as_uri()

            print(f"Processing {fname} ...")
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(3000)

            data = await page.screenshot(
                type="png",
                clip={"x": 0, "y": 0, "width": 540, "height": 720},
                timeout=60000,
            )
            out = OUT / f"{stem}.png"
            out.write_bytes(data)
            print(f"  ✓ {out.name}  ({540*SCALE}×{720*SCALE}px)")

        await ctx.close()
        await browser.close()
    print(f"\nDone! {len(FILES)} PNGs @ {540*SCALE}×{720*SCALE}px saved to: {OUT}")

asyncio.run(main())
