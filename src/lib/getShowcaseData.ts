import fs from 'fs';
import path from 'path';

export interface ShowcaseItem {
  id: string;
  category: string;
  subcategory: string;
  useCases: string[];
  desc: string;
  before: string[];
  afters: string[];
}

export async function getShowcaseData(): Promise<ShowcaseItem[]> {
  const result: ShowcaseItem[] = [];
  const baseDir = path.join(process.cwd(), 'public', 'prove nuove');

  if (!fs.existsSync(baseDir)) {
    return result;
  }

  const categories = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'Immagini originali' && !dirent.name.startsWith('.'));

  for (const cat of categories) {
    const catDir = path.join(baseDir, cat.name);
    const subcategories = fs.readdirSync(catDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'));

    for (const subcat of subcategories) {
      const fullPath = path.join(catDir, subcat.name);
      const files = fs.readdirSync(fullPath);
      
      const afterImages: string[] = [];
      const beforeImages: string[] = [];

      for (const file of files) {
        if (file.startsWith('.') || !file.match(/\.(jpg|jpeg|png|webp)$/i)) continue;
        
        const lowerFile = file.toLowerCase();
        if (lowerFile.startsWith('prima')) {
          beforeImages.push(`/prove nuove/${cat.name}/${subcat.name}/${file}`);
        } else {
          afterImages.push(`/prove nuove/${cat.name}/${subcat.name}/${file}`);
        }
      }

      if (beforeImages.length === 0) {
        const origPath = path.join(baseDir, 'Immagini originali');
        if (fs.existsSync(origPath)) {
          const origFiles = fs.readdirSync(origPath);
          const match = origFiles.find(f => f.toLowerCase().startsWith(cat.name.toLowerCase()));
          if (match) {
            beforeImages.push(`/prove nuove/Immagini originali/${match}`);
          } else {
            // Ultimate fallback to any image if available
            const anyImg = origFiles.find(f => f.match(/\.(jpg|jpeg|png|webp)$/i) && !f.startsWith('.'));
            if (anyImg) {
               beforeImages.push(`/prove nuove/Immagini originali/${anyImg}`);
            }
          }
        }
      }

      if (afterImages.length > 0) {
        result.push({
          id: `${cat.name}-${subcat.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: cat.name,
          subcategory: subcat.name,
          useCases: ["AI Generated", "E-Commerce", "Social Media"],
          desc: "AI Generated content",
          before: beforeImages,
          afters: afterImages
        });
      }
    }
  }

  // Merge SHOES / LifeStyle and SHOES / Detail : Texture
  const mergedResult: ShowcaseItem[] = [];
  const shoesToMerge: ShowcaseItem[] = [];
  let firstIndex = -1;

  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    if (item.category.toUpperCase() === 'SHOES' && 
       (item.subcategory.toLowerCase() === 'lifestyle' || item.subcategory.toLowerCase().includes('texture'))) {
      shoesToMerge.push(item);
      if (firstIndex === -1) firstIndex = mergedResult.length;
    } else {
      mergedResult.push(item);
    }
  }

  if (shoesToMerge.length > 0) {
    const mergedItem: ShowcaseItem = {
      id: 'shoes-lifestyle-texture',
      category: 'SHOES',
      subcategory: 'LifeStyle & Texture',
      useCases: ["AI Generated", "E-Commerce", "Social Media"],
      desc: "AI Generated content",
      before: shoesToMerge[0].before,
      afters: shoesToMerge.flatMap(item => item.afters)
    };
    
    if (firstIndex !== -1) {
      mergedResult.splice(firstIndex, 0, mergedItem);
    } else {
      mergedResult.push(mergedItem);
    }
  }

  return mergedResult;
}
