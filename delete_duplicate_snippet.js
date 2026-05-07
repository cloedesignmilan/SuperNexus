const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.promptSnippet.delete({
    where: { id: '8f90d76b-a519-4cd7-9761-09d0dbb844de' }
  });
  console.log("Deleted duplicate snippet");
}
main().catch(console.error).finally(() => prisma.$disconnect());
