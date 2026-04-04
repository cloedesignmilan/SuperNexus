import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const var1 = "standing full body, establishing shot capturing the surrounding modern architecture and atmosphere";
const var2 = "medium shot from the waist up, casual elegant posture, interacting naturally with the environment";
const var3 = "dynamic candid shot, focusing on movement and supreme confidence, cinematic blurred background";

function expand(situations: string[], categoryStyle: string) {
    const scenes: string[] = [];
    situations.forEach(sit => {
        scenes.push(`Cinematic candid magazine photography, ultra-realistic everyday life but luxury fashion editorial style. ${sit}. ${var1}. Shot on 35mm lens, ${categoryStyle}, 8k resolution, natural cinematic lighting.`);
        scenes.push(`Cinematic candid magazine photography, ultra-realistic everyday life but luxury fashion editorial style. ${sit}. ${var2}. Shot on 50mm lens, ${categoryStyle}, highly detailed face, natural cinematic lighting.`);
        scenes.push(`Cinematic candid magazine photography, ultra-realistic everyday life but luxury fashion editorial style. ${sit}. ${var3}. Shot on 85mm lens, ${categoryStyle}, deep depth of field, dramatic fashion lighting.`);
    });
    return scenes;
}

const cat7 = [ // Business & tempo libero
    "walking briskly out of a sleek glass skyscraper corporate building",
    "standing at a standing desk in a modern open-plan creative agency office",
    "sitting comfortably in a high-end airport lounge waiting for a first-class flight",
    "leaning against a highly polished luxury boardroom table",
    "walking across a sunlit modern European city plaza during lunch break",
    "sitting in an upscale artisan café reading a business newspaper",
    "confidently presenting in front of an interactive smart-screen in a luxury conference room",
    "stepping out of a premium ride-share hybrid car in the financial district",
    "relaxing on a modern leather sofa in a private member's club",
    "walking through an airport terminal pulling a sleek aluminum carry-on suitcase",
    "checking a luxury smartwatch while waiting curbside for a taxi",
    "casually browsing an elite boutique bookstore during weekend free time",
    "sitting on an outdoor terrace of a country club sipping sparkling water",
    "standing by the giant window of a corner office overlooking the city",
    "walking across an indoor botanical garden atrium wearing smart-casual apparel",
    "typing on an ultra-slim premium laptop at an oak wood cafe table",
    "walking through a bustling high-tech expo center hall",
    "standing inside a modern elevator with glass walls moving upwards",
    "strolling casually along an elegant riverside promenade at sunset",
    "sitting by a sleek fireplace in an ultra-modern hotel lobby",
    "casually admiring a painting in a quiet contemporary art museum",
    "walking briskly holding a minimalist leather briefcase",
    "standing outside a luxury high-rise apartment building entrance",
    "sitting at a high table in an exclusive rooftop restaurant at mid-day",
    "walking past a row of parked sleek executive cars",
    "talking confidently while standing next to a minimalist architectural sculpture",
    "waiting in line at a high-end specialty coffee roaster",
    "leaning over a clean architectural blueprint on a drafting table",
    "holding a minimalist umbrella while walking down a chic cobblestone street in light rain",
    "sitting in the back of an executive black car looking thoughtfully out the window",
    "walking across a perfectly manicured corporate campus lawn",
    "standing in front of an upscale minimalist boutique window display",
    "taking a casual stroll through a high-end outdoor luxury shopping village",
    "relaxing on an elegant wooden park bench checking a smartphone"
];

export async function GET() {
    const updates = [
        { old: "Eleganza Adulti (Gala)", new: "Cerimonia e festa" },
        { old: "Sposa e Sposo", new: "Sposi" },
        { old: "Festa 18 Anni (Teen)", new: "Festa 18°" },
        { old: "Sportivo (Fitness)", new: "Sport" },
        { old: "Kids & Ragazzi", new: "Bambini" },
        { old: "Streetwear Urbano", new: "Streetwear" }
    ];
    
    for (const u of updates) {
       const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: u.old } });
       if (existing) {
           await (prisma as any).promptTemplate.update({
               where: { id: existing.id },
               data: { name: u.new }
           });
       }
    }
    
    const bExisting = await (prisma as any).promptTemplate.findFirst({ where: { name: "Business & tempo libero" } });
    if (!bExisting) {
        await (prisma as any).promptTemplate.create({
            data: {
                name: "Business & tempo libero",
                base_prompt: "Smart casual, professional, elegant free time, modern luxury",
                scenes: JSON.stringify(expand(cat7, "modern professional and smart casual aesthetics")),
                is_active: true
            }
        });
    }
    
    return NextResponse.json({ ok: true });
}
