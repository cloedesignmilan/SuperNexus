import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const allSub = await prisma.subcategory.findMany({
    where: { is_active: true },
    include: { business_mode: { include: { category: true } } }
  });
  const tShirtUgcSub = allSub.filter(sub => sub.business_mode.category.slug === 't-shirt' && sub.business_mode.name === 'UGC');
  console.log("Active subcategories for t-shirt UGC:");
  tShirtUgcSub.forEach(s => console.log(`- ${s.name}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
