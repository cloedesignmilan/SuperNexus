import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const startOfDay = new Date('2026-05-03T00:00:00.000Z');
  const endOfDay = new Date('2026-05-03T23:59:59.999Z');

  // Raggruppiamo i jobs per model_used
  const jobs = await prisma.generationJob.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      images: true,
    }
  });

  const modelCounts: Record<string, { jobs: number, images: number, totalCost: number }> = {};

  for (const job of jobs) {
    const model = job.model_used || "Sconosciuto";
    if (!modelCounts[model]) {
      modelCounts[model] = { jobs: 0, images: 0, totalCost: 0 };
    }
    modelCounts[model].jobs += 1;
    modelCounts[model].images += job.images.length;
    modelCounts[model].totalCost += job.total_cost_eur || 0;
  }

  // Ordina per numero di immagini (decrescente)
  const sortedModels = Object.entries(modelCounts).sort((a, b) => b[1].images - a[1].images);

  console.log("Riepilogo per Modello AI (SKU API):");
  sortedModels.forEach(([model, data]) => {
    console.log(`- ${model}: ${data.images} immagini in ${data.jobs} job (Costo Totale: €${data.totalCost.toFixed(4)})`);
  });
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
