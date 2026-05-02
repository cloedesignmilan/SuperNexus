import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const subcategories = await prisma.subcategory.findMany({
    where: { name: 'Candid' },
    include: { business_mode: { include: { category: true } } }
  });
  console.log("Subcategories named Candid:");
  subcategories.forEach(s => {
    console.log(`- ID: ${s.id}, Name: ${s.name}, Active: ${s.is_active}, Mode: ${s.business_mode.name}, Cat: ${s.business_mode.category.slug}`);
  });
  
  const allSub = await prisma.subcategory.findMany({
    where: { is_active: true },
    include: { business_mode: { include: { category: true } } }
  });
  console.log(`Active subcategories count: ${allSub.length}`);
  const hasCandid = allSub.filter(s => s.name === 'Candid');
  console.log("Active 'Candid' in DB:");
  hasCandid.forEach(s => console.log(`- ${s.business_mode.name} -> ${s.name}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
