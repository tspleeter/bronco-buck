from PIL import Image; import numpy as np
im=np.array(Image.open('hero-hill-plate.png').convert('RGB')).astype(np.float32)
H,W=im.shape[:2]; yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
e=np.clip(np.minimum.reduce([xx,W-1-xx,yy,H-1-yy])/80.0,0,1); e=e*e*(3-2*e)
r=np.sqrt(((xx-W/2)/(W/2))**2+((yy-H/2)/(H/2))**2); e*=np.clip((1.45-r)/0.3,0,1)
out=im*e[...,None]+np.array([12,10,9],np.float32)*(1-e[...,None])
o=Image.fromarray(out.astype(np.uint8)); o.save('hero-ranch.png',optimize=True); o.resize((700,700)).save('ranch_final_prev.jpg',quality=90)
