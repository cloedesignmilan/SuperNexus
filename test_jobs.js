const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.generationJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log("RECENT JOBS:");
  jobs.forEach(j => console.log(`${j.createdAt.toISOString()} | Status: ${j.status} | Mode: ${j.business_mode_id} | Subcat: ${j.subcategory_id} | Error: ${j.error_message?.substring(0, 50)}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
