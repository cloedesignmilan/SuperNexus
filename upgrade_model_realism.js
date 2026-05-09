const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allShots = await prisma.promptConfigShot.findMany();
  
  // Filter locally for complex logic
  const targetShots = allShots.filter(shot => {
      const pres = shot.presentation.toLowerCase();
      const mode = shot.mode.toLowerCase();
      const isUgcOrCandid = pres.includes('ugc') || pres.includes('candid') || mode.includes('ugc');
      const isNoModel = pres.includes('no-model') || pres.includes('ghost-mannequin') || pres.includes('still-life-pack') || pres.includes('flat-lay');
      
      // We want shots that ARE NOT UGC/Candid, and ARE NOT No-Model
      return !isUgcOrCandid && !isNoModel;
  });

  console.log(`Found ${targetShots.length} Professional Model shots to upgrade...`);

  let updatedCount = 0;

  for (const shot of targetShots) {
    let updatedPositivePrompt = shot.positivePrompt || '';
    let updatedNegativePrompt = shot.negativePrompt || '';

    // 1. INJECT HUMAN REALISM (Positive Prompt)
    const realismRule = '[HUMAN REALISM DIRECTIVE]: Extremely realistic, naturally beautiful, and visually credible model. Authentic skin texture, realistic eyes, natural facial proportions, subtle human imperfections, and believable human details. Premium, editorial, cinematic, and hyper-realistic photographic style, similar to high-end fashion magazines and luxury commercial campaigns. Natural and credible skin rendering, facial anatomy, and expressions. The image MUST immediately feel real, emotionally believable, and professionally photographed by a real human photographer. DO NOT look like an AI.';
    
    if (!updatedPositivePrompt.includes('[HUMAN REALISM DIRECTIVE]')) {
      updatedPositivePrompt += `\n\n${realismRule}`;
    }

    // 2. INJECT ANTI-AI FILTER (Negative Prompt)
    const antiAiNegative = 'fake-looking AI face, plastic skin, uncanny expression, exaggerated beauty filter, artificial symmetry, overly retouched features, synthetic influencer, mannequin-like face, heavily airbrushed beauty imagery, AI-generated character, perfect flawless CGI skin';
    
    if (!updatedNegativePrompt.includes('fake-looking AI face')) {
       updatedNegativePrompt = updatedNegativePrompt 
         ? `${updatedNegativePrompt}, ${antiAiNegative}` 
         : antiAiNegative;
    }

    // Update the record
    await prisma.promptConfigShot.update({
      where: { id: shot.id },
      data: {
        positivePrompt: updatedPositivePrompt,
        negativePrompt: updatedNegativePrompt
      }
    });

    updatedCount++;
  }

  console.log(`Successfully upgraded ${updatedCount} Professional Model shots with Human Realism rules.`);
  
  if (targetShots.length > 0) {
    // Show a sample to verify
    const sample = await prisma.promptConfigShot.findFirst({
      where: { id: targetShots[0].id }
    });
    
    console.log("\n--- SAMPLE UPGRADED MODEL SHOT ---");
    console.log("CATEGORY:", sample.category, "| MODE:", sample.mode, "| PRES:", sample.presentation);
    console.log("POSITIVE:\n" + sample.positivePrompt);
    console.log("----------------------");
    console.log("NEGATIVE:\n" + sample.negativePrompt);
    console.log("----------------------");
    console.log("HARD RULES:\n" + sample.hardRules);
    console.log("----------------------------");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
