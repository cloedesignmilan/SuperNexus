const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const COST_PER_IMAGE_GEN = 0.03;
    const COST_PER_VISION_ANALYSIS = 0.0001315;
    
    // April 1st
    const aprilStart = new Date('2026-04-01T00:00:00.000+02:00');
    
    const jobs = await prisma.generationJob.findMany({
        where: { createdAt: { gte: aprilStart } },
        select: { status: true, results_count: true, createdAt: true }
    });
    
    let totalVision = 0;
    let totalImages = 0;
    
    for (const job of jobs) {
        totalVision += COST_PER_VISION_ANALYSIS;
        if (job.status === "completato") {
            totalImages += job.results_count;
        }
    }
    
    const costImages = totalImages * COST_PER_IMAGE_GEN;
    const totalCost = totalVision + costImages;
    console.log(`======================`);
    console.log(`Jobs dal 1 Aprile: ${jobs.length}`);
    console.log(`Images Generated: ${totalImages}`);
    console.log(`TOTAL APRIL SPEND: €${totalCost.toFixed(4)}`);
    console.log(`======================`);
}
run().catch(console.error).finally(() => prisma.$disconnect());
