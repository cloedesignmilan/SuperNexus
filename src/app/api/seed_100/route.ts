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

const sposiScene = "A real and elegant wedding environment such as a villa garden, ceremony area, outdoor reception, terrace, or refined indoor hall.";
const sposiSubject = "A real-looking person or couple with European appearance, light skin tones, natural features, not overly perfect.";
const sposiStyle = "Luxury wedding photography, soft natural light, shallow depth of field.";
const sposiMood = "Romantic, authentic, emotional, aspirational.";
const sposiDetails = "Include elements like bouquet, boutonnière, flowers, ceremony chairs, tables, champagne glasses, or soft decorations.";

const azioni100 = [
    // ARRIVO ALLA CERIMONIA
    "Bride stepping out of the wedding car perfectly naturally",
    "Groom waiting patiently in front of the venue",
    "Bride walking towards the ceremony entrance accompanied",
    "Groom adjusting his jacket while waiting outside",
    "Couple meeting for the first look before the ceremony",
    "Bride walking slowly towards the waiting guests",
    "Groom watching the bride arrive with emotion",
    "Entering the beautiful wedding villa",
    "Walking down the path towards the garden ceremony",
    "First look between the bride and groom",
    
    // CAMMINATA VERSO ALTARE
    "Bride walking holding a floral bouquet",
    "Groom waiting and smiling gently",
    "Walking between aligned ceremony chairs",
    "Bride seen from behind with veil flowing naturally",
    "Groom watching emotionally",
    "Slow elegant walking step close up",
    "Couple approaching each other",
    "Hand gripping the wedding bouquet firmly",
    "Entering under a beautiful floral arch",
    "Natural light beautifully illuminating the dress",
    
    // MOMENTO CERIMONIA
    "Hands joining together gracefully",
    "Deep emotional exchange of looks",
    "Silent intimate moment",
    "Slight natural and happy smile",
    "Couple standing in front of the officiant",
    "Close up of hands intertwined",
    "Natural shifting movement during ceremony",
    "Intense emotional look",
    "Capturing a hyper-emotional moment",
    "Elegant frontal standing posture",
    
    // USCITA CERIMONIA
    "Walking happily through the guests",
    "Spontaneous loud laughter",
    "Flower petals being thrown in the air",
    "Couple exiting ceremony with huge smiles",
    "Dynamic and fast exiting movement",
    "Holding hands tightly",
    "Guests applauding in the background",
    "Bride looking lovingly at the groom",
    "Groom laughing out loud",
    "Incredible happy energy",
    
    // PASSEGGIATA NEL GIARDINO
    "Walking peacefully among large trees",
    "Quiet relaxing moment in the garden",
    "Bride adjusting her dress naturally",
    "Groom adjusting his suit jacket",
    "Walking slowly side by side",
    "Exchanging warm looks",
    "Natural walking movement",
    "Close up of the dress moving naturally",
    "Couple standing very close",
    "Relaxed peaceful atmosphere",
    
    // MOMENTO FOTO
    "Bride standing still and elegant",
    "Groom standing slightly angled",
    "Couple in a natural unforced pose",
    "Smiling head and shoulders portrait",
    "Elegant half bust framing",
    "Looking away gracefully",
    "Full outfit visible in frame",
    "Close up of suit jacket and buttons",
    "Slight movement in the dress",
    "Spontaneous and totally natural pose",
    
    // TRAMONTO
    "Walking back-lit during golden hour",
    "Bride bathed in warm golden sunset light",
    "Groom illuminated from the side",
    "Couple hugging lightly",
    "Slow elegant movement",
    "Veil moving gently in the wind",
    "Elegant silhouette outline",
    "Romantic authentic look",
    "Walking towards the light",
    "Intimate quiet moment",
    
    // RICEVIMENTO
    "Sitting comfortably at the reception table",
    "Elegant toast with champagne glasses",
    "Smiling warmly during conversation",
    "Bride holding a wine glass gracefully",
    "Groom laughing at a joke",
    "Decorated reception table in context",
    "Guests sitting blurry in the background",
    "Convivial and social moment",
    "Couple sitting close together",
    "Beautiful environmental details",
    
    // FESTEGGIAMENTO
    "Laughing loudly with friends",
    "Moving casually among the guests",
    "Couple celebrating energetically",
    "Hugging family members",
    "Completely spontaneous moment",
    "Positive and exciting energy",
    "Casual conversation",
    "Light effortless movement",
    "Clearly visible happiness",
    "Sharing the moment with loved ones",
    
    // MOMENTI INTIMI
    "Close intimate look",
    "Bride leaning gently on the groom",
    "Relaxed holding hands",
    "Calm private conversation",
    "Tranquil moment away from the crowd",
    "Slight happy smile",
    "Couple standing perfectly still",
    "Emotional facial detail",
    "Natural authentic closeness",
    "A perfect authentic moment"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(sposiScene, sposiSubject, action, sposiStyle, sposiMood, sposiDetails));
    
    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Sposi" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    }

    return NextResponse.json({ ok: true, msg: "Sposi", count: blocks100.length });
}
