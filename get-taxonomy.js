const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const categories = await prisma.category.findMany({
    orderBy: { sort_order: 'asc' },
    include: {
      business_modes: {
        orderBy: { sort_order: 'asc' },
        include: {
          subcategories: {
            orderBy: { sort_order: 'asc' },
          }
        }
      }
    }
  });
  
  categories.forEach(cat => {
    console.log(`\n📌 MACRO CATEGORIA: ${cat.name} (${cat.slug})`);
    cat.business_modes.forEach(bm => {
      console.log(`   ├── 📂 CATEGORIA (Mode): ${bm.name} (${bm.slug})`);
      bm.subcategories.forEach(sub => {
        console.log(`   │    └── 📄 SOTTOCATEGORIA (Presentation): ${sub.name} (${sub.slug})`);
      });
      if (bm.subcategories.length === 0) {
         console.log(`   │    └── (Nessuna sottocategoria)`);
      }
    });
    if (cat.business_modes.length === 0) {
      console.log(`   └── (Nessuna categoria)`);
    }
  });
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
