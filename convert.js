const sharp = require('sharp');
const fs = require('fs');

async function processImages() {
  for (let i = 1; i <= 4; i++) {
    const input = `public/prove nuove/ceremony elegant/ADS_SCROLL_STOPPER_MODEL/temp/${i}.jpg`;
    const output = `public/prove nuove/ceremony elegant/ADS_SCROLL_STOPPER_MODEL/temp/${i}.webp`;
    if (fs.existsSync(input)) {
      await sharp(input).webp({ quality: 80 }).toFile(output);
      console.log(`Converted ${input} to webp`);
    }
  }
}
processImages();
