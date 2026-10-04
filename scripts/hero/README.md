# Homepage hero image pipeline

Builds `public/assets/hero-buck-duck-v6.png` (1400×1400): the gray Buck photo cut out and placed atop a hill with the curved tagline "Broncos don't duck, they buck.", in front of a muted (sepia, soft-focus, darkened) cartoon daytime western ranch (barn, house, windmill, fence, cacti, clouds, sun top-right), with all edges faded into the site background `#0C0A09`.

Run `./run.sh`. Intermediate PNGs are git-ignored scratch; only `hero-ranch.png` is the output.

- `source.jpg` — original product photo (Oct 4 2026)
- `Outfit800.ttf` — Outfit ExtraBold (SIL Open Font License), from @fontsource/outfit
- Tweak knobs: Buck height `bh` and position `bx/by` in `hill.py`; hill radius `R`/crest y 880; tagline sizes in `arc_text(...)` calls; sun `sx,sy,sr` and cloud positions in `ranch.py`; edge fade width in `finish.py`.
- `plate.py` uses fixed face coordinates (579,725)-(1023,880) — re-measure if the Buck size/position in `hill.py` changes.
- Background mute knobs: `MUTE_SAT`, `MUTE_CONTRAST`, `HAZE`, sepia multiplier and darken factor right after `ranch_bg.png` loads in `hill.py` — the ranch is deliberately low-key so eyes go to the Buck.
