import fs from 'fs';
import path from 'path';

// Define the static structure
const CATEGORIES = [
  {
    "id": "t-shirt & knitwear-streetwear-flatlay",
    "category": "T-Shirt & Knitwear",
    "subcategory": "Streetwear FlatLay",
    "useCases": ["Instagram", "Pinterest", "Hypebeast"],
    "desc": "Transform simple flat lays into hype streetwear shots with dynamic backgrounds and modern aesthetics.",
    "folderPath": "/prove/Tshirt/Tshirt- FlatLay"
  },
  {
    "id": "t-shirt & knitwear-e-commerce-clean",
    "category": "T-Shirt & Knitwear",
    "subcategory": "E-Commerce Clean",
    "useCases": ["Amazon", "Etsy", "Shopify"],
    "desc": "Stop shooting on rigid mannequins! Transform flat lays into highly converting e-commerce catalog photos.",
    "folderPath": "/prove/Tshirt/Ecommerce Clean"
  },
  {
    "id": "t-shirt & knitwear-ugc-(user-generated-content)",
    "category": "T-Shirt & Knitwear",
    "subcategory": "UGC (User Generated Content)",
    "useCases": ["TikTok", "IG Reels", "FB Ads"],
    "desc": "Create relatable, everyday lifestyle shots that look like genuine customer photos for high-converting ads.",
    "folderPath": "/prove/Tshirt/UCG"
  },
  {
    "id": "footwear & sneakers-product-clean",
    "category": "Footwear & Sneakers",
    "subcategory": "Product Clean",
    "useCases": ["Amazon", "Shopify"],
    "desc": "Total elimination of defects. Your warehouse shots become perfect still-lifes ready for online sales.",
    "folderPath": "/prove/Calzature/Product Clean"
  },
  {
    "id": "women's fashion-mannequin-display",
    "category": "Women's Fashion",
    "subcategory": "Mannequin Display",
    "useCases": ["Boutique", "Catalog"],
    "desc": "Turn standard store mannequins into lifelike models wearing your latest collections.",
    "folderPath": "/prove/Donna/Mannequin Display"
  },
  {
    "id": "women's fashion-runway-editorial",
    "category": "Women's Fashion",
    "subcategory": "Runway Editorial",
    "useCases": ["High Fashion", "Magazines"],
    "desc": "Place your garments in professional runway environments with perfect lighting.",
    "folderPath": "/prove/Donna/Runway Editorial"
  },
  {
    "id": "women's fashion-luxury-villa-shoot",
    "category": "Women's Fashion",
    "subcategory": "Luxury Villa Shoot",
    "useCases": ["Instagram", "Luxury", "FB Ads"],
    "desc": "Have your garments worn by hyper-realistic digital models in luxury villas.",
    "folderPath": "/prove/Donna/Luxury Villa Shoot"
  },
  {
    "id": "women's fashion-instagram-lifestyle",
    "category": "Women's Fashion",
    "subcategory": "Instagram Lifestyle",
    "useCases": ["Influencer", "TikTok", "IG Reels"],
    "desc": "Create vibrant, trendy lifestyle shots that perfectly match the Instagram aesthetic.",
    "folderPath": "/prove/Donna/Instagram Lifestyle"
  },
  {
    "id": "women's fashion-mature-sophistication",
    "category": "Women's Fashion",
    "subcategory": "Mature Sophistication",
    "useCases": ["LinkedIn", "Catalog", "Classic"],
    "desc": "Elegant and sophisticated shots targeting a mature, classy demographic.",
    "folderPath": "/prove/Donna/Mature Sophistication"
  },
  {
    "id": "women's fashion-gym-&-fitness",
    "category": "Women's Fashion",
    "subcategory": "Gym & Fitness",
    "useCases": ["Activewear", "TikTok", "Instagram"],
    "desc": "Dynamic, high-energy shots perfect for showcasing athletic wear in action.",
    "folderPath": "/prove/Donna/Gym & Fitness"
  },
  {
    "id": "women's fashion-outfit-coordination",
    "category": "Women's Fashion",
    "subcategory": "Outfit Coordination",
    "useCases": ["Pinterest", "Lookbook"],
    "desc": "Show how different pieces match together in realistic, coordinated street looks.",
    "folderPath": "/prove/Donna/Outfit Coordination"
  },
  {
    "id": "bridal-bridal-collection",
    "category": "Bridal",
    "subcategory": "Bridal Collection",
    "useCases": ["Atelier", "Wedding", "Pinterest"],
    "desc": "Transform an anonymous dress hanging in the Atelier into sumptuous catalogs that enchant brides.",
    "folderPath": "/prove/Sposa"
  },
  {
    "id": "groom & formal-groom-collection",
    "category": "Groom & Formal",
    "subcategory": "Groom Collection",
    "useCases": ["Tailoring", "Wedding", "Magazine"],
    "desc": "Elegant formal wear presented in stunning, romantic locations.",
    "folderPath": "/prove/Sposo"
  },
  {
    "id": "men's apparel-silver-fox-luxury",
    "category": "Men's Apparel",
    "subcategory": "Silver Fox Luxury",
    "useCases": ["Luxury", "Boutique"],
    "desc": "Target premium customers with sophisticated, mature male models.",
    "folderPath": "/prove/Uomo/Silver Fox Luxury"
  },
  {
    "id": "men's apparel-executive-lifestyle",
    "category": "Men's Apparel",
    "subcategory": "Executive Lifestyle",
    "useCases": ["LinkedIn", "Business", "Magazine"],
    "desc": "Showcase your suits in their natural habitat: modern offices and business environments.",
    "folderPath": "/prove/Uomo/Executive Lifestyle"
  },
  {
    "id": "kids collection-elegant-event",
    "category": "Kids Collection",
    "subcategory": "Elegant Event",
    "useCases": ["Ceremony", "Catalog"],
    "desc": "Adorable, high-quality shots for kids' formal wear and special occasions.",
    "folderPath": "/prove/Bambino/Elegant Event"
  },
  {
    "id": "kids collection-playful-lifestyle",
    "category": "Kids Collection",
    "subcategory": "Playful Lifestyle",
    "useCases": ["Parenting Groups", "IG Posts", "TikTok"],
    "desc": "Sweet and engaging lifestyle shots perfect for capturing the attention of parents.",
    "folderPath": "/prove/Bambino/Playful Lifestyle"
  }
];

export interface ShowcaseItem {
  id: string;
  category: string;
  subcategory: string;
  useCases: string[];
  desc: string;
  before: string;
  afters: string[];
}

export async function getShowcaseData(): Promise<ShowcaseItem[]> {
  const result: ShowcaseItem[] = [];

  for (const cat of CATEGORIES) {
    const fullPath = path.join(process.cwd(), 'public', cat.folderPath);
    let beforeImage = "";
    let afterImages: string[] = [];

    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath);

      for (const file of files) {
        // Skip hidden files or non-image files
        if (file.startsWith('.')) continue;
        if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

        const lowerFile = file.toLowerCase();

        // Exclusion rule: X.* or x.*
        if (lowerFile.startsWith('x.')) {
          continue;
        }

        // Before rule: starts with "prima"
        if (lowerFile.startsWith('prima')) {
          beforeImage = `${cat.folderPath}/${file}`;
          continue;
        }

        // Add to afters
        afterImages.push(`${cat.folderPath}/${file}`);
      }

      // Prioritization rule for 'afters': 1.*
      afterImages.sort((a, b) => {
        const fileA = path.basename(a).toLowerCase();
        const fileB = path.basename(b).toLowerCase();
        
        if (fileA.startsWith('1.')) return -1;
        if (fileB.startsWith('1.')) return 1;
        
        return a.localeCompare(b);
      });
    }

    result.push({
      id: cat.id,
      category: cat.category,
      subcategory: cat.subcategory,
      useCases: cat.useCases,
      desc: cat.desc,
      before: beforeImage || `${cat.folderPath}/prima.jpeg`, // fallback
      afters: afterImages
    });
  }

  return result;
}
