const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateShot() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 't-shirt',
      mode: 'ugc',
      scene: 'home',
      shotNumber: 2
    }
  });

  if (shots.length === 0) {
    console.log("No shots found for T-Shirt > UGC > home > Shot 2");
    return;
  }

  const shot = shots[0];

  const newHardRule = `\n[CRITICAL LABEL RULE]: Any branding, label, text, or tag normally located on the inside collar area must NEVER be visible on the outside of the garment. The neckline and collar area must remain completely clean and realistic. Exposed inner labels, fake neck branding, or artificial collar graphics are strictly forbidden.`;
  const newNegative = "exposed inner collar label, neck tag printed outside, text on collar, floating logo, collar branding, fake neck label";

  let updatedHardRules = shot.hardRules || "";
  if (!updatedHardRules.includes('[CRITICAL LABEL RULE]')) {
    updatedHardRules += newHardRule;
  }

  let updatedNegative = shot.negativePrompt || "";
  if (!updatedNegative.includes('exposed inner collar label')) {
    updatedNegative += `, ${newNegative}`;
  }

  await prisma.promptConfigShot.update({
    where: { id: shot.id },
    data: {
      hardRules: updatedHardRules,
      negativePrompt: updatedNegative
    }
  });

  console.log(`Successfully updated Shot ID: ${shot.id} with strict collar label rules.`);
}

updateShot().catch(console.error).finally(() => prisma.$disconnect());
