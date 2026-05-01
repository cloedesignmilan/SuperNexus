const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const file = './src/lib/prompt-configs/tshirt.json';
  let data = JSON.parse(fs.readFileSync(file, 'utf8'));

  data.forEach(config => {
    if (config.mode === 'ugc-home') {
      config.shots.forEach(shot => {
        // Enforce tidy constraints
        shot.positivePrompt = shot.positivePrompt.replace(/Messy unmade bed with white sheets/gi, 'Perfectly made, elegant bed with crisp white sheets');
        shot.positivePrompt = shot.positivePrompt.replace(/messy bun/gi, 'elegant casual hair');
        shot.positivePrompt = shot.positivePrompt.replace(/Imperfect candid mirror selfie/gi, 'Aesthetic candid mirror selfie');
        
        // Add "beautiful, clean and tidy" explicitly if not present
        if (!shot.positivePrompt.includes('tidy')) {
            shot.positivePrompt += ' The background must be a beautiful, highly aesthetic, clean and tidy home environment with no clutter.';
        }

        shot.negativePrompt += ', messy bed, unmade bed, cluttered room, messy room, dirty room, disorganized, chaotic background, trash, ugly interior';
        
        // Update hard rules
        if (!shot.hardRules.includes('TIDY')) {
            shot.hardRules += ' ABSOLUTELY NO MESSY BEDS OR CLUTTER. THE ROOM MUST BE BEAUTIFUL, CLEAN AND TIDY.';
        }
      });
    }
  });

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log("Updated tshirt.json");

  // Sync to DB
  for (const config of data) {
    if (config.mode === 'ugc-home') {
      for (const shot of config.shots) {
        await prisma.promptConfigShot.updateMany({
          where: {
            category: 't-shirt',
            mode: config.mode,
            presentation: config.presentation,
            shotNumber: shot.shotNumber
          },
          data: {
            positivePrompt: shot.positivePrompt,
            negativePrompt: shot.negativePrompt,
            hardRules: shot.hardRules
          }
        });
      }
    }
  }
  console.log("Synced to database");
}

run().catch(console.error).finally(() => prisma.$disconnect());
