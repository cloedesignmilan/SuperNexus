const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const presentations = ['model-photo-man', 'model-photo-woman'];

  for (const pres of presentations) {
    const shots = await prisma.promptConfigShot.findMany({
      where: { category: 'shoes', mode: 'lifestyle', presentation: pres }
    });
    
    for (const shot of shots) {
        let newPositive = shot.positivePrompt;
        if (!newPositive.includes("CRITICAL: PRESERVE EXACT ORIGINAL PRODUCT DESIGN")) {
            newPositive += " CRITICAL: PRESERVE EXACT ORIGINAL PRODUCT DESIGN, SHAPE, AND COLORS. ABSOLUTELY NO PRODUCT HALLUCINATION. The shoe must remain 100% identical to the input.";
        }
        
        let newNegative = "altered product, modified design, different shoe, fake design, changed colors, wrong laces, hallucinated shoe, deformed logo, fake brand, " + shot.negativePrompt;
        
        let newHardRules = shot.hardRules;
        if (!newHardRules.includes("STRICT PRODUCT PRESERVATION")) {
            newHardRules += " STRICT PRODUCT PRESERVATION. NO HALLUCINATION.";
        }

        await prisma.promptConfigShot.update({
          where: { id: shot.id },
          data: {
            positivePrompt: newPositive,
            negativePrompt: newNegative,
            hardRules: newHardRules
          }
        });
        console.log(`Aggiornato Lifestyle Shot ${shot.shotNumber} per ${pres} con regole anti-allucinazione!`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
