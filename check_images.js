const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { isActive: true }
  });
  const nullShots = shots.filter(s => !s.imageUrl);
  const byCat = {};
  for(const s of nullShots) {
    const key = `${s.category} / ${s.mode} / ${s.presentation}`;
    byCat[key] = (byCat[key] || 0) + 1;
  }
  console.log("Shots without images:");
  for(const [k,v] of Object.entries(byCat)) {
    console.log(`- ${k}: ${v} shots`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
