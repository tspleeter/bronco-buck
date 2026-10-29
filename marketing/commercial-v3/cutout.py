#!/usr/bin/env python3
"""Cut every real Buck out of photos/NN.jpg -> photos_cut/NN.png for a clean studio look.

Run from the repo root:  python3 marketing/commercial-v3/cutout.py
Needs: pip install "rembg[cpu]"  (isnet-general-use model, ~179 MB, downloads on first run)

Per photo:
  1. background removal (rembg isnet-general-use) on a window around the Buck
  2. mask cleanup: drop specks, cut off any stair-rail surface under the stand
  3. exposure + white balance matched across all photos using the TEETH as the
     reference white (every Buck has the same white teeth, so they should read
     identically): per-channel gain so the teeth median lands on TEETH_TARGET
  4. crop to the Buck and scale so every Buck is exactly OUT_H px tall
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session
from scipy import ndimage

HERE = os.path.join(os.getcwd(), "marketing/commercial-v3")
SRC, OUT = os.path.join(HERE, "photos"), os.path.join(HERE, "photos_cut")
OUT_H = 1000
TEETH_TARGET = np.array([238, 236, 232], float)
# Buck centre (cx, cy as fractions of the photo); the cutout window is centred on it
CENTRE = {1: (.52, .54), 2: (.485, .41), 3: (.54, .31), 4: (.475, .43), 5: (.59, .37), 6: (.51, .36),
          7: (.51, .49), 8: (.40, .36), 9: (.50, .44), 10: (.565, .50), 11: (.47, .47), 12: (.455, .47),
          13: (.55, .47), 14: (.54, .50)}

def cut(i, session):
    im = Image.open(f"{SRC}/{i:02d}.jpg").convert("RGB")
    cx, cy = CENTRE[i]
    win = int(im.height * (0.95 if i == 10 else 0.62))          # square window around the Buck
    l = int(min(max(cx * im.width - win / 2, 0), im.width - win))
    t = int(min(max(cy * im.height - win / 2, 0), im.height - win))
    crop = im.crop((l, t, l + win, t + win))
    rgba = remove(crop, session=session, post_process_mask=True)
    a = np.array(rgba)[..., 3].astype(float) / 255
    rgb = np.array(crop).astype(float)

    # keep the Buck (biggest blob + anything big touching it), drop specks
    lab, n = ndimage.label(a > 0.5)
    if n:
        sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
        keep = np.isin(lab, [k + 1 for k, s in enumerate(sizes) if s >= max(4000, sizes.max() * 0.02)])
        a = a * ndimage.binary_dilation(keep, iterations=3)

    # cut off rail surface: below the stand the row width balloons; stop at the last "stand-width" row
    rows = (a > 0.5).sum(1)
    ys = np.where(rows > 0)[0]; top, bot = ys.min(), ys.max()
    lower = np.arange(int(top + (bot - top) * 0.6), bot + 1)
    stand_w = np.median(rows[lower[: max(1, len(lower) // 2)]])
    for y in lower:
        if rows[y] > stand_w * 1.35:
            a[y:] = 0; break

    # exposure / white balance from the teeth (bright, low-saturation pixels in the mouth band)
    ys = np.where((a > 0.5).any(1))[0]; xs = np.where((a > 0.5).any(0))[0]
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    hgt, wid = y1 - y0, x1 - x0
    band = np.zeros_like(a, bool)
    band[y0 + int(hgt * .28): y0 + int(hgt * .62), x0 + int(wid * .25): x0 + int(wid * .75)] = True
    mx, mn = rgb.max(2), rgb.min(2)
    teeth = band & (a > .9) & (mx > 120) & ((mx - mn) < 0.18 * mx + 12)
    if teeth.sum() > 200:
        ref = np.array([np.percentile(rgb[..., c][teeth], 75) for c in range(3)])
        gain = np.clip(TEETH_TARGET / np.maximum(ref, 1), 0.6, 1.9)
    else:
        gain = np.ones(3)
    rgb = np.clip(rgb * gain, 0, 255)

    out = np.dstack([rgb, a * 255]).astype("uint8")
    img = Image.fromarray(out, "RGBA").crop((x0, y0, x1 + 1, y1 + 1))
    img = img.resize((round(img.width * OUT_H / img.height), OUT_H), Image.LANCZOS)
    img.save(f"{OUT}/{i:02d}.png")
    return teeth.sum(), gain

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    s = new_session("isnet-general-use")
    for i in (map(int, sys.argv[1:]) if len(sys.argv) > 1 else range(1, 15)):
        n, g = cut(i, s)
        print(f"{i:02d}  teeth px {n:6d}  gain {np.round(g, 2)}")
