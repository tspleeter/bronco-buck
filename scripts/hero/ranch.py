from PIL import Image, ImageDraw, ImageFilter
import numpy as np, math
W=H=1400; S=2; w,h=W*S,H*S
OL=(28,18,12,255); ow=5*S
yy,xx=np.mgrid[0:h,0:w].astype(np.float32)
# sky: dusk top -> warm orange horizon
t=np.clip(yy/(860*S),0,1)[...,None]
top=np.array([52,120,196]); mid=np.array([102,170,226]); hor=np.array([196,226,240])
sky=np.where(t<0.6, top+(mid-top)*(t/0.6), mid+(hor-mid)*((t-0.6)/0.4))
img=Image.fromarray(sky.astype(np.uint8)).convert('RGBA'); d=ImageDraw.Draw(img)
# sun (top-right, away from the duck)
sx,sy,sr=1215*S,170*S,72*S
glow=Image.new('RGBA',(w,h),(0,0,0,0)); ImageDraw.Draw(glow).ellipse((sx-sr*2.2,sy-sr*2.2,sx+sr*2.2,sy+sr*2.2),fill=(255,250,220,110))
img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(40*S)))
d=ImageDraw.Draw(img)
d.ellipse((sx-sr,sy-sr,sx+sr,sy+sr),fill=(255,226,110,255),outline=OL,width=ow)
# clouds
def cloud(cx,cy,s_):
    L=Image.new('RGBA',(w,h),(0,0,0,0)); cd=ImageDraw.Draw(L)
    blobs=[(-70,10,46),(-20,-18,60),(40,-8,52),(85,14,38),(0,20,50)]
    for dx,dy,r in blobs:
        x,y,rr=(cx+dx*s_)*S,(cy+dy*s_)*S,r*s_*S; cd.ellipse((x-rr-ow,y-rr-ow,x+rr+ow,y+rr+ow),fill=OL)
    for dx,dy,r in blobs:
        x,y,rr=(cx+dx*s_)*S,(cy+dy*s_)*S,r*s_*S; cd.ellipse((x-rr,y-rr,x+rr,y+rr),fill=(250,252,255,255))
    cut=(cy+40*s_)*S
    cd.rectangle((0,cut+ow,w,h),fill=(0,0,0,0))
    cd.rectangle(((cx-122*s_)*S,cut,(cx+130*s_)*S,cut+ow),fill=OL)
    m=L.split()[3]; bb=m.getbbox()
    # trim outline bar to cloud width
    row=np.array(m)[int(cut-2*S)]; xs=np.where(row>0)[0]
    if len(xs): cd.rectangle((0,cut,xs.min()-1,cut+ow),fill=(0,0,0,0)); cd.rectangle((xs.max()+1,cut,w,cut+ow),fill=(0,0,0,0))
    img.alpha_composite(L)
cloud(190,190,1.0); cloud(420,90,0.7); cloud(1000,330,0.8); cloud(150,470,0.6)
# far mesas
def poly(pts,fill): d.polygon([(x*S,y*S) for x,y in pts],fill=fill,outline=OL,width=ow)
poly([(-20,820),(-20,640),(40,630),(70,600),(250,598),(275,640),(330,660),(360,820)],(196,112,74,255))
poly([(1000,820),(1040,690),(1080,640),(1300,636),(1330,690),(1420,700),(1420,820)],(196,112,74,255))
poly([(300,820),(340,730),(380,712),(520,710),(545,740),(600,820)],(176,96,62,255))
# desert plain
d.rectangle((0,800*S,w,h),fill=(222,170,108,255)); d.line((0,800*S,w,800*S),fill=OL,width=ow)
d.rectangle((0,860*S,w,h),fill=(206,152,92,255))
# saguaros
def cactus(x,y,s,c=(70,110,52,255)):
    def cap(x0,y0,x1,y1): d.rounded_rectangle((x0*S,y0*S,x1*S,y1*S),radius=int((x1-x0)*S/2),fill=c,outline=OL,width=ow)
    cap(x-14*s,y-150*s,x+14*s,y); cap(x-56*s,y-110*s,x-30*s,y-50*s); d.rectangle(((x-44*s)*S,(y-66*s)*S,(x-12*s)*S,(y-50*s)*S),fill=c,outline=OL,width=ow)
    cap(x+30*s,y-130*s,x+56*s,y-70*s); d.rectangle(((x+12*s)*S,(y-86*s)*S,(x+44*s)*S,(y-70*s)*S),fill=c,outline=OL,width=ow)
    cap(x-14*s,y-150*s,x+14*s,y)
# barn (left)
bx,by=70,840
poly([(bx,by),(bx,by-170),(bx+130,by-250),(bx+260,by-170),(bx+260,by)],(176,52,40,255))
poly([(bx-14,by-166),(bx+130,by-262),(bx+274,by-166),(bx+260,by-160),(bx+130,by-246),(bx,by-160)],(70,40,30,255))
d.rectangle(((bx+80)*S,(by-120)*S,(bx+180)*S,by*S),fill=(232,220,196,255),outline=OL,width=ow)
d.rectangle(((bx+92)*S,(by-108)*S,(bx+168)*S,(by-12)*S),fill=(176,52,40,255),outline=OL,width=ow)
d.line(((bx+92)*S,(by-108)*S,(bx+168)*S,(by-12)*S),fill=(232,220,196,255),width=7*S)
d.line(((bx+168)*S,(by-108)*S,(bx+92)*S,(by-12)*S),fill=(232,220,196,255),width=7*S)
d.rectangle(((bx+108)*S,(by-200)*S,(bx+152)*S,(by-160)*S),fill=(150,200,230,255),outline=OL,width=ow)
# ranch arch gate sign (left foreground of barn)
# windmill (right)
wx,wy=1215,840
for a,b in [((wx-50,wy),(wx-8,wy-260)),((wx+50,wy),(wx+8,wy-260))]: d.line((a[0]*S,a[1]*S,b[0]*S,b[1]*S),fill=OL,width=10*S)
for yb in (wy-60,wy-130,wy-195): 
    k=(wy-yb)/260; x0=wx-50+42*k; d.line((x0*S,yb*S,(2*wx-x0)*S,yb*S),fill=OL,width=7*S)
d.line(((wx-40)*S,(wy-10)*S,(wx+30)*S,(wy-180)*S),fill=OL,width=5*S)
hx,hy=wx,wy-275
for i in range(12):
    an=i*math.pi/6; r0,r1=18,110
    pts=[(hx+r0*math.cos(an-0.12),hy+r0*math.sin(an-0.12)),(hx+r1*math.cos(an-0.17),hy+r1*math.sin(an-0.17)),(hx+r1*math.cos(an+0.17),hy+r1*math.sin(an+0.17)),(hx+r0*math.cos(an+0.12),hy+r0*math.sin(an+0.12))]
    poly(pts,(214,200,176,255) if i%2 else (176,52,40,255))
d.ellipse(((hx-20)*S,(hy-20)*S,(hx+20)*S,(hy+20)*S),fill=(90,60,40,255),outline=OL,width=ow)
poly([(hx+12,hy-10),(hx+150,hy-34),(hx+150,hy+34),(hx+12,hy+10)],(176,52,40,255))
# ranch house (right, in front of windmill base)
qx,qy=1020,850
poly([(qx,qy),(qx,qy-110),(qx+170,qy-110),(qx+170,qy)],(196,150,96,255))
poly([(qx-20,qy-108),(qx+30,qy-170),(qx+140,qy-170),(qx+190,qy-108)],(110,62,38,255))
d.rectangle(((qx+25)*S,(qy-80)*S,(qx+65)*S,(qy-40)*S),fill=(150,200,230,255),outline=OL,width=ow)
d.rectangle(((qx+105)*S,(qy-80)*S,(qx+145)*S,(qy-40)*S),fill=(150,200,230,255),outline=OL,width=ow)
d.rectangle(((qx+70)*S,(qy-70)*S,(qx+100)*S,qy*S),fill=(110,62,38,255),outline=OL,width=ow)
# split-rail fence across the plain
fy=900
for x in range(-20,1440,110):
    d.rectangle(((x-7)*S,(fy-70)*S,(x+7)*S,(fy+6)*S),fill=(130,86,52,255),outline=OL,width=4*S)
for yo in (fy-56,fy-26):
    d.rectangle((0,yo*S,w,(yo+11)*S),fill=(150,100,60,255),outline=OL,width=4*S)
cactus(380,905,0.9); cactus(1330,915,0.75); cactus(150,935,0.6)
out=img.resize((W,H),Image.LANCZOS)
out.convert('RGB').save('ranch_bg.png')
