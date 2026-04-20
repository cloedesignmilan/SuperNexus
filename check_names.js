const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cats = await prisma.category.findMany();
  console.log("Categories:", cats.map(c => c.name));
  
  const bms = await prisma.businessMode.findMany();
  console.log("Business Modes:", bms.map(bm => bm.name));
}
main().finally(() => prisma.$disconnect());
