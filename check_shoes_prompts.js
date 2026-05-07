const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { category: 'shoes', mode: 'lifestyle' },
    select: { presentation: true, shotNumber: true }
  });
  console.log("Shoes Lifestyle Prompts:", shots);
}
main().catch(console.error).finally(() => prisma.$disconnect());
