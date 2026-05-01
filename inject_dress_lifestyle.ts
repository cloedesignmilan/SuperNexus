const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const shots = [
  // ================= DRESS LIFESTYLE MODEL PHOTO WOMAN =================
  {
    category: 'dress', mode: 'lifestyle', presentation: 'model-photo-woman', shotNumber: 1,
    shotName: 'Magazine Editorial',
    positivePrompt: 'Aesthetic luxury lifestyle photo of an extremely beautiful hyper-realistic fashion model posing elegantly in a high-end architectural setting. She is wearing a stunning premium {product}. Magazine editorial style, striking fashionable pose, sophisticated expression, flawless lighting, cinematic composition. Highly detailed, Vogue cover aesthetic.',
    negativePrompt: 'candid, amateur, natural unposed, casual, selfie, messy background, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a high-end luxury setting. Model MUST be highly posed and editorial.'
  },
  {
    category: 'dress', mode: 'lifestyle', presentation: 'model-photo-woman', shotNumber: 2,
    shotName: 'Luxury Hotel Lobby',
    positivePrompt: 'Magazine editorial lifestyle photo of a gorgeous, elegant fashion model standing confidently in a luxury hotel lobby. Wearing a stunning premium {product}. Professional modeling pose, intense gaze. Premium architectural lighting, marble floors, sophisticated atmosphere. Photorealistic, 85mm portrait lens.',
    negativePrompt: 'candid, amateur, natural unposed, casual, selfie, messy background, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a luxury hotel lobby. Model MUST be posed like a professional fashion model.'
  },
  {
    category: 'dress', mode: 'lifestyle', presentation: 'model-photo-woman', shotNumber: 3,
    shotName: 'Elegant Staircase',
    positivePrompt: 'Editorial fashion photo of a stunning hyper-realistic model posing gracefully on a grand sweeping staircase. She is wearing a stunning premium {product}. Artistic magazine composition, high fashion pose, dramatic natural lighting streaming from large windows. Extremely premium, cinematic look.',
    negativePrompt: 'candid, amateur, natural unposed, casual, selfie, messy background, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST feature an elegant grand staircase. Model MUST be elegantly posed.'
  },
  {
    category: 'dress', mode: 'lifestyle', presentation: 'model-photo-woman', shotNumber: 4,
    shotName: 'Rooftop City Lights',
    positivePrompt: 'High-end editorial lifestyle photo of a beautiful fashion model posing elegantly on a luxury rooftop at dusk, with out-of-focus city lights behind her. Wearing a stunning premium {product}. Sophisticated magazine style, professional pose, glamorous atmosphere, flawless cinematic lighting.',
    negativePrompt: 'candid, amateur, natural unposed, casual, selfie, daytime, messy background, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a luxury rooftop at dusk. Model MUST have a strong fashion pose.'
  },
  {
    category: 'dress', mode: 'lifestyle', presentation: 'model-photo-woman', shotNumber: 5,
    shotName: 'Exclusive Gala Entrance',
    positivePrompt: 'Editorial fashion photography of a hyper-realistic beautiful model arriving at an exclusive gala event, posing confidently for cameras. She is wearing a stunning premium {product}. Paparazzi-style flashes lighting up her face perfectly, magazine cover composition, extremely glamorous and poised.',
    negativePrompt: 'candid, amateur, natural unposed, casual, selfie, messy background, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST simulate a luxury red carpet or gala entrance. Model MUST be striking a pose.'
  },

  // ================= DRESS LIFESTYLE CANDID WOMAN =================
  {
    category: 'dress', mode: 'lifestyle', presentation: 'candid-woman', shotNumber: 1,
    shotName: 'City Walk',
    positivePrompt: 'Candid, spontaneous lifestyle photo of a normal, cute, realistic young woman walking happily down a sunny European city street. She is wearing a beautiful {product}. Completely unposed, natural genuine smile, looking slightly away from the camera. Casual, authentic everyday moment. Highly realistic, warm natural lighting.',
    negativePrompt: 'posed, magazine, professional fashion model, editorial, studio, artificial lighting, high fashion, stern expression, low quality, illustration',
    hardRules: '[CRITICAL] Background MUST be a sunny city street. The girl MUST look normal, cute, and completely unposed/spontaneous.'
  },
  {
    category: 'dress', mode: 'lifestyle', presentation: 'candid-woman', shotNumber: 2,
    shotName: 'Cafe Terrace',
    positivePrompt: 'Spontaneous candid photo of a normal, cute girl sitting at an outdoor cafe terrace, laughing naturally as if caught mid-conversation. She is wearing a beautiful {product}. Unposed, authentic lifestyle aesthetic. Sunlit background, blurred pedestrians, realistic everyday scene.',
    negativePrompt: 'posed, magazine, professional fashion model, editorial, studio, artificial lighting, high fashion, stern expression, low quality, illustration',
    hardRules: '[CRITICAL] Background MUST be an outdoor cafe. The girl MUST look natural and unposed, laughing or smiling.'
  },
  {
    category: 'dress', mode: 'lifestyle', presentation: 'candid-woman', shotNumber: 3,
    shotName: 'Park Stroll',
    positivePrompt: 'Natural candid photo of a normal, pretty girl walking through a sunny green park, looking down and smiling spontaneously. She is wearing a beautiful {product}. Relaxed, casual posture, completely unposed. Authentic, relatable everyday lifestyle photography. Bright, joyful atmosphere.',
    negativePrompt: 'posed, magazine, professional fashion model, editorial, studio, artificial lighting, high fashion, stern expression, low quality, illustration',
    hardRules: '[CRITICAL] Background MUST be a sunny park. The girl MUST look casual and unposed.'
  },
  {
    category: 'dress', mode: 'lifestyle', presentation: 'candid-woman', shotNumber: 4,
    shotName: 'Checking Phone',
    positivePrompt: 'Authentic candid lifestyle photo of a normal, cute woman standing on a city sidewalk, casually checking her phone and smiling softly. She is wearing a beautiful {product}. Unposed, spontaneous moment, relatable everyday vibe. Soft natural daylight, realistic street background.',
    negativePrompt: 'posed, magazine, professional fashion model, editorial, studio, artificial lighting, high fashion, stern expression, low quality, illustration',
    hardRules: '[CRITICAL] Background MUST be a city street. The girl MUST look unposed and completely natural.'
  },
  {
    category: 'dress', mode: 'lifestyle', presentation: 'candid-woman', shotNumber: 5,
    shotName: 'Looking Back',
    positivePrompt: 'Spontaneous candid photo of a normal, cute girl walking slightly ahead and looking back over her shoulder with a natural, joyful smile. She is wearing a beautiful {product}. Completely unposed, authentic lifestyle moment. Sunny golden hour lighting, blurred urban background, highly realistic.',
    negativePrompt: 'posed, magazine, professional fashion model, editorial, studio, artificial lighting, high fashion, stern expression, low quality, illustration',
    hardRules: '[CRITICAL] Background MUST be an urban setting. The girl MUST look spontaneous, smiling naturally.'
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
    console.log('All Dress Lifestyle injections complete.');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
