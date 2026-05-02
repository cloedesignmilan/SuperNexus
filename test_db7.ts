import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const allSubcategories = await prisma.subcategory.findMany({
    where: { 
      is_active: true,
      business_mode: { 
        is_active: true,
        category: { is_active: true }
      }
    },
    include: { business_mode: { include: { category: true } } }
  });
  
  const tshirtUgc = allSubcategories.filter(sub => sub.business_mode.category.slug === 't-shirt' && sub.business_mode.name === 'UGC');
  console.log("Currently active subcategories for T-shirt UGC:");
  tshirtUgc.forEach(s => console.log(`- ${s.name} (is_active: ${s.is_active})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
