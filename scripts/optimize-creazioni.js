const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGET_DIR = path.join(process.cwd(), 'public', 'Creazioni');
const MAX_SIZE = 1080;
const QUALITY = 85;

async function processDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`Directory does not exist: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === '.DS_Store') continue;

        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            await processDirectory(filePath);
        } else {
            const ext = path.extname(file).toLowerCase();
            if (['.jpg', '.jpeg', '.png'].includes(ext)) {
                const webpPath = filePath.replace(new RegExp(`${ext}$`, 'i'), '.webp');
                
                // If it's already converted and original is there, we might just delete original or skip
                // We'll process it
                try {
                    console.log(`Converting: ${filePath}`);
                    await sharp(filePath)
                        .resize({
                            width: MAX_SIZE,
                            height: MAX_SIZE,
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                        .webp({ quality: QUALITY })
                        .toFile(webpPath);
                    
                    console.log(`Successfully created: ${webpPath}`);
                    
                    // Delete the original file to save space
                    fs.unlinkSync(filePath);
                    console.log(`Deleted original: ${filePath}`);
                } catch (error) {
                    console.error(`Error processing ${filePath}:`, error);
                }
            }
        }
    }
}

async function run() {
    console.log('Starting optimization of Creazioni images...');
    await processDirectory(TARGET_DIR);
    console.log('Optimization complete.');
}

run();
