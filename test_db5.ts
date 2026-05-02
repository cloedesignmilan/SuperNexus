import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    where: { slug: 't-shirt' }
  });
  console.log("Categories with slug t-shirt:");
  cats.forEach(c => console.log(`- ${c.name} (${c.id})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
