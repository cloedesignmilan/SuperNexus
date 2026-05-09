const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const job = await prisma.generationJob.findFirst({
    where: { status: 'failed' },
    orderBy: { createdAt: 'desc' }
  });
  console.log("LAST FAILED JOB ERROR MESSAGE:", job?.error_message);
}

main().catch(console.error).finally(() => prisma.$disconnect());
