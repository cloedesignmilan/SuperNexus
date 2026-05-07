import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const startOfDay = new Date('2026-05-04T00:00:00.000+02:00');
  const endOfDay = new Date('2026-05-04T23:59:59.999+02:00');

  const jobs = await prisma.generationJob.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      model_used: {
        contains: 'pro',
        mode: 'insensitive'
      }
    },
  });

  let totalImages = 0;
  const models = new Set();
  
  for (const job of jobs) {
    totalImages += job.results_count;
    models.add(job.model_used);
  }

  console.log(`Total images generated with Pro models on May 4: ${totalImages}`);
  console.log(`Models found:`, Array.from(models));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
