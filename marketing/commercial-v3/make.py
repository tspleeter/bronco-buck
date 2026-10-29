#!/usr/bin/env python3
"""Bronco Buck commercial v3: "Broncos don't duck, they buck." A rally cry to Bronco owners.

Run from the repo root:
  python3 marketing/commercial-v3/make.py                    -> buck-commercial-v3.mp4            (31 s, 16:9)
  VARIANT=15  python3 marketing/commercial-v3/make.py        -> buck-commercial-v3-15s.mp4        (15 s, 16:9: FB in-stream/Reels ads)
  VARIANT=15v python3 marketing/commercial-v3/make.py        -> buck-commercial-v3-15s-9x16.mp4   (15 s, 9:16: Reels/Stories)
  VARIANT=15 ETSY=1 python3 marketing/commercial-v3/make.py  -> buck-commercial-v3-15s-etsy.mp4   (silent, Etsy URL)

Story
  1  Bronco owners. We have a duck problem.         (title)
  2  It started with one duck.                      (the man hands over the duck: original spot, man only)
  3  Then another... MAKE IT STOP.                  (his "Duck!" x100, rising pitch + squeaks, faster and faster)
  -  hard stop, 1.2 s of black silence
  4  Broncos don't... duck, they BUCK.              (beat by beat, boom on BUCK)
  5  Every Buck is printed layer by layer.          (print-reveal animation  | SLOT footage/print.mp4)
  6  Your color. Your mane. Your name.              (Todd's real photos; custom name typed onto a real plate)
  7  This isn't CGI. These are real Bucks.          (real photos + mosaic    | SLOT footage/real.mp4)
  8  End card (big %uckThatDuck wordmark), with Grandma's "%uck that duck" (her audio only) over it.

Photos: marketing/commercial-v3/photos/01-14.jpg (real Bucks on the stair rail, Oct 29 2026), cut out by\ncutout.py into photos_cut/ (same height, exposure/white balance matched off the teeth) and shown on one studio set.
The grandma and shocked-guy shots are deliberately NOT used in this spot.

FOOTAGE SLOTS: drop real clips into marketing/commercial-v3/footage/ and re-run.
A clip that exists replaces the graphic for that scene, cropped to 16:9 and
trimmed to the scene length (portrait phone video is fine, it gets a blurred fill).
  print.mp4  Bambu P1S timelapse, or the nozzle laying down layers        (4.5 s used)
  real.mp4   hands holding / turning a Buck, setting the duck in its mouth (5.0 s used)

The price on the end card is the First Edition Sale price: set SALE = False after Nov 13 2026.
"""
import os, subprocess, wave, random, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.getcwd()
HERE = os.path.join(ROOT, "marketing/commercial-v3")
WORK = os.path.join(HERE, "work")
FOOT = os.path.join(HERE, "footage")
SRC = os.path.join(ROOT, "public/assets/buck-commercial.mp4")   # original spot (duck footage)
DASH = os.path.join(ROOT, "marketing/commercial-v2/dash.jpg")
FONT = os.path.join(ROOT, "scripts/hero/Outfit800.ttf")
# VARIANT=full (31 s, 16:9) | 15 (15 s, 16:9) | 15v (15 s, 9:16 Reels/Stories);  ETSY=1 -> silent, Etsy URL
VARIANT = os.environ.get("VARIANT", "full")
ETSY = os.environ.get("ETSY") == "1"
VERT = VARIANT.endswith("v")
W, H = (1080, 1920) if VERT else (1920, 1080)
FPS, SR = 30, 48000
SAFE = 330 if VERT else 0          # lift captions above the Reels/Stories UI
BG = (12, 10, 9); BAMBU = (84, 85, 90)
GOLD = (235, 178, 9); WHITE = (255, 255, 255); DIM = (150, 145, 135)
SALE = True
PRICE, LIST_PRICE = "$24.95", "$31.19"

COLORS = [("ruby_red", "Ruby Red", "white"), ("velocity_blue", "Velocity Blue", "white"),
          ("oxford_white", "Oxford White", "black"), ("eruption_green", "Eruption Green", "white"),
          ("cyber_orange", "Cyber Orange", "white"), ("azure_gray", "Azure Gray", "black"),
          ("shadow_black", "Shadow Black", "white"), ("desert_sand", "Desert Sand", "black"),
          ("robins_egg_blue", "Robin's Egg Blue", "black"), ("cactus_gray", "Cactus Gray", "black"),
          ("carbonized_gray", "Carbonized Gray", "white")]
NAMES = ["BUCK", "BIG RED", "DUCK HUNTER"]   # custom plate is capped at 12 chars on the site
# frame counts per scene (30 fps)
T = dict(title=75, title2=35, onslaught=120, pause=36, slam=80, duck_at=20, buck_at=38, print=135,
         color_each=14, mane_each=15, names=NAMES, name_frames=84, real=150, real_shots=True, end=120)
if VARIANT.startswith("15"):       # 445 frames = 14.8 s
    T.update(title=40, title2=14, onslaught=66, pause=21, slam=54, duck_at=14, buck_at=28, print=60,
             color_each=5, mane_each=6, names=["DUCK HUNTER"], name_frames=36, real=36, real_shots=False, end=75)
MAN_CX = .42 if VERT else .5       # keep the man + duck in frame on the vertical crop

_fonts = {}
def font(n):
    if n not in _fonts: _fonts[n] = ImageFont.truetype(FONT, n)
    return _fonts[n]

def body(color, view="front", style="regmane", mane="black"):
    return Image.open(f"{ROOT}/public/assets/body/body_{color}_{view}_{style}_{mane}.png").convert("RGB")

# ---------- drawing helpers ----------
def text_parts(d, parts, y, size, cx=W / 2, shadow=True, maxw=W * .92):
    f = font(size); tot = sum(d.textlength(t, font=f) for t, _ in parts)
    if tot > maxw:                                   # shrink to fit (vertical frames)
        f = font(int(size * maxw / tot)); tot = sum(d.textlength(t, font=f) for t, _ in parts)
    x = cx - tot / 2
    for t, c in parts:
        if shadow: d.text((x + 3, y + 4), t, font=f, fill=(0, 0, 0))
        d.text((x, y), t, font=f, fill=c)
        x += d.textlength(t, font=f)

_band = None
def caption(img, parts, size=84, sub=None):
    """Bottom gradient band + one-line caption (+ optional subline). Returns RGB."""
    global _band
    if _band is None:
        a = np.linspace(0, 1, 360 + SAFE) ** 1.4 * 215
        _band = Image.fromarray(np.repeat(a[:, None], W, 1).astype("uint8"), "L")
    img = img.copy()
    img.paste((0, 0, 0), (0, H - 360 - SAFE), _band)
    d = ImageDraw.Draw(img)
    y = H - SAFE - (200 if sub else 150)
    text_parts(d, parts, y, size)
    if sub: text_parts(d, [(sub, (232, 226, 214))], y + size + 16, 46)
    return img

def cover(im, w=W, h=H):
    s = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((l, t, l + w, t + h))

def fit_blur(im):
    """Contain the image on a blurred, darkened cover of itself (for portrait/square photos)."""
    bg = cover(im).filter(ImageFilter.GaussianBlur(40))
    bg = Image.blend(bg, Image.new("RGB", (W, H), (0, 0, 0)), 0.45)
    s = min(W / im.width, H / im.height)
    fg = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    bg.paste(fg, ((W - fg.width) // 2, (H - fg.height) // 2))
    return bg

def zoom(img, z, cx=0.5, cy=0.5):
    if z <= 1.0001: return img
    w, h = W / z, H / z
    l, t = cx * W - w / 2, cy * H - h / 2
    l, t = min(max(l, 0), W - w), min(max(t, 0), H - h)
    return img.resize((W, H), Image.BICUBIC, box=(l, t, l + w, t + h))

def ease(x): return 0.5 - 0.5 * math.cos(math.pi * min(max(x, 0), 1))

# ---------- video I/O ----------
def read_video(path, start, dur, blur_fill=False, cx=.5, speed=1.0):
    """Yield PIL frames (W x H, FPS) from a clip segment (speed>1 = faster)."""
    pre = f"setpts=PTS/{speed}," if speed != 1.0 else ""
    vf = (f"{pre}fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,"
          f"crop={W}:{H}:'max(0,min(iw-{W},iw*{cx}-{W}/2))':(ih-{H})/2" if not blur_fill else
          f"{pre}fps={FPS},split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=30,"
          f"eq=brightness=-0.15[bg];[b]scale={W}:{H}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2")
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", str(start), "-t", str(dur), "-i", path,
                          "-filter_complex" if blur_fill else "-vf", vf, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         stdout=subprocess.PIPE)
    n = 0
    while True:
        buf = p.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        n += 1
        yield Image.frombytes("RGB", (W, H), buf)
    p.wait()

def slot(name, nframes, fallback, path=None):
    """Footage slot: the WHOLE clip is sped to fit 88% of the scene, then holds its last frame."""
    path = path or os.path.join(FOOT, name)
    if not os.path.exists(path):
        return fallback
    print("  using footage", os.path.relpath(path, ROOT))
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                               capture_output=True, text=True).stdout)
    speed = dur / (nframes * .88 / FPS)
    def gen(i_frame_of):
        last = None; i = 0
        for f in read_video(path, 0, dur, blur_fill=not VERT, speed=speed):   # vertical: fill the frame
            if i >= nframes: break
            last = f; yield i_frame_of(i, f); i += 1
        while i < nframes: yield i_frame_of(i, last); i += 1
    return gen

# ---------- scenes (each yields exactly n frames) ----------
def s1_title(n=T["title"]):
    for i in range(n):
        im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
        a = ease(i / 12)
        text_parts(d, [("Bronco owners.", tuple(int(c * a) for c in WHITE))], int(H * .352), 140, shadow=False)
        if i >= T["title2"]:
            b = ease((i - T["title2"]) / 10)
            text_parts(d, [("We have a ", tuple(int(c * b) for c in WHITE)), ("duck", tuple(int(c * b) for c in GOLD)),
                           (" problem.", tuple(int(c * b) for c in WHITE))], int(H * .528), 84, shadow=False)
        yield im

PHOTOS = os.path.join(HERE, "photos")
# subject centre (cx, cy as fractions of the photo) so each Buck is framed tight, above the caption band
PHOTO_C = {1: (.52, .54), 2: (.485, .41), 3: (.54, .31), 4: (.475, .43), 5: (.59, .37), 6: (.51, .36),
           7: (.51, .49), 8: (.40, .36), 9: (.50, .44), 10: (.565, .50), 11: (.47, .47), 12: (.455, .47),
           13: (.55, .47), 14: (.54, .50)}

def photo(i, z=1.45):
    im = Image.open(f"{PHOTOS}/{i:02d}.jpg").convert("RGB")
    cx, cy = PHOTO_C.get(i, (.5, .5))
    if i == 10: z = 1.0                       # landscape shot is already framed
    ww = im.width / z; wh = ww * H / W        # 16:9 window
    l = min(max(cx * im.width - ww / 2, 0), im.width - ww)
    t = min(max(cy * im.height - wh * .42, 0), im.height - wh)
    return im.resize((W, H), Image.LANCZOS, box=(l, t, l + ww, t + wh))

# ---------- studio set: every real Buck cut out (cutout.py -> photos_cut/), same height, same light ----------
CUT = os.path.join(HERE, "photos_cut")
BUCK_H, FLOOR_Y = (920, 1180) if VERT else (700, 790)
_stage = None
def stage_bg():
    """Dark brand backdrop with a soft spotlight behind the Buck and a hint of floor."""
    global _stage
    if _stage is None:
        yy, xx = np.mgrid[0:H, 0:W].astype(float)
        img = np.zeros((H, W, 3)) + np.array(BG, float)
        glow = np.clip(1 - np.sqrt(((xx - W / 2) / (W * .42)) ** 2 + ((yy - H * .42) / (H * .62)) ** 2), 0, 1) ** 1.6
        img += glow[..., None] * np.array([58, 51, 42])
        floor = np.clip((yy - FLOOR_Y + 20) / 50, 0, 1) * np.exp(-((xx - W / 2) / (W * .30)) ** 2) * .55
        img += floor[..., None] * np.array([22, 19, 16])
        _stage = Image.fromarray(np.clip(img, 0, 255).astype("uint8"))
    return _stage

_cut = {}
def cutout(i, h):
    if (i, h) not in _cut:
        b = Image.open(f"{CUT}/{i:02d}.png")
        _cut[(i, h)] = b.resize((round(b.width * h / b.height), h), Image.LANCZOS)
    return _cut[(i, h)]

def studio(i, h=BUCK_H, cx=W // 2, floor=FLOOR_Y):
    im = stage_bg().copy(); b = cutout(i, h)
    sh = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sh).ellipse([cx - b.width * .58, floor - 16, cx + b.width * .58, floor + 20], fill=190)
    im.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(16)))
    im.paste(b, (cx - b.width // 2, floor - h), b)
    return im

def plate_box(i, h=BUCK_H, cx=W // 2, floor=FLOOR_Y):
    """Nameplate rectangle of cutout i, in studio-frame pixels."""
    a = np.array(Image.open(f"{CUT}/{i:02d}.png").convert("RGBA")).astype(int)
    lum = a[..., :3].mean(2); hh = a.shape[0]
    dark = (lum < 50) & (a[..., 3] > 200); dark[: int(hh * .62)] = False
    rows = np.where(dark.sum(1) > dark.shape[1] * .35)[0]
    cols = np.where(dark[rows.min(): rows.max() + 1].sum(0) > (rows.max() - rows.min()) * .6)[0]
    k = h / hh; x0 = cx - round(a.shape[1] * k) // 2; y0 = floor - h
    return (x0 + cols.min() * k, y0 + rows.min() * k, x0 + cols.max() * k, y0 + rows.max() * k)

def label(im, text):
    im = im.copy(); d = ImageDraw.Draw(im); f = font(44)
    x = W - 70 - d.textlength(text, font=f)
    d.text((x + 2, 72), text, font=f, fill=(0, 0, 0)); d.text((x, 70), text, font=f, fill=GOLD)
    return im

# the man's "Duck!" in the original spot (shot starts ~1.55 s)
MAN_IN, DUCK_START, DUCK_END = 1.72, 1.975, 2.32   # man shot starts 1.71 s (before that is the Bronco)
GRANDMA_LINE = (3.35, 4.32)        # her "%uck that duck" (audio only; she is never shown)
DUCK_N, ONSLAUGHT_FRAMES = 100, T["onslaught"]
def duck_onsets():
    """100 onsets (s, relative to the onslaught scene): clear "Duck." at first, then faster and faster."""
    span = (ONSLAUGHT_FRAMES - 4) / FPS
    return [span * (k / (DUCK_N - 1)) ** 0.45 for k in range(DUCK_N)]
def duck_rate(k): return 2 ** ((k / (DUCK_N - 1)) * 14 / 12)    # pitch/speed climbs 14 semitones

ONE_DUCK = [("It started with ", WHITE), ("one duck.", GOLD)]

def s2_man(n=round((DUCK_START - MAN_IN) * FPS)):
    for i, fr in enumerate(read_video(SRC, MAN_IN, n / FPS + 0.1, cx=MAN_CX)):
        if i >= n: break
        yield caption(fr, ONE_DUCK)

def s3_onslaught(n=ONSLAUGHT_FRAMES):
    clip = list(read_video(SRC, DUCK_START, DUCK_END - DUCK_START + 0.05, cx=MAN_CX))
    onsets = duck_onsets(); rnd = random.Random(9); punch = {}
    for i in range(n):
        t = i / FPS
        k = max(j for j, o in enumerate(onsets) if o <= t)
        fr = clip[min(int((t - onsets[k]) * FPS * duck_rate(k)), len(clip) - 1)]
        if k not in punch:          # each repeat punches in a little harder
            a = k / (DUCK_N - 1)
            punch[k] = (1 + a * rnd.uniform(.15, .45), .5 + a * rnd.uniform(-.15, .15), .45 + a * rnd.uniform(-.1, .1))
        fr = zoom(fr, *punch[k])
        cap = (ONE_DUCK if k < 2 else [("Then ", WHITE), ("another.", GOLD)] if k < 8 else
               [("And another. ", WHITE), ("And another.", GOLD)] if k < 35 else [("MAKE. IT. ", WHITE), ("STOP.", GOLD)])
        yield caption(fr, cap, size=84 if k < 35 else 110)

def s_pause(n=T["pause"]):
    black = Image.new("RGB", (W, H), (0, 0, 0))
    for _ in range(n): yield black

def s4_slam(n=T["slam"]):
    probe = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    f1 = font(min(120, int(120 * W * .92 / probe.textlength("Broncos don't duck,", font=font(120)))))
    base = min(260, int(260 * W * .9 / probe.textlength("they BUCK.", font=font(260))))
    y1, y2 = (int(H * .38), int(H * .45)) if VERT else (230, 440)
    for i in range(n):
        im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
        a, b = "Broncos don't ", "duck,"
        x = (W - d.textlength(a + b, font=f1)) / 2
        d.text((x, y1), a, font=f1, fill=WHITE)
        if i >= T["duck_at"]: d.text((x + d.textlength(a, font=f1), y1), b, font=f1, fill=WHITE)
        if i >= T["buck_at"]:
            k = i - T["buck_at"]
            sz = int(base * (1 + 0.35 * max(0, 1 - k / 4)))
            dx = int(random.uniform(-1, 1) * 18 * max(0, 1 - k / 10))
            dy = int(random.uniform(-1, 1) * 18 * max(0, 1 - k / 10))
            f = font(sz); tw = d.textlength("they BUCK.", font=f)
            d.text(((W - tw) / 2 + dx, y2 - (sz - base) * 0.6 + dy), "they BUCK.", font=f, fill=GOLD)
        yield im

PRINT_SRC = os.path.join(ROOT, "marketing/footage/print-timelapse-2026-10-19.mp4")
def s5_print(n=T["print"]):
    r = body("velocity_blue")
    rh = 980; r = r.resize((round(r.width * rh / r.height), rh), Image.LANCZOS)
    x0, y0 = (W - r.width) // 2, 50
    mask = np.array(r).astype(int); mask = (np.abs(mask - np.array(BAMBU)).sum(2) > 30)
    rows = np.where(mask.any(1))[0]; top, bot = rows.min(), rows.max()
    def graphic(i):
        im = Image.new("RGB", (W, H), BAMBU)
        p = ease(i / (n - 15))
        cut = int(bot - p * (bot - top))
        im.paste(r.crop((0, cut, r.width, r.height)), (x0, y0 + cut))
        if p < 1:
            cols = np.where(mask[min(cut, bot)])[0]
            lo, hi = (cols.min(), cols.max()) if len(cols) else (0, r.width)
            nx = x0 + lo + (hi - lo) * (0.5 + 0.5 * math.sin(i * 1.3))
            d = ImageDraw.Draw(im)
            d.rectangle([x0 + lo, y0 + cut - 2, x0 + hi, y0 + cut + 2], fill=(255, 210, 90))
            d.polygon([(nx - 26, y0 + cut - 70), (nx + 26, y0 + cut - 70), (nx + 6, y0 + cut - 6), (nx - 6, y0 + cut - 6)],
                      fill=(40, 40, 44))
            d.rectangle([nx - 60, y0 + cut - 130, nx + 60, y0 + cut - 70], fill=(30, 30, 33))
        d = ImageDraw.Draw(im)
        d.text((60, 50), "Printed in PETG on a Bambu Lab P1S", font=font(34), fill=(230, 230, 232))
        return im
    cap = ([("Every Buck is printed ", WHITE), ("layer by layer.", GOLD)], "Made to order in Hawthorne, New Jersey.")
    real = slot("print.mp4", n, None, path=PRINT_SRC if os.path.exists(PRINT_SRC) else None)
    if real:
        yield from real(lambda i, f: caption(f, cap[0], sub=cap[1]))
    else:
        for i in range(n): yield caption(graphic(i), cap[0], sub=cap[1])

def plate_photo(base, text, full, box):
    im = base.copy(); d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = [int(v) for v in box]
    d.rounded_rectangle([x0 + 2, y0 + 2, x1 - 2, y1 - 2], radius=4, fill=(24, 21, 21))
    if text:
        pw, ph = x1 - x0, y1 - y0
        size = min(int(ph * .40), int(100 * pw * .78 / d.textlength(full, font=font(100))))
        f = font(size); l, t, r, b = d.textbbox((0, 0), full, font=f)
        tx = x0 + (pw - (r - l)) / 2 - l; ty = y0 + (ph - (b - t)) / 2 - t
        layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
        ImageDraw.Draw(layer).text((tx, ty), text, font=f, fill=(232, 226, 214, 255))
        layer = layer.filter(ImageFilter.GaussianBlur(0.8))        # match the photo's softness
        im = Image.alpha_composite(im.convert("RGBA"), layer).convert("RGB")
    return im

def s6_custom():
    sub = "11 Bronco-inspired colors"
    imgs = [studio(i) for i in (1, 2, 3, 4, 10)]
    for i in range(5 * T["color_each"]):
        yield caption(imgs[min(i // T["color_each"], 4)], [("Your Bronco's ", WHITE), ("color.", GOLD)], sub=sub)
    manes = [(8, "Regular · Black"), (4, "Long · Black"), (6, "Regular · White"), (5, "Long · White")]
    imgs = [label(studio(i), lab) for i, lab in manes]
    for i in range(4 * T["mane_each"]):
        yield caption(imgs[i // T["mane_each"]], [("Your ", WHITE), ("mane.", GOLD)])
    base = studio(10); box = plate_box(10); seq = []
    names, nf = T["names"], T["name_frames"]
    for nm in names:
        seq += [(nm[:k], nm) for k in range(1, len(nm) + 1) for _ in range(2)] + [(nm, nm)] * (12 if nm != names[-1] else 30)
    seq = (seq + [(names[-1], names[-1])] * nf)[:nf]
    cache = {}
    for key in seq:
        if key not in cache:
            cache[key] = label(zoom(plate_photo(base, *key, box), 1.3, cx=.5, cy=(box[1] + box[3]) / 2 / H - .16), "Custom nameplate")
        yield caption(cache[key], [("Your ", WHITE), ("name on the plate.", GOLD)])

def mosaic():
    ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 14]
    cols, rows = (3, 4) if VERT else (4, 3)
    g = Image.new("RGB", (W, H)); tw, th = W // cols, H // rows
    big = dict(h=1300, floor=1610) if VERT else dict(h=860, floor=960)
    for n, i in enumerate(ids):
        g.paste(cover(studio(i, **big), tw, th), ((n % cols) * tw, (n // cols) * th))
    return g

def s7_real(n=T["real"]):
    cap = [("This isn't CGI. ", WHITE), ("These are real Bucks.", GOLD)]
    sub = "3D-printed in New Jersey. Shipped to your door."
    real = slot("real.mp4", n, None)
    if real:
        yield from real(lambda i, f: caption(f, cap, size=76, sub=sub)); return
    shots = [studio(i) for i in (7, 9, 11, 13, 6)] if T["real_shots"] else []
    per = 22
    for i in range(per * len(shots)):
        k = i // per
        yield caption(zoom(shots[k], 1 + 0.05 * ((i % per) / per), cy=.45), cap, size=76, sub=sub)
    m = mosaic()
    for i in range(n - per * len(shots)):
        yield caption(m, cap, size=76, sub=sub)

def s8_end(n=T["end"]):
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    url = "buckthatduck.etsy.com" if ETSY else "BuckThatDuck.com"
    small = (120, 115, 105); soft = (215, 208, 195)
    fp, fl = font(150), font(70)
    def price(y):
        if SALE:
            pw, lw = d.textlength(PRICE, font=fp), d.textlength(LIST_PRICE, font=fl)
            x = (W - pw - 40 - lw) / 2
            d.text((x, y), PRICE, font=fp, fill=GOLD)
            d.text((x + pw + 40, y + 60), LIST_PRICE, font=fl, fill=DIM)
            d.line((x + pw + 40, y + 108, x + pw + 40 + lw, y + 108), fill=DIM, width=6)
        else:
            text_parts(d, [(LIST_PRICE, GOLD)], y, 150, shadow=False)
    if VERT:                       # stacked layout, everything above the Reels/Stories UI
        text_parts(d, [("%uck", WHITE), ("ThatDuck", GOLD)], 430, 220, shadow=False)
        text_parts(d, [("Bronco Buck Classic", (225, 220, 208))], 630, 58, shadow=False)
        text_parts(d, [("First 100 numbered, with a certificate", (225, 220, 208))], 705, 42, shadow=False)
        price(810)
        text_parts(d, [(url, WHITE)], 1040, 100, shadow=False)
        text_parts(d, [("Real 3D-printed figurines", soft)], 1190, 46, shadow=False)
        text_parts(d, [("Free rubber duck  ·  Made in the USA", soft)], 1252, 46, shadow=False)
        text_parts(d, [("Duck scenes feature AI-generated characters.", small)], 1450, 30, shadow=False)
        text_parts(d, [("Buck photos are real products.", small)], 1490, 30, shadow=False)
        text_parts(d, [("Not affiliated with Ford Motor Company.", small)], 1530, 30, shadow=False)
        text_parts(d, [("Bronco® is a trademark of Ford Motor Company.", small)], 1570, 30, shadow=False)
    else:
        text_parts(d, [("%uck", WHITE), ("ThatDuck", GOLD)], 70, 220, shadow=False)
        text_parts(d, [("Bronco Buck Classic  ·  First 100 numbered with a certificate", (225, 220, 208))], 375, 48, shadow=False)
        price(460)
        text_parts(d, [(url, WHITE)], 690, 100, shadow=False)
        text_parts(d, [("Real 3D-printed figurines  ·  Free rubber duck  ·  Made in the USA", soft)], 835, 42, shadow=False)
        text_parts(d, [("Duck scenes feature AI-generated characters. Buck photos are real products.", small)], 975, 26, shadow=False)
        text_parts(d, [("Not affiliated with Ford Motor Company. Bronco® is a trademark of Ford Motor Company.", small)], 1012, 26, shadow=False)
    for i in range(n):
        a = ease(i / 10)
        yield im if a >= 1 else Image.blend(Image.new("RGB", (W, H), BG), im, a)

SCENES = [("title", s1_title), ("man", s2_man), ("onslaught", s3_onslaught), ("pause", s_pause), ("slam", s4_slam),
          ("print", s5_print), ("custom", s6_custom), ("real", s7_real), ("end", s8_end)]

# ---------- audio ----------
def read_wav(path):
    with wave.open(path) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        return a.reshape(-1, w.getnchannels()).mean(1)

def env(n, decay): return np.exp(-np.arange(n) / (decay * SR))

def kick(g=1.0):
    n = int(.5 * SR); t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 28)
    return g * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .16)

def snare(g=.5):
    n = int(.25 * SR); t = np.arange(n) / SR
    rng = np.random.default_rng(1)
    return g * (rng.uniform(-1, 1, n) * env(n, .05) * .8 + np.sin(2 * np.pi * 190 * t) * env(n, .04) * .5)

def tom(f0=110, g=.6):
    n = int(.4 * SR); t = np.arange(n) / SR
    return g * np.sin(2 * np.pi * np.cumsum(f0 * (1 + .5 * np.exp(-t * 20))) / SR) * env(n, .12)

def boom(g=1.3):
    n = int(2.5 * SR); t = np.arange(n) / SR
    rng = np.random.default_rng(7)
    low = np.sin(2 * np.pi * np.cumsum(32 + 70 * np.exp(-t * 6)) / SR) * env(n, .6)
    hit = rng.uniform(-1, 1, n) * env(n, .25) * .5
    return g * np.tanh(1.6 * (low + hit))

def squeak(g=.25, f0=1500):
    n = int(.18 * SR); t = np.arange(n) / SR
    f = f0 * (1 + .35 * np.sin(np.pi * t / t[-1])) + 60 * np.sin(2 * np.pi * 28 * t)
    return g * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * t / t[-1]) * .5

def mix(track, clip, at):
    i = int(at * SR)
    if i >= len(track): return
    j = min(len(track), i + len(clip)); track[i:j] += clip[: j - i]

def build_audio(starts, total):
    a = np.zeros(int(total * SR) + SR, np.float32)
    s = starts
    # 1 title: low drone + heartbeat
    t = np.arange(int(s["man"] * SR)) / SR
    a[: len(t)] += .12 * np.sin(2 * np.pi * 41 * t) * np.clip(t / 1.5, 0, 1)
    for x in (0.0, 0.35, 1.3, 1.65):
        if x < s["man"]: mix(a, kick(.55), x)
    # 2 the man's lead-in, original audio
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(MAN_IN), "-t", str(s["onslaught"] - s["man"]), "-i", SRC,
                    "-ac", "1", "-ar", str(SR), f"{WORK}/orig.wav"], check=True)
    mix(a, read_wav(f"{WORK}/orig.wav"), s["man"])
    # 3 onslaught: his "Duck!" x100, pitch + speed climbing, squeak on every repeat, more distortion as it goes,
    #   each repeat cutting off the last; ends dead at the scene cut
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(DUCK_START), "-t", str(DUCK_END - DUCK_START), "-i", SRC,
                    "-ac", "1", "-ar", str(SR), f"{WORK}/duck.wav"], check=True)
    duck = read_wav(f"{WORK}/duck.wav"); duck = duck / max(1e-6, np.abs(duck).max())
    ons = duck_onsets(); f = int(.004 * SR); end = s["pause"]
    for k, o in enumerate(ons):
        r = duck_rate(k); x = k / (DUCK_N - 1)
        v = np.interp(np.arange(0, len(duck) - 1, r), np.arange(len(duck)), duck)
        if k >= 4:
            q = squeak(.35, 1300 * r); v = np.concatenate([v, np.zeros(max(0, len(q) - len(v)))]); v[:len(q)] += q
        v = np.tanh(v * (1 + 5 * x)) * (0.75 + 0.35 * x)
        nxt = ons[k + 1] if k + 1 < len(ons) else end - s["onslaught"]
        v = v[: int((nxt - o) * SR)].copy(); m = min(f, len(v) // 2)
        if m: v[:m] *= np.linspace(0, 1, m); v[-m:] *= np.linspace(1, 0, m)
        mix(a, v, s["onslaught"] + o)
    # pause: silence
    # 4 "Broncos don't" = hit, "duck," = hit, "they BUCK." = boom
    mix(a, kick(.9), s["slam"]); mix(a, snare(.5), s["slam"])
    mix(a, kick(.9), s["slam"] + T["duck_at"] / FPS)
    mix(a, boom(), s["slam"] + T["buck_at"] / FPS); mix(a, kick(1.0), s["slam"] + T["buck_at"] / FPS)
    # 5-7 march groove, 100 bpm
    beat = 60 / 100
    t = s["print"]; b = 0
    while t < s["end"] - .02:
        if b % 4 in (0, 2): mix(a, kick(.8), t)
        if b % 4 in (1, 3): mix(a, snare(.45), t)
        if b % 2 == 1: mix(a, snare(.12), t + beat / 2)
        if b % 16 == 15: [mix(a, tom(130 - 12 * q, .45), t + q * beat / 4) for q in range(4)]
        t += beat; b += 1
    # 8 end card: final hit, then Grandma's "%uck that duck" from the original spot (3.35-4.32 s)
    mix(a, boom(.8), s["end"]); mix(a, kick(1.0), s["end"])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(GRANDMA_LINE[0]), "-t", str(GRANDMA_LINE[1] - GRANDMA_LINE[0]),
                    "-i", SRC, "-ac", "1", "-ar", str(SR), f"{WORK}/grandma.wav"], check=True)
    g = read_wav(f"{WORK}/grandma.wav"); g = g / max(1e-6, np.abs(g).max()) * .95
    f = int(.015 * SR); g[:f] *= np.linspace(0, 1, f); g[-f:] *= np.linspace(1, 0, f)
    at = s["end"] + .55
    i0, i1 = int(at * SR), int(at * SR) + len(g)          # duck the boom tail under her voice
    a[i0:i1] *= .35
    mix(a, g, at)
    a = a[: int(total * SR)]
    a[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))
    a = np.tanh(a * 1.1) / np.tanh(1.1); a *= .89 / max(1e-6, np.abs(a).max())
    with wave.open(f"{WORK}/audio.wav", "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((a * 32767).astype(np.int16).tobytes())

# ---------- main ----------
def main():
    os.makedirs(WORK, exist_ok=True); os.makedirs(FOOT, exist_ok=True)
    random.seed(11)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "18", "-preset", "veryfast",
                            "-pix_fmt", "yuv420p", f"{WORK}/silent.mp4"], stdin=subprocess.PIPE)
    starts, frame = {}, 0
    for name, fn in SCENES:
        starts[name] = frame / FPS
        for im in fn():
            enc.stdin.write(im.tobytes()); frame += 1
        print(f"  {name:10s} {starts[name]:5.2f}s")
    enc.stdin.close(); enc.wait()
    total = frame / FPS
    build_audio(starts, total)
    name = {"full": "buck-commercial-v3", "15": "buck-commercial-v3-15s", "15v": "buck-commercial-v3-15s-9x16"}[VARIANT]
    out = os.path.join(HERE, name + ("-etsy" if ETSY else "") + ".mp4")
    audio = [] if ETSY else ["-i", f"{WORK}/audio.wav", "-c:a", "aac", "-b:a", "192k", "-ac", "2", "-shortest"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{WORK}/silent.mp4", *audio,
                    "-c:v", "libx264", "-crf", "21", "-preset", "slow", "-pix_fmt", "yuv420p",
                    *([] if audio else ["-an"]), "-movflags", "+faststart", out], check=True)
    print(f"wrote {out} ({total:.1f}s)")

if __name__ == "__main__":
    main()
