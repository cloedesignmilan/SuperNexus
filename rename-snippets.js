const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const map = {
    'T-Shirts / Hoodies': 'T-shirt',
    'Sneakers / Shoes Focus': 'Shoes',
    'Swimwear / Beachwear': 'Swimwear',
    'Clothing / Fashion': 'Dress / Elegant',
    'Ceremony / Elegant': 'Dress / Elegant',
    'Bags / Accessories': 'Bags',
    'Jewelry / Watches': 'Jewelry'
  };

  let updated = 0;
  for (const [oldName, newName] of Object.entries(map)) {
    const res = await prisma.promptSnippet.updateMany({
      where: { snippet_type: 'PRODUCT_TYPE', label: oldName },
      data: { label: newName }
    });
    updated += res.count;
  }
  
  console.log(`Updated ${updated} snippets`);
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
