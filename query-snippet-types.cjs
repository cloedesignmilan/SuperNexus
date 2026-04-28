const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const snippets = await prisma.promptSnippet.findMany({
    select: { snippet_type: true },
    distinct: ['snippet_type']
  });
  console.log(snippets.map(s => s.snippet_type));
}
main().finally(() => prisma.$disconnect());
