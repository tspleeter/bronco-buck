"""Etsy listing video: 12s, 1080x1350, silent. Real product renders only."""
import subprocess, sys
from PIL import Image, ImageDraw, ImageFont

A = "public/assets/body/"  # run from repo root
FONT = "scripts/hero/Outfit800.ttf"
OUT = sys.argv[1]
W, H, FPS = 1080, 1350, 30
BG = (84, 85, 90)          # render background gray
DARK = (12, 10, 9)         # site #0C0A09
GOLD = (235, 178, 9)       # #EBB209 nameplate gold

def card(path):
    im = Image.open(path).convert("RGB")
    th = H - 190
    s = th / im.height
    im = im.resize((round(im.width * s), th), Image.LANCZOS)
    c = Image.new("RGB", (W, H), BG)
    c.paste(im, ((W - im.width) // 2, 190))
    return c

def label(img, text):
    img = img.copy()
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(FONT, 54)
    w = d.textlength(text, font=f)
    d.rounded_rectangle([(W - w) / 2 - 28, 50, (W + w) / 2 + 28, 140], 45, fill=(12, 10, 9))
    d.text(((W - w) / 2, 62), text, font=f, fill=(250, 250, 249))
    return img

def endcard():
    c = Image.new("RGB", (W, H), DARK)
    d = ImageDraw.Draw(c)
    f = ImageFont.truetype(FONT, 120)
    a, b = "%uck", "ThatDuck"
    wa, wb = d.textlength(a, font=f), d.textlength(b, font=f)
    x = (W - wa - wb) / 2
    d.text((x, 520), a, font=f, fill=(250, 250, 249))
    d.text((x + wa, 520), b, font=f, fill=GOLD)
    f2 = ImageFont.truetype(FONT, 52)
    for i, (t, col) in enumerate([("Broncos don’t duck,", (250, 250, 249)), ("they buck.", GOLD)]):
        w = d.textlength(t, font=f2)
        d.text(((W - w) / 2, 720 + i * 66), t, font=f2, fill=col)
    f3 = ImageFont.truetype(FONT, 40)
    t = "11 colors · Free rubber duck with every order"
    w = d.textlength(t, font=f3)
    d.text(((W - w) / 2, 920), t, font=f3, fill=(168, 162, 158))
    return c

# Segment list: (image, hold_seconds). Crossfade 0.25s between each.
segs = []
# Real product photo first (gray Buck = Carbonized Gray, sold as "Dark Gray")
real = Image.open("marketing/etsy/00_real_buck_duck.jpg").convert("RGB").resize((W, H), Image.LANCZOS)
segs.append((label(real, "Dark Gray"), 1.8))
for v in ["front", "right", "back", "left", "front"]:
    segs.append((label(card(f"{A}body_ruby_red_{v}_regmane_white.png"), "Deep Red"), 0.5))
colors = [("velocity_blue", "white", "Bold Blue"), ("shadow_black", "white", "Black"),
          ("eruption_green", "white", "Forest Green"), ("oxford_white", "black", "White"),
          ("cyber_orange", "white", "Bright Orange"), ("carbonized_gray", "white", "Dark Gray"),
          ("cactus_gray", "black", "Sage Gray"), ("desert_sand", "black", "Sand Tan"),
          ("azure_gray", "black", "Slate Blue"), ("robins_egg_blue", "black", "Robin Blue")]
for c, m, name in colors:
    segs.append((label(card(f"{A}body_{c}_front_regmane_{m}.png"), name), 0.45))
segs.append((endcard(), 1.5))

XF = int(0.25 * FPS)
p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                      "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-an",
                      "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
                      "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
frames = 0
for i, (img, hold) in enumerate(segs):
    for _ in range(int(hold * FPS)):
        p.stdin.write(img.tobytes()); frames += 1
    if i + 1 < len(segs):
        nxt = segs[i + 1][0]
        for k in range(1, XF + 1):
            p.stdin.write(Image.blend(img, nxt, k / (XF + 1)).tobytes()); frames += 1
p.stdin.close(); p.wait()
print(frames / FPS, "seconds")
