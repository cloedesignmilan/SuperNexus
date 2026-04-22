const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const images = await prisma.jobImage.findMany({ where: { job_id: "f85de8e6-ed26-4566-b365-b8e9b7e6013a" } });
  console.log("Images:", images);
}
main().catch(console.error).finally(() => prisma.$disconnect());
