import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const startDate = new Date('2026-05-01T00:00:00.000+02:00');
  const endDate = new Date('2026-05-05T00:00:00.000+02:00');

  const costLogs = await prisma.apiCostLog.findMany({
      where: {
          createdAt: {
              gte: startDate,
              lt: endDate
          }
      }
  });

  const jobs = await prisma.generationJob.findMany({
      where: {
          createdAt: {
              gte: startDate,
              lt: endDate
          }
      },
      select: { createdAt: true, user_id: true, results_count: true }
  });

  let flashImages = 0;
  let proImages = 0;

  for (const log of costLogs) {
      let imagesGenerated = 0;
      
      if (log.action_type.includes("generation") || log.action_type.includes("generate")) {
          const logTime = new Date(log.createdAt).getTime();
          let closestJob = null;
          let minDiff = 30000;
          
          for (const j of jobs) {
              const jobTime = new Date(j.createdAt).getTime();
              const diff = Math.abs(jobTime - logTime);
              if (diff < minDiff) {
                  if (log.user_id && j.user_id && log.user_id !== j.user_id) continue;
                  minDiff = diff;
                  closestJob = j;
              }
          }
          
          if (closestJob) {
              imagesGenerated = closestJob.results_count || 1;
          } else {
              imagesGenerated = 1;
          }
      }

      if (log.model_used.includes("flash")) {
          flashImages += imagesGenerated;
      } else if (log.model_used.includes("pro")) {
          proImages += imagesGenerated;
      }
  }

  const totalGoogleBilling = 25.73 + 15.01 + 39.58 + 1.42; // 81.74
  const flashGoogleBilling = 73.89;
  const proGoogleBilling = totalGoogleBilling - flashGoogleBilling; // 7.85

  const flashCostPerImage = flashGoogleBilling / (flashImages || 1);
  const proCostPerImage = proGoogleBilling / (proImages || 1);

  console.log(`--- GENERATION ANALYSIS (May 1 - May 4) ---`);
  console.log(`Total Billing (Google Cloud): €${totalGoogleBilling.toFixed(2)}`);
  console.log(`Flash Billing: €${flashGoogleBilling.toFixed(2)} for ${flashImages} images => €${flashCostPerImage.toFixed(4)} per image`);
  console.log(`Pro Billing: €${proGoogleBilling.toFixed(2)} for ${proImages} images => €${proCostPerImage.toFixed(4)} per image`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
