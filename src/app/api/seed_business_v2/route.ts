import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function buildBlockPrompt(
    sceneDesc: string, 
    subjectDesc: string, 
    actionDesc: string, 
    styleDesc: string, 
    moodDesc: string, 
    detailsDesc: string
) {
    return `Create a hyper-realistic photo.

SCENE:
${sceneDesc}

SUBJECT:
${subjectDesc}

OUTFIT:
The main subject is wearing the exact outfit from the reference image.

ACTION:
${actionDesc}

STYLE:
${styleDesc}

MOOD:
${moodDesc}

DETAILS:
${detailsDesc}

IMPORTANT:
Outfit must remain 100% identical.

No text, no logos, no watermarks.`;
}

// User-provided brief mapped to structural parameters
const cerScene = "A modern, curated but strictly realistic everyday living environment, such as a busy city street, a modern office, an elegant restaurant, an outdoor aperitivo, or a motorized vehicle context.";
const cerSubject = "An elegant, good-looking but entirely credible and realistic adult, European appearance, natural features, looking like a real aspirational professional and not an artificial studio model.";
const cerStyle = "Hyper-realistic everyday lifestyle photography. Bright, clean, and highly authentic natural lighting.";
const cerMood = "Confident, stylish, aspirational, highly authentic.";
const cerDetails = "Subtle contextual everyday elements like modern architecture, blurred city pedestrians, an elegant car or vespa, or high-end dining environments.";

const azioni100 = [
    // BLOCCO 1: UFFICIO E LAVORO (25 scene)
    "Reviewing notes at a modern minimalist office desk",
    "Walking with extreme confidence down a glass-walled corporate corridor",
    "Having a successful and relaxed conversation with a colleague",
    "Standing naturally near an office window looking out at the city",
    "Holding a digital tablet while explaining a point effectively",
    "Sitting back comfortably in an ergonomic office chair",
    "Walking dynamically through an elegant coworking space",
    "A casual professional conversation holding a coffee cup",
    "Exchanging a confident handshake in a bright modern office",
    "Standing confidently in the middle of a meeting room",
    "Looking engaged and professional while taking notes",
    "Walking steadily towards the office entrance",
    "Adjusting the outfit slightly before a business meeting",
    "Smiling professionally during a casual work discussion",
    "Looking confidently directly ahead in a modern workspace",
    "Listening attentively in a high-end office environment",
    "A simple everyday moment sitting at the work desk",
    "A completely authentic interaction near the office elevator",
    "Stepping elegantly out of an office elevator",
    "Reviewing a document while standing up",
    "A natural unposed look during a focused work task",
    "Looking up from a laptop with an engaging smile",
    "Leaning comfortably against a modern desk",
    "Walking forcefully and rapidly towards the camera",
    "An aspirational portrait of professional confidence",

    // BLOCCO 2: STRADA E CITTÀ (25 scene)
    "Walking elegantly down a lively city sidewalk",
    "Crossing a busy city street with a confident stride",
    "Taking a relaxed walk looking at luxury shop windows",
    "Waiting naturally at a city traffic light",
    "Walking between passing people showing natural movement",
    "A completely unposed and relaxed step in the city center",
    "Holding a leather bag or briefcase while walking securely",
    "Looking ahead with a relaxed but determined city gaze",
    "A fluid everyday walking movement in urban surroundings",
    "An unforced urban snapshot caught mid-step",
    "Walking past historical city architecture beautifully lit",
    "Stepping off the sidewalk with natural grace",
    "A quick casual stop to check the smartphone",
    "Walking down an elegant shopping avenue in daylight",
    "A confident over-the-shoulder look on a busy street",
    "Fluid motion walking towards an unseen destination",
    "An an extremely realistic documentary-style street walk",
    "A subtle but confident smile while navigating the city",
    "Walking with hands naturally down, highly relaxed",
    "Taking a brisk confident walk during a lunch break",
    "Stopping casually near a classic city lamppost",
    "A modern aspirational lifestyle walking shot",
    "Looking sharply left before crossing a busy avenue",
    "Relaxed urban movement under beautiful afternoon sun",
    "An absolute masterclass in confident street style",

    // BLOCCO 3: AUTO E VESPA (25 scene)
    "Getting out of an elegant car completely naturally",
    "Sitting casually in the driver's seat of a premium car",
    "Closing the car door behind while stepping onto the street",
    "Leaning effortlessly against a parked luxury car",
    "Sitting on an iconic Italian Vespa looking incredibly stylish",
    "Unlocking a car door with a fluid unposed movement",
    "Resting hands on a steering wheel with a relaxed gaze",
    "Looking calmly out the window of a modern vehicle",
    "Stepping out of an executive taxi in the city center",
    "A dynamic angle of opening a car door",
    "Sitting elegantly parked on a city Vespa holding a helmet",
    "Adjusting sunglasses before stepping into a luxury car",
    "A sophisticated and relaxed pose leaning on the car hood",
    "A totally unforced lifestyle moment arriving by car",
    "Sitting elegantly in the passenger seat looking forward",
    "A candid moment waiting in the car at a red light",
    "A deeply aspirational and stylish automotive lifestyle shot",
    "A confident glance while stepping out of a sports car",
    "A highly realistic snapshot arriving at the office by Vespa",
    "Resting against the side of the car looking at the camera",
    "Smiling softly while seated in a bright airy car interior",
    "A natural effortless movement starting a city drive",
    "Posing subtly and naturally against a vintage Italian scooter",
    "An upscale lifestyle commute arriving at a central destination",
    "A perfect authentic everyday moment related to urban driving",

    // BLOCCO 4: CENA E APERITIVO (25 scene)
    "Sipping an elegant cocktail standing at an upscale bar",
    "Having a highly relaxed and sophisticated dinner conversation",
    "Holding a drink gracefully at an outdoor terrace aperitivo",
    "Laughing authentically with friends at a high-end restaurant",
    "Reading the menu intently at a beautifully decorated table",
    "Pouring wine naturally into an elegant glass",
    "Leaning back comfortably after finishing a fine dinner",
    "Exchanging a spontaneous smile while holding an aperitivo drink",
    "Sitting warmly illuminated inside a cozy luxury restaurant",
    "A deeply convivial and natural moment holding a glass",
    "Walking to the reserved table in an elegant dining room",
    "Looking out over the city terrace during an evening drink",
    "An effortless social interaction holding an elegant cocktail",
    "Smiling warmly sitting at a small round outdoor cafe table",
    "Relaxed confident posture at a fine dining establishment",
    "A purely unforced laugh surrounded by elegant dinner guests",
    "Standing near the cocktail bar engaged in deep conversation",
    "Sharing an upscale but completely accessible slice of life",
    "Simply resting elbows on the dining table looking interested",
    "Raising a subtle toast during a relaxed evening out",
    "A high-end but totally credible daily lifestyle evening",
    "Taking a quiet sip of coffee after an elegant meal",
    "An authentic snapshot of modern evening socialization",
    "Moving naturally between tables during a stylish aperitivo",
    "Final aspirational shot: looking incredibly stylish holding a drink"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(cerScene, cerSubject, action, cerStyle, cerMood, cerDetails));
    
    // As in webhook/route.ts, Telegram callback uses "Business & tempo libero"
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Business & tempo libero" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    } else {
         const firstStore = await (prisma as any).store.findFirst();
         await (prisma as any).promptTemplate.create({
             data: {
                 name: "Business & tempo libero",
                 store_id: firstStore.id,
                 scenes: JSON.stringify(blocks100)
             }
         });
    }

    return NextResponse.json({ ok: true, count: blocks100.length, category: "Business & tempo libero" });
}
