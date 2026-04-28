const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const job = await prisma.generationJob.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log("PROMPT GENERATED:");
  console.log(job.prompt_generated);
}
main().finally(() => prisma.$disconnect());
