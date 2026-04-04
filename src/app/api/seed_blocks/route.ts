import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Template Builder Universale - Riproduce ESATTAMENTE il layout approvato dall'utente
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

// ======================================
// 1. FESTA 18° 
// ======================================
const f18Scene = "An 18th birthday party in a real decorated location such as a house, villa, terrace, or party room.";
const f18Subject = "A group of real-looking young people (18–20 years old), European appearance, light skin tones, natural and not overly perfect.";
const f18Style = "Natural lifestyle photography, soft warm lighting.";
const f18Mood = "Fun, energetic, authentic.";
const f18Details = "Include balloons with '18', birthday cake with candles, drinks, lights, decorations.";
const f18Actions = [
    "standing near a birthday cake with candles",
    "blowing out candles",
    "holding a drink",
    "dancing with friends",
    "laughing in a group",
    "taking selfies",
    "entering the party",
    "sitting and talking",
    "celebrating around a table",
    "smiling looking completely natural"
];

// ======================================
// 2. SPOSI 
// ======================================
const sposiScene = "A real and elegant wedding environment such as a villa garden, ceremony area, outdoor reception, terrace, or refined indoor hall.";
const sposiSubject = "A real-looking couple with European appearance, light skin tones, natural features, not overly perfect.";
const sposiStyle = "Luxury wedding photography, soft natural light, shallow depth of field.";
const sposiMood = "Romantic, authentic, emotional, aspirational.";
const sposiDetails = "Include elements like bouquet, boutonnière, flowers, ceremony chairs, tables, champagne glasses, or soft decorations.";
const sposiActions = [
    "walking toward the ceremony",
    "standing near floral arches",
    "sitting at decorated tables",
    "entering the venue",
    "standing on a staircase",
    "walking through a garden",
    "celebrating after the ceremony",
    "sharing a quiet moment together",
    "smiling and holding hands",
    "looking at each other warmly"
];

// ======================================
// 3. CERIMONIA E FESTA
// ======================================
const cerScene = "An elegant real-life setting such as a terrace, restaurant, hotel, city street, or refined indoor space.";
const cerSubject = "A real-looking person with European appearance, light skin tones, natural beauty, not overly perfect.";
const cerStyle = "Luxury lifestyle photography, soft light.";
const cerMood = "Elegant, confident, natural.";
const cerDetails = "Minimal refined environment.";
const cerActions = [
    "walking",
    "standing near a mirror",
    "sitting at a table",
    "arriving at an event",
    "holding a drink",
    "adjusting the dress",
    "interacting with surroundings",
    "laughing casually",
    "smiling naturally",
    "looking relaxed and confident"
];

// ======================================
// 4. STREETWEAR
// ======================================
const streetScene = "Urban everyday environments such as streets, sidewalks, shops, cafes, public transport, or outdoor areas.";
const streetSubject = "A real-looking young person with European appearance, light skin tones, not overly perfect.";
const streetStyle = "Street photography, natural light.";
const streetMood = "Relaxed, authentic, modern.";
const streetDetails = "City elements, real life atmosphere.";
const streetActions = [
    "walking",
    "crossing the street",
    "sitting on a bench",
    "using a phone",
    "talking with friends",
    "exiting a shop",
    "drinking coffee",
    "waiting at a bus stop",
    "looking around naturally",
    "standing casually against a wall"
];

// ======================================
// 5. BUSINESS & TEMPO LIBERO
// ======================================
const busScene = "A modern and elegant real-life environment such as city streets, offices, restaurants, hotels, terraces, or events.";
const busSubject = "A real-looking adult person with European appearance, light skin tones, natural features.";
const busStyle = "Luxury lifestyle photography, clean natural light.";
const busMood = "Confident, elegant, modern.";
const busDetails = "Urban or elegant elements, subtle background context.";
const busActions = [
    "walking in the city",
    "sitting in an office",
    "standing near a window",
    "entering a building",
    "having an aperitivo",
    "sitting at a table",
    "checking phone",
    "stepping out of a car",
    "holding a drink",
    "adjusting a jacket or clothing"
];

// ======================================
// 6. SPORT 
// ======================================
const sportScene = "Sport or active environments such as parks, gyms, streets, or outdoor fitness areas.";
const sportSubject = "A real-looking athletic person with European appearance, light skin tones.";
const sportStyle = "Clean fitness photography, natural light.";
const sportMood = "Active, healthy, energetic.";
const sportDetails = "Simple sport elements.";
const sportActions = [
    "walking",
    "stretching",
    "light running",
    "resting after workout",
    "preparing for activity",
    "stretching casually",
    "drinking water",
    "jogging lightly",
    "standing relaxed",
    "breathing deeply"
];

// ======================================
// 7. BAMBINI
// ======================================
const kidsScene = "Everyday environments such as parks, playgrounds, streets, or home settings.";
const kidsSubject = "A real-looking child or young person with European appearance, light skin tones.";
const kidsStyle = "Lifestyle photography, natural light.";
const kidsMood = "Happy, real, spontaneous.";
const kidsDetails = "Simple playful environment.";
const kidsActions = [
    "playing",
    "walking",
    "laughing",
    "interacting with others",
    "sitting",
    "moving naturally",
    "jumping happily",
    "running carelessly",
    "standing still looking cute",
    "smiling adorably towards the camera"
];


export async function GET() {
    const config = [
        { name: "Cerimonia e festa", s: cerScene, sub: cerSubject, sty: cerStyle, m: cerMood, d: cerDetails, a: cerActions },
        { name: "Sposi", s: sposiScene, sub: sposiSubject, sty: sposiStyle, m: sposiMood, d: sposiDetails, a: sposiActions },
        { name: "Festa 18°", s: f18Scene, sub: f18Subject, sty: f18Style, m: f18Mood, d: f18Details, a: f18Actions },
        { name: "Sport", s: sportScene, sub: sportSubject, sty: sportStyle, m: sportMood, d: sportDetails, a: sportActions },
        { name: "Bambini", s: kidsScene, sub: kidsSubject, sty: kidsStyle, m: kidsMood, d: kidsDetails, a: kidsActions },
        { name: "Streetwear", s: streetScene, sub: streetSubject, sty: streetStyle, m: streetMood, d: streetDetails, a: streetActions },
        { name: "Business & tempo libero", s: busScene, sub: busSubject, sty: busStyle, m: busMood, d: busDetails, a: busActions }
    ];

    for (const c of config) {
        const blocks = c.a.map(action => buildBlockPrompt(c.s, c.sub, action, c.sty, c.m, c.d));
        
        const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: c.name } });
        if (existing) {
             await (prisma as any).promptTemplate.update({
                 where: { id: existing.id },
                 data: { scenes: JSON.stringify(blocks) }
             });
        }
    }
    
    return NextResponse.json({ ok: true, msg: "Tutte le 7 categorie riscritte con il formato EXACT BLOCK dell'utente." });
}
