import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LEGACY_RATES = {
  "gemini-3.1-flash-image-preview": { input: 0.075, output: 0.30, per_image: 0.0653 },
  "gemini-2.5-flash": { input: 0.075, output: 0.30, per_image: 0 },
  "gemini-3-pro-image-preview": { input: 1.25, output: 5.00, per_image: 0.0653 },
  "imagen-3.0-generate-001": { input: 0.00, output: 0.00, per_image: 0.0300 },
  "imagen-4.0-generate-001": { input: 0.00, output: 0.00, per_image: 0.0650 },
  "gemini-1.5-pro": { input: 1.25, output: 5.00, per_image: 0 },
  "gemini-1.5-flash": { input: 0.075, output: 0.30, per_image: 0 },
  "gemini-2.0-flash": { input: 0.075, output: 0.30, per_image: 0 },
  "default": { input: 0.075, output: 0.30, per_image: 0 }
};

async function main() {
  const mayFirst = new Date('2026-05-01T00:00:00.000+02:00');
  
  console.log("Fetching ApiCostLog entries before May 1st...");
  const costLogs = await prisma.apiCostLog.findMany({
      where: {
          createdAt: {
              lt: mayFirst
          }
      }
  });
  
  console.log(`Found ${costLogs.length} logs from April to revert.`);

  const jobs = await prisma.generationJob.findMany({
    where: {
        createdAt: {
            lt: mayFirst
        }
    },
    select: { createdAt: true, user_id: true, results_count: true }
  });

  jobs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let updatedCount = 0;
  const updates = [];

  for (let idx = 0; idx < costLogs.length; idx++) {
    const log = costLogs[idx];
    const rate = LEGACY_RATES[log.model_used as keyof typeof LEGACY_RATES] || LEGACY_RATES["default"];
    
    let imagesGenerated = 0;
    
    if (log.action_type.includes("generation") || log.action_type.includes("generate")) {
        const logTime = new Date(log.createdAt).getTime();
        
        for (let i = 0; i < jobs.length; i++) {
            const j = jobs[i];
            const jobTime = new Date(j.createdAt).getTime();
            
            if (jobTime > logTime + 10000) break;
            
            if (Math.abs(jobTime - logTime) < 10000 && j.user_id === log.user_id) {
                imagesGenerated = j.results_count || 0;
                break;
            }
        }
    }

    const newCost = ((log.tokens_in / 1000000) * rate.input) + ((log.tokens_out / 1000000) * rate.output) + (imagesGenerated * rate.per_image);

    if (Math.abs(newCost - log.cost_eur) > 0.0001) {
        updates.push(
            prisma.apiCostLog.update({
                where: { id: log.id },
                data: { cost_eur: newCost }
            })
        );
        updatedCount++;
    }
  }

  console.log(`Executing ${updates.length} updates in batch...`);
  
  for (let i = 0; i < updates.length; i += 50) {
      await Promise.all(updates.slice(i, i + 50));
  }

  console.log(`Done! Reverted ${updatedCount} records before May 1st to their original legacy costs.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
