import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const multiplier = 2.1385;
  const cutoffDate = new Date('2026-05-01T00:00:00.000+02:00');
  
  const logsToRevert = await prisma.apiCostLog.findMany({
    where: {
      model_used: {
        contains: 'image-preview'
      },
      createdAt: {
        lt: cutoffDate
      }
    }
  });

  console.log(`Found ${logsToRevert.length} logs before May 1, 2026 to revert.`);

  let totalReverted = 0;
  for (const log of logsToRevert) {
    if (log.cost_eur > 0) {
      // Divide by the multiplier to restore the original value
      await prisma.apiCostLog.update({
        where: { id: log.id },
        data: { cost_eur: log.cost_eur / multiplier }
      });
      totalReverted++;
    }
  }

  console.log(`Successfully reverted ${totalReverted} cost logs to their original value.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
