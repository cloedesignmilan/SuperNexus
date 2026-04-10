const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const COST_PER_IMAGE_GEN = 0.03;
    const COST_PER_VISION_ANALYSIS = 0.0001315;
    let totalVision = 0;
    let totalImages = 0;
    const jobs = await prisma.generationJob.findMany({
        select: { status: true, results_count: true }
    });
    for (const job of jobs) {
        totalVision += COST_PER_VISION_ANALYSIS;
        if (job.status === "completato") {
            totalImages += job.results_count;
        }
    }
    const costImages = totalImages * COST_PER_IMAGE_GEN;
    const totalCost = totalVision + costImages;
    console.log(`======================`);
    console.log(`Total Jobs Analyzed: ${jobs.length}`);
    console.log(`Total Images Generated: ${totalImages}`);
    console.log(`Cost Vision API: €${totalVision.toFixed(4)}`);
    console.log(`Cost Generation API: €${costImages.toFixed(4)}`);
    console.log(`TOTAL EXACT SPEND: €${totalCost.toFixed(4)}`);
    console.log(`======================`);
}
run().catch(console.error).finally(() => prisma.$disconnect());
