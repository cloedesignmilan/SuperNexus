import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    console.log("Seeding missing Everyday Apparel prompt configs...");

    const shotsToCreate = [];

    // ==========================================
    // 1. CLEAN CATALOG -> NO MODEL
    // ==========================================
    const cleanCatalogNoModel = [
        {
            shotNumber: 1,
            shotName: 'Perfect Flat Lay (Hero)',
            positivePrompt: 'Ultra-crisp flat lay of the {product} on a pure white studio surface. Perfect symmetry, zero wrinkles, flawless alignment. High-end e-commerce product photography, soft diffused studio lighting, 8k resolution, razor-sharp focus on edges.',
            negativePrompt: 'human, hands, mannequins, hangers, wrinkles, messy folds, shadow cast, floating, devices, messy background, props',
            hardRules: 'NO HUMAN MODEL. FLAT LAY ONLY. PERFECT SYMMETRY.',
            outputGoal: 'Clean Catalog - Flat Lay'
        },
        {
            shotNumber: 2,
            shotName: 'Ghost Mannequin (Front)',
            positivePrompt: 'Ghost mannequin photography of the {product}. The {product} is perfectly shaped as if worn by an invisible body. Pure white background, high-end e-commerce lighting, perfect volume and form preservation, razor-sharp texture details.',
            negativePrompt: 'human, face, hands, flat, folded, messy background, props, dark background, hanger, string',
            hardRules: 'NO HUMAN MODEL. GHOST MANNEQUIN ONLY. PURE WHITE BACKGROUND.',
            outputGoal: 'Clean Catalog - Ghost Mannequin'
        },
        {
            shotNumber: 3,
            shotName: 'Premium Hanger Display',
            positivePrompt: 'The {product} hanging elegantly on a premium minimalist wooden hanger. Pure white seamless studio background. Soft directional lighting highlighting the fabric drape and natural fall. High-end boutique e-commerce style, hyper-realistic.',
            negativePrompt: 'human, face, hands, messy background, multiple hangers, cluttered, flat lay, wrinkles, shadow cast',
            hardRules: 'NO HUMAN MODEL. SINGLE HANGER ONLY. PURE WHITE BACKGROUND.',
            outputGoal: 'Clean Catalog - Hanger'
        },
        {
            shotNumber: 4,
            shotName: 'Ghost Mannequin (3/4 Angle)',
            positivePrompt: 'Ghost mannequin photography of the {product}, shown from a slight 3/4 angle to show depth and side profile. Pure white background, high-end e-commerce lighting, perfect volume preservation, ultra-sharp focus.',
            negativePrompt: 'human, face, hands, flat lay, folded, hanger, messy background, flat lighting',
            hardRules: 'NO HUMAN MODEL. GHOST MANNEQUIN 3/4 ANGLE. PURE WHITE BACKGROUND.',
            outputGoal: 'Clean Catalog - Ghost 3/4'
        },
        {
            shotNumber: 5,
            shotName: 'Folded Minimalist Detail',
            positivePrompt: 'The {product} perfectly and symmetrically folded into a neat square, resting on a pure white studio surface. Focus on the collar or main logo area. Crisp folding lines, ultra-premium boutique presentation, macro lens, soft shadows.',
            negativePrompt: 'human, hands, mannequin, hanger, hanging, full body, messy folds, crumpled, messy background',
            hardRules: 'NO HUMAN MODEL. FOLDED PRESENTATION ONLY. PERFECT SYMMETRY.',
            outputGoal: 'Clean Catalog - Folded'
        }
    ];

    cleanCatalogNoModel.forEach(s => shotsToCreate.push({
        category: 'everyday', mode: 'clean-catalog', presentation: 'no-model', scene: 'all', ...s
    }));

    // ==========================================
    // 2. ADS / SCROLL STOPPER -> NO MODEL
    // ==========================================
    const adsNoModel = [
        {
            shotNumber: 1,
            shotName: 'Zero Gravity Float',
            positivePrompt: 'Dynamic scroll-stopping commercial ad. The {product} floating in mid-air in a zero-gravity environment. Surrounding elements like subtle geometric shapes or premium color-matched blocks floating alongside. Cinematic lighting, dramatic shadows, 8k commercial photography.',
            negativePrompt: 'human, model, hands, hanger, flat lay, boring background, standard e-commerce, low contrast',
            hardRules: 'NO HUMAN MODEL. DYNAMIC FLOATING COMPOSITION. HIGH IMPACT.',
            outputGoal: 'Ads - Floating Impact'
        },
        {
            shotNumber: 2,
            shotName: 'Monochromatic Studio Podium',
            positivePrompt: 'The {product} presented like a luxury artifact on a sleek, minimalist monochromatic podium. Tone-on-tone background perfectly matching the garment color. Hard dramatic directional sunlight, sharp shadows, high-end Vogue magazine editorial style, still life mastery.',
            negativePrompt: 'human, hands, mannequin, hanger, messy background, white background, boring lighting, clutter',
            hardRules: 'NO HUMAN MODEL. PODIUM STILL LIFE. DRAMATIC DIRECTIONAL LIGHTING.',
            outputGoal: 'Ads - Luxury Podium'
        },
        {
            shotNumber: 3,
            shotName: 'Dynamic Wind Drape',
            positivePrompt: 'The {product} dramatically caught in a gust of wind, fabric flowing dynamically in the air against a vibrant gradient studio backdrop. High-speed photography, freeze-frame action, scroll-stopping energy, hyper-detailed fabric ripples.',
            negativePrompt: 'human, body, mannequin, hanger, flat lay, static, boring, low resolution',
            hardRules: 'NO HUMAN MODEL. FABRIC IN MOTION. HIGH IMPACT ADVERTISEMENT.',
            outputGoal: 'Ads - Wind Dynamics'
        },
        {
            shotNumber: 4,
            shotName: 'Surreal Reflection',
            positivePrompt: 'The {product} resting perfectly folded on a highly reflective black glass or water surface. Dramatic neon or rim lighting outlining the silhouette. Futuristic, premium streetwear advertising style. Razor sharp focus on the reflection and fabric texture.',
            negativePrompt: 'human, mannequin, hanger, white background, flat lighting, soft lighting, clutter, text',
            hardRules: 'NO HUMAN MODEL. REFLECTIVE SURFACE. DRAMATIC NEON/RIM LIGHTING.',
            outputGoal: 'Ads - Reflection'
        },
        {
            shotNumber: 5,
            shotName: 'Deconstructed Art Piece',
            positivePrompt: 'The {product} arranged artistically like a modern art installation on the floor. Bold, contrasting background colors. Abstract, high-fashion editorial still life photography. Scroll-stopping visual composition, striking colors.',
            negativePrompt: 'human, model, mannequin, standard fold, traditional, boring, white background',
            hardRules: 'NO HUMAN MODEL. ABSTRACT ARTISTIC ARRANGEMENT. EDITORIAL.',
            outputGoal: 'Ads - Artistic Arrangement'
        }
    ];

    adsNoModel.forEach(s => shotsToCreate.push({
        category: 'everyday', mode: 'ads', presentation: 'no-model', scene: 'all', ...s
    }));

    // ==========================================
    // 3. DETAIL / TEXTURE -> NO MODEL
    // ==========================================
    const detailNoModel = [
        {
            shotNumber: 1,
            shotName: 'Macro Fabric Weave',
            positivePrompt: 'Extreme macro photography of the {product} fabric. Focus purely on the textile weave, threads, and material texture. Razor-sharp 100mm macro lens, beautiful soft bokeh in the background. Emphasizing premium quality and craftsmanship.',
            negativePrompt: 'human, full garment, shape, mannequin, wide angle, flat lighting, blurry',
            hardRules: 'NO HUMAN MODEL. EXTREME MACRO FOCUS ON FABRIC TEXTURE.',
            outputGoal: 'Detail - Macro Weave'
        },
        {
            shotNumber: 2,
            shotName: 'Collar & Tag Focus',
            positivePrompt: 'Close-up shot of the {product} focusing on the collar, stitching, and inner neck area. Beautifully folded to highlight the craftsmanship. Premium studio lighting highlighting the depth of the stitches, high-end editorial product photography.',
            negativePrompt: 'human, wide angle, full body, messy background, low resolution, blown out highlights',
            hardRules: 'NO HUMAN MODEL. CLOSE-UP ON COLLAR/STITCHING.',
            outputGoal: 'Detail - Stitching'
        },
        {
            shotNumber: 3,
            shotName: 'Shadow & Fold Drape',
            positivePrompt: 'Close-up abstract shot of the {product} fabric draped elegantly, creating deep cinematic shadows and bright highlights. Focus on the volume and weight of the material. Artistic chiaroscuro lighting, luxurious feel, ultra-high resolution.',
            negativePrompt: 'human, flat lay, full garment, hanger, mannequin, bright flat lighting',
            hardRules: 'NO HUMAN MODEL. DRAMATIC DRAPE SHADOWS.',
            outputGoal: 'Detail - Abstract Drape'
        },
        {
            shotNumber: 4,
            shotName: 'Hemline Details',
            positivePrompt: 'Macro shot focusing on the lower hemline or cuff details of the {product}. Showing the finishing quality of the garment. Clean minimalist background, razor-sharp focus on the thread lines. High-end e-commerce detail shot.',
            negativePrompt: 'human, full garment, wide angle, clutter, messy background',
            hardRules: 'NO HUMAN MODEL. CLOSE-UP ON HEMLINE/CUFF.',
            outputGoal: 'Detail - Hemline'
        },
        {
            shotNumber: 5,
            shotName: 'Logo / Print Macro',
            positivePrompt: 'Extreme close-up on any logo, print, or defining graphic feature of the {product}. If solid color, focus on the richest part of the fabric dye. Sharp, punchy contrast, commercial macro photography, flawless lighting.',
            negativePrompt: 'human, wide angle, full body, low resolution, blurry text',
            hardRules: 'NO HUMAN MODEL. CLOSE-UP ON PRINT/COLOR/LOGO.',
            outputGoal: 'Detail - Print/Graphic'
        }
    ];

    detailNoModel.forEach(s => shotsToCreate.push({
        category: 'everyday', mode: 'detail', presentation: 'no-model', scene: 'all', ...s
    }));

    // ==========================================
    // 4 & 5. UGC HOME / STORE -> CANDID WOMAN/MAN
    // ==========================================
    const genders = ['woman', 'man'];
    
    genders.forEach(g => {
        const noun = g === 'man' ? 'man' : 'woman';
        const adj = g === 'man' ? 'handsome male' : 'beautiful female';

        const ugcHome = [
            {
                shotNumber: 1,
                shotName: 'Mirror Selfie Bedroom',
                positivePrompt: `UGC mirror selfie style. A realistic, relatable ${adj} wearing the {product} taking a mirror selfie in a cozy, aesthetically pleasing modern bedroom. Authentic, unpolished framing, slight motion blur, natural room lighting. Girl/Boy-next-door vibe, natural beauty.`,
                negativePrompt: 'studio, perfect lighting, modeling, professional camera, awkward hands, heavy makeup, fake CGI, fashion editorial',
                hardRules: `UGC MIRROR SELFIE. HOME ENVIRONMENT. NATURAL ${g.toUpperCase()}.`,
                outputGoal: 'UGC Home - Mirror Selfie'
            },
            {
                shotNumber: 2,
                shotName: 'Relaxing on Couch',
                positivePrompt: `UGC candid photo of a ${adj} wearing the {product} relaxing on a stylish living room couch. Authentic pose, checking phone or holding a mug. Cozy, warm natural window light. Relatable everyday lifestyle, highly authentic.`,
                negativePrompt: 'studio, perfect lighting, rigid pose, modeling, standing straight, fashion editorial, heavy makeup',
                hardRules: `UGC CANDID. COUCH/LIVING ROOM. RELAXED POSE. NATURAL ${g.toUpperCase()}.`,
                outputGoal: 'UGC Home - Couch'
            },
            {
                shotNumber: 3,
                shotName: 'Morning Kitchen Coffee',
                positivePrompt: `UGC lifestyle shot. A realistic ${adj} wearing the {product} standing in a modern kitchen, holding a cup of morning coffee. Bright, authentic daylight streaming through windows. Very natural smile, candid moment captured by a friend.`,
                negativePrompt: 'studio, dark, moody, heavy makeup, professional studio lights, unnatural pose',
                hardRules: `UGC CANDID. KITCHEN ENVIRONMENT. MORNING VIBE. NATURAL ${g.toUpperCase()}.`,
                outputGoal: 'UGC Home - Kitchen'
            },
            {
                shotNumber: 4,
                shotName: 'Fit Check Hallway',
                positivePrompt: `UGC fit check video still. A relatable ${adj} wearing the {product} standing in a hallway or doorway, looking down casually to show off the outfit fit. Authentic lighting, slightly grainy smartphone quality, genuine everyday style.`,
                negativePrompt: 'studio, perfect lighting, modeling, professional, fashion editorial',
                hardRules: `UGC FIT CHECK. HALLWAY. CASUAL POSE. NATURAL ${g.toUpperCase()}.`,
                outputGoal: 'UGC Home - Fit Check'
            },
            {
                shotNumber: 5,
                shotName: 'Window Light Candid',
                positivePrompt: `UGC aesthetic shot. A beautiful natural ${adj} wearing the {product} sitting near a large window in a home, looking outside. Soft, beautiful natural light wrapping around the garment. Authentic, intimate lifestyle moment, very relatable.`,
                negativePrompt: 'studio, heavy makeup, flash photography, artificial lighting, rigid pose',
                hardRules: `UGC CANDID. WINDOW LIGHT. INTIMATE/NATURAL. NATURAL ${g.toUpperCase()}.`,
                outputGoal: 'UGC Home - Window Light'
            }
        ];

        ugcHome.forEach(s => shotsToCreate.push({
            category: 'everyday', mode: 'ugc-home', presentation: `candid-${g}`, scene: 'all', ...s
        }));

        const ugcStore = [
            {
                shotNumber: 1,
                shotName: 'Fitting Room Selfie',
                positivePrompt: `UGC fitting room mirror selfie. A relatable ${adj} wearing the {product} in a clothing store fitting room. Authentic retail lighting, mirror reflection, casual pose checking the fit. Smartphone aesthetic, highly relatable shopping moment.`,
                negativePrompt: 'studio, perfect lighting, modeling, professional camera, outdoor, home environment',
                hardRules: `UGC FITTING ROOM SELFIE. STORE ENVIRONMENT. NATURAL ${g.toUpperCase()}.`,
                outputGoal: 'UGC Store - Fitting Room'
            },
            {
                shotNumber: 2,
                shotName: 'Browsing Clothes Racks',
                positivePrompt: `UGC candid photo of a ${adj} wearing the {product} browsing through clothing racks in a trendy boutique or retail store. Taken from a slightly low or candid angle by a friend. Authentic retail lighting, natural shopping moment.`,
                negativePrompt: 'studio, perfect lighting, looking at camera, rigid pose, home environment',
                hardRules: `UGC CANDID. BROWSING CLOTHES RACKS. STORE ENVIRONMENT. NATURAL ${g.toUpperCase()}.`,
                outputGoal: 'UGC Store - Browsing'
            },
            {
                shotNumber: 3,
                shotName: 'Aisle Fit Check',
                positivePrompt: `UGC style candid. A confident ${adj} wearing the {product} standing in the aisle of a minimalist clothing store. Candid pose, slightly turned, showcasing how the outfit looks in a public space. Real retail ambient light.`,
                negativePrompt: 'studio, heavy makeup, professional studio lights, home environment',
                hardRules: `UGC CANDID. STORE AISLE. NATURAL ${g.toUpperCase()}.`,
                outputGoal: 'UGC Store - Aisle'
            },
            {
                shotNumber: 4,
                shotName: 'Holding Shopping Bags',
                positivePrompt: `UGC lifestyle shot. A happy, natural ${adj} wearing the {product} standing outside or inside a stylish boutique holding premium shopping bags. Authentic, relatable shopping spree vibe, taken by a friend on a smartphone.`,
                negativePrompt: 'studio, perfect lighting, modeling, fashion editorial, sad, dramatic',
                hardRules: `UGC LIFESTYLE. HOLDING SHOPPING BAGS. NATURAL ${g.toUpperCase()}.`,
                outputGoal: 'UGC Store - Shopping Bags'
            },
            {
                shotNumber: 5,
                shotName: 'Checkout Counter Wait',
                positivePrompt: `UGC candid shot. A relatable ${adj} wearing the {product} casually leaning against a modern boutique checkout counter or display table. Relaxed, authentic posture. Bright retail environment, highly realistic everyday style.`,
                negativePrompt: 'studio, heavy makeup, dramatic lighting, rigid pose, home environment',
                hardRules: `UGC CANDID. BOUTIQUE DISPLAY/COUNTER. NATURAL ${g.toUpperCase()}.`,
                outputGoal: 'UGC Store - Boutique Counter'
            }
        ];

        ugcStore.forEach(s => shotsToCreate.push({
            category: 'everyday', mode: 'ugc-store', presentation: `candid-${g}`, scene: 'all', ...s
        }));
    });

    console.log(`Preparing to inject ${shotsToCreate.length} prompt configs...`);

    let createdCount = 0;
    for (const shot of shotsToCreate) {
        // Upsert based on composite uniqueness logic or just check if it exists
        const existing = await prisma.promptConfigShot.findFirst({
            where: {
                category: shot.category,
                mode: shot.mode,
                presentation: shot.presentation,
                shotNumber: shot.shotNumber
            }
        });

        if (!existing) {
            await prisma.promptConfigShot.create({
                data: {
                    ...shot,
                    priority: 0,
                    isActive: true
                }
            });
            createdCount++;
        }
    }

    return NextResponse.json({ ok: true, message: `Successfully created ${createdCount} new Prompt Configs for Everyday Apparel missing subcategories.` });
}
