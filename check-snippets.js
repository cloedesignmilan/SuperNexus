const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function r() {
  const c = await prisma.promptSnippet.findMany({where: {snippet_type: 'MODEL_OPTION'}});
  console.log(JSON.stringify(c, null, 2));
}
r().finally(() => prisma.$disconnect());
