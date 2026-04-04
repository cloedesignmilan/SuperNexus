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
    return `Create a hyper-realistic high-end fashion editorial photo shot in a professional studio.

SCENE:
${sceneDesc}

SUBJECT:
${subjectDesc}

OUTFIT:
The subject is wearing the exact outfit from the reference image.

ACTION:
${actionDesc}

STYLE:
${styleDesc}

MOOD:
${moodDesc}

DETAILS:
${detailsDesc}

IMPORTANT:
The outfit must remain 100% identical in shape, color, fabric, and fit.
The image must look like a real professional photoshoot.

NEGATIVE:
No text, no logos, no watermarks.
No cluttered background.
No exaggerated poses.`;
}

// User-provided brief mapped to structural parameters
const cerScene = "Minimal studio environment with a clean background (white, beige, grey, or soft neutral tones). No distractions.";
const cerSubject = "A real-looking model (male or female) aged 20–35, with European appearance, light skin tones, natural features, not overly artificial.";
const cerStyle = "High-end fashion magazine photography (Vogue-style), clean, sharp, and premium.";
const cerMood = "Elegant, minimal, sophisticated, editorial.";
const cerDetails = "Professional studio floor, extremely clean negative space to direct all focus on the outfit.";

const azioni100 = [
    // BLOCCO 1: Standing Poses & Full Body (25 scene)
    "Standing with a controlled and elegant pose directly facing the camera",
    "Standing gracefully with shoulders slightly angled for a slim silhouette",
    "A subtle standing fashion stance with perfect posture",
    "Standing tall with hands relaxed by the sides in an elegant way",
    "A confident classic standing pose as seen in premium lookbooks",
    "Looking straight ahead with an effortlessly chic standing posture",
    "Standing perfectly still with amazing high-end minimal elegance",
    "A very subtle hip tilt creating a classic fashion silhouette",
    "Standing confidently in the middle of the bright studio",
    "An effortless standing pose showcasing the outfit shape perfectly",
    "Standing with quiet confidence looking softly at the camera",
    "A perfectly balanced standing position over a seamless studio backdrop",
    "Standing with a gentle highly professional fashion attitude",
    "Looking elegant standing tall against a neutral grey wall",
    "A minimal and clean full-body presentation standing straight",
    "Standing with incredible sophistication feeling very premium",
    "A classic catalog standing pose with elevated magazine styling",
    "Posing subtly with absolute minimal movement while standing",
    "Standing under clean studio light with a striking gaze",
    "A highly curated standing position emphasizing the clothing lines",
    "Standing beautifully with extreme attention to garment fit",
    "A refined standing pose reflecting true luxury styling",
    "Standing with feet slightly apart for a modern fashion look",
    "Looking elegant and powerful in a simple standing position",
    "The perfect high-profile minimal fashion standing stance",

    // BLOCCO 2: Subtle Movement & Pacing (25 scene)
    "Taking a very slow and elegant step forward in the studio",
    "Walking gently against a pure seamless backdrop",
    "A subtle mid-step movement that looks completely editorial",
    "Moving gracefully while maintaining perfect fashion posture",
    "A slight pivot highlighting the side profile of the outfit",
    "Walking slowly with absolute confidence in the minimal space",
    "A very gentle breeze-like movement making the garment flow slightly",
    "Taking an elegant fashion step letting the outfit move naturally",
    "Moving softly ensuring the item remains perfectly focused",
    "A highly controlled slow-motion walk for a catalog shot",
    "An elegant turn of the body capturing the fabric beautifully",
    "Approaching the camera with a sophisticated model walk",
    "A delicate movement adjusting the posture like a professional model",
    "Looking incredible while performing a slight fashion turn",
    "Walking elegantly with a clean white studio background",
    "A subtle fluid step forward reflecting true editorial style",
    "Moving with absolute grace maximizing the visual impact of the clothes",
    "Taking a refined confident step towards optimal studio lighting",
    "A highly dynamic but controlled movement perfect for a magazine",
    "A beautiful gentle shift of weight from one leg to the other",
    "Moving slightly to catch the perfect studio shadow",
    "Walking smoothly across the seamless studio floor",
    "An elegant controlled fashion pace avoiding stiffness",
    "Moving naturally to present the garments in beautiful action",
    "The perfect minimal movement capturing elite editorial vibes",

    // BLOCCO 3: Soft Interactions & Hands (25 scene)
    "Posing elegantly while gently adjusting a sleeve or collar",
    "Resting one hand smoothly near the waist in a classic fashion pose",
    "Touching the garment lightly to showcase its premium texture",
    "Holding hands effortlessly straight down looking highly chic",
    "A controlled pose with one hand slightly inside a pocket",
    "Posing beautifully with arms crossed softly in a relaxed manner",
    "Adjusting the outfit with an extremely natural graceful movement",
    "Brushing fingers softly against the side of the garment",
    "A minimal elegant pose resting hands naturally in front",
    "Holding an incredibly sophisticated posture with relaxed arms",
    "A high-end editorial pose fixing the collar perfectly",
    "Resting hands lightly on the hips for a confident magazine look",
    "Posing with delicate hand positioning to accentuate the clothing",
    "A perfectly controlled subtle interaction with the fabric",
    "Slightly grabbing the edge of the outfit to show its cut",
    "A deeply elegant shot with hands folded beautifully",
    "A beautiful portrait focus with hands resting calmly by the sides",
    "Presenting the outfit by softly adjusting the shoulder line",
    "A minimal fashion stance focusing heavily on perfect hand placement",
    "Gently smoothing out a crease in an editorial-style movement",
    "A highly professional model pose working with the garment pockets",
    "Looking incredible while slightly touching the front of the attire",
    "A flawless studio pose demonstrating perfect physical control",
    "Posing like a professional with elegant calm gestures",
    "The ultimate high-fashion posture using minimal hand movement",

    // BLOCCO 4: Gaze, Attitude & Editorial Calm (25 scene)
    "Looking directly into the lens with absolute editorial confidence",
    "Looking softly off-camera in a beautiful minimal profile shot",
    "A powerful striking gaze typical of premium luxury campaigns",
    "Looking down slightly with incredible sophisticated calm",
    "A beautiful subtle smile in a strictly professional studio setting",
    "Gazing confidently with a highly relaxed facial expression",
    "An intense but elegant look perfectly matched with the high-end outfit",
    "Looking away thoughtfully emphasizing the garment structure",
    "A highly modern catalog gaze lacking any forced emotion",
    "Looking incredibly sharp and sophisticated under studio light",
    "A completely clean and serene look facing the camera",
    "Looking over the shoulder with extreme fashion elegance",
    "An effortless minimal expression conveying true luxury",
    "A perfectly composed facial attitude complementing the design",
    "Looking beautifully pensive against a neutral backdrop",
    "Exuding absolute calm and confidence like a top editorial star",
    "A subtle chin-up pose looking incredibly fierce and elegant",
    "A perfectly lit profile gaze showing the best outfit details",
    "Looking totally relaxed maintaining a premium fashion aura",
    "An aspirational high-fashion look with clear editorial vibes",
    "Looking softly into the distance with pure minimalist style",
    "A gentle warm editorial gaze that remains highly professional",
    "Looking deeply confident surrounded by perfect negative space",
    "A clean bright fashion expression under perfect exposure",
    "The ultimate magazine cover gaze ensuring maximum garment focus"
];

export async function GET() {
    const blocks100 = azioni100.map(action => buildBlockPrompt(cerScene, cerSubject, action, cerStyle, cerMood, cerDetails));
    
    const store = await (prisma as any).store.findFirst();

    const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: "Rivista" } });
    if (existing) {
         await (prisma as any).promptTemplate.update({
             where: { id: existing.id },
             data: { scenes: JSON.stringify(blocks100) }
         });
    } else {
         await (prisma as any).promptTemplate.create({
             data: {
                 name: "Rivista",
                 category: "magazine",
                 base_prompt: "Create a photo.",
                 rules: "No text.",
                 store_id: store?.id,
                 scenes: JSON.stringify(blocks100)
             }
         });
    }

    return NextResponse.json({ ok: true, count: blocks100.length, category: "Rivista" });
}
