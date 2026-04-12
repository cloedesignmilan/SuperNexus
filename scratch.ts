import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const catMap: Record<string, string> = {
  "Donna": "Women",
  "Uomo": "Men",
  "Prodotto": "Product"
};

const subMap: Record<string, string> = {
  "Catalogo": "Catalog",
  "Feste 18°": "18th Birthday / Party",
  "Elegante": "Elegant",
  "Casual": "Casual",
  "Ragazzo": "Boy/Teen",
  "Calzature": "Footwear"
};

async function main() {
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    if (catMap[cat.name]) {
      console.log(`Translate Cat: ${cat.name} -> ${catMap[cat.name]}`);
      await prisma.category.update({ where: { id: cat.id }, data: { name: catMap[cat.name] }});
    }
  }

  const subcats = await prisma.subcategory.findMany();
  for (const sub of subcats) {
    if (subMap[sub.name]) {
      console.log(`Translate Sub: ${sub.name} -> ${subMap[sub.name]}`);
      await prisma.subcategory.update({ where: { id: sub.id }, data: { name: subMap[sub.name] }});
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
