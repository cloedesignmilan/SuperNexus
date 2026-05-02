import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const checks = await prisma.outputValidationCheck.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(checks, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
