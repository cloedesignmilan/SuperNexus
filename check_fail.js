const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const jobs = await prisma.generationJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  console.log(jobs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
