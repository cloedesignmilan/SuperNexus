const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const snippets = await prisma.promptSnippet.findMany({
    where: { snippet_type: 'PRODUCT_TYPE' }
  });
  console.log(snippets.map(s => ({ id: s.id, label: s.label })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
