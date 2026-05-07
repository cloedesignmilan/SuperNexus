const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { category: 'everyday' }
  });
  
  if (shots.length === 0) {
    console.log("No shots found for everyday");
    return;
  }
  
  let count = 0;
  for (const shot of shots) {
    if (shot.shotName.toLowerCase().includes('back') || shot.shotName.toLowerCase().includes('dietro')) {
       console.log(`Found Back shot: ${shot.shotName}`);
       let newNegative = shot.negativePrompt || '';
       if (!newNegative.includes('back print')) {
         newNegative += ', back print, graphic on back, pattern bleeding, printed back, logo on back';
         await prisma.promptConfigShot.update({
            where: { id: shot.id },
            data: { negativePrompt: newNegative }
         });
         console.log(`Updated!`);
         count++;
       }
    }
  }
  console.log(`Updated ${count} back shots for everyday.`);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
