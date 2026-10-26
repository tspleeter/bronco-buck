#!/usr/bin/env python3
"""Bronco Buck commercial v2 — a 16s cut that sells the product.

Run from the repo root:  python3 marketing/commercial-v2/make.py [dash_photo.jpg]

Timeline (1920x1080, 23.976 fps, original commercial audio bed):
  0.00- 5.20  hook: the duck hand-off from the original commercial      captions: "Duck?" (hand-off) then "%uckThatDuck" (grandma's line)
  5.20- 8.20  REAL Buck on a real dash (Todd's photo), slow push-in     caption: "Meet the Bronco Buck."
  8.20-11.20  11 color renders, quick cuts, with nameplate             caption: "Your Bronco's color. Your name on the plate."
 11.20-13.70  real three-Buck photo, slow push-in                      caption: "3D-printed in New Jersey · Free rubber duck"
 13.70-16.70  end card: price, limited run, URL, AI disclaimer

Price on the end card comes from PRICE / LIST_PRICE below (First Edition Sale
ends Nov 13 2026 — set SALE = False and re-run after that).
"""
import os, subprocess, sys, shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.getcwd()
OUT_DIR = os.path.join(ROOT, "marketing/commercial-v2")
WORK = os.path.join(OUT_DIR, "work")
SRC = os.path.join(ROOT, "public/assets/buck-commercial.mp4")
DASH = sys.argv[1] if len(sys.argv) > 1 else os.path.join(OUT_DIR, "dash.jpg")
FONT = os.path.join(ROOT, "scripts/hero/Outfit800.ttf")
W, H, FPS = 1920, 1080, "24000/1001"
BG = (12, 10, 9)
GOLD = (235, 178, 9)
WHITE = (255, 255, 255)

SALE = True
PRICE, LIST_PRICE = "$24.95", "$31.19"

COLORS = [  # order alternates warm/cool/light/dark so quick cuts read as distinct
    ("ruby_red", "Ruby Red"), ("velocity_blue", "Velocity Blue"), ("oxford_white", "Oxford White"),
    ("eruption_green", "Eruption Green"), ("cyber_orange", "Cyber Orange"), ("azure_gray", "Azure Gray"),
    ("shadow_black", "Shadow Black"), ("desert_sand", "Desert Sand"), ("robins_egg_blue", "Robin's Egg Blue"),
    ("cactus_gray", "Cactus Gray"), ("carbonized_gray", "Carbonized Gray"),
]

def font(size):
    return ImageFont.truetype(FONT, size)

def run(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)

def caption_png(path, parts, size=84, sub=None):
    """Transparent 1920x1080 overlay: dark gradient band at the bottom + centered caption.
    parts = [(text, color), ...] drawn on one line."""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    band = Image.new("L", (1, 340))
    for y in range(340):
        band.putpixel((0, y), int(215 * (y / 339) ** 1.4))
    im.paste(Image.new("RGBA", (W, 340), (0, 0, 0, 255)), (0, H - 340), band.resize((W, 340)))
    d = ImageDraw.Draw(im)
    f = font(size)
    total = sum(d.textlength(t, font=f) for t, _ in parts)
    x = (W - total) / 2
    y = H - (190 if sub else 150)
    for t, c in parts:
        d.text((x + 3, y + 4), t, font=f, fill=(0, 0, 0, 160))
        d.text((x, y), t, font=f, fill=c)
        x += d.textlength(t, font=f)
    if sub:
        fs = font(44)
        sw = d.textlength(sub, font=fs)
        d.text(((W - sw) / 2, y + size + 18), sub, font=fs, fill=(230, 225, 215))
    im.save(path)

def cover(im, w, h):
    s = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((l, t, l + w, t + h))

def pushin(still, cap, out, dur, z1=1.10, cx=0.5, cy=0.5):
    """Slow push-in on a 1920x1080 still (rendered at 2x for smooth zoompan) + caption overlay."""
    n = round(dur * 24000 / 1001)
    zp = (f"zoompan=z='1+({z1}-1)*on/{n}':d={n}:s={W}x{H}:fps={FPS}:"
          f"x='({cx})*iw-iw/zoom/2':y='({cy})*ih-ih/zoom/2'")
    run("-loop", "1", "-i", still, "-i", cap, "-filter_complex",
        f"[0:v]scale={W*2}:{H*2},{zp}[v];[v][1:v]overlay=0:0,format=yuv420p",
        "-frames:v", str(n), "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", out)

def main():
    os.makedirs(WORK, exist_ok=True)
    seg = lambda i: os.path.join(WORK, f"seg{i}.mp4")

    # 1 — hook from the original commercial
    caption_png(f"{WORK}/cap1a.png", [("Duck?", WHITE)], size=110)
    caption_png(f"{WORK}/cap1b.png", [("%uck", WHITE), ("ThatDuck", GOLD)], size=110)
    run("-i", SRC, "-i", f"{WORK}/cap1a.png", "-i", f"{WORK}/cap1b.png", "-t", "5.2", "-filter_complex",
        "[0:v][1:v]overlay=0:0:enable='between(t,1.75,4.25)'[a];"
        "[a][2:v]overlay=0:0:enable='gte(t,4.25)',format=yuv420p", "-an",
        "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", seg(1))

    # 2 — the real Buck on a real dash
    dash = Image.open(DASH).convert("RGB")
    cover(dash, W * 2, H * 2).save(f"{WORK}/dash169.jpg", quality=95)
    caption_png(f"{WORK}/cap2.png", [("Meet the ", WHITE), ("Bronco Buck.", GOLD)],
                sub="A real 3D-printed dash buddy. Duck included.")
    pushin(f"{WORK}/dash169.jpg", f"{WORK}/cap2.png", seg(2), 3.0, z1=1.12, cx=0.45, cy=0.52)

    # 3 — 11 colors, quick cuts
    cap3 = Image.open(_cap3()).convert("RGBA")
    fdir = os.path.join(WORK, "colors"); shutil.rmtree(fdir, ignore_errors=True); os.makedirs(fdir)
    for i, (slug, name) in enumerate(COLORS):
        fr = Image.new("RGB", (W, H), BG)
        r = Image.open(f"{ROOT}/public/assets/product/{slug}.webp").convert("RGB")
        r = r.resize((round(r.width * 760 / r.height), 760), Image.LANCZOS)
        fr.paste(r, ((W - r.width) // 2, 40))
        fr = Image.alpha_composite(fr.convert("RGBA"), cap3)
        d = ImageDraw.Draw(fr); fl = font(40)
        d.text((W - 60 - d.textlength(name, font=fl), 60), name, font=fl, fill=GOLD)
        fr.convert("RGB").save(f"{fdir}/{i:02d}.png")
    per = 3.0 / len(COLORS)
    run("-framerate", f"1/{per}", "-i", f"{fdir}/%02d.png", "-vf", f"fps={FPS},format=yuv420p",
        "-t", "3.0", "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", seg(3))

    # 4 — real three-Buck photo
    trio = Image.open(f"{ROOT}/public/assets/product/gifts-trio-v1.webp").convert("RGB")
    t = Image.new("RGB", (W * 2, H * 2), BG)
    tr = trio.resize((1560, 1560), Image.LANCZOS)  # leave the bottom third for the caption
    t.paste(tr, ((W * 2 - tr.width) // 2, 40))
    t.save(f"{WORK}/trio169.jpg", quality=95)
    caption_png(f"{WORK}/cap4.png", [("3D-printed in ", WHITE), ("New Jersey", GOLD)],
                sub="Free rubber duck in every box")
    pushin(f"{WORK}/trio169.jpg", f"{WORK}/cap4.png", seg(4), 2.5, z1=1.06, cy=0.40)

    # 5 — end card
    _endcard(f"{WORK}/end.png")
    run("-loop", "1", "-i", f"{WORK}/end.png", "-vf", f"fps={FPS},format=yuv420p", "-t", "3.0",
        "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", seg(5))

    # concat + original audio bed, faded out
    with open(f"{WORK}/list.txt", "w") as fh:
        fh.writelines(f"file '{seg(i)}'\n" for i in range(1, 6))
    run("-f", "concat", "-safe", "0", "-i", f"{WORK}/list.txt", "-i", SRC,
        "-map", "0:v", "-map", "1:a", "-af", "afade=t=out:st=15.4:d=1.3", "-t", "16.7",
        "-c:v", "libx264", "-crf", "22", "-preset", "slow", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart",
        os.path.join(OUT_DIR, "buck-commercial-v2.mp4"))
    print("wrote", os.path.join(OUT_DIR, "buck-commercial-v2.mp4"))

def _cap3():
    p = f"{WORK}/cap3.png"
    caption_png(p, [("Your Bronco's color. ", WHITE), ("Your name on the plate.", GOLD)], size=70)
    return p

def _endcard(path):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    def center(text, y, f, fill):
        d.text(((W - d.textlength(text, font=f)) / 2, y), text, font=f, fill=fill)
    # wordmark: %uck white + ThatDuck gold
    fw = font(120); a, b = "%uck", "ThatDuck"
    x = (W - d.textlength(a + b, font=fw)) / 2
    d.text((x, 110), a, font=fw, fill=WHITE); d.text((x + d.textlength(a, font=fw), 110), b, font=fw, fill=GOLD)
    center("Bronco Buck Classic  ·  Limited to 100, numbered", 290, font(52), WHITE)
    fp = font(150)
    if SALE:
        ls = font(70); gap = 40
        pw, lw = d.textlength(PRICE, font=fp), d.textlength(LIST_PRICE, font=ls)
        x0 = (W - pw - gap - lw) / 2
        d.text((x0, 400), PRICE, font=fp, fill=GOLD)
        lx, ly = x0 + pw + gap, 460
        d.text((lx, ly), LIST_PRICE, font=ls, fill=(150, 145, 135))
        d.line((lx, ly + 48, lx + lw, ly + 48), fill=(150, 145, 135), width=6)
    else:
        center(LIST_PRICE, 400, fp, GOLD)
    center("BuckThatDuck.com", 640, font(96), WHITE)
    center("Free rubber duck  ·  Ships in 3–5 days  ·  Made in the USA", 790, font(44), (220, 214, 200))
    fd = font(24)
    center("Commercial characters are AI-generated. Product photos are real Bucks.", 990, fd, (120, 115, 105))
    center("Not affiliated with Ford Motor Company. Bronco® is a trademark of Ford Motor Company.", 1022, fd, (120, 115, 105))
    im.save(path)

if __name__ == "__main__":
    main()
