import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEGATIVE_PROMPT = "(text:1.8), (watermark:1.8), typography, words, letters, signature, logo, (plastic skin:1.5), (CGI:1.5), (fake lighting:1.5), (unnatural symmetry:1.4), glossy face, heavily airbrushed, cartoon, 3d render, low resolution, bad anatomy, bad hands, deformed limbs, artificial lighting";

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

async function main() {
    console.log("🔥 INIZIO AGGIORNAMENTO: Aggiunta Product Clean (Unisex) 🔥");

    // 1. Find the "Calzature" category
    const shoesCat = await prisma.category.findFirst({
        where: { slug: 'cat-shoes' }
    });

    if (!shoesCat) {
        throw new Error("Categoria Calzature non trovata!");
    }

    // 2. Create "Unisex / Product" Business Mode
    console.log("🌱 Creazione Business Mode: Unisex (Product Focus)...");
    const unisexMode = await prisma.businessMode.create({
        data: {
            name: "Unisex (Product Focus)",
            slug: "shoes-unisex",
            sort_order: 30,
            category_id: shoesCat.id,
            is_active: true
        }
    });

    // 3. Create "Product Clean" Subcategory
    console.log("🌱 Creazione Sottocategoria: Product Clean...");
    await prisma.subcategory.create({
        data: {
            name: "Product Clean",
            slug: "sh-uni-clean",
            base_prompt_prefix: PHOTO_STUDIO + "Focus entirely on the FOOTWEAR. The image shows the provided shoe isolated in a clean, high-end studio setting. Neutral minimalist background, perfect crisp lighting. NO human elements, NO legs, NO people. Just the product displayed beautifully like a premium e-commerce shot.",
            negative_prompt: NEGATIVE_PROMPT,
            sort_order: 10,
            is_active: true,
            max_images_allowed: 10,
            style_type: "editorial",
            output_goal: "ecommerce",
            business_mode_id: unisexMode.id,
            business_context: "shoes-unisex",
            variations: {
                create: [
                    v("sh-cln-side", "Lateral Profile", "Shot straight from the side, showing the exact lateral profile of the shoe on a clean surface.", 10),
                    v("sh-cln-45", "45 Degree Angle", "Classic e-commerce 45-degree angle shot, showing the toe box and the side.", 20),
                    v("sh-cln-pair", "Pair Together", "Both the left and right shoe placed elegantly next to each other.", 30),
                    v("sh-cln-top", "Top-Down View", "Looking straight down at the shoe to show the toe box and laces/design.", 40),
                    v("sh-cln-back", "Heel Detail", "Shot from the back, showing the heel tab and rear construction.", 50)
                ]
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
