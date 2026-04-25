const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const data = await prisma.promptConfigShot.findMany();
  console.log(JSON.stringify(data, null, 2));
}
run().finally(() => prisma.$disconnect());
