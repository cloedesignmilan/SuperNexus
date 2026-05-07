import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const costLogs = await prisma.apiCostLog.findMany({
      where: {
          createdAt: {
              gte: new Date('2026-05-01T00:00:00.000+02:00'),
              lt: new Date('2026-05-05T00:00:00.000+02:00')
          }
      }
  });

  const actionTypes: Record<string, number> = {};

  for (const log of costLogs) {
      if (!actionTypes[log.action_type]) actionTypes[log.action_type] = 0;
      actionTypes[log.action_type]++;
  }

  console.log("Action Types in May 1-4:");
  console.table(actionTypes);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
