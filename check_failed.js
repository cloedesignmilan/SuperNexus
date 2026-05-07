const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const jobs = await prisma.generationJob.findMany({
    where: { status: 'failed' },
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  console.log(jobs.map(j => ({ id: j.id, error: j.error_message })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
