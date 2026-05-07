import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const startOfDay = new Date('2026-05-03T00:00:00.000+02:00');
  const endOfDay = new Date('2026-05-03T23:59:59.999+02:00');

  const jobs = await prisma.generationJob.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      }
    },
  });

  const modelCounts: Record<string, number> = {};
  
  for (const job of jobs) {
    const model = job.model_used || 'unknown';
    modelCounts[model] = (modelCounts[model] || 0) + job.results_count;
  }

  console.log(`Model counts on May 3:`, modelCounts);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
