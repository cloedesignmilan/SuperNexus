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

const cerScene = "An elegant real-life setting such as a terrace, restaurant, hotel, city street, or refined indoor space.";
const cerSubject = "A real-looking woman with European appearance, light skin tones, natural beauty, not overly perfect.";
const cerStyle = "Luxury lifestyle photography, soft light.";
const cerMood = "Elegant, confident, natural.";
const cerDetails = "Minimal refined environment.";

const azioni100 = [
    // PREPARAZIONE / SPECCHIO
    "Standing in front of a full-length mirror",
    "Adjusting the dress gently with hands",
    "Looking at her reflection smiling",
    "Naturally fixing her hair",
    "Half-body shot looking in the mirror",
    "Slight elegant movement of the dress",
    "Turning around in front of the mirror",
    "Checking the completed look",
    "Close up of the mirror reflection",
    "Confident and satisfied look",

    // USCITA DI CASA
    "Opening the front door to leave",
    "Stepping out with an elegant walk",
    "Turning around looking back before leaving",
    "Walking towards the exterior day light",
    "Natural sunlight hitting the entrance",
    "Hand gracefully on the door handle",
    "Fluid walking movement",
    "Slight natural smile",
    "Stepping down a small porch step",
    "The exact moment before stepping outside",

    // IN STRADA (CITY STYLE)
    "Walking elegantly on the city sidewalk",
    "Crossing the street confidently",
    "Refined city center stroll",
    "Stopping slightly to look around",
    "Looking casually at shop windows",
    "Natural walking movement",
    "Looking straight ahead gracefully",
    "Hand gently brushing the dress",
    "Walking among other blurred pedestrians",
    "Elegant and confident step",

    // IN AUTO
    "Sitting completely relaxed in the passenger seat",
    "Stepping elegantly out of the car",
    "Adjusting the dress while getting out",
    "Hand gently resting on the car door",
    "Sitting with an elegant comfortable posture",
    "Looking thoughtfully out the car window",
    "Fluid exit movement from the vehicle",
    "Leaning slightly against the car exterior",
    "Looking towards the outside warmly",
    "A moment right before stepping out",

    // APERITIVO
    "Standing elegantly holding a drink",
    "Sitting relaxed at a small cocktail table",
    "Having a sophisticated conversation with friends",
    "Holding a glass naturally",
    "Light and elegant laughter",
    "Leaning comfortably against the table edge",
    "Raising a glass for a delicate toast",
    "Elegant bar environment in the background",
    "Relaxed confident look",
    "Convivial social moment",

    // CENA
    "Sitting gracefully at a restaurant table",
    "Looking casually at the dining menu",
    "Having an elegant dinner conversation",
    "Soft natural smile",
    "Beautifully set table in the foreground",
    "Natural hand movement",
    "Talking warmly with someone off camera",
    "Leaning back comfortably on the chair",
    "Refined and luxurious dining atmosphere",
    "Joyful dinner moment",

    // EVENTO / CERIMONIA
    "Arriving gracefully at the event location",
    "Walking among elegantly dressed guests",
    "Engaged in a polite conversation",
    "Waiting while standing elegantly",
    "Gently adjusting the dress",
    "Fluid walking movement across the venue",
    "Natural and poised smile",
    "Entering the elegant event room",
    "Beautiful ceremony environment",
    "Sophisticated social event moment",

    // HOTEL / LOCATION ELEGANTI
    "Walking gracefully through the hotel lobby",
    "Sitting perfectly on a luxury sofa",
    "Waiting near an elegant reception desk",
    "Walking into the grand hotel entrance",
    "Standing inside an elegant elevator",
    "Walking down a highly refined corridor",
    "Leaning gently against an elegant wall",
    "Slow and confident walking movement",
    "Looking around at the beautiful surroundings",
    "High-end luxury atmosphere",

    // ESTERNO / GIARDINO
    "Walking gracefully among garden trees",
    "Slow and peaceful outdoor stroll",
    "Slight movement of the dress in the breeze",
    "Stopping quietly in the green environment",
    "Beautiful natural daylight illumination",
    "Relaxed and happy look",
    "The elegant dress moving naturally",
    "Quiet and peaceful moment",
    "Warm natural outdoor atmosphere",
    "Full complete detail of the outfit",

    // SERA / USCITA
    "Walking elegantly during the evening",
    "City lights glowing softly in the background",
    "Nighttime elegant stroll",
    "Stopping slightly looking chic",
    "Decisive confident evening look",
    "Perfectly elegant movement",
    "Soft blurry night atmosphere",
    "Tranquil elegant moment",
    "Looking directly and smoothly towards the camera",
    "Grand finale beautiful lifestyle scene"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(cerScene, cerSubject, action, cerStyle, cerMood, cerDetails));
    
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Cerimonia e festa" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    }

    return NextResponse.json({ ok: true, msg: "Cerimonia e festa (Eleganza Donna)", count: blocks100.length });
}
