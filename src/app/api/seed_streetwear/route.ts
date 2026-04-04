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

const streetScene = "Urban everyday environments such as streets, sidewalks, shops, cafes, public transport, or outdoor areas.";
const streetSubject = "A real-looking young person with European appearance, light skin tones, not overly perfect.";
const streetStyle = "Street photography, natural light.";
const streetMood = "Relaxed, authentic, modern.";
const streetDetails = "City elements, real life atmosphere.";

const azioni100 = [
    // CAMMINATA IN STRADA
    "Walking casually on the city sidewalk",
    "Crossing the street at a pedestrian crossing",
    "Relaxed urban walk",
    "Stopping naturally at a traffic light",
    "Walking comfortably among the crowd",
    "Completely natural body movement",
    "Relaxed and effortless pace",
    "Looking straight ahead calmly",
    "Walking with one hand in the pocket",
    "Walking casually past city storefronts",

    // BAR / CAFFÈ
    "Sitting relaxed at a small cafe table",
    "Holding a paper coffee cup",
    "Engaged in conversation with a friend",
    "Leaning casually against a cafe counter",
    "Looking calmly at a smartphone",
    "Taking a slow sip from a cup",
    "Showing a light natural smile",
    "Casual coffee shop environment",
    "Relaxed daytime moment",
    "Sitting comfortably at an outdoor cafe",

    // USO TELEFONO
    "Walking while briefly checking the phone",
    "Typing a quick text message",
    "Answering a casual phone call",
    "Looking at smartphone notifications",
    "Sitting down looking at the screen",
    "Stopping for a moment to read something",
    "Talking on the phone casually",
    "Natural looking movement",
    "Concentrated look on the phone",
    "Authentic everyday moment",

    // PANCHINA / RELAX
    "Sitting relaxed on a park bench",
    "Outdoor relaxation time",
    "Looking around at the surroundings",
    "Having a casual conversation with a friend",
    "Spontaneous completely natural smile",
    "Quiet and calm moment",
    "Leaning back comfortably on the bench",
    "Completely unforced movement",
    "Relaxed and comfortable gesture",
    "Simple daily life moment",

    // USCITA DA NEGOZIO
    "Exiting a store holding a shopping bag",
    "Walking along outside after shopping",
    "Looking casually at a display window",
    "Holding a shopping bag naturally",
    "Stopping outside a city store",
    "Natural and unposed movement",
    "Curious look at the surroundings",
    "Walking past modern store windows",
    "Urban city environment",
    "Real and relatable action",

    // TRASPORTI
    "Walking inside a train station",
    "Waiting for the subway train",
    "Sitting on public transport",
    "Standing inside a subway train car",
    "Looking casually out the window",
    "Moving among station commuters",
    "Holding a casual backpack",
    "A typical daily commute moment",
    "Having a chat while travelling",
    "Urban travel scene",

    // AMICI
    "Walking side by side with friends",
    "Relaxed group conversation",
    "Spontaneous group laughter",
    "Natural relaxed movement together",
    "Sitting closely together",
    "Spontaneous friendly dialogue",
    "Authentic group smile",
    "Shared social moment",
    "Close tight-knit group of friends",
    "Social and relaxed atmosphere",

    // STREET STYLE URBANO
    "Leaning casually against a brick wall",
    "Walking through tall city buildings",
    "Deep urban background",
    "Dynamic but relaxed moving posture",
    "Confident and decisive look",
    "Secure and solid walking pace",
    "Modern city environment",
    "Natural unposed gesture",
    "Walking with a decisive fast step",
    "A true urban moment",

    // MOMENTI STATICI
    "Standing completely relaxed",
    "Looking slightly to the side",
    "Hand casually slipped in the pocket",
    "Natural comfortable posture",
    "Casual lifestyle portrait up close",
    "Half chest framing",
    "Direct and calm look into the camera",
    "A quiet static moment",
    "Completely natural expression",
    "Simple effortless moment",

    // SERA / QUOTIDIANO
    "Walking under the late sunset",
    "Soft city lights in the background",
    "Taking a quiet evening stroll",
    "Stopping casually on the street",
    "Relaxed look towards the horizon",
    "Slow and deliberate movement",
    "Soft urban evening atmosphere",
    "Evening conversation with someone",
    "A natural end-of-day moment",
    "Grand final scene action"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(streetScene, streetSubject, action, streetStyle, streetMood, streetDetails));
    
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Streetwear" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    }

    return NextResponse.json({ ok: true, msg: "Streetwear", count: blocks100.length });
}
