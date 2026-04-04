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
const cerScene = "A highly realistic, entirely credible everyday urban scenario, like a city sidewalk, an outdoor cafe, near public transport, or exiting a local store. Absolutely no artificial studio elements.";
const cerSubject = "A relatable, attractive but extremely authentic person, European appearance, natural skin tones with slight real-life imperfections. Perfect representation of everyday streetwear lifestyle.";
const cerStyle = "Hyper-realistic documentary streetwear lifestyle photography. Bright, clean, with highly authentic natural daylight.";
const cerMood = "Casual, spontaneous, simple, trendy but highly authentic.";
const cerDetails = "Everyday urban elements subtly visible in the background like blurred storefronts, coffee cups, a smartphone, or city street textures.";

const azioni100 = [
    // BLOCCO 1: PASSEGGIATA IN CITTÀ E MEZZI (25 scene)
    "Walking casually on a bright city sidewalk",
    "Stepping confidently off a city bus while looking ahead",
    "Crossing the street looking comfortably stylish",
    "A candid walking shot looking off-camera near an urban crosswalk",
    "Walking hands-in-pockets under bright afternoon sunlight",
    "A completely unposed movement passing by a beautiful brick wall",
    "Walking up subway stairs holding a casual bag",
    "Looking down slightly while exploring a new city neighborhood",
    "An effortless stride on an asphalt city street",
    "A spontaneous moment waiting near a public transit stop",
    "Stopping casually to look down a long avenue",
    "Walking actively through the daily city hustle",
    "A natural quick look to the side while walking on the pavement",
    "Walking past blurred background pedestrians naturally",
    "Crossing a charming urban bridge holding a jacket",
    "A highly realistic everyday street style walk",
    "Leaning safely against a city pole waiting to cross",
    "A quick mid-step snapshot on an everyday morning",
    "Looking effortlessly cool walking through town",
    "Walking directly towards the camera with a soft warm smile",
    "A documentary style shot commuting in the city",
    "Stepping gracefully over a street corner curb",
    "An everyday walk captured with stunning realism",
    "Walking under the shade of a street tree in the city",
    "Taking a relaxed weekend stroll down a residential street",

    // BLOCCO 2: CAFFÈ E BAR (25 scene)
    "Sipping an espresso at a small outdoor urban cafe",
    "Holding a paper coffee cup while walking down the street",
    "Sitting comfortably on a bar stool looking out the window",
    "A spontaneous bright smile while stirring a coffee",
    "Leaning back casually in an outdoor cafe chair",
    "Holding a modern iced coffee taking an unposed walking step",
    "Looking highly relaxed across the cafe table",
    "Resting elbows on a small round outdoor table naturally",
    "Taking a casual sip of a drink while observing the city",
    "A beautifully lit candid moment buying coffee",
    "Smiling softly over a steaming cup of everyday coffee",
    "Walking away from a coffee shop entrance",
    "A completely unstaged relaxation moment holding a mug",
    "Looking thoughtfully into the distance from a cafe terrace",
    "A bright morning moment starting the day with coffee",
    "Sitting alone reading a note while finishing a drink",
    "Holding the cup with both hands leaning forward",
    "A quick casual smile exchanged with an unseen barista",
    "Walking down the sidewalk holding a pastry and a drink",
    "A realistic snapshot of modern urban coffee culture",
    "Simply holding the coffee cup on the lap while resting",
    "Smiling warmly seated at an outdoor coffee spot",
    "A perfect highly relatable everyday morning break",
    "Looking incredibly natural sitting near the cafe window",
    "Turning happily while holding a takeaway drink",

    // BLOCCO 3: NEGOZI, SHOPPING E SMARTPHONE (25 scene)
    "Walking happily out of a beautiful storefront holding a shopping bag",
    "Stopping casually on the street to check a smartphone",
    "Smiling widely at a text message while standing on the sidewalk",
    "Walking while briefly looking down at the phone",
    "Looking through a shop window with genuine interest",
    "Holding a shopping bag effortlessly while taking a relaxed walk",
    "A candid snapshot holding the phone near an urban wall",
    "Pausing on the corner to send a quick voice message",
    "A soft everyday smile while browsing the internet outside",
    "An authentic snapshot leaning on a wall holding a phone",
    "Adjusting the outfit naturally after leaving a boutique",
    "Holding multiple shopping bags with a triumphant smile",
    "Walking past colorful store displays perfectly integrated in the city",
    "Looking up from the screen with a totally natural expression",
    "Snapping a quick casual photo of the street with the phone",
    "A highly realistic shopping lifestyle walk",
    "Waiting outside a store looking casually chic",
    "Taking an everyday phone call while continuing to walk",
    "Resting the arm naturally holding a screen",
    "Walking briskly after a successful shopping trip",
    "An aspirational but totally authentic everyday tech interaction",
    "Looking incredibly stylish while waiting with bags",
    "A soft warm expression checking notifications outdoors",
    "Walking away from a store entirely happy and relaxed",
    "A perfectly unposed urban lifestyle shopping shot",

    // BLOCCO 4: AMICI E SPONTANEITÀ URBANA (25 scene)
    "Laughing heartily during a completely spontaneous street conversation",
    "Leaning beautifully against an urban concrete wall",
    "A natural unforced standing pose resting near a city bench",
    "Sitting casually on the edge of an urban fountain",
    "Exchanging a bright smile with a friend just out of frame",
    "A candid snapshot resting on public street steps",
    "Looking highly attractive and relatable while chatting",
    "A deeply authentic relaxed street style presentation",
    "Hugging a friend hello right on the sidewalk",
    "A completely relaxed posture waiting for a friend",
    "Looking over the shoulder laughing with pure joy",
    "Sitting back comfortably on a city park bench",
    "A totally unposed interaction on a busy street corner",
    "Gesturing naturally while telling a funny story",
    "Standing easily with hands in pockets looking happy",
    "A bright beautiful day relaxing outdoors in the city",
    "Sharing an everyday slice of life with friends",
    "A dynamic snapshot of youthful urban energy",
    "Sitting gracefully on a low city wall in the sun",
    "A completely casual unforced street style portrait",
    "A deeply real and authentic warm smile on a local street",
    "Looking effortlessly cool under the city sunlight",
    "Enjoying a relaxed weekend hangout outside",
    "A true documentary style moment of urban youth",
    "The ultimate relatable everyday lifestyle capture"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(cerScene, cerSubject, action, cerStyle, cerMood, cerDetails));
    
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Streetwear" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    }

    return NextResponse.json({ ok: true, count: blocks100.length, category: "Streetwear" });
}
