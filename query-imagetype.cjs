const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const snippets = await prisma.promptSnippet.findMany({
    where: { snippet_type: 'IMAGE_TYPE' }
  });
  console.log(snippets.map(s => s.label));
}
main().finally(() => prisma.$disconnect());
