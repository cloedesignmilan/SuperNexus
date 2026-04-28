const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const job = await prisma.generationJob.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log("JOB CREATED AT:", job.createdAt);
}
main().finally(() => prisma.$disconnect());
