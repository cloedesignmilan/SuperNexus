const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = "f85de8e6-ed26-4566-b365-b8e9b7e6013a";
  const job = await prisma.generationJob.findUnique({ where: { id } });
  console.log("Job:", job);
}
main().catch(console.error).finally(() => prisma.$disconnect());
