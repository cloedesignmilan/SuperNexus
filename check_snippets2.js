const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const snippets = await prisma.promptSnippet.findMany({
    where: { snippet_type: 'PRODUCT_TYPE', label: 'Dress / Elegant' }
  });
  console.log(snippets);
}
main().catch(console.error).finally(() => prisma.$disconnect());
