import os
import json

base_path = "public/prove"
ordered_categories = ["Tshirt", "Calzature", "Donna", "Sposa", "Sposo", "Uomo", "Bambino"]

data = []

def add_item(cat, subcat, use_cases, desc, rel_path):
    full_path = os.path.join(base_path, rel_path)
    if not os.path.exists(full_path):
        return
    files = [f for f in os.listdir(full_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    prima = next((f for f in files if f.startswith('prima')), None)
    afters = [f for f in files if not f.startswith('prima')]
    
    if prima and afters:
        data.append({
            "id": f"{cat.lower()}-{subcat.lower().replace(' ', '-')}",
            "category": cat,
            "subcategory": subcat,
            "useCases": use_cases,
            "desc": desc,
            "before": f"/prove/{rel_path}/{prima}",
            "afters": [f"/prove/{rel_path}/{a}" for a in afters[:4]]
        })

# 1. Tshirt
add_item("T-Shirt & Knitwear", "Streetwear FlatLay", ["Instagram", "Pinterest", "Hypebeast"], "Transform simple flat lays into hype streetwear shots with dynamic backgrounds and modern aesthetics.", "Tshirt/Tshirt- FlatLay")
add_item("T-Shirt & Knitwear", "E-Commerce Clean", ["Amazon", "Etsy", "Shopify"], "Stop shooting on rigid mannequins! Transform flat lays into highly converting e-commerce catalog photos.", "Tshirt/Ecommerce Clean")
add_item("T-Shirt & Knitwear", "UGC (User Generated Content)", ["TikTok", "IG Reels", "FB Ads"], "Create relatable, everyday lifestyle shots that look like genuine customer photos for high-converting ads.", "Tshirt/UCG")

# 2. Calzature
add_item("Footwear & Sneakers", "Sneakers Donna", ["Zalando", "Asos", "E-commerce"], "Perfect lighting and reflection generation for premium sneaker catalogs.", "Calzature/sneakers-donna")
add_item("Footwear & Sneakers", "Product Clean", ["Amazon", "Shopify"], "Total elimination of defects. Your warehouse shots become perfect still-lifes ready for online sales.", "Calzature/Product Clean")
add_item("Footwear & Sneakers", "Tacchi Eleganti", ["Instagram", "Boutique", "Pinterest"], "Showcase elegant heels in luxury settings to attract high-end customers.", "Calzature/Tacchi")
add_item("Footwear & Sneakers", "On Feet Urban", ["Streetwear", "FB Ads", "TikTok"], "Realistic on-feet simulations in urban environments for maximum social engagement.", "Calzature/On Feet Urban")

# 3. Donna
add_item("Women's Fashion", "Mannequin Display", ["Boutique", "Catalog"], "Turn standard store mannequins into lifelike models wearing your latest collections.", "Donna/Mannequin Display")
add_item("Women's Fashion", "Runway Editorial", ["High Fashion", "Magazines"], "Place your garments in professional runway environments with perfect lighting.", "Donna/Runway Editorial")
add_item("Women's Fashion", "Dress Spotlight", ["Atelier", "Pinterest"], "Highlight the details of your dresses with stunning, focused lighting and elegant models.", "Donna/Dress Spotlight")
add_item("Women's Fashion", "Luxury Villa Shoot", ["Instagram", "Luxury", "FB Ads"], "Have your garments worn by hyper-realistic digital models in luxury villas.", "Donna/Luxury Villa Shoot")
add_item("Women's Fashion", "Instagram Lifestyle", ["Influencer", "TikTok", "IG Reels"], "Create vibrant, trendy lifestyle shots that perfectly match the Instagram aesthetic.", "Donna/Instagram Lifestyle")
add_item("Women's Fashion", "Mature Sophistication", ["LinkedIn", "Catalog", "Classic"], "Elegant and sophisticated shots targeting a mature, classy demographic.", "Donna/Mature Sophistication")
add_item("Women's Fashion", "Gym & Fitness", ["Activewear", "TikTok", "Instagram"], "Dynamic, high-energy shots perfect for showcasing athletic wear in action.", "Donna/Gym & Fitness")
add_item("Women's Fashion", "Outfit Coordination", ["Pinterest", "Lookbook"], "Show how different pieces match together in realistic, coordinated street looks.", "Donna/Outfit Coordination")

# 4. Sposa
add_item("Bridal", "Bridal Collection", ["Atelier", "Wedding", "Pinterest"], "Transform an anonymous dress hanging in the Atelier into sumptuous catalogs that enchant brides.", "Sposa")

# 5. Sposo
add_item("Groom & Formal", "Groom Collection", ["Tailoring", "Wedding", "Magazine"], "Elegant formal wear presented in stunning, romantic locations.", "Sposo")

# 6. Uomo
add_item("Men's Apparel", "Ecommerce Studio", ["Zalando", "Shopify", "Catalog"], "Clean, professional studio shots highlighting the fit and fabric of menswear.", "Uomo/Ecommerce Studio")
add_item("Men's Apparel", "Street Style", ["Hypebeast", "Instagram", "TikTok"], "Urban and edgy looks perfect for marketing modern men's streetwear.", "Uomo/Street Style")
add_item("Men's Apparel", "Silver Fox Luxury", ["Luxury", "Boutique"], "Target premium customers with sophisticated, mature male models.", "Uomo/Silver Fox Luxury")
add_item("Men's Apparel", "Executive Lifestyle", ["LinkedIn", "Business", "Magazine"], "Showcase your suits in their natural habitat: modern offices and business environments.", "Uomo/Executive Lifestyle")

# 7. Bambino
add_item("Kids Collection", "Elegant Event", ["Ceremony", "Catalog"], "Adorable, high-quality shots for kids' formal wear and special occasions.", "Bambino/Elegant Event")
add_item("Kids Collection", "Playful Lifestyle", ["Parenting Groups", "IG Posts", "TikTok"], "Sweet and engaging lifestyle shots perfect for capturing the attention of parents.", "Bambino/Playful Lifestyle")

with open('showcase_data.json', 'w') as f:
    json.dump(data, f, indent=2)

