import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    where: { is_active: true }
  });
  console.log("Active Categories:");
  cats.forEach(c => console.log(`- ${c.name} (slug: ${c.slug})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
