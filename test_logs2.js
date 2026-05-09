const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const job = await prisma.generationJob.findFirst({
    where: { status: 'failed' },
    orderBy: { createdAt: 'desc' }
  });
  console.log("LAST FAILED JOB:");
  console.log("ID:", job.id);
  console.log("Category:", job.category_id);
  console.log("Mode:", job.business_mode_id);
  console.log("Original Image:", job.original_product_image_url);
  console.log("Custom Notes:", job.custom_notes);
}

main().catch(console.error).finally(() => prisma.$disconnect());
