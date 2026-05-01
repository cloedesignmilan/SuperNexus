import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

const shotsHomeWoman = [
  {
    shotNumber: 1,
    shotName: "Bedroom Mirror Selfie",
    positivePrompt: "Imperfect candid mirror selfie taken by a woman in her bright aesthetic bedroom. She is holding her iPhone slightly blocking her face, looking in the mirror. Messy unmade bed with white sheets in the background. Natural morning window light. Wearing a {product} that fits casually and comfortably. Relaxed everyday home vibe.",
    negativePrompt: "professional photoshoot, studio lighting, posed model, perfect framing, artificial setup",
    hardRules: "MUST BE A MIRROR SELFIE IN A BEDROOM. REALISTIC IPHONE CAMERA QUALITY.",
    outputGoal: "Bedroom Mirror Selfie"
  },
  {
    shotNumber: 2,
    shotName: "Living Room Casual",
    positivePrompt: "Candid photo of a beautiful woman sitting comfortably on a modern beige sofa in her bright living room. Natural sunlight streaming through a large window, creating soft shadows. She is wearing a {product}. Relaxed, happy expression, looking away from the camera. Real life aesthetic.",
    negativePrompt: "studio, fashion editorial, rigid pose, artificial lighting",
    hardRules: "MUST BE SITTING IN A LIVING ROOM. NATURAL DAYLIGHT.",
    outputGoal: "Living Room Casual"
  },
  {
    shotNumber: 3,
    shotName: "Pointing at T-Shirt",
    positivePrompt: "Candid photo of a young woman standing in a bright home living room with indoor plants. She is playfully pointing two index fingers at the center of her {product}. Smiling naturally at the camera. Soft natural light, casual domestic atmosphere.",
    negativePrompt: "studio background, rigid pose, professional lighting, holding objects",
    hardRules: "MUST BE POINTING AT HER OWN T-SHIRT WITH BOTH HANDS. HOME ENVIRONMENT.",
    outputGoal: "Pointing at T-Shirt"
  },
  {
    shotNumber: 4,
    shotName: "Half-Body Selfie",
    positivePrompt: "Close-up front-facing iPhone selfie of a woman in her bedroom. She is holding the phone with one hand out of frame. Wearing a {product}. Natural makeup, messy bun, bright daylight. Realistic skin texture, imperfect framing, genuine smile.",
    negativePrompt: "mirror, full body, studio, professional camera, heavy makeup",
    hardRules: "FRONT-FACING IPHONE SELFIE (NO MIRROR). HALF-BODY SHOT.",
    outputGoal: "Half-Body Selfie"
  },
  {
    shotNumber: 5,
    shotName: "Close-up Fit",
    positivePrompt: "A candid close-up shot focused on the chest and torso of a woman wearing a {product}. The face is mostly cropped out. Soft natural light from a nearby window. Highlighting the fabric texture and relaxed fit of the t-shirt in a real-life home environment.",
    negativePrompt: "full body, wide angle, studio background",
    hardRules: "CLOSE-UP ON THE T-SHIRT. NO FULL FACE. HOME ENVIRONMENT.",
    outputGoal: "Close-up Fit"
  }
];

const shotsHomeMan = [
  {
    shotNumber: 1,
    shotName: "Mirror Selfie Man",
    positivePrompt: "Imperfect candid mirror selfie taken by a man in a modern minimal bedroom. He is standing, holding his iPhone, looking in the mirror. Neutral color palette in the room, wooden floor. Wearing a {product} that fits perfectly. Relaxed casual home style.",
    negativePrompt: "professional photoshoot, studio lighting, posed model, perfect framing, artificial setup",
    hardRules: "MUST BE A MIRROR SELFIE IN A BEDROOM. REALISTIC IPHONE CAMERA QUALITY.",
    outputGoal: "Mirror Selfie Man"
  },
  {
    shotNumber: 2,
    shotName: "Sitting on Floor",
    positivePrompt: "Candid photo of a man sitting casually on the wooden floor of a modern living room, leaning slightly back on his hands. Wearing a {product} and casual sweatpants. Natural daylight, relaxed Sunday morning vibe.",
    negativePrompt: "studio, standing, fashion editorial, artificial lighting",
    hardRules: "MUST BE SITTING ON THE FLOOR. HOME ENVIRONMENT. NATURAL LIGHT.",
    outputGoal: "Sitting on Floor"
  },
  {
    shotNumber: 3,
    shotName: "Holding T-Shirt",
    positivePrompt: "Candid photo of a smiling man standing in a bright home interior, holding up a {product} with both hands in front of his chest as if showing it to the camera. Casual everyday aesthetic, bright room with white walls and subtle decor.",
    negativePrompt: "wearing the t-shirt, studio, professional lighting",
    hardRules: "MUST BE HOLDING THE T-SHIRT WITH HANDS (NOT WEARING IT IN THIS SHOT). HOME ENVIRONMENT.",
    outputGoal: "Holding T-Shirt"
  },
  {
    shotNumber: 4,
    shotName: "Sunglasses Vibe",
    positivePrompt: "Candid photo of a stylish man relaxing on a modern sofa in his living room. He is wearing cool sunglasses and a {product}. Slight smile, looking away from the camera. Sun rays coming through the window. Casual streetwear home aesthetic.",
    negativePrompt: "studio, standing, artificial lighting, formal wear",
    hardRules: "MUST WEAR SUNGLASSES. SITTING ON A SOFA. NATURAL LIGHT.",
    outputGoal: "Sunglasses Vibe"
  },
  {
    shotNumber: 5,
    shotName: "Hanging on Door",
    positivePrompt: "A candid aesthetic shot of a {product} perfectly hung on a wooden hanger against a clean white bedroom door. Natural daylight creating soft shadows. Minimalist home environment, real-life creator aesthetic.",
    negativePrompt: "human model, studio background, flat lay, professional lighting",
    hardRules: "MUST BE HANGING ON A DOOR. NO HUMAN MODEL IN THIS SHOT. HOME ENVIRONMENT.",
    outputGoal: "Hanging on Door"
  }
];

const shotsStoreWoman = [
  {
    shotNumber: 1,
    shotName: "Fitting Room Mirror Selfie",
    positivePrompt: "Imperfect candid mirror selfie taken by a woman inside a premium clothing store fitting room. She is holding her iPhone, looking in the mirror. Warm flattering fitting room lighting, curtains and a bench in the background. Wearing a {product}.",
    negativePrompt: "bedroom, home, outdoor, studio lighting, professional camera",
    hardRules: "MUST BE A MIRROR SELFIE IN A FITTING ROOM. REALISTIC IPHONE CAMERA QUALITY.",
    outputGoal: "Fitting Room Mirror Selfie"
  },
  {
    shotNumber: 2,
    shotName: "Boutique Bench",
    positivePrompt: "Candid photo of a beautiful woman sitting casually on a velvet bench inside a premium boutique. Racks of clothing softly blurred in the background. She is wearing a {product}. Smiling naturally. Stylish shopping aesthetic.",
    negativePrompt: "home, outdoor, studio, rigid pose",
    hardRules: "MUST BE SITTING IN A CLOTHING STORE. STORE RACKS IN BACKGROUND.",
    outputGoal: "Boutique Bench"
  },
  {
    shotNumber: 3,
    shotName: "Pointing in Store",
    positivePrompt: "Candid photo of a young woman standing among clothing racks in a modern boutique. She is playfully pointing two index fingers at the center of her {product}. Smiling at the camera. Bright store lighting, shopping lifestyle.",
    negativePrompt: "home, studio background, holding objects",
    hardRules: "MUST BE POINTING AT HER OWN T-SHIRT. STORE ENVIRONMENT WITH CLOTHING RACKS.",
    outputGoal: "Pointing in Store"
  },
  {
    shotNumber: 4,
    shotName: "Half-Body Store Selfie",
    positivePrompt: "Close-up front-facing iPhone selfie of a woman inside a clothing store. She is holding the phone with one hand out of frame. Wearing a {product}. Clothing racks softly blurred behind her. Realistic skin texture, genuine smile.",
    negativePrompt: "mirror, full body, home, studio, professional camera",
    hardRules: "FRONT-FACING IPHONE SELFIE (NO MIRROR). HALF-BODY SHOT IN A STORE.",
    outputGoal: "Half-Body Store Selfie"
  },
  {
    shotNumber: 5,
    shotName: "Fitting Room Close-up",
    positivePrompt: "A candid close-up shot focused on the chest and torso of a woman wearing a {product}. The face is mostly cropped out. Warm fitting room lighting creating depth. Highlighting the fabric texture and fit in a retail environment.",
    negativePrompt: "full body, wide angle, home, natural daylight",
    hardRules: "CLOSE-UP ON THE T-SHIRT. NO FULL FACE. FITTING ROOM ENVIRONMENT.",
    outputGoal: "Fitting Room Close-up"
  }
];

const shotsStoreMan = [
  {
    shotNumber: 1,
    shotName: "Fitting Room Selfie",
    positivePrompt: "Imperfect candid mirror selfie taken by a man in a modern minimal fitting room of a streetwear store. He is standing, holding his iPhone, looking in the mirror. Warm retail lighting. Wearing a {product} that fits perfectly.",
    negativePrompt: "bedroom, home, professional photoshoot, studio lighting",
    hardRules: "MUST BE A MIRROR SELFIE IN A FITTING ROOM. REALISTIC IPHONE CAMERA QUALITY.",
    outputGoal: "Fitting Room Selfie"
  },
  {
    shotNumber: 2,
    shotName: "Store Relaxed",
    positivePrompt: "Candid photo of a man sitting casually on a modern bench inside a premium clothing store, leaning slightly back. Wearing a {product}. Stylish interior with clothing displays in the background. Relaxed shopping vibe.",
    negativePrompt: "home, outdoor, studio, artificial lighting",
    hardRules: "MUST BE SITTING IN A CLOTHING STORE. RETAIL ENVIRONMENT.",
    outputGoal: "Store Relaxed"
  },
  {
    shotNumber: 3,
    shotName: "Holding T-Shirt at Rack",
    positivePrompt: "Candid photo of a smiling man standing in a modern boutique, holding up a {product} with both hands in front of his chest. He is standing next to a clothing rack. Casual retail aesthetic, bright store interior.",
    negativePrompt: "wearing the t-shirt, home, studio, professional lighting",
    hardRules: "MUST BE HOLDING THE T-SHIRT WITH HANDS (NOT WEARING IT IN THIS SHOT). CLOTHING STORE ENVIRONMENT.",
    outputGoal: "Holding T-Shirt at Rack"
  },
  {
    shotNumber: 4,
    shotName: "Sunglasses Store Vibe",
    positivePrompt: "Candid photo of a stylish man standing relaxed in a premium clothing store. He is wearing cool sunglasses and a {product}. Looking away from the camera. Modern retail interior lighting, blurred clothing racks behind him.",
    negativePrompt: "home, sitting, studio, artificial setup",
    hardRules: "MUST WEAR SUNGLASSES. STANDING IN A STORE. CLOTHING DISPLAYS IN BACKGROUND.",
    outputGoal: "Sunglasses Store Vibe"
  },
  {
    shotNumber: 5,
    shotName: "Hanging on Store Display",
    positivePrompt: "A high-quality aesthetic shot of a {product} perfectly hung on a premium metal display rack inside a modern boutique. Warm, sophisticated store lighting. Soft blurred background of the shop interior.",
    negativePrompt: "human model, home, door, flat lay, studio background",
    hardRules: "MUST BE HANGING ON A DISPLAY RACK IN A STORE. NO HUMAN MODEL IN THIS SHOT.",
    outputGoal: "Hanging on Store Display"
  }
];

async function seed() {
  const configs = [
    { mode: 'ugc-home', presentation: 'candid-woman', shots: shotsHomeWoman },
    { mode: 'ugc-home', presentation: 'candid-man', shots: shotsHomeMan },
    { mode: 'ugc-store', presentation: 'candid-woman', shots: shotsStoreWoman },
    { mode: 'ugc-store', presentation: 'candid-man', shots: shotsStoreMan }
  ];

  for (const config of configs) {
    for (const shot of config.shots) {
      const existing = await prisma.promptConfigShot.findFirst({
        where: {
          category: 't-shirt',
          mode: config.mode,
          presentation: config.presentation,
          shotNumber: shot.shotNumber,
          scene: 'all'
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
            outputGoal: shot.outputGoal,
            priority: 0,
            isActive: true
          }
        });
      } else {
        await prisma.promptConfigShot.create({
          data: {
            category: 't-shirt',
            mode: config.mode,
            presentation: config.presentation,
            shotNumber: shot.shotNumber,
            scene: 'all',
            shotName: shot.shotName,
            positivePrompt: shot.positivePrompt,
            negativePrompt: shot.negativePrompt,
            hardRules: shot.hardRules,
            outputGoal: shot.outputGoal,
            priority: 0,
            isActive: true
          }
        });
      }
    }
  }

  // Update tshirt.json as well
  const jsonPath = 'src/lib/prompt-configs/tshirt.json';
  const fileContent = fs.readFileSync(jsonPath, 'utf8');
  let data = JSON.parse(fileContent);

  // remove existing ugc-home / ugc-store if any
  data = data.filter((d: any) => d.mode && !(d.mode.startsWith('ugc-home') || d.mode.startsWith('ugc-store')));

  // push new configs
  for (const config of configs) {
    data.push({
      mode: config.mode,
      presentation: config.presentation,
      shots: config.shots
    });
  }

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

  console.log('Seeded database and updated tshirt.json successfully!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
