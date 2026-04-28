import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const configPath = './src/components/InfiniteShowcase.tsx';
let content = fs.readFileSync(configPath, 'utf8');

const regex = /\"(\/prove nuove\/[^\"]+\.(?:jpg|jpeg|png))\"/gi;
let match;
const urls = new Set();

while ((match = regex.exec(content)) !== null) {
  urls.add(match[1]);
}

console.log(`Found ${urls.size} unique images to process.`);

async function processImages() {
  let processed = 0;
  for (const url of urls) {
    const oldPath = path.join(process.cwd(), 'public', url);
    if (!fs.existsSync(oldPath)) {
      console.warn(`File not found: ${oldPath}`);
      continue;
    }
    
    const newUrl = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const newPath = path.join(process.cwd(), 'public', newUrl);
    
    try {
      await sharp(oldPath)
        .resize({ width: 1080, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(newPath);
        
      fs.unlinkSync(oldPath);
      console.log(`Converted: ${url} -> ${newUrl}`);
      
      // Update content string
      content = content.replace(new RegExp(url.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), newUrl);
      processed++;
    } catch (e) {
      console.error(`Error processing ${url}:`, e);
    }
  }
  
  if (processed > 0) {
    fs.writeFileSync(configPath, content, 'utf8');
    console.log(`Updated ${configPath} with new .webp paths.`);
  }
}

processImages();
