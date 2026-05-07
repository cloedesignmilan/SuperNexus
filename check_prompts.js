const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { category: 'shoes', mode: 'model-studio', presentation: { in: ['model-photo-woman', 'model-photo-man'] } },
    orderBy: [{ presentation: 'asc' }, { shotNumber: 'asc' }]
  });
  shots.forEach(s => {
    console.log(`\n--- ${s.presentation} SHOT ${s.shotNumber} ---`);
    console.log(`POS: ${s.positivePrompt}`);
    console.log(`NEG: ${s.negativePrompt}`);
    console.log(`RULES: ${s.hardRules}`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
