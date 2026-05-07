import { PrismaClient } from '@prisma/client';
import { GEMINI_RATES } from './src/lib/gemini-cost';

const prisma = new PrismaClient();

async function main() {
  const mayFirst = new Date('2026-05-01T00:00:00.000+02:00');
  
  const costLogs = await prisma.apiCostLog.findMany({
      where: { createdAt: { gte: mayFirst } }
  });
  
  const jobs = await prisma.generationJob.findMany({
      where: { createdAt: { gte: mayFirst } },
      select: { createdAt: true, user_id: true, results_count: true }
  });

  let updatedCount = 0;
  const updates = [];

  for (const log of costLogs) {
    const rate = GEMINI_RATES[log.model_used as keyof typeof GEMINI_RATES] || GEMINI_RATES["default"];
    
    let imagesGenerated = 0;
    
    if (log.action_type.includes("generation") || log.action_type.includes("generate")) {
        const logTime = new Date(log.createdAt).getTime();
        
        let closestJob = null;
        let minDiff = 30000; // 30 seconds max window
        
        for (const j of jobs) {
            const jobTime = new Date(j.createdAt).getTime();
            const diff = Math.abs(jobTime - logTime);
            
            if (diff < minDiff) {
                // If user_id exists on both, they must match. If either is null, we can tolerate it.
                if (log.user_id && j.user_id && log.user_id !== j.user_id) continue;
                minDiff = diff;
                closestJob = j;
            }
        }
        
        if (closestJob) {
            imagesGenerated = closestJob.results_count || 1;
        } else {
            // If no generation job is found (like in Telegram or Guest generation), it defaults to 1 image per call.
            imagesGenerated = 1;
        }
    }

    const newCost = ((log.tokens_in / 1000000) * rate.input) + ((log.tokens_out / 1000000) * rate.output) + (imagesGenerated * rate.per_image);

    updates.push(
        prisma.apiCostLog.update({
            where: { id: log.id },
            data: { cost_eur: newCost }
        })
    );
    updatedCount++;
  }

  console.log(`Executing ${updates.length} fixed updates for May...`);
  
  for (let i = 0; i < updates.length; i += 50) {
      await Promise.all(updates.slice(i, i + 50));
  }

  console.log(`Done! Fixed ${updatedCount} records for May to include correct image generation counts.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
