const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');

const prisma = new PrismaClient();

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // follow redirect
                return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve); // close() is async, call cb after close completes.
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err.message);
        });
    });
}

function getKeywordsForSlug(slug) {
    if (slug.includes('women') || slug.includes('donna') || slug.includes('cerimonia')) return 'fashion,women,editorial';
    if (slug.includes('men') || slug.includes('uomo')) return 'fashion,men,suit';
    if (slug.includes('kid') || slug.includes('bambin')) return 'fashion,kids';
    if (slug.includes('street')) return 'streetwear,fashion';
    if (slug.includes('sport')) return 'sportswear,fitness,apparel';
    if (slug.includes('footwear') || slug.includes('scarpe')) return 'shoes,footwear,sneakers';
    if (slug.includes('boutique')) return 'boutique,store,fashion';
    if (slug.includes('tshirt')) return 'tshirt,apparel';
    return 'fashion,apparel';
}

async function processImage(imageUrl, slug) {
    if (!imageUrl || !imageUrl.startsWith('/seed/')) return;
    
    const targetPath = path.join(__dirname, 'public', imageUrl);
    const targetDir = path.dirname(targetPath);
    
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const keywords = getKeywordsForSlug(slug);
    const sourceUrl = `https://loremflickr.com/800/600/${keywords}`;
    
    try {
        console.log(`Downloading for ${slug} (${keywords})...`);
        await downloadImage(sourceUrl, targetPath);
    } catch (e) {
        console.error(`Failed to download for ${slug}: ${e}`);
    }
}

async function main() {
    console.log("Downloading diverse themed images...");
    const categories = await prisma.category.findMany();
    for (const c of categories) await processImage(c.cover_image, c.slug);
    
    const businessModes = await prisma.businessMode.findMany();
    for (const b of businessModes) await processImage(b.cover_image, b.slug);
    
    const subcategories = await prisma.subcategory.findMany();
    for (const s of subcategories) await processImage(s.preview_image, s.slug);
    
    const references = await prisma.subcategoryReferenceImage.findMany();
    for (const r of references) {
        await processImage(r.image_url, r.title || 'reference');
    }
    
    console.log("Download complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
