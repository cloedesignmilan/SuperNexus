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
const cerScene = "A safe, simple, and completely authentic environment for a child, such as a sunny park, a cozy home interior, a school exterior, or a quiet outdoor space. Absolutely no artificial studio elements.";
const cerSubject = "An extremely realistic, beautiful but entirely authentic child, European appearance, natural light skin tones. They must look like a real kid having a normal day, not a posed child model.";
const cerStyle = "Hyper-realistic childhood lifestyle photography. Bright, clean, beautiful natural daylight.";
const cerMood = "Spontaneous, joyful, serene, highly authentic and peaceful.";
const cerDetails = "Subtle childhood elements in the background, like a blurred swing set, real grass, a softly lit home interior, or simple everyday objects.";

const azioni100 = [
    // BLOCCO 1: PARCO E GIOCO OUTDOOR (25 scene)
    "Running happily across the vibrant green grass of a city park",
    "Laughing spontaneously while playing near a wooden playground",
    "Standing proudly with a wide authentic smile near the swings",
    "Walking actively through the park holding a tiny flower",
    "A completely candid shot caught mid-step while playing outside",
    "Looking surprisingly overjoyed while pointing at something off-camera",
    "Jumping lightly with an expression of pure childhood joy",
    "Sitting peacefully on the grass looking perfectly relaxed",
    "A totally unposed active movement running towards the camera",
    "Looking down curiously at the ground during a walk",
    "Walking enthusiastically down a wide sunlit park path",
    "Standing completely relaxed next to a park bench",
    "Smiling softly while feeling a gentle outdoor breeze",
    "A dynamic angle of joyful play in a safe green space",
    "Walking happily and exploring the natural surroundings",
    "A deeply authentic unforced laugh catching the sunlight",
    "Looking highly curious while discovering a new outdoor area",
    "Stopping suddenly mid-run to look at something interesting",
    "Leaning safely on a park structure looking absolutely adorable",
    "Running with arms naturally raised in absolute happiness",
    "An everyday childhood walk captured beautifully",
    "Resting quietly for a moment during an active day outdoors",
    "A highly realistic everyday smile standing in the park",
    "A completely spontaneous forward movement during playtime",
    "The ultimate representation of a happy carefree childhood outdoors",

    // BLOCCO 2: CON I GENITORI (25 scene)
    "Holding a parent's hand while walking peacefully on the sidewalk",
    "Looking up happily and securely at an out-of-frame parent",
    "Walking side-by-side with a parent showing pure trust",
    "Laughing joyfully holding a parent's hand during a walk",
    "A candid beautifully lit moment of a family walk",
    "Smiling brightly feeling totally safe walking outdoors",
    "A completely unposed everyday moment walking with family",
    "An elegant but highly realistic walk holding the mother's hand",
    "An active energetic stride while walking near a parent",
    "Looking extremely serene while taking an afternoon family walk",
    "A soft warm smile shared during a daily family stroll",
    "A documentary style shot of a peaceful walk together",
    "Walking comfortably under beautiful afternoon sunlight",
    "Laughing completely naturally during a family interaction",
    "Holding the parent's hand gently feeling fully protected",
    "An aspirational but intensely real everyday moment of family life",
    "A quick happy glance given during a quiet outdoor walk",
    "Relaxed and perfectly natural posture strolling outside",
    "An amazing unforced smile showing intense family affection",
    "A calm highly emotional snapshot feeling profoundly safe",
    "A deeply authentic and peaceful family walk captured in motion",
    "Looking forward with complete innocence and joy while walking",
    "Stopping naturally on the sidewalk during a walk with a parent",
    "An easy relaxed stroll with a completely spontaneous attitude",
    "A perfect authentic shot saying: this is beautiful innocent childhood",

    // BLOCCO 3: GIOCOL E SERENITÀ IN CASA (25 scene)
    "Sitting peacefully on a soft carpet in a bright living room",
    "Playing quietly with completely natural and unposed movement",
    "Looking up from playing with an astonishingly authentic smile",
    "Laughing brightly while sitting comfortably on the home sofa",
    "A candid wonderful moment playing calmly indoors",
    "A deeply peaceful gaze illuminated by natural window light",
    "Sitting on the floor looking at a picture book naturally",
    "An everyday unforced smile relaxing in a cozy home environment",
    "A beautiful quiet moment of childhood serenity inside the house",
    "Looking completely relaxed kneeling on a soft rug",
    "A documentary style shot of safe happy indoor play",
    "Laughing spontaneously at a fun indoor moment",
    "Turning happily towards the camera while in the living room",
    "A slow calm movement showing perfect emotional security",
    "Looking gently off-camera with a pure innocent smile",
    "A perfectly genuine snapshot of daily life at home",
    "Sitting completely calm surrounded by a soft home atmosphere",
    "A spontaneous and highly relaxed pose on the couch",
    "Smiling warmly while relaxing in the family space",
    "An unstaged moment of absolute peace indoors",
    "Quiet highly authentic observation of an indoor activity",
    "A beautifully lit portrait showcasing a tranquil childhood",
    "A soft everyday smile showing deep inner happiness",
    "A relaxed casual moment waiting or playing inside",
    "The perfect lifestyle representation of a safe happy childhood home",

    // BLOCCO 4: AMICI E SCUOLA (25 scene)
    "Walking cheerfully with a tiny backpack after school",
    "Laughing wonderfully together with a friend outdoors",
    "Standing proudly outside a school gate looking completely happy",
    "A completely natural walk enjoying a peaceful afternoon",
    "A bright happy smile holding a casual small toy",
    "Walking confidently on an everyday school morning",
    "Exchanging a pure unposed laugh with an unseen friend",
    "A beautiful candid snapshot of childhood friendship",
    "Running lightly towards a best friend with wide-open joy",
    "Walking comfortably and casually in an outdoor urban space",
    "A daily life snapshot arriving happily at a destination",
    "Looking completely relaxed adjusting a strap or jacket naturally",
    "A sweet unforced smile during a calm outdoor walk",
    "Chatting excitedly with a friend in a perfectly realistic way",
    "Standing happily with pure innocent energy",
    "An amazing authentic look feeling fully comfortable",
    "Taking a steady peaceful walk enjoying the day",
    "A documentary style capture of school-aged social life",
    "Looking beautifully content while waiting outdoors",
    "Walking carefully and elegantly on a residential street",
    "A deeply believable everyday friendly interaction",
    "Smiling with pure beautiful innocence doing nothing special",
    "A totally unposed natural posture displaying complete well-being",
    "A highly realistic lifestyle portrait of a happy kid",
    "The ultimate representation of a perfect unforced childhood day"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(cerScene, cerSubject, action, cerStyle, cerMood, cerDetails));
    
    // DB key is "Bambini"
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Bambini" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    }

    return NextResponse.json({ ok: true, count: blocks100.length, category: "Bambini" });
}
