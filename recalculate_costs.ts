import { PrismaClient } from '@prisma/client';
import { GEMINI_RATES } from './src/lib/gemini-cost';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching ApiCostLog entries...");
  const costLogs = await prisma.apiCostLog.findMany();
  
  console.log("Fetching GenerationJob entries...");
  const jobs = await prisma.generationJob.findMany({
    select: { createdAt: true, user_id: true, results_count: true }
  });

  // Optimize search: sort jobs by time
  jobs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let updatedCount = 0;
  const updates = [];

  for (let idx = 0; idx < costLogs.length; idx++) {
    const log = costLogs[idx];
    const rate = GEMINI_RATES[log.model_used as keyof typeof GEMINI_RATES] || GEMINI_RATES["default"];
    
    let imagesGenerated = 0;
    
    if (log.action_type.includes("generation") || log.action_type.includes("generate")) {
        const logTime = new Date(log.createdAt).getTime();
        
        // Find matching job
        for (let i = 0; i < jobs.length; i++) {
            const j = jobs[i];
            const jobTime = new Date(j.createdAt).getTime();
            
            if (jobTime > logTime + 10000) break; // Optimization
            
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

    if (idx % 100 === 0 && idx > 0) {
        console.log(`Processed ${idx}/${costLogs.length} logs...`);
    }
  }

  console.log(`Executing ${updates.length} updates in batch...`);
  
  // Batch update 50 at a time
  for (let i = 0; i < updates.length; i += 50) {
      await Promise.all(updates.slice(i, i + 50));
      console.log(`Batch updated ${Math.min(i + 50, updates.length)}/${updates.length}`);
  }

  console.log(`Done! Updated ${updatedCount} records to reflect new exact costs.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
