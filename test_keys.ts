import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const jobs = await prisma.generationJob.findMany({ take: 1 });
  console.log("Job keys:", Object.keys(jobs[0]));
  const logs = await prisma.apiCostLog.findMany({ take: 1 });
  console.log("Log keys:", Object.keys(logs[0]));
}
main().finally(() => prisma.$disconnect());
