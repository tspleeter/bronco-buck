import sys,os,glob
from PIL import Image
from concurrent.futures import ProcessPoolExecutor
def conv(p):
    out=p[:-4]+'.webp'
    im=Image.open(p)
    has_a = im.mode in ('RGBA','LA') or (im.mode=='P' and 'transparency' in im.info)
    if has_a:
        im=im.convert('RGBA')
        if im.getchannel('A').getextrema()==(255,255): im=im.convert('RGB'); has_a=False
    else: im=im.convert('RGB')
    im.save(out,'WEBP',quality=90 if has_a else 85,method=6,exact=has_a,alpha_quality=100)
    return os.path.getsize(p),os.path.getsize(out)
files=[f for f in glob.glob(sys.argv[1]+'/*/*.png')]
with ProcessPoolExecutor() as ex: r=list(ex.map(conv,files))
print(len(files), sum(a for a,b in r)/1e6, 'MB ->', sum(b for a,b in r)/1e6,'MB')
