const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const genericShots = await prisma.promptConfigShot.findMany({
    where: { presentation: 'model-photo' }
  });

  console.log(`Found ${genericShots.length} generic model-photo shots. Migrating to man/woman...`);

  let count = 0;
  for (const shot of genericShots) {
    // Duplica per WOMAN
    await prisma.promptConfigShot.create({
      data: {
        category: shot.category,
        mode: shot.mode,
        presentation: 'model-photo-woman',
        shotNumber: shot.shotNumber,
        shotName: shot.shotName,
        priority: shot.priority,
        scene: shot.scene,
        positivePrompt: shot.positivePrompt,
        negativePrompt: shot.negativePrompt,
        hardRules: shot.hardRules,
        outputGoal: shot.outputGoal,
        isActive: shot.isActive,
        imageUrl: shot.imageUrl
      }
    });

    // Duplica per MAN
    await prisma.promptConfigShot.create({
      data: {
        category: shot.category,
        mode: shot.mode,
        presentation: 'model-photo-man',
        shotNumber: shot.shotNumber,
        shotName: shot.shotName,
        priority: shot.priority,
        scene: shot.scene,
        positivePrompt: shot.positivePrompt,
        negativePrompt: shot.negativePrompt,
        hardRules: shot.hardRules,
        outputGoal: shot.outputGoal,
        isActive: shot.isActive,
        imageUrl: shot.imageUrl
      }
    });

    // Elimina quello generico
    await prisma.promptConfigShot.delete({
      where: { id: shot.id }
    });
    
    count++;
  }

  console.log(`Migration complete! Processed ${count} shots.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
