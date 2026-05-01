const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const shots = [
  // ================= UGC HOME WOMAN =================
  {
    category: 'swimwear', mode: 'ugc-home', presentation: 'candid-woman', shotNumber: 1,
    shotName: 'Luxury Bathroom Selfie',
    positivePrompt: 'Aesthetic candid mirror selfie of a beautiful woman in a luxurious modern home bathroom. She is holding her iPhone, taking a selfie in the large mirror. Wearing a stunning premium {product}. The bathroom features bright white marble, elegant fixtures, and bright natural morning light streaming in. Perfectly clean and tidy environment. Highly realistic, Instagram-style luxury lifestyle photography.',
    negativePrompt: 'messy, dirty mirror, clutter, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor home bathroom. The person MUST be taking a selfie with a phone.'
  },
  {
    category: 'swimwear', mode: 'ugc-home', presentation: 'candid-woman', shotNumber: 2,
    shotName: 'Poolside Villa',
    positivePrompt: 'Candid photo of a beautiful woman relaxing by the edge of a private luxury home swimming pool. She is sitting on the pool edge with her feet near the crystal clear water, looking away from the camera. Wearing a stunning premium {product}. Bright sunny day, reflections on the water, lush green plants in the background. Incredible high-end vacation-at-home aesthetic.',
    negativePrompt: 'messy, crowded public pool, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a private home swimming pool setting.'
  },
  {
    category: 'swimwear', mode: 'ugc-home', presentation: 'candid-woman', shotNumber: 3,
    shotName: 'Packing for Beach',
    positivePrompt: 'Candid photo of a young woman sitting casually on a pristine white bed in a bright, aesthetic bedroom. She is packing a stylish straw beach bag. Wearing a stunning premium {product}. Natural sunlight pouring through large windows, creating soft shadows. Relaxed, happy expression. The background must be a beautiful, highly aesthetic, clean home environment.',
    negativePrompt: 'messy room, clutter, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor home bedroom.'
  },
  {
    category: 'swimwear', mode: 'ugc-home', presentation: 'candid-woman', shotNumber: 4,
    shotName: 'Sunny Balcony',
    positivePrompt: 'Candid lifestyle shot of a beautiful woman leaning against the glass railing of a luxury home balcony, looking out at a bright summer view. She is holding a coffee cup. Wearing a stunning premium {product}. Warm morning sunlight, lens flare, relaxed holiday-at-home vibe. Highly detailed, photorealistic editorial quality.',
    negativePrompt: 'messy, clutter, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a home balcony. Outdoor but domestic setting.'
  },
  {
    category: 'swimwear', mode: 'ugc-home', presentation: 'candid-woman', shotNumber: 5,
    shotName: 'Indoor Lounge',
    positivePrompt: 'A candid full-body shot of a beautiful woman lounging gracefully on a modern beige sofa in a sunlit living room with sheer white curtains. Wearing a stunning premium {product}. Soft natural daylight illuminating her skin. Real-life luxury aesthetic. The background must be a beautiful, clean and tidy home environment with no clutter.',
    negativePrompt: 'messy room, clutter, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor home living room.'
  },

  // ================= UGC HOME MAN =================
  {
    category: 'swimwear', mode: 'ugc-home', presentation: 'candid-man', shotNumber: 1,
    shotName: 'Luxury Bathroom Selfie',
    positivePrompt: 'Aesthetic candid mirror selfie of a handsome man in a luxurious modern home bathroom. He is holding his iPhone, taking a selfie in the large mirror. Wearing a stunning premium {product}. The bathroom features bright white marble, elegant fixtures, and bright natural morning light streaming in. Perfectly clean and tidy environment. Highly realistic, Instagram-style luxury lifestyle photography.',
    negativePrompt: 'messy, dirty mirror, clutter, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor home bathroom. The person MUST be taking a selfie with a phone.'
  },
  {
    category: 'swimwear', mode: 'ugc-home', presentation: 'candid-man', shotNumber: 2,
    shotName: 'Poolside Villa',
    positivePrompt: 'Candid photo of a handsome man relaxing by the edge of a private luxury home swimming pool. He is sitting on the pool edge with his feet near the crystal clear water, looking away from the camera. Wearing a stunning premium {product}. Bright sunny day, reflections on the water, lush green plants in the background. Incredible high-end vacation-at-home aesthetic.',
    negativePrompt: 'messy, crowded public pool, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a private home swimming pool setting.'
  },
  {
    category: 'swimwear', mode: 'ugc-home', presentation: 'candid-man', shotNumber: 3,
    shotName: 'Packing for Beach',
    positivePrompt: 'Candid photo of a handsome man sitting casually on a pristine white bed in a bright, aesthetic bedroom. He is holding a stylish duffel bag. Wearing a stunning premium {product}. Natural sunlight pouring through large windows, creating soft shadows. Relaxed, confident expression. The background must be a beautiful, highly aesthetic, clean home environment.',
    negativePrompt: 'messy room, clutter, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor home bedroom.'
  },
  {
    category: 'swimwear', mode: 'ugc-home', presentation: 'candid-man', shotNumber: 4,
    shotName: 'Sunny Balcony',
    positivePrompt: 'Candid lifestyle shot of a handsome man leaning against the glass railing of a luxury home balcony, looking out at a bright summer view. He is holding a coffee cup. Wearing a stunning premium {product}. Warm morning sunlight, lens flare, relaxed holiday-at-home vibe. Highly detailed, photorealistic editorial quality.',
    negativePrompt: 'messy, clutter, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be a home balcony. Outdoor but domestic setting.'
  },
  {
    category: 'swimwear', mode: 'ugc-home', presentation: 'candid-man', shotNumber: 5,
    shotName: 'Indoor Lounge',
    positivePrompt: 'A candid full-body shot of a handsome man sitting casually on a modern beige sofa in a sunlit living room with sheer white curtains. Wearing a stunning premium {product}. Soft natural daylight illuminating his skin. Real-life luxury aesthetic. The background must be a beautiful, clean and tidy home environment with no clutter.',
    negativePrompt: 'messy room, clutter, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor home living room.'
  },

  // ================= UGC STORE WOMAN =================
  {
    category: 'swimwear', mode: 'ugc-store', presentation: 'candid-woman', shotNumber: 1,
    shotName: 'Boutique Fitting Room Selfie',
    positivePrompt: 'Aesthetic candid mirror selfie of a beautiful woman inside a high-end luxury resort wear boutique fitting room. She is holding her iPhone taking a selfie in the large mirror. Wearing a stunning premium {product}. Warm, flattering fitting room lighting, elegant wallpaper, plush carpet. Incredible Instagram influencer shopping aesthetic.',
    negativePrompt: 'cheap store, messy, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor retail fitting room.'
  },
  {
    category: 'swimwear', mode: 'ugc-store', presentation: 'candid-woman', shotNumber: 2,
    shotName: 'Checking the Fit',
    positivePrompt: 'Candid photo of a beautiful woman standing in front of a full-length mirror in a luxury beachwear boutique, looking at her reflection and admiring the stunning premium {product} she is wearing. Soft, flattering indoor retail lighting. Racks of colorful summer clothing blurred softly in the background. Photorealistic.',
    negativePrompt: 'messy store, outdoor, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor retail store with clothing racks.'
  },
  {
    category: 'swimwear', mode: 'ugc-store', presentation: 'candid-woman', shotNumber: 3,
    shotName: 'Store Aisle Selfie',
    positivePrompt: 'Candid mirror selfie taken by a woman on the main floor of an aesthetic, well-lit swimwear boutique. She is wearing a stunning premium {product}. In the blurred background, neatly organized racks of high-end resort wear and stylish store interior. Bright, clean, premium shopping experience.',
    negativePrompt: 'messy store, outdoor, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor retail store with clothing racks. Must be a selfie.'
  },
  {
    category: 'swimwear', mode: 'ugc-store', presentation: 'candid-woman', shotNumber: 4,
    shotName: 'Excited Pointing',
    positivePrompt: 'Playful candid photo of a woman in a bright luxury fitting room, pointing excitedly at her reflection in the mirror with a huge smile. She is wearing a stunning premium {product}. Flattering warm spotlights, clean aesthetic background. Highly realistic, vibrant colors.',
    negativePrompt: 'outdoor, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor retail fitting room.'
  },
  {
    category: 'swimwear', mode: 'ugc-store', presentation: 'candid-woman', shotNumber: 5,
    shotName: 'Close-up Fit',
    positivePrompt: 'A candid close-up mirror selfie focused on the torso of a woman in a luxury fitting room, highlighting the incredible fit and premium fabric texture of the {product} she is wearing. The face is mostly cropped out. Warm, flattering retail lighting. Beautiful aesthetic.',
    negativePrompt: 'outdoor, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor retail fitting room. Focus on the product texture.'
  },

  // ================= UGC STORE MAN =================
  {
    category: 'swimwear', mode: 'ugc-store', presentation: 'candid-man', shotNumber: 1,
    shotName: 'Boutique Fitting Room Selfie',
    positivePrompt: 'Aesthetic candid mirror selfie of a handsome man inside a high-end luxury resort wear boutique fitting room. He is holding his iPhone taking a selfie in the large mirror. Wearing a stunning premium {product}. Warm, flattering fitting room lighting, elegant wooden accents, plush carpet. Incredible Instagram influencer shopping aesthetic.',
    negativePrompt: 'cheap store, messy, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor retail fitting room.'
  },
  {
    category: 'swimwear', mode: 'ugc-store', presentation: 'candid-man', shotNumber: 2,
    shotName: 'Checking the Fit',
    positivePrompt: 'Candid photo of a handsome man standing in front of a full-length mirror in a luxury beachwear boutique, looking at his reflection and admiring the stunning premium {product} he is wearing. Soft, flattering indoor retail lighting. Racks of colorful summer clothing blurred softly in the background. Photorealistic.',
    negativePrompt: 'messy store, outdoor, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor retail store with clothing racks.'
  },
  {
    category: 'swimwear', mode: 'ugc-store', presentation: 'candid-man', shotNumber: 3,
    shotName: 'Store Aisle Selfie',
    positivePrompt: 'Candid mirror selfie taken by a handsome man on the main floor of an aesthetic, well-lit swimwear boutique. He is wearing a stunning premium {product}. In the blurred background, neatly organized racks of high-end resort wear and stylish store interior. Bright, clean, premium shopping experience.',
    negativePrompt: 'messy store, outdoor, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor retail store with clothing racks. Must be a selfie.'
  },
  {
    category: 'swimwear', mode: 'ugc-store', presentation: 'candid-man', shotNumber: 4,
    shotName: 'Excited Pointing',
    positivePrompt: 'Playful candid photo of a handsome man in a bright luxury fitting room, pointing excitedly at his reflection in the mirror with a huge smile. He is wearing a stunning premium {product}. Flattering warm spotlights, clean aesthetic background. Highly realistic, vibrant colors.',
    negativePrompt: 'outdoor, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor retail fitting room.'
  },
  {
    category: 'swimwear', mode: 'ugc-store', presentation: 'candid-man', shotNumber: 5,
    shotName: 'Close-up Fit',
    positivePrompt: 'A candid close-up mirror selfie focused on the torso of a handsome man in a luxury fitting room, highlighting the incredible fit and premium fabric texture of the {product} he is wearing. The face is mostly cropped out. Warm, flattering retail lighting. Beautiful aesthetic.',
    negativePrompt: 'outdoor, dark, low quality, illustration, cartoon',
    hardRules: '[CRITICAL] Background MUST be an indoor retail fitting room. Focus on the product texture.'
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
    console.log('All Swimwear UGC injections complete.');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
