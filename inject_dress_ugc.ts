const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const shots = [
  {
    category: 'dress', mode: 'ugc', presentation: 'candid-woman', shotNumber: 1,
    shotName: 'Wedding Reception Selfie',
    positivePrompt: 'Aesthetic UGC smartphone photo of a beautiful young woman as a wedding guest at a luxury outdoor reception. She is taking a quick, spontaneous mirror selfie or holding the phone up, laughing. Wearing a stunning premium {product}. Authentic, unposed, slightly imperfect framing. Warm evening string lights, blurred wedding tables in the background. Highly realistic amateur photography, iPhone 14 style, slight grain.',
    negativePrompt: 'posed, magazine, professional fashion model, editorial, studio, artificial lighting, high fashion, stern expression, professional camera, cinematic blur, DSLR, perfect framing, low quality, illustration',
    hardRules: '[CRITICAL] Background MUST be a wedding reception. Photo MUST look like it was taken by a smartphone, spontaneous and amateur.'
  },
  {
    category: 'dress', mode: 'ugc', presentation: 'candid-woman', shotNumber: 2,
    shotName: 'Dancing at Party',
    positivePrompt: 'Candid UGC smartphone photo of a cute woman dancing happily at a glamorous evening party or wedding reception. She is wearing a beautiful {product}. Captured mid-movement, blurry background with party lights, joyful authentic expression, unposed. Feels like a real photo taken by a friend on an iPhone. Natural flash lighting.',
    negativePrompt: 'posed, magazine, professional fashion model, editorial, studio, artificial lighting, high fashion, stern expression, professional camera, cinematic blur, DSLR, perfect framing, low quality, illustration',
    hardRules: '[CRITICAL] Background MUST be a party or wedding dance floor. Photo MUST look spontaneous and captured mid-movement.'
  },
  {
    category: 'dress', mode: 'ugc', presentation: 'candid-woman', shotNumber: 3,
    shotName: 'Holding Champagne',
    positivePrompt: 'Spontaneous UGC photo taken by a friend: a beautiful woman standing casually at a wedding cocktail hour, holding a glass of champagne and smiling naturally at the camera. Wearing a stunning premium {product}. Unposed, candid moment. Blurred garden or luxury villa background. iPhone camera aesthetic, highly realistic.',
    negativePrompt: 'posed, magazine, professional fashion model, editorial, studio, artificial lighting, high fashion, stern expression, professional camera, cinematic blur, DSLR, perfect framing, low quality, illustration',
    hardRules: '[CRITICAL] Background MUST be a wedding cocktail hour. The girl MUST look natural and unposed, holding a drink.'
  },
  {
    category: 'dress', mode: 'ugc', presentation: 'candid-woman', shotNumber: 4,
    shotName: 'Ceremony Guest',
    positivePrompt: 'Authentic candid UGC photo of a woman sitting as a guest during a beautiful outdoor wedding ceremony, looking towards the altar with a soft smile. Shot from a slightly imperfect angle by a friend. She is wearing a beautiful {product}. Sunny day, floral decorations in the blurred background. Realistic smartphone aesthetic.',
    negativePrompt: 'posed, magazine, professional fashion model, editorial, studio, artificial lighting, high fashion, stern expression, professional camera, cinematic blur, DSLR, perfect framing, low quality, illustration',
    hardRules: '[CRITICAL] Background MUST be a wedding ceremony setting. The girl MUST look unposed and completely natural.'
  },
  {
    category: 'dress', mode: 'ugc', presentation: 'candid-woman', shotNumber: 5,
    shotName: 'Walking to Venue',
    positivePrompt: 'Spontaneous UGC smartphone photo of a happy woman walking towards a luxury party venue, looking back over her shoulder at the camera and laughing. She is wearing a stunning premium {product}. Completely unposed, authentic lifestyle moment. Evening light, slightly tilted angle, realistic amateur iPhone photography.',
    negativePrompt: 'posed, magazine, professional fashion model, editorial, studio, artificial lighting, high fashion, stern expression, professional camera, cinematic blur, DSLR, perfect framing, low quality, illustration',
    hardRules: '[CRITICAL] Background MUST be an outdoor path or venue entrance. The girl MUST look spontaneous, smiling naturally.'
  }
];

async function run() {
  for (const shot of shots) {
    const exists = await prisma.promptConfigShot.findFirst({
      where: {
        category: shot.category,
        mode: shot.mode,
        presentation: shot.presentation,
        shotNumber: shot.shotNumber
      }
    });

    if (exists) {
      await prisma.promptConfigShot.update({
        where: { id: exists.id },
        data: shot
      });
      console.log(`Updated \${shot.mode} / \${shot.presentation} / Shot \${shot.shotNumber}`);
    } else {
      await prisma.promptConfigShot.create({
        data: {
          ...shot,
          scene: 'all',
          priority: 1,
          isActive: true
        }
      });
      console.log(`Created \${shot.mode} / \${shot.presentation} / Shot \${shot.shotNumber}`);
    }
  }
}

run()
  .then(() => {
    console.log('All Dress UGC Wedding/Party injections complete.');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
