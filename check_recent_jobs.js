const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const jobs = await prisma.generationJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(jobs.map(j => ({ id: j.id, status: j.status, error: j.error_message, created: j.createdAt, provider: j.provider_name })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
