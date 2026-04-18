import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEGATIVE_PROMPT = "(text:1.8), (watermark:1.8), typography, words, letters, signature, logo, (plastic skin:1.5), (CGI:1.5), (fake lighting:1.5), (unnatural symmetry:1.4), glossy face, heavily airbrushed, cartoon, 3d render, low resolution, bad anatomy, bad hands, deformed limbs, artificial lighting";

const PHOTO_LIFESTYLE = "Shot on 35mm film, Leica M11. Masterpiece, photorealistic, cinematic lighting, natural sunlight, candid, highly detailed, realistic skin texture. ";
const PHOTO_STUDIO = "Shot on Hasselblad H6D-100c, 85mm f/1.4 lens. Masterpiece, photorealistic, incredibly detailed, studio lighting, softbox, professional fashion editorial. ";

function v(code: string, name: string, prompt: string, order: number) {
    return {
        variation_name: name,
        variation_code: code,
        variation_prompt: prompt,
        sort_order: order,
        is_active: true
    };
}

const NEW_FOOTWEAR_TAXONOMY = {
    name: "Calzature (Footwear)", slug: "cat-shoes", sort_order: 60,
    business_modes: [
        {
            name: "Uomo (Men's Shoes)", slug: "shoes-men", sort_order: 10,
            subcategories: [
                {
                    name: "Sneakers Uomo (Street)", slug: "sh-m-snk",
                    base_prompt: PHOTO_LIFESTYLE + "Focus entirely on the FOOTWEAR. The image shows the provided shoes worn on the feet of a man. Urban streetwear setting, asphalt or concrete ground. He is wearing men's straight-leg denim or stylish men's cargo pants. The rest of the body is mostly out of frame or blurred.",
                    variations: [
                        v("m-snk-side", "Side Profile", "Shot from the side at ground level, showing the lateral profile of the shoe. Crisp details on the sole and materials.", 10),
                        v("m-snk-top", "Top-Down View", "Looking down at the shoes from the wearer's perspective. Showing the toe box, laces, and the hem of the men's pants.", 20),
                        v("m-snk-walk", "Mid-Stride Action", "Captured mid-step, lifting the heel, conveying movement and comfort.", 30),
                        v("m-snk-front", "Frontal Stance", "Standing straight, facing the camera at a low angle. Showing the toe box and width of the shoe.", 40),
                        v("m-snk-sit", "Casual Sitting", "Sitting down, legs crossed or stretched out, showing the shoes in a relaxed, lifestyle context.", 50)
                    ]
                },
                {
                    name: "Eleganti Uomo (Luxury)", slug: "sh-m-lux",
                    base_prompt: PHOTO_STUDIO + "Focus entirely on the LUXURY MEN'S FOOTWEAR. The image shows the provided elegant shoes worn on the feet of a gentleman. High-end setting, polished marble floor or dark wood. He is wearing tailored men's suit trousers with a perfect break. Extremely crisp textures.",
                    variations: [
                        v("m-lux-side", "Classic Side Profile", "Shot from the side, showing the elegant silhouette of the men's shoe and the trouser break.", 10),
                        v("m-lux-top", "Executive Top-Down", "Looking down from the wearer's perspective, showing the sharp toe and fine leather texture.", 20),
                        v("m-lux-cross", "Crossed Ankles", "Sitting elegantly, ankles crossed, showing both shoes in a sophisticated manner.", 30),
                        v("m-lux-front", "Frontal Stance", "Standing straight, facing the camera at a low angle, conveying authority and style.", 40),
                        v("m-lux-close", "Macro Detail", "Extreme close-up on the shoe's stitching, leather grain, or buckle.", 50)
                    ]
                }
            ]
        },
        {
            name: "Donna (Women's Shoes)", slug: "shoes-women", sort_order: 20,
            subcategories: [
                {
                    name: "Sneakers Donna (Street)", slug: "sh-w-snk",
                    base_prompt: PHOTO_LIFESTYLE + "Focus entirely on the FOOTWEAR. The image shows the provided shoes worn on the feet of a woman. Urban streetwear or clean aesthetic setting. She is wearing women's skinny jeans, leggings, or a casual skirt. The rest of the body is mostly out of frame or blurred.",
                    variations: [
                        v("w-snk-side", "Side Profile", "Shot from the side at ground level, showing the lateral profile of the shoe and the feminine ankle.", 10),
                        v("w-snk-top", "Top-Down View", "Looking down at the shoes from the wearer's perspective. Showing the toe box, laces, and feminine styling.", 20),
                        v("w-snk-walk", "Mid-Stride Action", "Captured mid-step, lifting the heel, conveying graceful movement.", 30),
                        v("w-snk-front", "Frontal Stance", "Standing straight, facing the camera at a low angle, showing the shoes together.", 40),
                        v("w-snk-pose", "Fashion Pose", "One foot forward, pointing slightly, typical Instagram influencer footwear pose.", 50)
                    ]
                },
                {
                    name: "Tacchi/Eleganti Donna", slug: "sh-w-lux",
                    base_prompt: PHOTO_STUDIO + "Focus entirely on the LUXURY WOMEN'S FOOTWEAR. The image shows the provided elegant shoes (heels, flats, or sandals) worn on the feet of a woman. High-end setting, polished marble or soft carpet. Showing feminine legs, perhaps the hem of a beautiful dress. Extremely crisp textures.",
                    variations: [
                        v("w-lux-side", "Elegant Side Profile", "Shot from the side, highlighting the arch, the heel, and the silhouette of the shoe.", 10),
                        v("w-lux-cross", "Crossed Ankles", "Sitting elegantly with ankles crossed, showcasing the front design of the shoes.", 20),
                        v("w-lux-walk", "Confident Stride", "Captured mid-step in a confident, runway-style walk. Focus on the shoes in motion.", 30),
                        v("w-lux-front", "Frontal Stance", "Standing straight with feet slightly apart or in a subtle V-shape, facing the camera.", 40),
                        v("w-lux-close", "Macro Detail", "Extreme close-up on the shoe's texture, straps, embellishments, or heel.", 50)
                    ]
                }
            ]
        }
    ]
};

async function main() {
    console.log("🔥 INIZIO AGGIORNAMENTO TASSONOMIA CALZATURE 🔥");

    // 1. Find and delete existing "Calzature" category
    const existingCat = await prisma.category.findFirst({
        where: { slug: 'cat-shoes' }
    });

    if (existingCat) {
        console.log(`🧨 Eliminazione vecchia categoria Calzature (ID: ${existingCat.id})...`);
        await prisma.category.delete({
            where: { id: existingCat.id }
        });
        console.log("✅ Vecchia categoria eliminata.");
    }

    // 2. Insert new "Calzature" category
    console.log("🌱 Creazione nuova architettura Calzature Uomo/Donna...");
    
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!adminUser) throw new Error("No admin user found");

    await prisma.category.create({
        data: {
            name: NEW_FOOTWEAR_TAXONOMY.name,
            slug: NEW_FOOTWEAR_TAXONOMY.slug,
            sort_order: NEW_FOOTWEAR_TAXONOMY.sort_order,
            is_active: true,
            user_id: adminUser.id,
            business_modes: {
                create: NEW_FOOTWEAR_TAXONOMY.business_modes.map(bm => ({
                    name: bm.name,
                    slug: bm.slug,
                    sort_order: bm.sort_order,
                    is_active: true,
                    subcategories: {
                        create: bm.subcategories.map((sub, idx) => ({
                            name: sub.name,
                            slug: sub.slug,
                            base_prompt_prefix: sub.base_prompt,
                            negative_prompt: NEGATIVE_PROMPT,
                            sort_order: (idx + 1) * 10,
                            is_active: true,
                            max_images_allowed: 10,
                            style_type: "editorial",
                            output_goal: "ecommerce",
                            business_context: bm.slug,
                            variations: {
                                create: sub.variations
                            }
                        }))
                    }
                }))
            }
        }
    });

    console.log("🚀 AGGIORNAMENTO COMPLETATO CON SUCCESSO! 🚀");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
