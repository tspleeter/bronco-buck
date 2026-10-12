"""Draw the %uckThatDuck nameplate onto a 990x1294 FRONT body render.

Matches the site's BuilderPreview overlay: plate box top 76.5% / left 10.5% /
width 78.8% / height 18.0%, #111 fill, white border, "%uck" white +
"ThatDuck" gold (#EBB209), Outfit 800, text ~86% of plate width.
Run from the repo root.
"""
from PIL import Image, ImageDraw, ImageFont

FONT = "scripts/hero/Outfit800.ttf"
GOLD = (235, 178, 9)


def add_nameplate(img: Image.Image) -> Image.Image:
    img = img.convert("RGB").copy()
    W, H = img.size
    x0, y0 = round(W * 0.105), round(H * 0.765)
    pw, ph = round(W * 0.788), round(H * 0.180)
    d = ImageDraw.Draw(img)
    border = max(3, round(W * 0.006))
    d.rectangle([x0, y0, x0 + pw, y0 + ph], fill=(17, 17, 17), outline=(255, 255, 255), width=border)
    a, b = "%uck", "ThatDuck"
    target = pw * 0.86
    size = 100
    f = ImageFont.truetype(FONT, size)
    total = d.textlength(a + b, font=f)
    size = int(size * target / total)
    f = ImageFont.truetype(FONT, size)
    wa, wb = d.textlength(a, font=f), d.textlength(b, font=f)
    l, t, r, btm = d.textbbox((0, 0), a + b, font=f)
    x = x0 + (pw - (wa + wb)) / 2
    y = y0 + (ph - (btm - t)) / 2 - t
    d.text((x, y), a, font=f, fill=(255, 255, 255))
    d.text((x + wa, y), b, font=f, fill=GOLD)
    return img


if __name__ == "__main__":
    import sys
    from pathlib import Path
    out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    order = [("ruby_red", "white"), ("velocity_blue", "white"), ("shadow_black", "white"),
             ("eruption_green", "white"), ("oxford_white", "black"), ("cyber_orange", "white"),
             ("carbonized_gray", "white"), ("cactus_gray", "black"), ("desert_sand", "black"),
             ("azure_gray", "black"), ("robins_egg_blue", "black")]
    for i, (c, m) in enumerate(order, 1):
        im = add_nameplate(Image.open(f"public/assets/body/body_{c}_front_regmane_{m}.png"))
        im.save(out / f"{i:02d}_{c}.jpg", quality=92)
