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
const f18Scene = "A credible and well-decorated 18th birthday party environment like a house, villa, terrace, or party room. The environment is extremely realistic and not an artificial studio.";
const f18Subject = "A real-looking 18-year-old with European appearance, light skin tones, good-looking but highly realistic and natural, not overly perfect.";
const f18Style = "Hyper-realistic lifestyle photography, bright and natural lighting. Feeling exactly like a real high-quality party snapshot.";
const f18Mood = "Energetic, happy, spontaneous, full of life.";
const f18Details = "Subtle but clear elements like '18' shaped balloons, birthday cake with candles, decorative warm lights, and friends in the background.";

const azioni100 = [
    // BLOCCO 1: LA TORTA (25 scene)
    "Blowing out the candles on a beautiful 18th birthday cake",
    "Standing proudly behind a large birthday cake with lit candles",
    "Cutting the first slice of the 18th birthday cake",
    "Laughing loudly while friends bring out the birthday cake",
    "Looking down at the birthday cake with a huge spontaneous smile",
    "Holding a knife ready to cut the cake while friends clap",
    "Leaning forward slightly to blow out the '18' candles",
    "Smiling brightly at the camera with the cake in the foreground",
    "Closing eyes making a wish before blowing candles",
    "Holding a piece of cake on a small elegant plate",
    "Friends cheering around the lit birthday cake",
    "Standing next to the cake table with natural movement",
    "Looking surprised as the cake is revealed",
    "Enjoying a slice of cake while talking to a friend",
    "Pointing happily at the '18' candles",
    "Looking at the cake warmly lit by the candles",
    "Celebrating immediately after blowing the candles out",
    "Laughing with cake frosting on a small finger",
    "Posing spontaneously next to the dessert table",
    "Holding the cake knife up playfully",
    "Friends hugging the birthday person near the cake",
    "Tasting the cake with a natural happy expression",
    "Looking happily at the '18' balloons behind the cake",
    "Standing elegantly by the cake table waiting for guests",
    "Clapping hands happily around the birthday cake",

    // BLOCCO 2: BRINDISI E DRINK (25 scene)
    "Toasting with a glass of champagne together with friends",
    "Raising a colorful party drink for a celebratory toast",
    "Holding a drink gracefully while engaged in conversation",
    "Laughing out loud with friends while holding glasses",
    "Clinking glasses with a best friend at the party",
    "Sipping a party cocktail with a natural smile",
    "Standing near the drink station talking to guests",
    "Holding a glass up during an 18th birthday speech",
    "Conversing elegantly with a drink in hand",
    "Smiling widely during a spontaneous group toast",
    "Looking authentically happy holding a party flute",
    "Cheers with a group of friends in the center of the room",
    "Taking a casual sip while looking naturally off-camera",
    "Leaning on the party table with a drink in hand",
    "Offering a toast directly to the camera",
    "Relaxed party interaction holding a cold beverage",
    "Laughing with friends near the cocktail table",
    "Raising a class in a gesture of pure celebration",
    "Looking gracefully at a friend while toasting",
    "Dynamic toast moment with drinks in the air",
    "Holding two glasses ready to give one to a friend",
    "Talking energetically with a drink at the terrace party",
    "Soft smile during a polite toast",
    "Group toast capturing the real essence of the 18th birthday",
    "Drinking casually in a crowded party atmosphere",

    // BLOCCO 3: BALLO ED ENERGIA (25 scene)
    "Dancing spontaneously with a group of friends",
    "Moving naturally to the music on the dance floor",
    "Laughing with pure joy while dancing",
    "Spinning around lightly on the party floor",
    "Clapping to the rhythm of the music with friends",
    "Walking actively through the dancing crowd",
    "Holding hands with a friend while jumping to music",
    "Energetic and fluid authentic dancing movement",
    "Throwing hands up in the air in pure celebration",
    "Smiling while moving to the party beat",
    "Dynamic lifestyle shot in the middle of a dance circle",
    "Singing along to a favorite song with friends",
    "Walking away from the dance floor breathing heavily but happy",
    "Natural unposed movement responding to the party vibe",
    "Group of young adults dancing organically together",
    "Laughing hysterically while trying a dance move",
    "Turning successfully while dancing in a beautiful dress",
    "Casual sway to the music holding a friend's hand",
    "High-energy moment capturing the youth of 18",
    "Looking back over the shoulder while walking to the dance floor",
    "Spontaneous jump of joy",
    "Laughing and pointing at a dancing friend",
    "Dancing under warm decorative party string lights",
    "Casual fun party interaction on the dance floor",
    "A candid snapshot of pure 18th birthday dancing energy",

    // BLOCCO 4: SOCIALE, RELAX E ARRIVO (25 scene)
    "Walking into the party venue looking incredibly happy",
    "Hugging a friend who just arrived to the party",
    "Taking a spontaneous selfie with a group of friends",
    "Sitting on a sofa having an intimate laugh with a friend",
    "Standing gracefully near giant '18' helium balloons",
    "Looking at a smartphone screen and laughing",
    "Welcoming a party guest with a huge warm smile",
    "Walking smoothly across the party terrace",
    "Posing casually and authentically for a friend's photo",
    "Opening a birthday gift looking genuinely surprised",
    "Standing on a villa terrace looking at the city lights",
    "Refined portrait near the entrance of the party",
    "Hugging best friends in a tight comfortable group",
    "Adjusting the outfit naturally while chatting",
    "Walking down a decorated grand staircase",
    "Sitting casually by the party decorations",
    "A quiet but happy moment observing the party",
    "Looking effortlessly elegant while entering the room",
    "Greeting people with warm natural gestures",
    "Laughing deeply while reading a birthday card",
    "Holding a small gift box naturally",
    "Walking between party tables to greet friends",
    "Standing confidently in the middle of the decorated room",
    "Relaxing on a garden chair away from the music",
    "Final moment of the party, looking relaxed and satisfied"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(f18Scene, f18Subject, action, f18Style, f18Mood, f18Details));
    
    // Assumiano che il DB sia stato aggiornato precedentemente e continuiamo a usare la label "Festa 18°"
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Festa 18°" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    }

    return NextResponse.json({ ok: true, count: blocks100.length, category: "Festa 18°" });
}
