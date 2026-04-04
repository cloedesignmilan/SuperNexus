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
const cerScene = "A highly elegant, completely believable formal event such as a wedding reception, baptism, exclusive birthday party, elegant restaurant, or a magnificent villa garden.";
const cerSubject = "An incredibly stylish but fully realistic event guest, European appearance, natural skin tones, looking like a real aspirational person attending a high-end celebration rather than a stiff studio model.";
const cerStyle = "Hyper-realistic high-end event and lifestyle photography. Bright, clean, with highly authentic natural lighting.";
const cerMood = "Sophisticated, confident, joyful, fully authentic.";
const cerDetails = "Subtle contextual background elements establishing a formal event, like softly blurred guests, beautifully set tables, elegant party drinks, or refined floral decorations.";

const azioni100 = [
    // BLOCCO 1: L'ARRIVO ALL'EVENTO (25 scene)
    "Walking elegantly into the magnificent event venue",
    "Stepping gracefully out of a car arriving at a formal celebration",
    "Walking smoothly across an elegant villa entrance",
    "Looking forward with a warm smile while entering the reception",
    "A spontaneous candid shot walking towards the party crowd",
    "Standing gracefully near the intricately decorated entrance",
    "Greeting another guest with an authentic, joyful smile",
    "Walking down a stone pathway towards an outdoor summer event",
    "Stepping elegantly into a high-end restaurant lobby",
    "Turning to smile at someone while walking into the garden",
    "Adjusting the outfit naturally while arriving at the venue",
    "Walking fluidly past a beautifully decorated event welcome sign",
    "An effortlessly chic lifestyle walk into the formal party",
    "Looking confidently around upon entering the elegant hall",
    "Walking over a pristine manicured lawn towards the celebration",
    "Holding an elegant small bag while walking to the party tables",
    "A candid moment walking up the stairs of an elegant villa",
    "Smiling naturally while being welcomed to the formal event",
    "Taking slow and elegant steps through the event's grand entrance",
    "A highly photogenic yet completely unposed walking movement",
    "Looking effortlessly polished while walking into the ceremony",
    "A gentle natural breeze moving the clothing upon arrival",
    "Walking securely and stylishly into a luxury dining location",
    "Standing confidently the moment they step into the event room",
    "An aspirational documentary-style arrival shot",

    // BLOCCO 2: BRINDISI E DRINK (25 scene)
    "Sipping a cocktail gracefully while talking to other guests",
    "Holding a champagne glass during an elegant party toast",
    "Laughing heartily with friends during an outdoor reception toast",
    "Clinking glasses elegantly at a beautifully set event table",
    "A highly authentic moment raising a glass for celebration",
    "Smiling broadly while holding an elegant party drink",
    "Listening intently to a speech while delicately holding a flute",
    "Walking through the party lightly holding a cocktail glass",
    "Sharing an elegant laugh holding wine at a formal reception",
    "A relaxed but sophisticated pose holding an evening drink",
    "Resting the hand on a cocktail table with a relaxed smile",
    "Offering a warm, spontaneous toast directly to the camera",
    "Looking fully engaged in a happy conversation holding a glass",
    "An unposed candid moment drinking during a summer wedding",
    "Leaning back comfortably holding a drink during the party",
    "Smiling softly while looking at the glass during a conversation",
    "A dynamic angle of a spontaneous celebration toast",
    "Standing elegantly near the bar holding a fresh cocktail",
    "Participating enthusiastically in a lively group toast",
    "Laughing in pure joy with a drink in hand",
    "Looking radiantly happy holding champagne during a baptism party",
    "A refined lifestyle shot holding a glass at twilight",
    "Holding a luxury cocktail in a completely realistic party setting",
    "Exchanging a beautiful smile over a celebratory drink",
    "An aspirational snapshot of a high-end elegant toast",

    // BLOCCO 3: CONVERSAZIONI E SOCIALITÀ (25 scene)
    "Engaged in a deeply polite and elegant conversation with a guest",
    "Laughing aloud spontaneously during a formal dinner chat",
    "Looking completely attentive while listening to a friend at the party",
    "A relaxed conversational posture standing near event tables",
    "Smiling warmly during a social interaction at a luxury event",
    "A totally unforced smile while talking to someone off-camera",
    "Gesturing naturally while telling a story to other guests",
    "Sitting at the reception table having a wonderful conversation",
    "An authentic snapshot of joyous interaction at a wedding party",
    "Looking elegantly comfortable sharing a moment with friends",
    "Leaning in slightly during an interesting formal conversation",
    "A candid beautifully lit moment talking amidst the crowd",
    "Radiating confidence and happiness during a social interaction",
    "Looking extremely natural while conversing at a luxury villa",
    "A gentle smile while greeting completely blurred background guests",
    "Sharing an upscale but wildly accessible slice of party life",
    "Turning successfully while engaged in an ongoing conversation",
    "A bright happy look while chatting with family at the event",
    "Standing effortlessly elegant while surrounded by talking guests",
    "A deeply convivial moment that feels 100% real",
    "An easy relaxed conversational look in an outdoor garden",
    "Laughing authentically holding a conversation by the dinner table",
    "Taking a soft breath mid-conversation showing pure elegance",
    "A documentary-style snapshot of high-end socializing",
    "The perfect representation of formal yet spontaneous interaction",

    // BLOCCO 4: POSA ELEGANTE E AMBIENTE (25 scene)
    "Standing elegantly relaxed in the middle of a villa garden",
    "A highly confident static pose that looks completely casual",
    "Looking out thoughtfully over the beautiful event location",
    "Resting a hand naturally on an outdoor stone railing",
    "Standing peacefully near the lavishly decorated dinner tables",
    "An unposed elegant moment standing perfectly still",
    "Looking right into the camera with absolute relaxed confidence",
    "A quiet solitary moment of elegance during the busy party",
    "Leaning comfortably against a beautifully lit outdoor wall",
    "A perfect full presentation of the outfit during a relaxed moment",
    "A confident half-body portrait showcasing incredible formal style",
    "Looking to the side gracefully under natural daylight",
    "Enjoying a quiet moment surrounded by elegant party floral decor",
    "Sitting elegantly and completely relaxed in a party lounge chair",
    "An aspirational portrait that captures the true essence of formal wear",
    "Standing effortlessly with a posture of absolute confidence",
    "A casual elegant moment waiting near the venue terrace",
    "Looking highly stylish and completely comfortable at a wedding",
    "A beautiful calm moment right before the sunset",
    "Standing gracefully in the manicured garden of the event",
    "A striking yet entirely natural pose showcasing the perfect outfit",
    "A peaceful highly emotional static portrait at the reception",
    "Looking exceptionally chic while standing near large party windows",
    "The perfect lifestyle representation of an important event guest",
    "An unforgettable elegant closing shot full of pure relaxed style"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(cerScene, cerSubject, action, cerStyle, cerMood, cerDetails));
    
    // In base al DB attuale, la categoria generica per eleganti invitati e cerimonie
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Cerimonia e festa" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    }

    return NextResponse.json({ ok: true, count: blocks100.length, category: "Cerimonia e festa" });
}
