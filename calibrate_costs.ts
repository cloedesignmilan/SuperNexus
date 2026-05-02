import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const multiplier = 2.1385; // 26.02 / 12.1674
  
  const logsToUpdate = await prisma.apiCostLog.findMany({
    where: {
      model_used: {
        contains: 'image-preview'
      }
    }
  });

  console.log(`Found ${logsToUpdate.length} logs to calibrate.`);

  let totalUpdated = 0;
  for (const log of logsToUpdate) {
    if (log.cost_eur > 0) {
      await prisma.apiCostLog.update({
        where: { id: log.id },
        data: { cost_eur: log.cost_eur * multiplier }
      });
      totalUpdated++;
    }
  }

  console.log(`Successfully calibrated ${totalUpdated} cost logs.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
