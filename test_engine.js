require('dotenv').config({path: '.env.local'});
if (!process.env.GOOGLE_AI_STUDIO_API_KEY) {
  require('dotenv').config({path: '.env'});
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateTshirtImages } = require('./src/lib/ai/engines/tshirtEngine');

async function main() {
  const subcat = await prisma.subcategory.findFirst({
    where: { name: 'No Model' },
    include: { business_mode: { include: { category: true } } }
  });
  
  try {
    const result = await generateTshirtImages({
      qty: 1,
      subcat,
      publicUrls: ['https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-uploads/web_admin_sandbox_1778345695077.jpg'],
      userClarification: 'X',
      isOutfit: false,
      varianceEnabled: false,
      generationModel: 'gemini-1.5-pro',
      taxonomyCat: 't-shirt',
      taxonomyMode: 'clean-catalog',
      taxonomySubcat: 'no-model',
      specificShotNumber: 1,
      clientGender: 'WOMAN'
    });
    console.log("SUCCESS:", result.errorMessages);
  } catch(e) {
    console.error("CRASH:", e);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
