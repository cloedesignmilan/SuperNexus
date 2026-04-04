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

const kidsScene = "Everyday environments such as parks, playgrounds, streets, or home settings.";
const kidsSubject = "A real-looking child or young person with European appearance, light skin tones.";
const kidsStyle = "Lifestyle photography, natural light.";
const kidsMood = "Happy, real, spontaneous.";
const kidsDetails = "Simple playful environment.";

const azioni100 = [
    // GIOCO ALL’APERTO / PARCO
    "Running happily across the park grass",
    "Jumping energetically in a public park",
    "Playing enthusiastically on a slide",
    "Holding tightly to a playground swing",
    "Sitting in a sandbox playing",
    "Chasing a bouncy ball in the distance",
    "A moment of intense outdoor play",
    "Natural spontaneous playing movement",
    "Happy and completely unforced expression",
    "Dynamic and fast-moving play",

    // PASSEGGIATA IN CITTÀ
    "Walking down a pedestrian street",
    "Stopping casually to look at a window",
    "Holding an invisible parent's hand",
    "Taking slow and curious steps",
    "Looking around at the city environment",
    "Crossing a quiet urban street",
    "Walking fluidly in the town center",
    "Looking up curiously",
    "Walking between passing people",
    "A casual daily walk in the city",

    // MOMENTI QUOTIDIANI / ROUTINE
    "Sitting down taking a small break",
    "Eating a delicious ice cream cone",
    "Drinking from a juice box",
    "Adjusting their clothes casually",
    "Looking naturally at an object",
    "Pausing in the middle of a walk",
    "Tying a shoe or looking down",
    "Sitting casually on a low wall",
    "Waiting patiently",
    "Extremely simple ordinary moment",

    // INTERAZIONE
    "Laughing loudly during a game",
    "Talking vividly with a friend",
    "Calling out to a parent off-screen",
    "A shared happy moment",
    "Looking attentively at someone speaking",
    "Smiling widely during a conversation",
    "Moving naturally to catch attention",
    "Gesturing with small hands",
    "Close interactive dialogue",
    "Sweet and pure social moment",

    // ESPLORAZIONE
    "Looking closely at something on the ground",
    "Curious and exploratory look",
    "Touching a leaf or a flower",
    "Observing the surroundings with wonder",
    "Leaning forward slightly",
    "A moment of quiet discovery",
    "Spontaneous exploratory movement",
    "Walking carefully with intent",
    "Focused and absorbed look",
    "A perfectly natural child exploration",

    // FOTO RICORDO (STILE GENITORE)
    "Looking straight at the smartphone camera",
    "Posing quickly and adorably for a photo",
    "Huge spontaneous smile for the parent",
    "Half-body portrait looking happy",
    "Natural unprepared expression",
    "Completely authentic child portrait",
    "A perfect authentic candid moment",
    "Smiling while squinting in the sun",
    "Brief moment standing perfectly still",
    "Snapshot taken by a parent",

    // MOVIMENTO / ENERGIA
    "Sudden burst of running energy",
    "Jumping high off the ground",
    "Turning around really quickly",
    "Dynamic uncoordinated energy",
    "Running towards the camera",
    "Moving fast without warning",
    "Expression of total chaotic joy",
    "Loud laughter caught in motion",
    "Clapping hands in excitement",
    "Pure unbridled motion",

    // RELAX / CALMA
    "Sitting quietly on the green grass",
    "Looking dreamily into the distance",
    "A moment of sudden calm",
    "Breathing and resting",
    "Gentle innocent smile",
    "Laying back on the floor",
    "Holding a small toy gently",
    "Sitting still on a park bench",
    "Leaning against an adult's leg",
    "Completely peaceful look",

    // AMBIENTE DOMESTICO / INTERNO
    "Walking through a bright hallway",
    "Sitting on a living room rug",
    "Playing near a sunny window",
    "Looking out the window",
    "Moving naturally across the room",
    "Sitting at a table drawing",
    "Looking up from playing",
    "A totally ordinary indoor moment",
    "Cozy and familiar environment",
    "Completely natural indoor lighting",

    // FINE GIORNATA
    "Walking slowly feeling tired",
    "Sitting down yawning adorably",
    "Looking somewhat exhausted but happy",
    "Looking at the sunset",
    "Slow and sleepy walking pace",
    "A quiet end of the day",
    "Holding a jacket draggingly",
    "Looking softly at the camera",
    "Relaxed and heavy eyelids",
    "A beautiful calm finale moment"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(kidsScene, kidsSubject, action, kidsStyle, kidsMood, kidsDetails));
    
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Bambini" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    }

    return NextResponse.json({ ok: true, msg: "Bambini", count: blocks100.length });
}
