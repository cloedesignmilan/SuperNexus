import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const allForTshirtUGC = await prisma.subcategory.findMany({
    where: { 
      business_mode: {
        name: 'UGC',
        category: { slug: 't-shirt' }
      }
    }
  });
  console.log("ALL subcategories for T-shirt UGC (active and inactive):");
  allForTshirtUGC.forEach(s => console.log(`- ${s.name} (Active: ${s.is_active})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
