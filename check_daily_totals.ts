import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const costLogs = await prisma.apiCostLog.findMany({
      where: { createdAt: { gte: new Date('2026-05-01T00:00:00.000+02:00') } }
  });

  const dailyTotals: Record<string, { cost: number, count: number, flashCount: number, proCount: number }> = {};

  for (const log of costLogs) {
      const day = log.createdAt.toISOString().split('T')[0];
      if (!dailyTotals[day]) {
          dailyTotals[day] = { cost: 0, count: 0, flashCount: 0, proCount: 0 };
      }
      dailyTotals[day].cost += log.cost_eur;
      dailyTotals[day].count++;
      
      if (log.model_used.includes('flash')) dailyTotals[day].flashCount++;
      if (log.model_used.includes('pro')) dailyTotals[day].proCount++;
  }

  console.log("Current Database Totals:");
  for (const day of Object.keys(dailyTotals).sort()) {
      console.log(`${day}: €${dailyTotals[day].cost.toFixed(2)} (Logs: ${dailyTotals[day].count} | Flash: ${dailyTotals[day].flashCount} | Pro: ${dailyTotals[day].proCount})`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
