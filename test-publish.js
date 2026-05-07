const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const check = await prisma.outputValidationCheck.findFirst({
    orderBy: { created_at: 'desc' }
  });
  console.log('Latest check:', check ? check.id : 'none');
  
  if (!check) return;
  
  let urls = [];
  try {
      const parsed = JSON.parse(check.generated_sample_image);
      urls = parsed.urls || [];
  } catch(e) {
      urls = [check.generated_sample_image];
  }
  console.log('urls length:', urls.length);
  
  const targetCategory = 'T-SHIRT';
  const targetSubcategory = 'TEST_UGC';
  
  const escapeRegex = (s) => s.replace(/[-\/\\\\^$*+?.()|[\]{}]/g, '\\\\$&');
  const safeCat = escapeRegex(targetCategory);
  const safeSub = escapeRegex(targetSubcategory);

  const regex = new RegExp(\`(displayCategory:\\\\s*['\\\"]\${safeCat}['\\\"],\\\\s*displaySubcategory:\\\\s*['\\\"]\${safeSub}['\\\"][\\\\s\\\\S]*?manualImages:\\\\s*\\\\[)([\\\\s\\\\S]*?)(\\\\])\`, 'g');

  const fs = require('fs');
  const filePath = 'src/components/InfiniteShowcase.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!regex.test(content)) {
        console.log('Not found, appending...');
        const newObject = `  {
    displayCategory: '${targetCategory}',
    displaySubcategory: '${targetSubcategory}',
    originalImage: '${check.reference_image_url && check.reference_image_url !== 'N/A' && !check.reference_image_url.includes('>') ? check.reference_image_url : '/prove nuove/ceremony elegant/DETAIL_TEXTURE_ORIGINAL.webp'}',
    manualImages: [
      ${urls.map(u => `"${u}"`).join(',\n      ')}
    ]
  }`;
        const newContent = content.replace(/(\n];\n\s*const UNIQUE_CATEGORIES)/, `,\n${newObject}$1`);
        if (newContent === content) {
            console.log('REPLACE FAILED!');
        } else {
            console.log('REPLACE SUCCESS, length changed from', content.length, 'to', newContent.length);
        }
  } else {
      console.log('Found, updating...');
  }
}
test().catch(console.error).finally(() => prisma.$disconnect());
