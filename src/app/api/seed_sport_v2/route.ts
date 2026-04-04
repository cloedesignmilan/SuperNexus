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
const cerScene = "A strictly realistic and simple active environment, such as an outdoor city park, a running path, a street, or a well-lit real gym. No artificial studio sets.";
const cerSubject = "An athletic but fully relatable and realistic person, European appearance, natural skin tones. They must look like a real person engaging in daily exercise, not an overly perfect fitness model.";
const cerStyle = "Hyper-realistic sports lifestyle photography. Bright, energetic, using natural or clean realistic lighting.";
const cerMood = "Energetic, active, determined, highly authentic and healthy.";
const cerDetails = "Simple sports elements subtly integrated, like blurred park trees, a water bottle, an urban running path, or light gym equipment in the background.";

const azioni100 = [
    // BLOCCO 1: CORSA E MOVIMENTO DINAMICO (25 scene)
    "Jogging effortlessly along a sunlit city park path",
    "Running dynamically down a beautiful urban street",
    "A candid snapshot mid-stride during a morning run",
    "Sprinting lightly with natural athletic form",
    "Running up modern city stairs as part of a workout",
    "A side-profile shot of a highly energetic outdoor jog",
    "Running along a scenic waterfront path in the morning",
    "A fully authentic dynamic running step with a determined gaze",
    "Jogging with a relaxed smile looking completely natural",
    "A powerful forward push during a real daily run",
    "Running past blurred autumn trees in a large park",
    "A casual light jog during a weekend outdoor workout",
    "Speeding up slightly with great energetic movement",
    "A documentary style shot of urban running exercise",
    "Running comfortably feeling fully active and healthy",
    "A completely unstaged running snapshot looking forward",
    "Moving fast through a dedicated city bike path",
    "Jogging gently while enjoying a beautiful sunny day",
    "An aspirational running posture captured in mid-air",
    "Looking determined while finishing a real city run",
    "A beautiful dynamic run capturing pure athletic movement",
    "Jogging slowly and steadily with rhythmic breathing",
    "Running under an urban bridge during a daily workout",
    "A quick turn of the head while jogging outdoors",
    "A dynamic active lifestyle capture of true running motion",

    // BLOCCO 2: ALLENAMENTO ALL'APERTO E STRETCHING (25 scene)
    "Doing a deep warm-up stretch leaning forward in the park",
    "Holding a standing leg stretch perfectly balancing",
    "Looking perfectly focused while stretching the arms overhead",
    "A dynamic lunge movement on the grass during outdoor training",
    "Preparing for a workout with a highly natural morning stretch",
    "Doing light core exercises in a green outdoor area",
    "Holding a plank position with perfect authentic athletic form",
    "A casual standing stretch looking off into the distance",
    "Stretching the back while sitting comfortably on the ground",
    "A candid unforced moment during an outdoor core workout",
    "Standing gracefully while twisting the torso to warm up",
    "Doing a highly focused cool-down stretch post-workout",
    "Bending down naturally to stretch the hamstrings",
    "Looking relaxed doing shoulder stretches under a bright sky",
    "A functional outdoor workout using a public park bench",
    "Candid active stretching movement feeling highly authentic",
    "A gentle neck stretch closing the eyes in concentration",
    "Squatting naturally during a functional outdoor training session",
    "Taking a deep breath before holding a yoga-style stretch",
    "An aspirational yet totally real outdoor gym moment",
    "Stretching the calves against an urban concrete wall",
    "A slow concentrated stretching movement with a clear focus",
    "Holding an athletic pose during morning warm-ups",
    "An unposed snapshot preparing muscles for functional movement",
    "A purely energetic yet controlled stretching flow",

    // BLOCCO 3: PALESTRA E ALLENAMENTO INDOOR (25 scene)
    "Walking actively through a modern bright gym",
    "Holding a light dumbbell showing authentic fitness effort",
    "Sitting on a workout bench resting before the next set",
    "Looking engaged while adjusting an indoor fitness machine",
    "A standing workout pose near the gym mirror",
    "Walking between sets looking naturally determined",
    "A highly realistic snapshot holding gym equipment",
    "Smiling casually while chatting with someone in the gym",
    "Focusing intently while doing a cable machine workout",
    "A completely candid shot finishing an indoor workout set",
    "Standing confidently in the middle of a spacious gym room",
    "Holding a gym towel casually draped over the shoulder",
    "Looking perfectly active walking down the gym hallway",
    "A highly authentic documentary style gym snapshot",
    "Doing a controlled indoor stretch on a yoga mat",
    "Walking away from the weights rack feeling satisfied",
    "A completely natural stance observing the workout area",
    "A dynamic angle performing a gentle indoor core workout",
    "Looking highly focused pushing effort in a real gym",
    "Taking a deep breath before lifting light fitness weights",
    "A relaxed confident walk through the indoor training zone",
    "An aspirational full-body presentation in a realistic gym",
    "Standing actively with hands on hips near the workout bench",
    "A completely authentic interaction within an indoor gym",
    "A perfect representation of healthy daily gym lifestyle",

    // BLOCCO 4: PAUSE, RECUPERO E CAMMINATA ATTIVA (25 scene)
    "Taking an active casual walk to cool down after running",
    "Drinking water from a sports bottle with a satisfied smile",
    "Wiping sweat gently from the forehead holding a towel",
    "Resting breathlessly but happily putting hands on knees",
    "Sitting on a park bench directly after an intense workout",
    "Walking dynamically while checking a sports smartwatch",
    "A relaxed post-workout walk holding a water bottle",
    "Exhaling deeply with pure satisfaction after a hard run",
    "Looking successfully exhausted but happy after training",
    "Standing completely relaxed drinking a sip of water",
    "A candid happy smile walking actively with a friend",
    "Leaning softly against a city pole catching a breath",
    "Taking a deeply refreshing drink during a training pause",
    "A completely authentic moment of post-workout relaxation",
    "Walking energetically without running just enjoying the outdoors",
    "Smiling wiping the face while a soft breeze blows",
    "Resting beautifully under a large tree after exercise",
    "A dynamic angle drinking water under bright sunlight",
    "A real slice-of-life snapshot looking actively tired",
    "Walking slowly stretching the arms after massive effort",
    "A deeply satisfying smile reflecting a great daily workout",
    "Standing tall and proud resting after athletic movement",
    "A genuine candid break sitting on some urban park steps",
    "An aspirational and extremely healthy rest moment",
    "The perfect lifestyle presentation of active daily movement"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(cerScene, cerSubject, action, cerStyle, cerMood, cerDetails));
    
    // Riferimento al nome nel DB per la categoria
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Sport" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    }

    return NextResponse.json({ ok: true, count: blocks100.length, category: "Sport" });
}
