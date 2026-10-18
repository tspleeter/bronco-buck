"""Gifts-page / Etsy lead image: the real three-Buck photo on the homepage ranch.

Inputs (scratch, git-ignored): trio_src.jpg (original photo), trio_cut.png (rembg
isnet-general-use cutout of trio_src downscaled to 2400px wide), ranch_bg.png (ranch.py).
Output: trio-ranch.png (2000x2000).
"""
from PIL import Image, ImageOps, ImageEnhance, ImageFilter, ImageDraw, ImageFont
import numpy as np
from scipy import ndimage

W = H = 2000
BG = (12, 10, 9)
GOLD = (234, 179, 8, 255)
WHITE = (250, 250, 249, 255)
FONT = "Outfit800.ttf"

# ---------- cutout: split into the three Bucks, clean strings off the edges
src = ImageOps.exif_transpose(Image.open("trio_src.jpg")).convert("RGB")
cut = Image.open("trio_cut.png")
k = src.width / cut.width
alpha = np.array(cut)[..., 3]
lab, n = ndimage.label(alpha > 128)
sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, n + 1))
keep = [i + 1 for i in np.argsort(-sizes)[:3]]
objs = ndimage.find_objects(lab)

# gentle cleanup of the photo: neutralise the warm room light, a touch of contrast/sharpness
img = np.array(src).astype(np.float32)
img *= np.array([0.96, 1.0, 1.06], np.float32)
src = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
src = ImageEnhance.Contrast(src).enhance(1.05)
src = ImageEnhance.Color(src).enhance(1.06)

bucks = []
for lid in keep:
    sl = objs[lid - 1]
    y0, y1, x0, x1 = sl[0].start - 20, sl[0].stop + 20, sl[1].start - 20, sl[1].stop + 20
    m = np.where(lab[y0:y1, x0:x1] == lid, alpha[y0:y1, x0:x1], 0).astype(np.uint8)
    hard = ndimage.binary_fill_holes(m > 128)
    # opening drops thin PETG strings sticking out of the silhouette; wide parts (ears, mane) survive
    opened = ndimage.binary_opening(hard, structure=np.ones((9, 9)))
    lab2, _ = ndimage.label(opened)
    big = np.bincount(lab2.ravel()); big[0] = 0
    opened = lab2 == big.argmax()
    if lid == keep[0] or True:
        # keep small detached-but-real parts close to the body (duck bill etc. stay connected anyway)
        pass
    soft = np.minimum(m, ndimage.binary_dilation(opened, iterations=2) * 255).astype(np.uint8)
    soft = np.maximum(soft, (opened * 255).astype(np.uint8))
    M = Image.fromarray(soft).resize((int((x1 - x0) * k), int((y1 - y0) * k)), Image.LANCZOS)
    M = M.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.6))
    c = src.crop((int(x0 * k), int(y0 * k), int(x0 * k) + M.width, int(y0 * k) + M.height))
    c = c.filter(ImageFilter.UnsharpMask(radius=2.5, percent=55, threshold=3)).convert("RGBA")
    c.putalpha(M)
    c = c.crop(c.getbbox())
    bucks.append((x0, c))
bucks.sort(key=lambda t: t[0])
bucks = [b for _, b in bucks]

# ---------- background: same muted ranch as the homepage hero
bg = Image.open("ranch_bg.png").convert("RGB").resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(3.0))
bgf = np.array(bg).astype(np.float32)
MUTE_SAT, MUTE_CONTRAST, HAZE = 0.20, 0.65, 0.25
lum = (bgf @ np.array([0.299, 0.587, 0.114], np.float32))[..., None]
bgf = lum + (bgf - lum) * MUTE_SAT
bgf = 128 + (bgf - 128) * MUTE_CONTRAST
bgf = bgf * (1 - HAZE) + np.array([170, 140, 104], np.float32) * HAZE
bgf *= np.array([1.06, 0.96, 0.80], np.float32)
bgf *= 0.62

# ---------- hill: wide, flat crest for three Bucks
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
rng = np.random.default_rng(7)
CREST, R, CX = 1540, 3400, 1000
cy = CREST + R
d = np.sqrt((xx - CX) ** 2 + (yy - cy) ** 2)
inside = d <= R
depth = np.clip((yy - CREST) / 500, 0, 1)
hill = np.stack([92 - 60 * depth, 56 - 38 * depth, 34 - 24 * depth], -1)
hill += (ndimage.gaussian_filter(rng.normal(0, 1, (H, W)), 1.2) * 5)[..., None]
hill += (np.sin((R - d) / 14 + ndimage.gaussian_filter(rng.normal(0, 1, (H, W)), 25) * 30) * 3.5)[..., None]
bgf = np.where(inside[..., None], hill, bgf)
rim = np.exp(-((d - R) / 4.5) ** 2) * (np.clip(1 - np.abs(xx - CX) / 1080, 0, 1) ** 1.3)
bgf += rim[..., None] * np.array([210, 150, 30], np.float32)
glow = np.exp(-np.clip(R - d, 0, None) / 80) * inside * (np.clip(1 - np.abs(xx - CX) / 1000, 0, 1) ** 2)
bgf += glow[..., None] * np.array([60, 40, 6], np.float32)
canvas = Image.fromarray(np.clip(bgf, 0, 255).astype(np.uint8)).convert("RGBA")


def hill_y(x):
    return cy - np.sqrt(R ** 2 - (x - CX) ** 2)


# ---------- place the Bucks on the crest
BH = 760  # height of the tallest Buck
scale = BH / max(b.height for b in bucks)
bucks = [b.resize((int(b.width * scale), int(b.height * scale)), Image.LANCZOS) for b in bucks]
gap = 30
total = sum(b.width for b in bucks) + gap * 2
x = (W - total) // 2
for b in bucks:
    cxb = x + b.width / 2
    base = hill_y(cxb) + 16
    sh = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sh).ellipse((cxb - b.width * 0.52, base - 34, cxb + b.width * 0.52, base + 30), fill=190)
    sh = sh.filter(ImageFilter.GaussianBlur(24))
    canvas = Image.composite(Image.new("RGBA", (W, H), (0, 0, 0, 255)), canvas, sh)
    canvas.alpha_composite(b, (int(x), int(base - b.height)))
    x += b.width + gap


# ---------- tagline on top
def line(text, size, y, color):
    fnt = ImageFont.truetype(FONT, size)
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).text((W / 2, y + 8), text, font=fnt, fill=(0, 0, 0, 190), anchor="ms")
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(9)))
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(layer).text((W / 2, y), text, font=fnt, fill=color, anchor="ms")
    canvas.alpha_composite(layer)


line("Broncos don’t duck,", 150, 300, WHITE)
line("they buck.", 230, 520, GOLD)

# ---------- fade edges into the site background
out = np.array(canvas.convert("RGB")).astype(np.float32)
edge = np.minimum.reduce([xx, W - 1 - xx, yy, H - 1 - yy])
f = np.clip(edge / 140, 0, 1) ** 1.5
bottom = np.clip((yy - 1750) / 250, 0, 1)
f = f * (1 - bottom * 0.85)
out = out * f[..., None] + np.array(BG, np.float32) * (1 - f[..., None])
Image.fromarray(out.astype(np.uint8)).save("trio-ranch.png", optimize=True)
print("saved trio-ranch.png")
