import os
from PIL import Image
from rembg import remove

img_path = "/Users/cristiancalcagnile/.gemini/antigravity/brain/6aca2ee0-6495-47b9-b0ff-f0d8a5d44ed8/media__1777410552153.png"
if not os.path.exists(img_path):
    print("File not found")
    exit()

img = Image.open(img_path)
w, h = img.size

row_h = h // 3
bottom_y = row_h * 2
bottom_row = img.crop((0, bottom_y, w, h))

col_w = w // 5

ages = [20, 27, 35, 42, 50]

for i in range(5):
    crop_box = (i * col_w, 0, (i+1) * col_w, bottom_row.height)
    frame = bottom_row.crop(crop_box)
    
    out_img = remove(frame)
    
    out_path = f"public/age-system/v2/transparent/man_{ages[i]}.png"
    out_img.save(out_path, format="PNG")
    print(f"Saved {out_path}")
