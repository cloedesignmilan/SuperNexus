const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const shots = [
  // ================= SWIMWEAR LIFESTYLE CANDID WOMAN =================
  {
    category: 'swimwear', mode: 'lifestyle', presentation: 'candid-woman', shotNumber: 1,
    shotName: 'Walking on the Beach',
    positivePrompt: 'Aesthetic candid lifestyle photo of a beautiful woman walking away on a pristine white sand beach, looking back over her shoulder with a genuine smile. She is wearing a stunning premium {product}. The lighting is gorgeous golden hour sunlight, creating a warm, dreamy holiday atmosphere. Crystal clear ocean waves gently washing ashore in the background. Highly realistic editorial photography, 85mm lens, natural pose.',
    negativePrompt: 'messy, crowded beach, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a beautiful beach at golden hour.'
  },
  {
    category: 'swimwear', mode: 'lifestyle', presentation: 'candid-woman', shotNumber: 2,
    shotName: 'Sitting by the Pool',
    positivePrompt: 'Candid lifestyle photo of a beautiful woman sitting casually at the edge of a luxurious infinity pool overlooking the ocean. She is dipping her toes in the crystal clear water. Wearing a stunning premium {product}. Bright midday sun, vivid blue sky, tropical palm trees in the background. Highly detailed, photorealistic vacation aesthetic.',
    negativePrompt: 'messy, public pool, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a luxury infinity pool setting.'
  },
  {
    category: 'swimwear', mode: 'lifestyle', presentation: 'candid-woman', shotNumber: 3,
    shotName: 'Beach Towel Relaxing',
    positivePrompt: 'Candid photo of a beautiful woman lying gracefully on a stylish boho beach towel on the sand. She is resting on her elbows, looking out towards the sea. Wearing a stunning premium {product}. Soft natural sunlight, warm tropical vibe. Highly realistic, Instagram influencer vacation aesthetic.',
    negativePrompt: 'messy, crowded beach, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a beautiful sandy beach.'
  },
  {
    category: 'swimwear', mode: 'lifestyle', presentation: 'candid-woman', shotNumber: 4,
    shotName: 'Sipping Coconut',
    positivePrompt: 'Candid half-body shot of a beautiful woman holding a fresh coconut drink with a straw, smiling naturally while standing near tropical palm trees. She is wearing a stunning premium {product}. Vibrant summer colors, bright sunlight filtering through the leaves. Realistic skin texture, premium editorial photography.',
    negativePrompt: 'indoor, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a tropical outdoor environment with palm trees.'
  },
  {
    category: 'swimwear', mode: 'lifestyle', presentation: 'candid-woman', shotNumber: 5,
    shotName: 'Sunset Ocean View',
    positivePrompt: 'Breathtaking candid lifestyle photo of a beautiful woman standing in shallow ocean water during a spectacular sunset. The warm golden and pink light reflects beautifully on her skin and the water. She is wearing a stunning premium {product}. Natural, relaxed pose. Incredible cinematic lighting, photorealistic.',
    negativePrompt: 'indoor, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be the ocean at sunset.'
  },

  // ================= SWIMWEAR LIFESTYLE CANDID MAN =================
  {
    category: 'swimwear', mode: 'lifestyle', presentation: 'candid-man', shotNumber: 1,
    shotName: 'Walking on the Beach',
    positivePrompt: 'Aesthetic candid lifestyle photo of a handsome man walking casually on a pristine white sand beach, looking relaxed. He is wearing stunning premium {product}. The lighting is gorgeous golden hour sunlight, creating a warm, dreamy holiday atmosphere. Crystal clear ocean waves gently washing ashore in the background. Highly realistic editorial photography, 85mm lens, natural pose.',
    negativePrompt: 'messy, crowded beach, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a beautiful beach at golden hour.'
  },
  {
    category: 'swimwear', mode: 'lifestyle', presentation: 'candid-man', shotNumber: 2,
    shotName: 'Sitting by the Pool',
    positivePrompt: 'Candid lifestyle photo of a handsome man sitting casually at the edge of a luxurious infinity pool overlooking the ocean. He is dipping his toes in the crystal clear water. Wearing stunning premium {product}. Bright midday sun, vivid blue sky, tropical palm trees in the background. Highly detailed, photorealistic vacation aesthetic.',
    negativePrompt: 'messy, public pool, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a luxury infinity pool setting.'
  },
  {
    category: 'swimwear', mode: 'lifestyle', presentation: 'candid-man', shotNumber: 3,
    shotName: 'Beach Towel Relaxing',
    positivePrompt: 'Candid photo of a handsome man sitting casually on a stylish boho beach towel on the sand, looking out towards the sea. Wearing stunning premium {product}. Soft natural sunlight, warm tropical vibe. Highly realistic, premium vacation aesthetic.',
    negativePrompt: 'messy, crowded beach, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a beautiful sandy beach.'
  },
  {
    category: 'swimwear', mode: 'lifestyle', presentation: 'candid-man', shotNumber: 4,
    shotName: 'Leaning on Palm Tree',
    positivePrompt: 'Candid half-body shot of a handsome man leaning casually against a tropical palm tree trunk on the beach. He is wearing stunning premium {product}. Vibrant summer colors, bright sunlight filtering through the leaves. Realistic skin texture, premium editorial photography.',
    negativePrompt: 'indoor, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a tropical outdoor environment with palm trees.'
  },
  {
    category: 'swimwear', mode: 'lifestyle', presentation: 'candid-man', shotNumber: 5,
    shotName: 'Sunset Ocean View',
    positivePrompt: 'Breathtaking candid lifestyle photo of a handsome man standing in shallow ocean water during a spectacular sunset. The warm golden and pink light reflects beautifully on his skin and the water. He is wearing stunning premium {product}. Natural, relaxed pose. Incredible cinematic lighting, photorealistic.',
    negativePrompt: 'indoor, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be the ocean at sunset.'
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
    console.log('All Swimwear Lifestyle Candid injections complete.');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
