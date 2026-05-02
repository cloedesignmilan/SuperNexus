import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const allForDressUGC = await prisma.subcategory.findMany({
    where: { 
      is_active: true,
      business_mode: {
        name: 'UGC',
        category: { slug: 'dress' }
      }
    }
  });
  console.log("ACTIVE subcategories for Dress UGC:");
  allForDressUGC.forEach(s => console.log(`- ${s.name}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
