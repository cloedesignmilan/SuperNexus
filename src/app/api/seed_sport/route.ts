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

const sportScene = "Sport or active environments such as parks, gyms, streets, or outdoor fitness areas.";
const sportSubject = "A real-looking athletic person with European appearance, light skin tones.";
const sportStyle = "Clean fitness photography, natural light.";
const sportMood = "Active, healthy, energetic.";
const sportDetails = "Simple sport elements.";

const azioni100 = [
    // CORSA / MOVIMENTO
    "Running actively on an urban street",
    "Running steadily through a green park",
    "Light casual jogging",
    "Dynamic and energetic running movement",
    "Running pace step",
    "Natural running acceleration",
    "Running casually on a city sidewalk",
    "Fluid continuous running movement",
    "Focused and determined athletic look",
    "High energy active movement",

    // ALLENAMENTO ALL’APERTO
    "Doing light stretching in the public park",
    "Light athletic warm-up routine",
    "Bodyweight exercises outdoors",
    "Controlled and balanced athletic movement",
    "Holding a stable plank position",
    "Stretching leg muscles standing up",
    "Simple light fitness exercises",
    "Completely natural workout movement",
    "Preparing for an outdoor workout",
    "Active outdoor fitness activity",

    // PALESTRA (REALISTICA)
    "Walking casually between gym equipment",
    "Sitting down to rest after a workout",
    "Holding a workout towel casually",
    "Drinking water from a sports bottle",
    "Preparing to start a workout session",
    "Light movement walking around the gym",
    "Waiting relaxed between exercise sets",
    "Focused and concentrated athletic look",
    "A moment of pause taking a breath",
    "Real realistic fitness environment",

    // CAMMINATA SPORTIVA
    "Walking fast with an athletic pace",
    "Active and energetic walk",
    "Natural energetic moving pace",
    "Looking straight ahead decisively",
    "Confident and determined walking step",
    "Urban power walk through the city",
    "Athletic walk through a nature park",
    "Relaxed but active movement",
    "Daily routine athletic activity",
    "Light active and healthy energy",

    // PAUSA / RECUPERO
    "Drinking water staying hydrated",
    "Wiping sweat off the face",
    "Breathing deeply after a hard workout",
    "A quiet moment of athletic pause",
    "Sitting down taking a deep rest",
    "Relaxed and satisfied look",
    "Recovering energy after cardio",
    "Slow and heavy breathing movement",
    "Natural and authentic paused moment",
    "Tranquil rest period",

    // MOMENTI QUOTIDIANI SPORT
    "Walking while wearing athletic headphones",
    "Listening to workout music",
    "Checking the smartphone casually",
    "Answering a quick text message",
    "Natural daily routine movement",
    "Stopping casually to check progress",
    "Urban athletic lifestyle moment",
    "Typical daily sports routine",
    "Focused look checking a smart watch",
    "A personal and quiet moment",

    // SPORT IN CITTÀ
    "Walking athletically among city buildings",
    "Urban running on the pavement",
    "Moving through city street traffic",
    "Dynamic and fast walking pace",
    "Active city environment background",
    "Confident look navigating the city",
    "Continuous athletic forward movement",
    "Urban open-air fitness activity",
    "Natural energetic vibe",
    "Daily urban commute routine",

    // MOMENTI STATICI SPORT
    "Standing completely relaxed",
    "Standing with hands on hips breathing",
    "Direct and focused confident look",
    "Strong athletic standing posture",
    "Close up athletic portrait",
    "Half body framing while resting",
    "Taking a deep breath of fresh air",
    "A static and calm moment",
    "Completely natural facial expression",
    "A paused moment of silence",

    // NATURA / ESTERNO
    "Walking peacefully in a green outdoor area",
    "Training actively in fresh air",
    "Natural outdoor fitness movement",
    "Pausing in the middle of a park",
    "Relaxed look absorbing nature",
    "Natural and positive energy",
    "Green outdoor athletic activity",
    "Light and effortless movement",
    "Clean natural environmental atmosphere",
    "Quiet and peaceful outdoor moment",

    // SERA / FINE ALLENAMENTO
    "Walking down the street at sunset",
    "Finishing up a workout routine",
    "Slow and exhausted but happy movement",
    "Relaxed and satisfied evening look",
    "Post-workout tired recovery",
    "Soft dim evening lighting",
    "Soft and calm evening atmosphere",
    "Final moment of the session",
    "Relaxing finally after extreme activity",
    "Grand final athletic scene"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(sportScene, sportSubject, action, sportStyle, sportMood, sportDetails));
    
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Sport" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    }

    return NextResponse.json({ ok: true, msg: "Sport", count: blocks100.length });
}
