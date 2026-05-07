const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const presentations = ['model-photo-man', 'model-photo-woman'];

  for (const pres of presentations) {
    const s2 = await prisma.promptConfigShot.findFirst({
      where: { category: 'shoes', mode: 'model-studio', presentation: pres, shotNumber: 2 }
    });
    if (s2) {
      await prisma.promptConfigShot.update({
        where: { id: s2.id },
        data: {
          positivePrompt: "Dynamic high fashion editorial photography. Beautiful {gender} model captured mid-step walking across a sophisticated minimalist studio set with dramatic professional lighting. 3/4 body framing showing from torso down. High-end modern styling. The {product} is perfectly integrated into the elegant look. CRITICAL: PRESERVE EXACT ORIGINAL PRODUCT DESIGN, SHAPE, AND COLORS. ABSOLUTELY NO PRODUCT HALLUCINATION. The shoe must remain 100% identical to the input. CRITICAL VARIETY RULE: This shot MUST be clearly different in angle, framing, lighting, and composition from any standard view.",
          negativePrompt: "altered product, modified design, different shoe, fake design, changed colors, wrong laces, hallucinated shoe, deformed logo, fake brand, full body, face, messy background, outdoor, street, stiff pose, static pose, bad lighting, text, watermark, price tag, barcode",
          hardRules: "DYNAMIC WALKING POSE. 3/4 BODY FRAMING. STRICT PRODUCT PRESERVATION. NO HALLUCINATION. DRAMATIC STUDIO LIGHTING. NO SIMILAR SHOTS."
        }
      });
      console.log(`Aggiornato Shot 2 per ${pres} con regole anti-allucinazione letali!`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
