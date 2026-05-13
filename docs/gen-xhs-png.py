#!/usr/bin/env python3
"""
Generate XHS portrait PNGs (1080x1440 @ 2x) from HTML promo files.
- Dual-column files (01-06): 1080x720 viewport, split left/right -> -L.png, -R.png
- Single-column files (07-08): 540x720 viewport, full screenshot -> .png
Output: 1080x1440px per image (XHS recommended resolution, crisp on Retina).
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

DOCS = Path(__file__).parent
OUT  = DOCS / "xhs-images"
OUT.mkdir(exist_ok=True)

DUAL_FILES = [
    "xhs-promo-01.html",
    "xhs-promo-02.html",
    "xhs-promo-03.html",
    "xhs-promo-04.html",
    "xhs-promo-05.html",
    "xhs-promo-06.html",
]

SINGLE_FILES = [
    "xhs-promo-07.html",
    "xhs-promo-08.html",
]

SCALE = 2   # deviceScaleFactor: CSS px → physical 1080x1440

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # Process dual-column files (1080x720 viewport, split L/R)
        ctx = await browser.new_context(
            viewport={"width": 1080, "height": 720},
            device_scale_factor=SCALE,
        )
        page = await ctx.new_page()

        for fname in DUAL_FILES:
            fpath = DOCS / fname
            stem  = fpath.stem
            url   = fpath.as_uri()

            print(f"Processing {fname} (dual) ...")
            await page.goto(url, wait_until="networkidle")
            await page.wait_for_timeout(1000)

            for side, x in [("L", 0), ("R", 540)]:
                data = await page.screenshot(
                    type="png",
                    clip={"x": x, "y": 0, "width": 540, "height": 720},
                )
                out = OUT / f"{stem}-{side}.png"
                out.write_bytes(data)
                print(f"  ✓ {out.name}  ({540*SCALE}×{720*SCALE}px)")

        await ctx.close()

        # Process single-column files (540x720 viewport, full screenshot)
        ctx2 = await browser.new_context(
            viewport={"width": 540, "height": 720},
            device_scale_factor=SCALE,
        )
        page2 = await ctx2.new_page()

        for fname in SINGLE_FILES:
            fpath = DOCS / fname
            stem  = fpath.stem
            url   = fpath.as_uri()

            print(f"Processing {fname} (single) ...")
            await page2.goto(url, wait_until="networkidle")
            await page2.wait_for_timeout(1000)

            data = await page2.screenshot(type="png")
            out = OUT / f"{stem}.png"
            out.write_bytes(data)
            print(f"  ✓ {out.name}  ({540*SCALE}×{720*SCALE}px)")

        await ctx2.close()
        await browser.close()

    total = len(DUAL_FILES) * 2 + len(SINGLE_FILES)
    print(f"\nDone! {total} PNGs @ {540*SCALE}×{720*SCALE}px saved to: {OUT}")

asyncio.run(main())
