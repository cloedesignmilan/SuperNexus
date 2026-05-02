import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const activeSubcategories = await prisma.subcategory.findMany({
    where: { 
      is_active: true,
      business_mode: { 
        is_active: true,
        category: { is_active: true }
      }
    },
    include: { business_mode: { include: { category: true } } }
  });

  const detectedCat = 't-shirt';
  const mode = 'UGC';

  const activeSubNames = activeSubcategories
    .filter(sub => sub.business_mode.category.slug === detectedCat && sub.business_mode.name === mode)
    .map(sub => sub.name);

  console.log("activeSubNames for T-shirt UGC:", activeSubNames);
  console.log("Does it include Candid?", activeSubNames.includes("Candid"));
}

main().catch(console.error).finally(() => prisma.$disconnect());
