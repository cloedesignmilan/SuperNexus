const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const COST_PER_IMAGE_GEN = 0.03;
    const COST_PER_VISION_ANALYSIS = 0.0001315;
    
    // Today boundaries (since it is 00:51 AM April 11 right now)
    const todayStart = new Date('2026-04-11T00:00:00.000+02:00');
    
    const jobs = await prisma.generationJob.findMany({
        where: {
            createdAt: {
                gte: todayStart
            }
        },
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
    console.log(`Jobs TODAY (April 11): ${jobs.length}`);
    console.log(`Images Generated TODAY: ${totalImages}`);
    console.log(`Cost Vision API: €${totalVision.toFixed(4)}`);
    console.log(`Cost Generation API: €${costImages.toFixed(4)}`);
    console.log(`TOTAL TODAY SPEND: €${totalCost.toFixed(4)}`);
    console.log(`======================`);
}
run().catch(console.error).finally(() => prisma.$disconnect());
