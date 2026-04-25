const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const snippets = await prisma.promptSnippet.findMany({
    where: { is_active: true },
    select: { snippet_type: true, label: true }
  });
  console.log(JSON.stringify(snippets, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
