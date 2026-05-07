import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const startOfDay = new Date('2026-05-03T00:00:00.000Z');
  const endOfDay = new Date('2026-05-03T23:59:59.999Z');

  const jobs = await prisma.generationJob.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  const images = await prisma.jobImage.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  console.log(`Jobs: ${jobs}`);
  console.log(`Images: ${images}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
