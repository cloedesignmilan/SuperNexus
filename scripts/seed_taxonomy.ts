import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEGATIVE_PROMPT = "(text:1.8), (watermark:1.8), typography, words, letters, signature, logo, (plastic skin:1.5), (CGI:1.5), (fake lighting:1.5), (unnatural symmetry:1.4), glossy face, heavily airbrushed, cartoon, 3d render, low resolution, bad anatomy, bad hands, deformed limbs, artificial lighting";

const PHOTO_STUDIO = "Shot on Hasselblad H6D-100c, 85mm f/1.4 lens. Masterpiece, photorealistic, incredibly detailed, studio lighting, softbox, professional fashion editorial. ";
const PHOTO_LIFESTYLE = "Shot on 35mm film, Leica M11. Masterpiece, photorealistic, cinematic lighting, natural sunlight, candid, highly detailed, realistic skin texture. ";
const PHOTO_LUXURY = "Shot on medium format camera, 50mm lens. High fashion editorial, Vogue magazine cover style, dramatic and elegant cinematic lighting, incredibly detailed. ";

// Helper per generare variazioni velocemente
function v(code: string, name: string, prompt: string, order: number) {
    return { variation_code: code, variation_name: name, variation_prompt: prompt, sort_order: order, is_active: true };
}

const TAXONOMY = [
    // ==========================================
    // 1. DONNA (WOMEN)
    // ==========================================
    {
        name: "Donna (Women)", slug: "cat-women", sort_order: 10,
        business_modes: [
            {
                name: "Casual & Streetwear", slug: "women-casual", sort_order: 10,
                subcategories: [
                    {
                        name: "Instagram Lifestyle", slug: "w-cas-ig",
                        base_prompt: PHOTO_LIFESTYLE + "The model is a beautiful, natural, extremely realistic young woman (20-30 years old) with realistic skin texture, slight skin imperfections, natural makeup. She is wearing the provided garment.",
                        variations: [
                            v("ig-cafe", "Cafe Sitting", "Sitting at a Parisian cafe table, sipping coffee, relaxed natural pose, soft morning light.", 10),
                            v("ig-walk", "City Walking", "Walking confidently down a sunlit city street, dynamic movement, hair slightly blowing in the wind.", 20),
                            v("ig-park", "Park Stroll", "Standing in a lush green park, golden hour sunlight filtering through trees.", 30),
                            v("ig-wall", "Leaning on Wall", "Leaning casually against a textured brick wall in the city, cool and trendy attitude.", 40),
                            v("ig-laugh", "Candid Laugh", "Looking away from camera, laughing naturally, candid lifestyle moment, shallow depth of field.", 50)
                        ]
                    },
                    {
                        name: "Ecommerce Studio Clean", slug: "w-cas-ecom",
                        base_prompt: PHOTO_STUDIO + "The model is a beautiful, realistic young woman. Perfectly lit studio environment with a clean, neutral grey or white background. Focus entirely on the garment's fit and texture.",
                        variations: [
                            v("ecom-front", "Front View", "Standing straight, facing the camera directly, neutral confident expression, arms relaxed at sides.", 10),
                            v("ecom-side", "3/4 Side View", "Turned slightly to the side in a 3/4 angle, showing the profile fit of the garment.", 20),
                            v("ecom-back", "Back View", "Turned around facing away from the camera, looking over the shoulder, showing the back of the garment.", 30),
                            v("ecom-pocket", "Hand in Pocket", "Casual pose with one hand in the pocket or resting on the hip, relaxed stance.", 40),
                            v("ecom-walk", "Studio Walk", "Simulated walking motion inside the studio, dynamic but clean e-commerce pose.", 50)
                        ]
                    }
                ]
            },
            {
                name: "Elegant & Ceremony", slug: "women-elegant", sort_order: 20,
                subcategories: [
                    {
                        name: "Luxury Villa Shoot", slug: "w-eleg-villa",
                        base_prompt: PHOTO_LUXURY + "The model is an elegant, stunning, highly realistic woman. She is wearing the provided elegant garment. The setting is a breathtaking luxury Italian villa with marble columns, large windows, and classic architecture.",
                        variations: [
                            v("villa-stair", "Grand Staircase", "Posing elegantly on a grand marble staircase, soft natural light from a window.", 10),
                            v("villa-balcony", "Sunset Balcony", "Standing on a classic balcony overlooking a garden at sunset, golden hour lighting.", 20),
                            v("villa-hall", "Chandelier Hall", "Standing in a luxurious hall with crystal chandeliers, dramatic and moody lighting.", 30),
                            v("villa-sit", "Elegant Sitting", "Sitting gracefully on an antique velvet sofa, regal and sophisticated posture.", 40),
                            v("villa-walk", "Flowing Walk", "Walking elegantly, allowing the fabric of the dress to flow beautifully, catching the light.", 50)
                        ]
                    },
                    {
                        name: "Runway Editorial", slug: "w-eleg-runway",
                        base_prompt: PHOTO_STUDIO + "High fashion runway editorial. The model is a tall, striking fashion model with a fierce expression, walking a high-end fashion show runway. Spotlights and dark background.",
                        variations: [
                            v("rw-front", "Runway Front Walk", "Walking directly towards the camera, fierce runway stare, dynamic stride.", 10),
                            v("rw-pose", "End of Runway Pose", "Posed at the end of the runway, hand on hip, dramatic spotlight on the garment.", 20),
                            v("rw-side", "Runway Profile", "Walking past the camera, sharp profile shot capturing the movement of the outfit.", 30),
                            v("rw-back", "Runway Back", "Walking away down the runway, showing the back details of the elegant garment.", 40),
                            v("rw-close", "Runway Half Body", "Closer shot from the waist up on the runway, focusing on the upper details and model's intense gaze.", 50)
                        ]
                    }
                ]
            },
            {
                name: "Over 50 Elegance", slug: "women-over50", sort_order: 30,
                subcategories: [
                    {
                        name: "Mature Sophistication", slug: "w-o50-soph",
                        base_prompt: PHOTO_LIFESTYLE + "The model is a stunning, sophisticated, highly realistic MATURE WOMAN (55-65 years old). She has natural signs of aging, beautiful silver or styled hair, and a deeply elegant aura. Absolutely NO fake plastic skin. Celebrate natural mature beauty.",
                        variations: [
                            v("o50-city", "City Chic", "Walking confidently in an upscale city district, holding a designer bag, chic and timeless.", 10),
                            v("o50-cafe", "Morning Coffee", "Reading a magazine at a high-end cafe, sophisticated and relaxed.", 20),
                            v("o50-studio", "Studio Portrait", "Clean studio portrait, soft flattering light, warm and wise smile.", 30),
                            v("o50-gallery", "Art Gallery", "Admiring art in a modern gallery, cultured and refined aesthetic.", 40),
                            v("o50-garden", "Villa Garden", "Standing in a manicured botanical garden, peaceful and elegant.", 50)
                        ]
                    }
                ]
            },
            {
                name: "Activewear & Sport", slug: "women-sport", sort_order: 40,
                subcategories: [
                    {
                        name: "Gym & Fitness", slug: "w-sport-gym",
                        base_prompt: PHOTO_STUDIO + "The model is a fit, athletic, highly realistic woman. Modern, high-end gym environment with dramatic, contrasty lighting emphasizing muscle tone and the fit of the activewear.",
                        variations: [
                            v("gym-stretch", "Stretching", "Doing a dynamic stretching pose, showing the flexibility of the garment.", 10),
                            v("gym-weights", "Dumbbell Pose", "Holding dumbbells, athletic stance, intense focus.", 20),
                            v("gym-water", "Resting Drink", "Resting on a bench, drinking water, sweaty and realistic post-workout glow.", 30),
                            v("gym-run", "Treadmill Action", "Running motion, high energy, dynamic blur on the background.", 40),
                            v("gym-portrait", "Athletic Portrait", "Close-up half body, confident athletic posture, cinematic gym lighting.", 50)
                        ]
                    }
                ]
            }
        ]
    },

    // ==========================================
    // 2. UOMO (MEN)
    // ==========================================
    {
        name: "Uomo (Men)", slug: "cat-men", sort_order: 20,
        business_modes: [
            {
                name: "Casual & Urban", slug: "men-casual", sort_order: 10,
                subcategories: [
                    {
                        name: "Street Style", slug: "m-cas-street",
                        base_prompt: PHOTO_LIFESTYLE + "The model is a handsome, rugged, extremely realistic young man (25-35 years old). Cool urban street style aesthetic, natural lighting.",
                        variations: [
                            v("st-walk", "City Stride", "Walking decisively across a city street, hands in pockets, cool attitude.", 10),
                            v("st-wall", "Brick Wall Lean", "Leaning against a graffiti or brick wall, relaxed posture.", 20),
                            v("st-stairs", "Sitting on Steps", "Sitting casually on urban stone steps, looking at the camera.", 30),
                            v("st-sunset", "Rooftop Sunset", "Standing on a city rooftop during a stunning golden hour sunset.", 40),
                            v("st-coffee", "Coffee to go", "Walking while holding a takeaway coffee cup, candid lifestyle.", 50)
                        ]
                    },
                    {
                        name: "Ecommerce Studio", slug: "m-cas-ecom",
                        base_prompt: PHOTO_STUDIO + "The model is a handsome, realistic young man. Perfectly lit studio environment with a neutral background. Focus entirely on the garment.",
                        variations: [
                            v("ecom-front", "Front Stance", "Standing straight, facing camera, neutral confident expression.", 10),
                            v("ecom-cross", "Arms Crossed", "Standing with arms crossed, strong and masculine posture.", 20),
                            v("ecom-side", "Profile View", "Turned 3/4 to the side, showing the garment's cut.", 30),
                            v("ecom-pocket", "Hand in Pocket", "One hand in pocket, relaxed but professional e-commerce pose.", 40),
                            v("ecom-back", "Back Details", "Turned away from camera, showing the back of the item.", 50)
                        ]
                    }
                ]
            },
            {
                name: "Tailored & Classic", slug: "men-tailored", sort_order: 20,
                subcategories: [
                    {
                        name: "Executive Lifestyle", slug: "m-tail-exec",
                        base_prompt: PHOTO_LUXURY + "The model is a sharp, handsome, highly realistic man. He is wearing the provided tailored garment. The setting is a luxurious modern office or a high-end hotel lobby.",
                        variations: [
                            v("exec-chair", "Leather Chair", "Sitting confidently in a luxury leather armchair, commanding presence.", 10),
                            v("exec-walk", "Lobby Walk", "Walking purposefully through a marble hotel lobby.", 20),
                            v("exec-watch", "Checking Watch", "Adjusting cuff or checking a luxury watch, elegant detail shot.", 30),
                            v("exec-window", "Window View", "Standing by a floor-to-ceiling window overlooking the city skyline.", 40),
                            v("exec-portrait", "Close Portrait", "Tight portrait shot, serious and charismatic expression, sharp focus on the collar/tie.", 50)
                        ]
                    }
                ]
            },
            {
                name: "Over 50 Gentlemen", slug: "men-over50", sort_order: 30,
                subcategories: [
                    {
                        name: "Silver Fox Luxury", slug: "m-o50-silver",
                        base_prompt: PHOTO_LUXURY + "The model is a highly realistic, charismatic MATURE MAN (55-65 years old) with stylish silver hair and beard. Deeply sophisticated aura, natural wrinkles, no plastic skin. George Clooney vibe.",
                        variations: [
                            v("o50-cigar", "Lounge Relaxing", "Relaxing in a classic gentlemen's lounge, dark moody lighting, extremely elegant.", 10),
                            v("o50-boat", "Yacht Lifestyle", "Standing on the deck of a luxury yacht, breezy, wealthy lifestyle.", 20),
                            v("o50-drive", "Classic Car", "Standing next to or sitting in a vintage classic car, timeless elegance.", 30),
                            v("o50-studio", "Charismatic Portrait", "Studio portrait, warm lighting, charismatic smile, sharp clothing fit.", 40),
                            v("o50-walk", "Estate Walk", "Walking through the grounds of a luxury country estate.", 50)
                        ]
                    }
                ]
            }
        ]
    },

    // ==========================================
    // 3. SPOSA E SPOSO (BRIDAL & GROOM)
    // ==========================================
    {
        name: "Sposa & Sposo (Bridal)", slug: "cat-bridal", sort_order: 30,
        business_modes: [
            {
                name: "Sposa (Bride)", slug: "bridal-bride", sort_order: 10,
                subcategories: [
                    {
                        name: "Romantic Venue", slug: "b-bride-venue",
                        base_prompt: PHOTO_LUXURY + "The model is a breathtakingly beautiful bride. She is wearing the provided wedding dress. Soft, romantic, ethereal lighting. Breathtaking wedding venue.",
                        variations: [
                            v("venue-altar", "At the Altar", "Standing elegantly near a floral altar, soft heavenly light.", 10),
                            v("venue-window", "Bridal Prep Window", "Looking out of a large classic window, soft backlight illuminating the dress details.", 20),
                            v("venue-stairs", "Grand Staircase", "Descending a sweeping staircase, the dress train flowing beautifully behind.", 30),
                            v("venue-spin", "Joyful Spin", "Spinning happily, capturing the motion and volume of the wedding gown.", 40),
                            v("venue-garden", "Enchanted Garden", "Standing in a lush, romantic blooming garden, fairytale aesthetic.", 50)
                        ]
                    }
                ]
            },
            {
                name: "Sposo (Groom)", slug: "bridal-groom", sort_order: 20,
                subcategories: [
                    {
                        name: "Elegant Groom", slug: "b-groom-eleg",
                        base_prompt: PHOTO_LUXURY + "The model is a handsome, sharp groom. He is wearing the provided groom's suit or tuxedo. Classic, luxurious, high-end wedding photography.",
                        variations: [
                            v("groom-prep", "Fixing Tie", "Candid moment adjusting his tie or bowtie, looking in a mirror.", 10),
                            v("groom-portrait", "Classic Portrait", "Strong, confident portrait in an elegant hallway, dramatic lighting.", 20),
                            v("groom-wait", "Waiting at Altar", "Standing handsomely, looking forward with emotion, blurred floral background.", 30),
                            v("groom-walk", "Confident Walk", "Walking towards the camera in the venue, sharp tailored fit.", 40),
                            v("groom-pocket", "Hand in Pocket", "Relaxed but elegant stance, one hand in pocket, smiling slightly.", 50)
                        ]
                    }
                ]
            }
        ]
    },

    // ==========================================
    // 4. BAMBINO (KIDS)
    // ==========================================
    {
        name: "Bambino (Kids)", slug: "cat-kids", sort_order: 40,
        business_modes: [
            {
                name: "Kids Casual", slug: "kids-casual", sort_order: 10,
                subcategories: [
                    {
                        name: "Playful Lifestyle", slug: "k-cas-play",
                        base_prompt: PHOTO_LIFESTYLE + "The model is a cute, highly realistic child (5-8 years old) with a natural, happy expression. Bright, colorful, joyful atmosphere. Absolutely avoid creepy or deformed faces.",
                        variations: [
                            v("play-park", "Running in Park", "Running happily in a sunny park, dynamic and joyful.", 10),
                            v("play-toys", "Playing with Toys", "Sitting in a modern bright playroom, playing naturally.", 20),
                            v("play-laugh", "Big Laugh", "Close up portrait, laughing out loud, very natural and candid.", 30),
                            v("play-street", "Urban Kid", "Standing casually on a safe city sidewalk, trendy kids fashion look.", 40),
                            v("play-jump", "Jumping", "Mid-air jump, full of energy, bright lighting.", 50)
                        ]
                    }
                ]
            },
            {
                name: "Kids Ceremony", slug: "kids-ceremony", sort_order: 20,
                subcategories: [
                    {
                        name: "Elegant Event", slug: "k-cer-eleg",
                        base_prompt: PHOTO_STUDIO + "The model is a beautiful, realistic child dressed for a formal ceremony (baptism, communion, wedding). Very soft, elegant, bright studio lighting.",
                        variations: [
                            v("cer-stand", "Sweet Standing", "Standing politely, looking sweet and innocent, soft pastel background.", 10),
                            v("cer-sit", "Sitting on Stool", "Sitting elegantly on a vintage wooden stool.", 20),
                            v("cer-flower", "Holding Flower", "Gently holding a white flower, angelic aesthetic.", 30),
                            v("cer-walk", "Walking Forward", "Walking slowly towards the camera, showing the elegant outfit.", 40),
                            v("cer-look", "Looking Up", "Looking slightly upwards with wonder, soft rim light on the hair.", 50)
                        ]
                    }
                ]
            }
        ]
    },

    // ==========================================
    // 5. T-SHIRT & GADGETS
    // ==========================================
    {
        name: "T-Shirt & Gadgets", slug: "cat-tshirt", sort_order: 50,
        business_modes: [
            {
                name: "T-Shirt Brand", slug: "tshirt-brand", sort_order: 10,
                subcategories: [
                    {
                        name: "Flat Lay Clean", slug: "ts-flat",
                        base_prompt: PHOTO_STUDIO + "Focus on the garment. Flat lay composition. The T-shirt is laid out perfectly flat on a clean background, showing the graphic or cut clearly.",
                        variations: [
                            v("fl-center", "Centered Perfect", "Perfectly centered and straight, crisp lighting, neutral background.", 10),
                            v("fl-rotated", "Slightly Rotated", "Laid flat but rotated slightly diagonally for a dynamic composition.", 20),
                            v("fl-fold", "Neatly Folded", "Folded neatly showing the front graphic and collar, clean presentation.", 30),
                            v("fl-messy", "Artistic Wrinkles", "Artistically wrinkled, giving it a natural, worn-in, organic aesthetic.", 40),
                            v("fl-close", "Graphic Close-Up", "Zoomed in tightly on the main print or chest logo, capturing fabric texture.", 50)
                        ]
                    },
                    {
                        name: "UGC / Creator Style", slug: "ts-ugc",
                        base_prompt: PHOTO_LIFESTYLE + "User Generated Content aesthetic. The model is a cool, trendy Gen-Z creator wearing the T-Shirt. Shot on iPhone 15 Pro, slightly imperfect lighting, very natural and relatable.",
                        variations: [
                            v("ugc-mirror", "Mirror Selfie", "Taking a mirror selfie in a cool bedroom or studio setting.", 10),
                            v("ugc-street", "Street Candid", "Walking outside, looking at phone, casual creator lifestyle.", 20),
                            v("ugc-skate", "Skatepark Vibe", "Sitting at a skatepark, trendy and rebellious attitude.", 30),
                            v("ugc-friends", "Casual Hangout", "Hanging out casually, relaxed pose, natural daylight.", 40),
                            v("ugc-cafe", "Cafe Snap", "A quick snap while sitting at a cafe table, natural lighting.", 50)
                        ]
                    }
                ]
            }
        ]
    },

    // ==========================================
    // 6. CALZATURE (FOOTWEAR)
    // ==========================================
    {
        name: "Calzature (Footwear)", slug: "cat-shoes", sort_order: 60,
        business_modes: [
            {
                name: "Sneakers & Street", slug: "shoes-sneakers", sort_order: 10,
                subcategories: [
                    {
                        name: "On Feet Urban", slug: "sh-snk-onfeet",
                        base_prompt: PHOTO_LIFESTYLE + "Focus entirely on the FOOTWEAR. The image shows the provided shoes worn on feet. Urban streetwear setting, asphalt or concrete ground. The rest of the body is mostly out of frame or blurred.",
                        variations: [
                            v("snk-step", "Mid-Step", "Close up of the shoes taking a step forward on a city street, dynamic angle.", 10),
                            v("snk-stand", "Standing Parallel", "Both feet planted firmly on the ground, front 3/4 angle.", 20),
                            v("snk-air", "Jumping Air", "Shoes suspended in mid-air during a jump, sky or blur in background.", 30),
                            v("snk-stairs", "On Stairs", "Feet resting on urban concrete stairs, showing the side profile and sole.", 40),
                            v("snk-tie", "Tying Laces", "Hands entering the frame tying the shoelaces, POV perspective.", 50)
                        ]
                    }
                ]
            },
            {
                name: "Luxury Shoes", slug: "shoes-luxury", sort_order: 20,
                subcategories: [
                    {
                        name: "High-End Display", slug: "sh-lux-disp",
                        base_prompt: PHOTO_STUDIO + "Focus entirely on the FOOTWEAR. The image shows the provided luxury shoes displayed as high-end art. Dramatic, elegant lighting, reflections, premium materials.",
                        variations: [
                            v("lux-marble", "Marble Pedestal", "Shoes resting elegantly on a sleek marble pedestal, dark moody background.", 10),
                            v("lux-mirror", "Mirror Reflection", "Shoes placed on a reflective mirror surface, showing the bottom profile.", 20),
                            v("lux-float", "Floating Magic", "Shoes magically floating in the air against a studio backdrop, perfect lighting.", 30),
                            v("lux-box", "Premium Box", "Shoes resting half-inside a premium luxury shoebox, tissue paper unwrapped.", 40),
                            v("lux-onfeet", "Elegant On Feet", "Worn on feet in a luxury setting, e.g. stepping out of a luxury car.", 50)
                        ]
                    }
                ]
            },
            {
                name: "Unisex (Product Focus)", slug: "shoes-unisex", sort_order: 30,
                subcategories: [
                    {
                        name: "Product Clean", slug: "sh-uni-clean",
                        base_prompt: PHOTO_STUDIO + "Focus entirely on the FOOTWEAR. The image shows the provided shoe isolated in a clean, high-end studio setting. Neutral minimalist background, perfect crisp lighting. NO human elements, NO legs, NO people. Just the product displayed beautifully like a premium e-commerce shot.",
                        variations: [
                            v("sh-cln-side", "Lateral Profile", "Shot straight from the side, showing the exact lateral profile of the shoe on a clean surface.", 10),
                            v("sh-cln-45", "45 Degree Angle", "Classic e-commerce 45-degree angle shot, showing the toe box and the side.", 20),
                            v("sh-cln-pair", "Pair Together", "Both the left and right shoe placed elegantly next to each other.", 30),
                            v("sh-cln-top", "Top-Down View", "Looking straight down at the shoe to show the toe box and laces/design.", 40),
                            v("sh-cln-back", "Heel Detail", "Shot from the back, showing the heel tab and rear construction.", 50)
                        ]
                    }
                ]
            }
        ]
    }
];


async function runSeed() {
    console.log("🔥 INIZIO MIGRAZIONE MASSIVA TAXONOMY SUPER NEXUS 🔥");

    // 1. DELETE EVERYTHING (Clean Slate)
    console.log("🧨 Eliminazione categorie esistenti (Cascade delete su tutto)...");
    await prisma.category.deleteMany({});
    
    // NOTA: GenerationJobs sono stati persi, ma va bene per il Clean Slate.
    console.log("✅ Database pulito.");

    // 2. INSERIMENTO NUOVA STRUTTURA
    console.log("🌱 Creazione nuova architettura...");
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!adminUser) {
        throw new Error("Admin user not found. Cannot associate categories.");
    }

    for (const cat of TAXONOMY) {
        console.log(`\nCrating Category: ${cat.name}`);
        const createdCat = await prisma.category.create({
            data: {
                name: cat.name,
                slug: cat.slug,
                sort_order: cat.sort_order,
                user_id: adminUser.id,
                is_active: true
            }
        });

        for (const mode of cat.business_modes) {
            console.log(`  -> Business Mode: ${mode.name}`);
            const createdMode = await prisma.businessMode.create({
                data: {
                    name: mode.name,
                    slug: mode.slug,
                    sort_order: mode.sort_order,
                    category_id: createdCat.id,
                    is_active: true
                }
            });

            for (const sub of mode.subcategories) {
                console.log(`    -> Subcategory: ${sub.name} (Variations: ${sub.variations.length})`);
                
                // Forza i parametri per scarpe
                let integrityRules = "Must absolutely clone the structure and colors of the garment. Do not invent details.";
                if (cat.slug === 'cat-shoes') {
                    integrityRules = "EXTREME FOOTWEAR CLONING: You must perfectly clone the soles, laces, shape, logos, and materials of the provided shoe. DO NOT change the shoe.";
                }

                await prisma.subcategory.create({
                    data: {
                        name: sub.name,
                        slug: sub.slug,
                        business_mode_id: createdMode.id,
                        base_prompt_prefix: sub.base_prompt,
                        negative_prompt: NEGATIVE_PROMPT,
                        product_integrity_rules: integrityRules,
                        strict_reference_mode: false,
                        sort_order: 10,
                        is_active: true,
                        variations: {
                            create: sub.variations
                        }
                    }
                });
            }
        }
    }

    console.log("\n🚀 MIGRAZIONE COMPLETATA CON SUCCESSO! 🚀");
}

runSeed().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
