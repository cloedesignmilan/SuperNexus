const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const data = require('./src/lib/prompt-configs/tshirt.json');

async function sync() {
  const catNode = data[0];
  for (const configNode of catNode.configs) {
    for (const shot of configNode.shots) {
      const existing = await prisma.promptConfigShot.findFirst({
        where: {
          category: catNode.category,
          mode: configNode.mode,
          presentation: configNode.presentation,
          scene: configNode.scene || "all",
          shotNumber: Number(shot.shotNumber)
        }
      });
      if (existing) {
        await prisma.promptConfigShot.update({
          where: { id: existing.id },
          data: {
            shotName: shot.shotName,
            positivePrompt: shot.positivePrompt,
            negativePrompt: shot.negativePrompt,
            hardRules: shot.hardRules,
            outputGoal: shot.outputGoal
          }
        });
      } else {
        await prisma.promptConfigShot.create({
          data: {
            category: catNode.category,
            mode: configNode.mode,
            presentation: configNode.presentation,
            scene: configNode.scene || "all",
            shotNumber: Number(shot.shotNumber),
            shotName: shot.shotName,
            positivePrompt: shot.positivePrompt,
            negativePrompt: shot.negativePrompt,
            hardRules: shot.hardRules,
            outputGoal: shot.outputGoal,
            isActive: true,
            priority: 0
          }
        });
      }
    }
  }
  console.log("Synced to DB successfully");
}
sync().catch(console.error).finally(() => prisma.$disconnect());
