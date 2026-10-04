#!/bin/sh
# Rebuilds the homepage hero. Needs: pip install "rembg[cpu]" pillow numpy scipy
set -e
cd "$(dirname "$0")"
python3 cutout.py   # source.jpg -> cut_c.png (mask)
python3 ranch.py    # cartoon daytime ranch background -> ranch_bg.png
python3 hill.py     # hill + Buck + arc tagline -> hero-hill.png
python3 plate.py    # full-face %uckThatDuck nameplate -> hero-hill-plate.png
python3 finish.py   # edge fade into #0C0A09 -> hero-ranch.png
echo "Done: hero-ranch.png (copy to public/assets/ under a NEW name, update src in src/app/page.tsx)"
