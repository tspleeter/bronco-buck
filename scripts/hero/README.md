# Homepage hero image pipeline

Builds `public/assets/hero-buck-duck-v6.png` (1400×1400): the gray Buck photo cut out and placed atop a hill with the curved tagline "Broncos don't duck, they buck.", in front of a muted (sepia, soft-focus, darkened) cartoon daytime western ranch (barn, house, windmill, fence, cacti, clouds, sun top-right), with all edges faded into the site background `#0C0A09`.

Run `./run.sh`. Intermediate PNGs are git-ignored scratch; only `hero-ranch.png` is the output.

- `source.jpg` — original product photo (Oct 4 2026)
- `Outfit800.ttf` — Outfit ExtraBold (SIL Open Font License), from @fontsource/outfit
- Tweak knobs: Buck height `bh` and position `bx/by` in `hill.py`; hill radius `R`/crest y 880; tagline sizes in `arc_text(...)` calls; sun `sx,sy,sr` and cloud positions in `ranch.py`; edge fade width in `finish.py`.
- `plate.py` uses fixed face coordinates (579,725)-(1023,880) — re-measure if the Buck size/position in `hill.py` changes.
- Background mute knobs: `MUTE_SAT`, `MUTE_CONTRAST`, `HAZE`, sepia multiplier and darken factor right after `ranch_bg.png` loads in `hill.py` — the ranch is deliberately low-key so eyes go to the Buck.

## Gifts page / Etsy lead: `trio.py` (Oct 18 2026)

Real photo of three Bucks (gray, black w/ white mane + duck, light blue) on the same muted ranch, wide hill crest, tagline straight across the top. 2000x2000 → `trio-ranch.png`.

1. `trio_cut.png`: rembg `isnet-general-use` on `trio_src.jpg` downscaled to 2400px wide (full-res cut loses detail).
2. `python3 ranch.py && python3 trio.py`
3. Ship as `public/assets/product/gifts-trio-vN.webp` (1400px, q85, new name each time) + `marketing/etsy/00_trio_ranch.jpg` (Etsy lead).

Cleanup in `trio.py`: splits the cutout into the three Bucks, morphological opening (9px) strips PETG strings off the silhouettes, slight cool white-balance to neutralise the warm room light.
