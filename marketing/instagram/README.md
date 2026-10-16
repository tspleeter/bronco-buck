# Instagram Reel

`bronco-buck-reel.mp4` — 1080×1920, 12.4s, H.264/AAC with sound (Oct 15 2026).

Built from the cleaned 1080 commercial master (`buck-commercial_10_3_26_1080_clean.mov`, not in repo — ProRes too big):
- Story shots 0–6.67s: per-shot 4:3 crop (1440×1080 → 1080×810) centered on a blurred, darkened copy of the same shot. Crop x per shot: Bronco 330, hand-off 40, grandma 337, shocked guy 60, Buck eats duck 480.
- "Broncos don’t duck, / they buck." tagline above, %uckThatDuck below (overlay.png).
- Wordmark card (BuckThatDuck.com) → vertical end card: two nameplate renders, Bronco Buck Classic, first 100 numbered, Made in the USA · 11 colors, free duck, BuckThatDuck.com, "Link in bio", Ford disclaimer.
- Audio is the commercial's own (silent after ~7.5s), faded out at the end.

Rebuild: `python3 marketing/instagram/reel_cards.py <outdir>` (from repo root) for the PNGs, then ffmpeg with `-filter_complex_script reel_filter.txt` and inputs: master, overlay.png (6.68s loop), wordmark.png (1.75s), endcard.png (4.5s), all at 24000/1001.
