const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const snippets = await prisma.promptSnippet.findMany({
    where: { snippet_type: 'MODEL_OPTION' }
  });
  console.log(snippets.map(s => s.label));
}
main().finally(() => prisma.$disconnect());
