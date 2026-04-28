import os
from rembg import remove
from PIL import Image

images = [
    ("/Users/cristiancalcagnile/.gemini/antigravity/brain/6aca2ee0-6495-47b9-b0ff-f0d8a5d44ed8/media__1777409864982.jpg", "public/age-system/v2/transparent/man_20.png"),
    ("/Users/cristiancalcagnile/.gemini/antigravity/brain/6aca2ee0-6495-47b9-b0ff-f0d8a5d44ed8/media__1777409864997.jpg", "public/age-system/v2/transparent/man_50.png")
]

for in_path, out_path in images:
    if os.path.exists(in_path):
        input_image = Image.open(in_path)
        output_image = remove(input_image)
        output_image.save(out_path, format="PNG")
        print(f"Saved {out_path}")
