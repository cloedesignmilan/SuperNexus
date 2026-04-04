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
const cerScene = "A refined but entirely real and believable wedding environment such as a luxurious villa, a manicured garden, an outdoor ceremony area, or an elegant sunny location.";
const cerSubject = "An extremely good-looking but entirely realistic bride or groom, European appearance, light skin tones, completely authentic and natural, not an artificial studio model.";
const cerStyle = "Hyper-realistic high-end wedding photography. Bright, bright natural lighting, elegant yet spontaneous.";
const cerMood = "Emotional, romantic, authentic, deeply aspirational but credible.";
const cerDetails = "Subtle high-end wedding elements like a floral bouquet, boutonnière, elegant guests subtly out of focus, or ceremonial flowers.";

const azioni100 = [
    // BLOCCO 1: LA CAMMINATA E L'ARRIVO (25 scene)
    "Walking gracefully down the outdoor aisle lined with floral arrangements",
    "Stepping out of a vintage wedding car with a completely natural smile",
    "Walking side by side with the parent towards the ceremony path",
    "Holding the floral bouquet tightly while taking slow elegant steps",
    "A candid moment walking up the stone stairs of the villa",
    "Looking down slightly while adjusting the dress during an elegant walk",
    "Walking confidently on the green grass of the ceremony garden",
    "Looking straight ahead emotionally while approaching the altar",
    "A completely spontaneous walking movement towards the guests",
    "Adjusting the jacket or dress naturally while arriving at the venue",
    "Walking smoothly under a large floral archway",
    "Turning the head back with a radiant smile during the outdoor entrance",
    "Taking the first confident step into the elegant wedding reception",
    "Walking with fluid movement through the garden path",
    "Leaning in slightly during an elegant walk across the terrace",
    "A slow elegant stroll holding the beautiful wedding bouquet",
    "Looking at the waiting guests with a sincere authentic smile",
    "Walking past decorated chairs with natural grace",
    "Stepping onto the terrace with beautiful natural sunlight",
    "An unposed walking snapshot towards the ceremony area",
    "Looking at the person waiting at the altar with deep emotion",
    "Natural forward movement holding hands together",
    "A completely candid shot taken mid-stride during the ceremony entrance",
    "Walking calmly and elegantly without any forced stiff poses",
    "Walking straight towards the camera with an emotional smile",

    // BLOCCO 2: LO SGUARDO E L'EMOZIONE (25 scene)
    "Exchanging a deeply emotional and silent look",
    "Looking at each other with pure authentic love and a soft smile",
    "A candid moment wiping a sudden tear of joy",
    "Staring romantically into the eyes with slight natural movement",
    "A spontaneous burst of happy laughter during an intimate look",
    "Closing the eyes gently during an intensely emotional quiet moment",
    "Looking down with a soft, peaceful, and totally authentic expression",
    "An elegant side-profile look full of deep emotion",
    "Smiling softly while making direct eye contact with the partner",
    "A spontaneous knowing look exchanged in complete silence",
    "Holding hands tightly while exchanging an intense look",
    "Looking softly at the partner holding the floral bouquet",
    "A quiet tender moment without any artificial posing",
    "Laughing nervously but happily right before saying vows",
    "An intensely authentic romantic glance near the altar",
    "Looking warmly and affectionately with bright eyes",
    "A candid unposed look of pure joy",
    "Turning slightly to give a deeply emotional smile",
    "Gazing affectionately during the calm before the ceremony",
    "An honest and totally authentic emotional reaction snapshot",
    "A subtle but incredibly romantic facial expression",
    "Looking gently off-camera with a deeply moving smile",
    "A beautiful quiet moment staring lovingly",
    "A highly emotional reaction with a huge genuine smile",
    "Exchanging an aspirational and deeply loving look",

    // BLOCCO 3: FESTEGGIAMENTO E BRINDISI (25 scene)
    "Toasting with an elegant crystal champagne glass",
    "Laughing loudly during a spontaneous group celebration",
    "Smiling warmly while raising a glass to the wedding guests",
    "Clinking champagne glasses with pure authentic joy",
    "Walking through a cloud of thrown flower petals with a huge smile",
    "Cheering spontaneously with the guests at the reception",
    "An unposed happy moment talking to guests holding a drink",
    "Laughing while being hugged by excited friends",
    "Looking radiantly happy holding an elegant drink",
    "A natural celebratory toast captured mid-action",
    "Smiling brightly under soft natural sunlight during the toast",
    "Spontaneous high-energy celebration with wedding guests",
    "Walking happily while holding an elegant champagne flute",
    "Sharing an incredibly funny and happy conversational moment",
    "Toasting enthusiastically with an energetic smile",
    "A dynamic snapshot of pure wedding day happiness",
    "Looking relaxed and joyful chatting at the reception table",
    "Holding the glass elegantly while listening to a wedding speech",
    "An incredibly authentic moment of laughter with family",
    "A beautiful unforced smile during the general celebration",
    "Celebrating the moment with effortless elegance",
    "A true documentary style snapshot of a happy wedding toast",
    "Turning to a friend with an elegant but joyful expression",
    "Walking actively through the party while holding a drink",
    "Smiling widely during an elegant daytime garden party",

    // BLOCCO 4: PASSEGGIATA NEL GIARDINO E RELAX (25 scene)
    "A quiet romantic stroll through the lush villa garden",
    "Walking slowly side by side looking extremely relaxed",
    "Holding hands gracefully while walking through the green park",
    "A serene and elegant moment resting against a stone wall",
    "Walking peacefully under the shade of ancient trees",
    "A private quiet moment away from the crowd",
    "Looking absolutely tranquil and relaxed in the beautiful garden",
    "A candid snapshot walking effortlessly on the grass",
    "Looking thoughtfully at the stunning floral surroundings",
    "Walking slowly with the dress flowing naturally",
    "A deeply romantic and calm stroll across the wedding venue",
    "Enjoying a peaceful moment of solitude and elegance",
    "Simply standing in the garden looking naturally beautiful",
    "A relaxed unposed walk holding the lovely wedding flowers",
    "Exchanging a quiet smile while walking in the garden path",
    "A totally unforced and calm moment captured flawlessly",
    "Walking gently with a soft breeze moving the outfit naturally",
    "An aspirational and extremely relaxed wedding day walk",
    "Stopping slightly to enjoy the beautiful day outside",
    "A perfectly elegant resting pose that looks 100% natural",
    "Wandering slowly through the carefully manicured garden",
    "A highly authentic documentary style walk in nature",
    "Looking serene and happy surrounded by beautiful flowers",
    "An understated but deeply emotional garden stroll",
    "Final shot: looking back gently with a peaceful authentic smile"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(cerScene, cerSubject, action, cerStyle, cerMood, cerDetails));
    
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Sposi" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    }

    return NextResponse.json({ ok: true, count: blocks100.length, category: "Sposi" });
}
