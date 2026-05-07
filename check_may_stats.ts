import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const mayFirst = new Date('2026-05-01T00:00:00.000+02:00');
  
  const costLogs = await prisma.apiCostLog.findMany({
      where: { createdAt: { gte: mayFirst } }
  });
  
  const jobs = await prisma.generationJob.findMany({
      where: { createdAt: { gte: mayFirst } }
  });

  for (let i = 0; i < Math.min(5, costLogs.length); i++) {
      const log = costLogs[i];
      if (log.action_type.includes("generation") || log.action_type.includes("generate")) {
        const logTime = new Date(log.createdAt).getTime();
        console.log(`Log ${log.id} created at ${log.createdAt}`);
        // find closest job
        let closestJob = null;
        let minDiff = Infinity;
        for (const j of jobs) {
            const jobTime = new Date(j.createdAt).getTime();
            const diff = Math.abs(jobTime - logTime);
            if (diff < minDiff) {
                minDiff = diff;
                closestJob = j;
            }
        }
        if (closestJob) {
            console.log(`Closest job created at ${closestJob.createdAt}, diff: ${minDiff}ms, log user: ${log.user_id}, job user: ${closestJob.user_id}`);
        }
      }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
