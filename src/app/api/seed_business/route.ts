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

const busScene = "A modern and elegant real-life environment such as city streets, offices, restaurants, hotels, terraces, or events.";
const busSubject = "A real-looking adult person with European appearance, light skin tones, natural features.";
const busStyle = "Luxury lifestyle photography, clean natural light.";
const busMood = "Confident, elegant, modern.";
const busDetails = "Urban or elegant elements, subtle background context.";

const azioni100 = [
    // A LAVORO (UFFICI / BUSINESS)
    "Sitting at a modern office desk",
    "Standing in front of an office glass window",
    "Walking down an elegant office corridor",
    "Talking naturally with a colleague",
    "Looking thoughtfully at a laptop",
    "Writing notes carefully",
    "Giving a professional handshake",
    "Sitting in a business meeting",
    "Explaining something professionally",
    "Looking out the window thoughtfully",

    // IN STRADA (CITY STYLE)
    "Walking casually on the sidewalk",
    "Crossing the street confidently",
    "Stopping at a city traffic light",
    "Taking an urban walk",
    "Turning around slightly",
    "Walking with extreme confidence",
    "Hand casually in the pocket",
    "Looking straight ahead",
    "Completely natural walking movement",
    "Walking past interesting shop windows",

    // IN AUTO
    "Sitting in the driver's seat",
    "Stepping out of the car",
    "Leaning casually against the car",
    "Opening the car door",
    "Looking casually out the passenger window",
    "Sitting comfortably on the car seat",
    "Hand casually resting on the steering wheel",
    "Dynamic movement exiting the car",
    "Closing the car door",
    "A moment just before driving off",

    // APERITIVO
    "Standing with an elegant drink",
    "Sitting relaxed at a cocktail table",
    "Having a conversation with friends",
    "Holding a glass elegantly",
    "Light natural laughter",
    "Leaning comfortably against the table",
    "Raising a glass for a toast",
    "Elegant bar environment in the background",
    "Relaxed and confident look",
    "Social and convivial moment",

    // CENA
    "Sitting at a fine dining restaurant",
    "Pouring wine into a glass",
    "Engaged in a dinner conversation",
    "Looking casually at the menu",
    "Natural sophisticated smile",
    "Elegant decorated table in context",
    "Quiet and calm dialogue",
    "Convivial dining moment",
    "Leaning back comfortably on the chair",
    "Refined and elegant restaurant atmosphere",

    // EVENTO / CERIMONIA
    "Arriving at a formal event",
    "Walking among event guests",
    "Talking politely with other guests",
    "Waiting while standing elegantly",
    "Adjusting the jacket naturally",
    "Elegant and refined conversation",
    "Formal yet natural smile",
    "Slow and elegant movement",
    "Ceremony environment in the background",
    "Entering the elegant location venue",

    // HOTEL / LOCATION ELEGANTI
    "Walking through a luxury hotel lobby",
    "Sitting comfortably on a lobby sofa",
    "Waiting near the elegant reception",
    "Entering the grand hotel doors",
    "Standing in a refined elevator",
    "Walking down a prestigious corridor",
    "Leaning elegantly against the wall",
    "Slow confident movement",
    "Looking around at the elegant surroundings",
    "Luxury high-end environment",

    // MOMENTI PREPARAZIONE
    "Adjusting the jacket in front of a mirror",
    "Fixing the shirt cuffs",
    "Checking the full outfit",
    "Adjusting the tie perfectly",
    "Looking intensely at the mirrored reflection",
    "Natural preparation movement",
    "Elegant close-up face shot",
    "Half body elegant portrait",
    "Specific detail on the jacket and buttons",
    "Preparing for a high-end event",

    // MOMENTI QUOTIDIANI
    "Using a smartphone casually",
    "Answering a phone call",
    "Walking while talking on the phone",
    "Typing a quick message",
    "Looking at phone notifications",
    "Stopping briefly to read the phone",
    "Completely natural daily movement",
    "Casual conversation",
    "Waiting patiently",
    "Spontaneous completely unplanned gesture",

    // SERA / USCITA
    "Walking during the evening",
    "City lights glowing in the background",
    "Taking a quiet evening stroll",
    "Stopping casually under a street light",
    "Looking around the evening city",
    "Slow and relaxed evening movement",
    "Elegant and calm night atmosphere",
    "Decisive and confident look",
    "Quiet and peaceful evening moment",
    "Grand finale lifestyle scene"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(busScene, busSubject, action, busStyle, busMood, busDetails));
    
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Business & tempo libero" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    }

    return NextResponse.json({ ok: true, msg: "Business & tempo libero", count: blocks100.length });
}
