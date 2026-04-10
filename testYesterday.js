const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const COST_PER_IMAGE_GEN = 0.03;
    const COST_PER_VISION_ANALYSIS = 0.0001315;
    
    // Yesterday boundaries (assuming today is April 11, 2026 local time, so yesterday is April 10)
    const yesterdayStart = new Date('2026-04-10T00:00:00.000+02:00');
    const yesterdayEnd = new Date('2026-04-10T23:59:59.999+02:00');

    console.log(`Checking from: ${yesterdayStart.toISOString()} to ${yesterdayEnd.toISOString()}`);

    const jobs = await prisma.generationJob.findMany({
        where: {
            createdAt: {
                gte: yesterdayStart,
                lte: yesterdayEnd
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
    console.log(`Jobs Yesterday: ${jobs.length}`);
    console.log(`Images Generated Yesterday: ${totalImages}`);
    console.log(`Cost Vision API: €${totalVision.toFixed(4)}`);
    console.log(`Cost Generation API: €${costImages.toFixed(4)}`);
    console.log(`TOTAL YESTERDAY SPEND: €${totalCost.toFixed(4)}`);
    console.log(`======================`);
}
run().catch(console.error).finally(() => prisma.$disconnect());
