import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const snippets = await prisma.promptSnippet.findMany({
    where: { snippet_type: 'PRODUCT_TYPE' }
  });
  console.log("PRODUCT_TYPE snippets:");
  snippets.forEach(s => console.log(`- ${s.label}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
