#!/usr/bin/env python3
"""Bronco Buck commercial v3: "Broncos don't duck, they buck." A rally cry to Bronco owners.

Run from the repo root:  python3 marketing/commercial-v3/make.py
Output: marketing/commercial-v3/buck-commercial-v3.mp4 (1920x1080, 30 fps, ~30 s)

Story
  1  Bronco owners. We have a problem.             (title)
  2  It started with one duck... now everywhere.   (duck footage from the original spot, its own audio)
  3  The ducks are multiplying.                    (duck footage tiles 1 -> 4 -> 16 -> 64, squeaks)
  4  Enough.  Broncos don't duck, they BUCK.    (slam)
  5  Every Buck is 3D-printed, layer by layer.     (print-reveal animation  | SLOT footage/print.mp4)
  6  Your color. Your mane. Your name.             (11 colors, 4 manes, nameplate typing)
  7  This isn't CGI. These are real Bucks.         (real photos            | SLOT footage/real.mp4)
  8  Join the resistance. End card.

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
W, H, FPS, SR = 1920, 1080, 30, 48000
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

_fonts = {}
def font(n):
    if n not in _fonts: _fonts[n] = ImageFont.truetype(FONT, n)
    return _fonts[n]

def body(color, view="front", style="regmane", mane="black"):
    return Image.open(f"{ROOT}/public/assets/body/body_{color}_{view}_{style}_{mane}.png").convert("RGB")

# ---------- drawing helpers ----------
def text_parts(d, parts, y, size, cx=W / 2, shadow=True):
    f = font(size)
    x = cx - sum(d.textlength(t, font=f) for t, _ in parts) / 2
    for t, c in parts:
        if shadow: d.text((x + 3, y + 4), t, font=f, fill=(0, 0, 0))
        d.text((x, y), t, font=f, fill=c)
        x += d.textlength(t, font=f)

_band = None
def caption(img, parts, size=84, sub=None):
    """Bottom gradient band + one-line caption (+ optional subline). Returns RGB."""
    global _band
    if _band is None:
        a = np.linspace(0, 1, 360) ** 1.4 * 215
        _band = Image.fromarray(np.repeat(a[:, None], W, 1).astype("uint8"), "L")
    img = img.copy()
    img.paste((0, 0, 0), (0, H - 360), _band)
    d = ImageDraw.Draw(img)
    y = H - (200 if sub else 150)
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
def read_video(path, start, dur, blur_fill=False):
    """Yield PIL frames (W x H, FPS) from a clip segment."""
    vf = (f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}" if not blur_fill else
          f"fps={FPS},split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=30,"
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

def slot(name, nframes, fallback):
    path = os.path.join(FOOT, name)
    if not os.path.exists(path):
        return fallback
    print("  using footage", name)
    def gen(i_frame_of):
        frames = list(read_video(path, 0, nframes / FPS + 0.2, blur_fill=True))[:nframes]
        while len(frames) < nframes: frames.append(frames[-1])
        for i, f in enumerate(frames): yield i_frame_of(i, f)
    return gen

# ---------- scenes (each yields exactly n frames) ----------
def s1_title(n=75):
    for i in range(n):
        im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
        a = ease(i / 12)
        text_parts(d, [("Bronco owners.", tuple(int(c * a) for c in WHITE))], 380, 140, shadow=False)
        if i >= 35:
            b = ease((i - 35) / 10)
            text_parts(d, [("We have a ", tuple(int(c * b) for c in WHITE)), ("duck", tuple(int(c * b) for c in GOLD)),
                           (" problem.", tuple(int(c * b) for c in WHITE))], 570, 84, shadow=False)
        yield im

def s2_ducks(n=108):   # original spot 1.6s -> 5.2s (hand-off, grandma, shocked guy)
    caps = [(0, [("It started with ", WHITE), ("one duck.", GOLD)]),
            (40, [("Then ", WHITE), ("another.", GOLD)]),
            (75, [("Now they're ", WHITE), ("everywhere.", GOLD)])]
    for i, fr in enumerate(read_video(SRC, 1.6, n / FPS + 0.1)):
        if i >= n: break
        parts = [c for s, c in caps if i >= s][-1]
        yield caption(fr, parts)

def s3_onslaught(n=66):
    srcs = [next(read_video(SRC, t, 0.05)) for t in (2.2, 3.7, 4.6, 2.9, 4.9)]
    tiles = {}
    levels = [1, 2, 4, 8, 16]
    for i in range(n):
        k = levels[min(i // 13, len(levels) - 1)]
        if k not in tiles:
            tw, th = W // k, H // k
            small = [s.resize((tw, th), Image.BILINEAR) for s in srcs]
            g = Image.new("RGB", (W, H))
            rnd = random.Random(k)
            for r in range(k):
                for c in range(k):
                    g.paste(small[rnd.randrange(len(small))], (c * tw, r * th))
            tiles[k] = g
        im = zoom(tiles[k], 1 + 0.04 * ((i % 13) / 13))
        yield caption(im, [("The ducks are ", WHITE), ("multiplying.", GOLD)])

def s4_slam(n=84):
    for i in range(n):
        im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
        if i < 30:
            text_parts(d, [("Enough.", WHITE)], 440, 150, shadow=False)
            yield im; continue
        j = i - 30
        text_parts(d, [("Broncos don't duck,", WHITE)], 230, 120, shadow=False)
        if j >= 14:
            k = j - 14
            sz = int(260 * (1 + 0.35 * max(0, 1 - k / 4)))         # punches in
            dx = int(random.uniform(-1, 1) * 18 * max(0, 1 - k / 10))
            dy = int(random.uniform(-1, 1) * 18 * max(0, 1 - k / 10))
            f = font(sz); tw = d.textlength("they BUCK.", font=f)
            d.text(((W - tw) / 2 + dx, 440 - (sz - 260) * 0.6 + dy), "they BUCK.", font=f, fill=GOLD)
        yield im

def s5_print(n=135):
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
    real = slot("print.mp4", n, None)
    if real:
        yield from real(lambda i, f: caption(f, cap[0], sub=cap[1]))
    else:
        for i in range(n): yield caption(graphic(i), cap[0], sub=cap[1])

def plate(img, text, full=None):
    """Custom nameplate (white text on black, white border) on a 990x1294 front render."""
    img = img.copy(); w, h = img.size
    x0, y0, pw, ph = round(w * .105), round(h * .765), round(w * .788), round(h * .180)
    d = ImageDraw.Draw(img)
    d.rectangle([x0, y0, x0 + pw, y0 + ph], fill=(17, 17, 17), outline=WHITE, width=6)
    if text:
        full = full or text   # size from the whole name so typing doesn't resize it
        size = min(int(ph * .60), int(100 * pw * .86 / d.textlength(full, font=font(100))))
        f = font(size); l, t, rr, b = d.textbbox((0, 0), full, font=f)
        x = x0 + (pw - (rr - l)) / 2 - l
        d.text((x, y0 + (ph - (b - t)) / 2 - t), text, font=f, fill=WHITE)
    return img

def on_stage(r, label=None):
    im = Image.new("RGB", (W, H), BG)
    rh = 760; r = r.resize((round(r.width * rh / r.height), rh), Image.LANCZOS)
    im.paste(r, ((W - r.width) // 2, 40))
    if label:
        d = ImageDraw.Draw(im); f = font(44)
        d.text((W - 70 - d.textlength(label, font=f), 70), label, font=f, fill=GOLD)
    return im

def s6_custom():
    # a) colors — 66 frames, 6 each
    imgs = [on_stage(body(c, mane=m), name) for c, name, m in COLORS]
    for i in range(66):
        yield caption(imgs[min(i // 6, 10)], [("Your Bronco's ", WHITE), ("color.", GOLD)])
    # b) manes — 48 frames, 12 each
    manes = [("regmane", "black", "Regular · Black"), ("longmane", "black", "Long · Black"),
             ("regmane", "white", "Regular · White"), ("longmane", "white", "Long · White")]
    imgs = [on_stage(body("cyber_orange", style=s, mane=m), lab) for s, m, lab in manes]
    for i in range(48):
        yield caption(imgs[i // 12], [("Your ", WHITE), ("mane.", GOLD)])
    # c) nameplate typing — 78 frames
    base = body("ruby_red", mane="white")
    seq = []
    for nm in NAMES:
        seq += [(nm[:k], nm) for k in range(1, len(nm) + 1) for _ in range(2)] + [(nm, nm)] * (10 if nm != NAMES[-1] else 30)
    seq = (seq + [(NAMES[-1], NAMES[-1])] * 78)[:78]
    cache = {}
    for i, key in enumerate(seq):
        if key not in cache: cache[key] = on_stage(plate(base, *key), "Custom nameplate")
        yield caption(cache[key], [("Your ", WHITE), ("name on the plate.", GOLD)])

def s7_real(n=150):
    cap = [("This isn't CGI. ", WHITE), ("These are real Bucks.", GOLD)]
    real = slot("real.mp4", n, None)
    if real:
        yield from real(lambda i, f: caption(f, cap, sub="3D-printed, hand-finished, shipped to your door."))
        return
    shots = [(fit_blur(Image.open(f"{ROOT}/marketing/etsy/00_real_buck_duck.jpg").convert("RGB")), "A real 3D-printed Buck."),
             (cover(Image.open(DASH).convert("RGB")), "On a real Bronco dash."),
             (fit_blur(Image.open(f"{ROOT}/public/assets/product/gifts-trio-v1.webp").convert("RGB")), "Free rubber duck in every box.")]
    per = n // len(shots)
    for i in range(n):
        k = min(i // per, len(shots) - 1); img, sub = shots[k]
        yield caption(zoom(img, 1 + 0.06 * ((i - k * per) / per), cy=0.45), cap, size=76, sub=sub)

def s8_end(n=120):
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    text_parts(d, [("Join the resistance.", WHITE)], 70, 72, shadow=False)
    text_parts(d, [("%uck", WHITE), ("ThatDuck", GOLD)], 175, 150, shadow=False)
    text_parts(d, [("Bronco Buck Classic  ·  First 100 numbered with a certificate", (225, 220, 208))], 375, 48, shadow=False)
    fp, fl = font(150), font(70)
    if SALE:
        pw, lw = d.textlength(PRICE, font=fp), d.textlength(LIST_PRICE, font=fl)
        x = (W - pw - 40 - lw) / 2
        d.text((x, 460), PRICE, font=fp, fill=GOLD)
        d.text((x + pw + 40, 520), LIST_PRICE, font=fl, fill=DIM)
        d.line((x + pw + 40, 568, x + pw + 40 + lw, 568), fill=DIM, width=6)
    else:
        text_parts(d, [(LIST_PRICE, GOLD)], 460, 150, shadow=False)
    text_parts(d, [("BuckThatDuck.com", WHITE)], 690, 100, shadow=False)
    text_parts(d, [("Real 3D-printed figurines  ·  Free rubber duck  ·  Made in the USA", (215, 208, 195))], 835, 42, shadow=False)
    small = (120, 115, 105)
    text_parts(d, [("Duck scenes feature AI-generated characters. Buck photos are real products.", small)], 975, 26, shadow=False)
    text_parts(d, [("Not affiliated with Ford Motor Company. Bronco® is a trademark of Ford Motor Company.", small)], 1012, 26, shadow=False)
    for i in range(n):
        a = ease(i / 10)
        yield im if a >= 1 else Image.blend(Image.new("RGB", (W, H), BG), im, a)

SCENES = [("title", s1_title), ("ducks", s2_ducks), ("onslaught", s3_onslaught), ("slam", s4_slam),
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
    t = np.arange(int(s["ducks"] * SR)) / SR
    a[: len(t)] += .12 * np.sin(2 * np.pi * 41 * t) * np.clip(t / 1.5, 0, 1)
    for x in (0.0, 0.35, 1.3, 1.65): mix(a, kick(.55), x)
    # 2 original spot audio (grandma's line) for the duck footage
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "1.6", "-t", str(s["onslaught"] - s["ducks"]), "-i", SRC,
                    "-ac", "1", "-ar", str(SR), f"{WORK}/orig.wav"], check=True)
    o = read_wav(f"{WORK}/orig.wav"); o[-int(.25 * SR):] *= np.linspace(1, 0, int(.25 * SR))
    mix(a, o * 1.0, s["ducks"])
    # 3 onslaught: squeaks doubling + tom roll crescendo
    rnd = random.Random(3)
    for lvl in range(5):
        t0 = s["onslaught"] + lvl * 13 / FPS
        for q in range(2 ** lvl):
            mix(a, squeak(.18, rnd.uniform(1100, 2200)), t0 + rnd.uniform(0, 12 / FPS))
    k = 0; t = s["onslaught"]
    while t < s["slam"] - .05:
        mix(a, tom(95 + 6 * k, .25 + .5 * (t - s["onslaught"]) / (s["slam"] - s["onslaught"])), t)
        t += max(.06, .22 - .015 * k); k += 1
    # 4 "Enough." = hit then silence, "they BUCK." = boom
    mix(a, kick(1.0), s["slam"]); mix(a, snare(.6), s["slam"])
    mix(a, boom(), s["slam"] + 44 / FPS)
    # 5-7 march groove, 100 bpm
    beat = 60 / 100
    t = s["print"]; b = 0
    while t < s["end"] - .02:
        if b % 4 in (0, 2): mix(a, kick(.8), t)
        if b % 4 in (1, 3): mix(a, snare(.45), t)
        if b % 2 == 1: mix(a, snare(.12), t + beat / 2)
        if b % 16 == 15: [mix(a, tom(130 - 12 * q, .45), t + q * beat / 4) for q in range(4)]
        t += beat; b += 1
    # 8 end card: final boom, then let it ring
    mix(a, boom(1.1), s["end"]); mix(a, kick(1.0), s["end"])
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
    out = os.path.join(HERE, "buck-commercial-v3.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{WORK}/silent.mp4", "-i", f"{WORK}/audio.wav",
                    "-c:v", "libx264", "-crf", "21", "-preset", "slow", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", "-ac", "2", "-movflags", "+faststart", "-shortest", out], check=True)
    print(f"wrote {out} ({total:.1f}s)")

if __name__ == "__main__":
    main()
