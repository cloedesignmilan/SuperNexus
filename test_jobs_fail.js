const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const jobs = await prisma.generationJob.findMany({
    where: { status: 'failed' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  jobs.forEach(j => console.log(j.createdAt.toISOString() + " " + j.subcategory_id));
}
main().catch(console.error).finally(() => prisma.$disconnect());
