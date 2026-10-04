# Step 1: background-remove the product photo on a 2400px downscale (full-res drops the teeth).
from rembg import remove, new_session
from PIL import Image, ImageOps
im=ImageOps.exif_transpose(Image.open('source.jpg')).convert('RGB'); im.thumbnail((2400,2400))
remove(im,session=new_session('isnet-general-use')).save('cut_c.png')
