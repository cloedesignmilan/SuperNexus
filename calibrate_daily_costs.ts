import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetTotals = {
      "2026-05-01": 25.73,
      "2026-05-02": 15.01,
      "2026-05-03": 39.58,
      "2026-05-04": 1.42
  };

  const logs = await prisma.apiCostLog.findMany({
      where: {
          createdAt: {
              gte: new Date("2026-05-01T00:00:00.000+02:00"),
              lt: new Date("2026-05-05T00:00:00.000+02:00")
          }
      }
  });

  const logsByDay: Record<string, typeof logs> = {
      "2026-05-01": [],
      "2026-05-02": [],
      "2026-05-03": [],
      "2026-05-04": []
  };

  const currentTotals: Record<string, number> = {
      "2026-05-01": 0,
      "2026-05-02": 0,
      "2026-05-03": 0,
      "2026-05-04": 0
  };

  for (const log of logs) {
      const dayStr = log.createdAt.toISOString().split('T')[0];
      if (logsByDay[dayStr]) {
          logsByDay[dayStr].push(log);
          currentTotals[dayStr] += log.cost_eur;
      }
  }

  let updatedCount = 0;

  for (const day of Object.keys(targetTotals)) {
      const target = targetTotals[day as keyof typeof targetTotals];
      const current = currentTotals[day];
      
      if (current === 0 || logsByDay[day].length === 0) continue;

      const multiplier = target / current;
      console.log(`Day ${day}: Target €${target}, Current €${current.toFixed(2)}, Multiplier: ${multiplier.toFixed(4)}`);

      for (const log of logsByDay[day]) {
          const newCost = log.cost_eur * multiplier;
          await prisma.apiCostLog.update({
              where: { id: log.id },
              data: { cost_eur: newCost }
          });
          updatedCount++;
      }
  }

  console.log(`Successfully calibrated ${updatedCount} records to perfectly match Google Cloud daily totals.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
