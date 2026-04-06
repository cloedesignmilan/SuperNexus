import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Rinomina "Sposi" in "Sposo"
        const vecchiSposi = await (prisma as any).category.findFirst({
            where: { name: { contains: 'Sposi', mode: 'insensitive' } }
        });

        if (vecchiSposi && vecchiSposi.name === 'Sposi') {
            await (prisma as any).category.update({
                where: { id: vecchiSposi.id },
                data: { name: 'Sposo' }
            });
        }

        // 2. Crea Categoria "Sposa"
        const catName = "Sposa";
        const sposaExists = await (prisma as any).category.findFirst({
            where: { name: catName }
        });

        if (sposaExists) {
            return NextResponse.json({ message: "La categoria Sposa esiste già!" });
        }

        const category = await (prisma as any).category.create({
            data: {
                name: catName,
                description: "Dedicato esclusivamente alla Sposa e al suo Abito. Nessuna interferenza maschile.",
                age_range: "22-35",
                is_active: true,
                sort_order: 1 // La mettiamo in alto per importanza
            }
        });

        // 3. Crea Prompt Master
        await (prisma as any).promptMaster.create({
            data: {
                category_id: category.id,
                title: "Bride Exclusive Master",
                prompt_text: "You are the world's most acclaimed bridal fashion photographer shooting a high fashion editorial. The subject is a stunningly beautiful bride. CRITICAL: The image MUST feature ONE FEMALE BRIDE ONLY. Completely isolate the bride. Do NOT generate a groom. Do NOT generate any male figures. Do NOT divide the frame. Focus entirely on the flawless lighting, the majestic draping of the bridal grown, the delicate lace, and the ethereal glow of the bride.",
                negative_rules: "No groom, no men, no couples, no split screen, no two people, no wedding rings on men, no masculine suits, no messy backgrounds, out of focus, bad proportions, bad hands.",
                studio_prompts: "Full body shot of the bride against a pure white studio backdrop, glowing softbox lighting.\nMedium close-up of the bride's torso and upper dress on a neutral warm beige background."
            }
        });

        // 4. Crea Scene Tematiche
        const scenes = [
            {
                title: "Navata della Chiesa",
                scene_text: "The bride is walking down a grand, majestic church aisle illuminated by golden sunlight streaming through stained glass. Rose petals on the floor. Stunning bridal aura.",
            },
            {
                title: "Parco della Villa Storica",
                scene_text: "The bride standing elegantly in the lush green gardens of an 18th-century Italian villa. Golden hour lighting casting a warm, romantic glow over the bridal dress.",
            },
            {
                title: "Preparativi allo Specchio",
                scene_text: "Intimate and luxurious bridal suite. The bride looking out of a large arched window or gently touching a vintage mirror. Soft, diffuse morning light wrapping the white dress.",
            },
            {
                title: "Bouquet e Veli",
                scene_text: "Artistic shot. The bride is holding a magnificent floral bouquet. A dramatic, long sheer veil is catching the wind, creating a breathtaking, dynamic fashion portrait.",
            },
            {
                title: "Taglio della Torta (Solo Lei)",
                scene_text: "The radiant bride standing alone next to a towering, luxurious 5-tier white wedding cake decorated with fresh flowers. Elegant evening reception ambiance, shimmering bokeh fairy lights in the background.",
            },
            {
                title: "Fuga nel Borgo Antico",
                scene_text: "The bride walking joyfully down a charming, narrow cobblestone alleyway in an historic Italian town (like Amalfi or Florence). Bright mediterranean sunlight reflecting off vintage stone walls.",
            }
        ];

        for (let i = 0; i < scenes.length; i++) {
            await (prisma as any).scene.create({
                data: {
                    category_id: category.id,
                    title: scenes[i].title,
                    scene_text: scenes[i].scene_text,
                    sort_order: i,
                    is_active: true
                }
            });
        }

        return NextResponse.json({ success: true, message: "Categoria 'Sposa' isolata con successo! 'Sposi' è stata rinominata in 'Sposo'." });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
