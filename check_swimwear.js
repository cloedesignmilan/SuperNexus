const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSwimwear() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { category: 'swimwear' },
    select: { mode: true, presentation: true, shotNumber: true }
  });
  console.log(`Trovati ${shots.length} shots per Swimwear nel DB.`);
  if(shots.length > 0) {
      // groupBy mode e presentation
      const groups = {};
      for(const s of shots) {
          const key = `${s.mode} > ${s.presentation}`;
          if(!groups[key]) groups[key] = 0;
          groups[key]++;
      }
      console.log(groups);
  }
}
checkSwimwear().catch(console.error).finally(() => prisma.$disconnect());
