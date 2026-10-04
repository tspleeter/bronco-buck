from PIL import Image, ImageOps, ImageEnhance, ImageFilter, ImageDraw, ImageFont, ImageChops
import numpy as np, math
from scipy import ndimage
W=H=1400; BG=(12,10,9)
# --- cutout
src=ImageOps.exif_transpose(Image.open('source.jpg')).convert('RGB')
m2=Image.open('cut_c.png').split()[3]; a=np.array(m2); ys,xs=np.where(a>20)
lb=(xs.min()-30,ys.min()-30,xs.max()+30,ys.max()+30); k=src.width/m2.width
c=src.crop(tuple(int(round(v*k)) for v in lb))
c=ImageEnhance.Contrast(c).enhance(1.06); c=ImageEnhance.Color(c).enhance(1.08)
c=c.filter(ImageFilter.UnsharpMask(radius=2,percent=60,threshold=3))
m=np.array(m2.crop(lb)); f=ndimage.binary_fill_holes(m>128); m=np.maximum(m,(f*255).astype(np.uint8))
M=Image.fromarray(m).resize(c.size,Image.LANCZOS).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(1.5))
buck=c.convert('RGBA'); buck.putalpha(M); buck=buck.crop(buck.getbbox())
bh=760; buck=buck.resize((int(buck.width*bh/buck.height),bh),Image.LANCZOS)
# --- background
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
rng=np.random.default_rng(7)
_bg=Image.open('ranch_bg.png').convert('RGB').filter(ImageFilter.GaussianBlur(2.2))  # soft focus: keep eyes on the Buck
img=np.array(_bg).astype(np.float32)
# mute the ranch: desaturate, flatten contrast, wash toward a dusty haze
MUTE_SAT,MUTE_CONTRAST,HAZE=0.20,0.65,0.25
lum=(img@np.array([0.299,0.587,0.114],np.float32))[...,None]
img=lum+(img-lum)*MUTE_SAT
img=128+(img-128)*MUTE_CONTRAST
img=img*(1-HAZE)+np.array([170,140,104],np.float32)*HAZE
img*=np.array([1.06,0.96,0.80],np.float32)  # warm sepia tone: contrasts the gray Buck
img*=0.70  # darken so the Buck pops
# --- hill
R=1150; cx,cy=700,880+R
d=np.sqrt((xx-cx)**2+(yy-cy)**2); inside=d<=R
depth=np.clip((yy-880)/520,0,1)
hill=np.stack([92-60*depth,56-38*depth,34-24*depth],-1)
tex=ndimage.gaussian_filter(rng.normal(0,1,(H,W)),1.2)*5
hill+=tex[...,None]
strata=np.sin((R-d)/14+ndimage.gaussian_filter(rng.normal(0,1,(H,W)),25)*30)*3.5
hill+=strata[...,None]
img=np.where(inside[...,None],hill,img)
rim=np.exp(-((d-R)/3.5)**2)*(np.clip(1-np.abs(xx-700)/760,0,1)**1.3)
img+=rim[...,None]*np.array([210,150,30],np.float32)
glow=np.exp(-np.clip(R-d,0,None)/60)*inside*(np.clip(1-np.abs(xx-700)/700,0,1)**2)
img+=glow[...,None]*np.array([60,40,6],np.float32)
# bottom/side vignette into page bg
v=np.zeros_like(yy)
img=img*(1-v[...,None])+np.array(BG)*v[...,None]
canvas=Image.fromarray(np.clip(img,0,255).astype(np.uint8)).convert('RGBA')
# --- contact shadow + buck
sh=Image.new('L',(W,H),0); ImageDraw.Draw(sh).ellipse((700-330,880-30,700+330,880+34),fill=190)
sh=sh.filter(ImageFilter.GaussianBlur(22))
canvas=Image.composite(Image.new('RGBA',(W,H),(0,0,0,255)),canvas,sh)
bx=700-buck.width//2+40; by=880-bh+14
canvas.alpha_composite(buck,(bx,by))
# --- arc text
font_path='Outfit800.ttf'
def arc_text(img,text,size,radius,color,track=-0.02):
    fnt=ImageFont.truetype(font_path,size)
    adv=[fnt.getlength(ch)+track*size for ch in text]; total=sum(adv)-track*size
    ang=-total/2/radius
    for ch,av in zip(text,adv):
        mid=ang+(av/2)/radius
        tile=Image.new('RGBA',(size*2,size*2),(0,0,0,0)); dr=ImageDraw.Draw(tile)
        dr.text((size,size),ch,font=fnt,fill=color,anchor='ms')
        sh=Image.new('RGBA',tile.size,(0,0,0,0)); ImageDraw.Draw(sh).text((size,size+5),ch,font=fnt,fill=(0,0,0,170),anchor='ms')
        sh=sh.filter(ImageFilter.GaussianBlur(5))
        for t in (sh,tile):
            r=t.rotate(-math.degrees(mid),resample=Image.BICUBIC)
            px=cx+radius*math.sin(mid); py=cy-radius*math.cos(mid)
            img.alpha_composite(r,(int(px-size),int(py-size)))
        ang+=av/radius
arc_text(canvas,"Broncos don’t duck,",88,R-120,(250,250,249,255))
arc_text(canvas,"they buck.",132,R-265,(234,179,8,255))
canvas.convert('RGB').save('hero-hill.png',optimize=True)
canvas.convert('RGB').resize((700,700)).save('hill_prev.jpg',quality=90)
