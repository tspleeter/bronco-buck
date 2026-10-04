from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
base=Image.open('hero-hill.png').convert('RGBA'); A=np.array(base).astype(int)
S=4  # supersample
x0,y0,x1,y1=579,725,1023,880; w,h=x1-x0,y1-y0
pl=Image.new('RGBA',(w*S,h*S),(0,0,0,0)); d=ImageDraw.Draw(pl)
d.rounded_rectangle((0,0,w*S-1,h*S-1),radius=5*S,fill=(24,22,25,255))
# subtle vertical lighting + texture
arr=np.array(pl).astype(np.float32)
yy=np.linspace(0,1,h*S)[:,None]
shade=1.18-0.30*yy
arr[...,:3]*=shade[...,None]
arr[...,:3]+=np.random.default_rng(1).normal(0,1.6,(h*S,w*S))[...,None]
pl=Image.fromarray(np.clip(arr,0,255).astype(np.uint8))
d=ImageDraw.Draw(pl)
d.rounded_rectangle((0,0,w*S-1,h*S-1),radius=5*S,outline=(70,66,68,255),width=2*S)  # edge catch-light
d.line((6*S,1*S,w*S-6*S,1*S),fill=(110,105,105,255),width=S)
f=ImageFont.truetype('Outfit800.ttf',100)
t1,t2='%uck','ThatDuck'; tr=-0.02
def L(t,f): return f.getlength(t)+tr*f.size*(len(t)-1)
size=int(100*(w*0.88)/(L(t1,f)+L(t2,f))); f=ImageFont.truetype('Outfit800.ttf',size*S)
tw=L(t1,f)+L(t2,f); x=(w*S-tw)/2; ycap=h*S*0.5
def draw(t,col,x):
    for ch in t:
        d.text((x,ycap),ch,font=f,fill=col,anchor='lm'); x+=f.getlength(ch)+tr*f.size
    return x
x=draw(t1,(236,234,231,255),x); draw(t2,(208,154,92,255),x)
pl=pl.resize((w,h),Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
out=base.copy(); out.alpha_composite(pl,(x0,y0))
# restore duck where it overlaps the plate's top-left
O=np.array(out); reg=(slice(y0,y0+45),slice(x0,x0+80))
a=A[reg]; duck=(a[...,0]>150)&(a[...,1]>95)&(a[...,0]-a[...,2]>70)
from scipy import ndimage
duck=ndimage.binary_opening(duck,iterations=1)
O[reg][duck]=A[reg][duck]
out=Image.fromarray(O.astype(np.uint8))
out.convert('RGB').save('hero-hill-plate.png',optimize=True)
out.crop((480,620,1100,920)).save('plate_zoom.png')
out.convert('RGB').resize((700,700)).save('plate_prev.jpg',quality=90)
print(size)
