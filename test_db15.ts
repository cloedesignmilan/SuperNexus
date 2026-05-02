import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const startOfDay = new Date('2026-05-01T00:00:00.000+02:00');
  const endOfDay = new Date('2026-05-01T23:59:59.999+02:00');

  const count = await prisma.generationJob.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  console.log(`Generations on May 1, 2026: ${count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
