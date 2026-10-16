import sys
sys.path.insert(0, "marketing/etsy")
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from nameplate import add_nameplate
OUT=sys.argv[1]
W,H=1080,1920; F="scripts/hero/Outfit800.ttf"
GOLD=(234,179,8); WHITE=(250,250,249); GRAY=(168,162,158)
def ctext(d,y,parts,size,W=W):
    f=ImageFont.truetype(F,size); tw=sum(d.textlength(t,font=f) for t,_ in parts); x=(W-tw)/2
    for t,col in parts: d.text((x,y),t,font=f,fill=col); x+=d.textlength(t,font=f)
# top tagline overlay (transparent)
o=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(o)
ctext(d,300,[("Broncos don’t duck,",WHITE)],78); ctext(d,395,[("they buck.",GOLD)],78)
ctext(d,1430,[("%uck",WHITE),("ThatDuck",GOLD)],60)
o.save(OUT+"/overlay.png")
# wordmark card
c=Image.new("RGB",(W,H),(0,0,0)); d=ImageDraw.Draw(c)
ctext(d,800,[("%uck",WHITE),("ThatDuck",GOLD)],150)
ctext(d,990,[("Buck",WHITE),("ThatDuck.com",GOLD)],64)
c.save(OUT+"/wordmark.png")
# end card
c=Image.new("RGB",(W,H),(0,0,0)); d=ImageDraw.Draw(c)
ctext(d,250,[("%uck",WHITE),("ThatDuck",GOLD)],120)
A="public/assets/body/"
for col,x in [("cactus_gray",60),("cyber_orange",560)]:
    im=add_nameplate(Image.open(f"{A}body_{col}_front_regmane_black.png").convert("RGB"))
    s=460/im.width; im=im.resize((460,round(im.height*s)),Image.LANCZOS)
    c.paste(im,(x,460))
y=460+round(1294*460/990)+50
ctext(d,y,[("Bronco Buck ",WHITE),("Classic",GOLD)],84)
ctext(d,y+120,[("The first 100 are individually numbered.",WHITE)],42)
ctext(d,y+190,[("Made in the USA · 11 Bronco colors",GRAY)],38)
ctext(d,y+240,[("Free rubber duck with every Buck",GRAY)],38)
ctext(d,y+330,[("Buck",WHITE),("ThatDuck.com",GOLD)],66)
ctext(d,y+420,[("Link in bio",WHITE)],40)
f=ImageFont.truetype(F,22)
for i,t in enumerate(["Not affiliated with, sponsored, or endorsed by Ford Motor Company.","Bronco® is a trademark of Ford Motor Company."]):
    w=d.textlength(t,font=f); d.text(((W-w)/2,1800+i*30),t,font=f,fill=GRAY)
c.save(OUT+"/endcard.png"); print("end y",y)
