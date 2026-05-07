import { getRandomSceneForSubcategory } from "@/app/api/telegram/webhook/sceneDictionary";
import { getPromptsForSelection } from "../../prompt-configs";
import { GenerateImagesOptions } from "../generate";
import { executeGeminiBatch, downloadImageAsBase64, GLOBAL_INVIOLABLE_RULES, AIExecutionBatch, getDynamicAestheticRules } from "./coreEngine";

export async function generateTshirtImages({
    qty,
    subcat,
    publicUrls,
    userClarification,
    isOutfit,
    varianceEnabled,
    generationModel,
    taxonomyCat,
    taxonomyMode,
    taxonomySubcat,
    specificShotNumber,
    clientGender,
    detectedProductType,
    aspectRatio,
    printLocation,
    imageBackUrl,
    productColors
}: GenerateImagesOptions) {
    
    // 1. Fetch input images and convert to base64
    let base64OutfitParts: any[] = [];
    let base64BackPart: any | null = null;
    
    for (const url of publicUrls) {
        const arr = await downloadImageAsBase64(url);
        if (arr) base64OutfitParts.push(arr);
    }
    
    if (imageBackUrl) {
        const arr = await downloadImageAsBase64(imageBackUrl);
        if (arr) base64BackPart = arr;
    }
    
    if (base64OutfitParts.length === 0) {
        throw new Error("Impossibile scaricare le immagini input.");
    }

    // 2. Fetch Reference Images if any (for strict mode / inspiration)
    const referenceImages = subcat.reference_images || [];
    let referenceBuffers: any[] = [];
    
    for (const ref of referenceImages.slice(0, 10)) {
        const arr = await downloadImageAsBase64(ref.image_url);
        if (arr) referenceBuffers.push(arr.inlineData);
    }

    // 3. Prompt Master Construction for T-SHIRT
    const basePrompt = subcat.base_prompt_prefix;
    const bContext = subcat.business_context ? `\n[BUSINESS CONTEXT: ${subcat.business_context}]` : "";

    const userPrompt = `[CORE INSTRUCTION]
1. SCENE DESCRIPTION: ${basePrompt}${bContext}
2. CAMERA ANGLE: Professional fashion e-commerce photography, 85mm lens, sharp focus.
3. LIGHTING: Cinematic and professional studio lighting or high-end natural lighting.
4. QUALITY: 8k, photorealistic, ultra-detailed, editorial fashion magazine quality.
5. NO HALLUCINATIONS: Do NOT invent garments not present in the input image.
6. MANDATORY RULE: IF THE REFERENCE IMAGE SHOWS ONLY ONE GARMENT, YOU MUST GENERATE ONLY THAT GARMENT ON THE MODEL. Do NOT hallucinate jackets, sweaters, or other layers over it. Do not invent accessories unless explicitly required.
7. CRITICAL FLAT-LAY RULE: If the reference image is a flat-lay or ghost mannequin, you MUST "dress" the model with it, adapting it perfectly to the 3D body shape. Do NOT generate the person holding a flat t-shirt. Do NOT generate a flat t-shirt floating in the air. The garment must be WORN by the model.
8. ${clientGender === 'WOMAN' ? `CRITICAL GENDER RULE: YOU MUST GENERATE A FEMALE MODEL. DO NOT GENERATE A MAN.` : clientGender === 'MAN' ? `CRITICAL GENDER RULE: YOU MUST GENERATE A MALE MODEL. DO NOT GENERATE A WOMAN.` : `GENDER RULE: Adapt the gender to match the clothing style.`}
${userClarification === 'UGC_MAN' ? `9. CLARIFICATION FROM THE USER: The user has explicitly requested a MALE model for this shot. YOU MUST STRICTLY USE A HANDSOME 20-25 YEAR OLD BOY. ABSOLUTELY NO FEMALE MODELS. You MUST adapt the fit of the t-shirt to a male body.` : (userClarification !== 'X' ? `9. CLARIFICATION FROM THE USER: The user was asked a question about the garment and explicitly responded with: "${userClarification}". YOU MUST STRICTLY RESPECT THIS INFORMATION AND BUILD THE IMAGE ACCORDINGLY.` : '')}
${isOutfit ? `10. CRITICAL OUTFIT COORDINATION: The user has provided MULTIPLE reference images for this job. YOU MUST COMBINE THEM! Do not generate them separately. Dress the model or arrange the scene with ALL the provided items simultaneously, creating a perfectly coordinated outfit.` : ''}
${taxonomySubcat?.toLowerCase().includes('model photo') ? `11. MODEL REALISM (NO PLASTIC): I modelli DEVONO essere esteticamente bellissimi, con lineamenti eleganti da alta moda. TUTTAVIA, DEVI GARANTIRE UN REALISMO ESTREMO FOTOGRAFICO. La pelle NON deve sembrare di plastica, lisciata, CGI o videogioco. Mostra la texture naturale della pelle, i pori e un'illuminazione fotografica reale. Le pose devono essere eleganti ma non rigide o finte come manichini.` : ''}`;

    const presentationSlug = taxonomySubcat?.toLowerCase().replace(/\s+/g, '-') || 'default';
    const modeSlug = taxonomyMode?.toLowerCase().replace(/\s+/g, '-') || 'lifestyle';
    const categorySlug = 't-shirt'; // Hardcoded for this engine

    // T-SHIRT Specific Flags
    const isTshirtBackPrint = printLocation === 'back' || presentationSlug.includes('back');
    const isTshirtNoModel = presentationSlug === 'no-model' || modeSlug === 'clean-catalog' || userPrompt.toLowerCase().includes('no model');
    const isTshirtColorVariants = userPrompt.toLowerCase().includes('color variants') || userPrompt.toLowerCase().includes('different colors');
    const isTshirtPremium = userPrompt.toLowerCase().includes('premium brand') || userPrompt.toLowerCase().includes('luxury');
    const isTshirtUGC = modeSlug.includes('ugc');
    const isTshirtAds = modeSlug.includes('ads') || presentationSlug.includes('scroll-stopper');

    let strictPoses: string[] = [];
    if (isTshirtBackPrint) {
        strictPoses = [
            "[T-SHIRT BACK PRINT 1] Show full back clearly, model turned away, design fully visible, no cropping",
            "[T-SHIRT BACK PRINT 2] Slightly rotated back view, natural relaxed pose, back print 100% visible",
            "[T-SHIRT BACK PRINT 3] Close-up on back print design, ultra sharp, clear details",
            "[T-SHIRT BACK PRINT 4] Over-the-shoulder look, back print fully visible",
            "[T-SHIRT BACK PRINT 5] Lifestyle back shot, model walking away, design clearly visible"
        ];
    } else if (isTshirtNoModel) {
        strictPoses = [
            "[T-SHIRT NO MODEL 1] Flat lay, clean studio background, perfect symmetry, perfect alignment, no wrinkles",
            "[T-SHIRT NO MODEL 2] Ghost mannequin shot, clean studio background, perfect symmetry",
            "[T-SHIRT NO MODEL 3] Hanger shot, clean background, focus on product shape and fit",
            "[T-SHIRT NO MODEL 4] Flat lay close-up on fabric/stitching, ultra sharp, no wrinkles",
            "[T-SHIRT NO MODEL 5] Ghost mannequin side angle, clean studio background"
        ];
    } else if (isTshirtColorVariants) {
        strictPoses = [
            "[T-SHIRT COLOR VARIANT 1] Front view, change ONLY base color, keep design identical, maintain same lighting and framing",
            "[T-SHIRT COLOR VARIANT 2] Front view, change ONLY base color, keep design identical, maintain same lighting and framing",
            "[T-SHIRT COLOR VARIANT 3] Front view, change ONLY base color, keep design identical, maintain same lighting and framing",
            "[T-SHIRT COLOR VARIANT 4] Front view, change ONLY base color, keep design identical, maintain same lighting and framing",
            "[T-SHIRT COLOR VARIANT 5] Front view, change ONLY base color, keep design identical, maintain same lighting and framing"
        ];
    } else if (isTshirtPremium) {
        strictPoses = [
            "[T-SHIRT PREMIUM 1] High-end minimal environment, luxury fashion editorial, confident minimal pose, soft cinematic light",
            "[T-SHIRT PREMIUM 2] Elevated branding feel, soft cinematic light, product-focused",
            "[T-SHIRT PREMIUM 3] Editorial close-up, luxury lighting, premium texture focus",
            "[T-SHIRT PREMIUM 4] Minimal studio, high fashion posture, cinematic shadows",
            "[T-SHIRT PREMIUM 5] Aspirative luxury environment, confident relaxed pose"
        ];
    } else if (isTshirtUGC) {
        strictPoses = [
            "[T-SHIRT UGC 1] Mirror selfie, bedroom environment, real person vibe, authentic not polished",
            "[T-SHIRT UGC 2] Street casual, iPhone style, handheld feeling, slight motion blur",
            "[T-SHIRT UGC 3] Home environment, natural light only, slightly imperfect framing",
            "[T-SHIRT UGC 4] FIT FOCUS (UGC): Mid torso crop, real life setting. Show fit on chest and sleeves naturally.",
            "[T-SHIRT UGC 5] DETAIL (UGC): Casual close-up on fabric/print, real shadows, slight grain, not professional."
        ];
    } else if (isTshirtAds) {
        strictPoses = [
            "[T-SHIRT SCROLL STOPPER 1] Bold pose, close camera, large in frame, strong contrast, eye-catching",
            "[T-SHIRT SCROLL STOPPER 2] Movement (walking, turning), dramatic framing, high attention",
            "[T-SHIRT SCROLL STOPPER 3] High contrast or golden hour light, scroll stopping mood",
            "[T-SHIRT SCROLL STOPPER 4] FIT FOCUS (ADS): Mid torso crop, dynamic angle, bold lighting on chest and fit.",
            "[T-SHIRT SCROLL STOPPER 5] LIFESTYLE SCROLL STOPPER: Urban street, strong visual impact, aspirational real brand feeling."
        ];
    } else {
        strictPoses = [
            "[T-SHIRT LIFESTYLE 1] Urban street or coffee shop, young realistic person, natural walking pose, soft shadows, modern aspirational",
            "[T-SHIRT LIFESTYLE 2] FRONT MODEL SHOT: Model facing camera, neutral pose, casual environment",
            "[T-SHIRT LIFESTYLE 3] FIT FOCUS: Mid torso crop, showing how it fits on body (chest, sleeves, length)",
            "[T-SHIRT LIFESTYLE 4] BACK MODEL SHOT: Show full back of t-shirt clearly",
            "[T-SHIRT LIFESTYLE 5] DETAIL CLOSE-UP: Macro shot on print, texture, or fabric. Ultra sharp."
        ];
    }

    const configShots = await getPromptsForSelection({
        categorySlug,
        modeSlug,
        presentationSlug,
        quantity: qty,
        specificShotNumber,
        gender: clientGender
    });

    let batches: AIExecutionBatch[] = [];

    for (let i = 0; i < qty; i++) {
        let aiParts: any[] = [];
        let variantPrompt = "";
        let currentShotName: string | null = null;
        let currentShotNumber: number | null = null;

        const currentRefInline = referenceBuffers.length > 0 ? referenceBuffers[i % referenceBuffers.length] : null;

        if (configShots && configShots.length > 0) {
            const shotInfo = configShots[i % configShots.length];
            currentShotName = shotInfo.shot_name;
            currentShotNumber = shotInfo.shot_number;

            const isBackShotNoPrint = shotInfo.hard_rules?.includes('BACK OF THE GARMENT') || shotInfo.positive_prompt?.includes('BACK SHOT');
            let backShotOverride = "";
            if (isBackShotNoPrint && printLocation === 'front') {
                backShotOverride = `\n\n[CRITICAL OVERRIDE FOR BACK VIEW]: The reference image shows the FRONT of the garment with a print/graphic. HOWEVER, THIS IS A BACK SHOT. YOU MUST ASSUME THE BACK OF THE GARMENT IS COMPLETELY BLANK. DO NOT REPLICATE THE FRONT PRINT ON THE BACK. DO NOT ADD ANY LOGOS, GRAPHICS, OR DESIGNS ON THE BACK OF THE SHIRT. IT MUST BE A SOLID COLOR.`;
            } else if (isBackShotNoPrint) {
                backShotOverride = `\n\n[CRITICAL OVERRIDE FOR BACK VIEW]: The reference image shows the FRONT of the garment with a print/graphic. HOWEVER, THIS IS A BACK SHOT. YOU MUST ASSUME THE BACK OF THE GARMENT IS COMPLETELY BLANK. DO NOT REPLICATE THE FRONT PRINT ON THE BACK. DO NOT ADD ANY LOGOS, GRAPHICS, OR DESIGNS ON THE BACK OF THE SHIRT. IT MUST BE A SOLID COLOR.`;
            }

            const genderNoun = clientGender === 'MAN' ? 'man' : (clientGender === 'WOMAN' ? 'woman' : 'model');
            let finalPositive = shotInfo.positive_prompt?.replace(/\{product\}/g, 't-shirt').replace(/\{gender\}/g, genderNoun) || "";
            if (clientGender === 'MAN') {
                finalPositive = finalPositive.replace(/\b([Mm])odel\b/g, '$1ale model');
            } else if (clientGender === 'WOMAN') {
                finalPositive = finalPositive.replace(/\b([Mm])odel\b/g, '$1emale model');
            }
            
            const dbGlobalNegative = subcat?.business_mode?.category?.global_negative_prompt || "";
            const { positive: dynPos, negative: dynNeg } = getDynamicAestheticRules(taxonomyMode);

            let finalNegative = "plastic skin, fake CGI, 3D render, smooth airbrushed skin, ugly, " + dynNeg + ", " + dbGlobalNegative + ", " + (shotInfo.negative_prompt?.replace(/\{product\}/g, 't-shirt').replace(/\{gender\}/g, genderNoun) || "");

            const dbGlobalPositive = subcat?.business_mode?.category?.global_positive_prompt ? `\n[GLOBAL CATEGORY POSITIVE RULES]: ${subcat.business_mode.category.global_positive_prompt}` : `\n[CRITICAL PRODUCT LOCK SYSTEM: The uploaded product image is the ONLY source of truth. Replicate exact structure, patterns, and construction.]`;
            const dbGlobalHardRules = subcat?.business_mode?.category?.global_hard_rules ? `\n[GLOBAL CATEGORY HARD RULES]: ${subcat.business_mode.category.global_hard_rules}` : "";

            const wearDirective = isTshirtNoModel ? "\n[DIRECTIVE: The product must be displayed ALONE, flat lay or ghost mannequin. NO HUMAN MODEL.]" : "\n[DIRECTIVE: You MUST generate a REALISTIC HUMAN MODEL wearing the product. If the input is a flat-lay, you must perfectly map it onto the model's 3D body, maintaining all proportions.]";

            let backgroundOverride = "";
            if (!currentRefInline) {
                backgroundOverride = "\n[CRITICAL BACKGROUND OVERRIDE]: DO NOT COPY OR REPLICATE THE BACKGROUND FROM THE GARMENT REFERENCE IMAGE. YOU MUST COMPLETELY REPLACE THE ENVIRONMENT WITH A NEW SCENE THAT MATCHES THE POSITIVE INSTRUCTIONS EXACTLY. IGNORE THE ORIGINAL ROOM/BEDROOM COMPLETELY.";
            }

            if (!isTshirtNoModel && isTshirtAds && productColors && productColors.length > 0) {
                const color = productColors[0];
                backgroundOverride += `\n[DYNAMIC TONE-ON-TONE OVERRIDE]: The background MUST be a pure, seamless studio cyclorama backdrop painted EXACTLY in ${color} to perfectly match the garment. Create a premium, high-end monochromatic studio setting (solid ${color} background with a soft, elegant lighting gradient). ABSOLUTELY NO OUTDOOR SCENES. NO CLUTTER. Just a perfectly clean, luxurious ${color} tone-on-tone environment like a Vogue editorial.`;
            }

            let povOverride = "";
            if (shotInfo.hard_rules?.includes('POV') || shotInfo.positive_prompt?.includes('POV')) {
                povOverride = `\n[STRICT POV OVERRIDE (HIGHEST PRIORITY)]: Ignore any global prompt asking for a "handsome man", "beautiful woman", "fashion model", "portrait", or "face". THIS IS A FIRST-PERSON POINT-OF-VIEW (POV) SHOT. DO NOT DRAW THE MODEL'S UPPER BODY OR FACE. YOU MUST DRAW ONLY THE LEGS/FEET/TORSO AS SEEN FROM THE EYES OF THE PERSON LOOKING DOWN. THIS RULE OVERRIDES ALL OTHERS.`;
            }

            variantPrompt = `--- T-SHIRT ECOMMERCE STRUCTURED SYSTEM ---
CURRENT SHOT: ${shotInfo.shot_number} - ${shotInfo.shot_name}
[POSITIVE INSTRUCTIONS]: ${finalPositive}
[HARD RULES]: ${shotInfo.hard_rules}
[OUTPUT GOAL]: ${shotInfo.output_goal}

[STRICT NEGATIVE CONSTRAINTS - DO NOT GENERATE THESE ELEMENTS UNDER ANY CIRCUMSTANCE]: ${finalNegative}
` + dynPos + GLOBAL_INVIOLABLE_RULES + dbGlobalPositive + dbGlobalHardRules + backShotOverride + wearDirective + backgroundOverride + povOverride;

            if (base64BackPart) {
                aiParts.push({ text: "SUBJECT GARMENT - FRONT VIEW (To be mapped on front-facing parts of the pose):" });
                aiParts.push(base64OutfitParts[0]);
                aiParts.push({ text: "SUBJECT GARMENT - BACK VIEW (To be mapped on back-facing parts of the pose):" });
                aiParts.push(base64BackPart);
            } else {
                aiParts.push({ text: "SUBJECT GARMENT TO STRICTLY CLONE (Do NOT change details on this specific item. CRITICAL: DO NOT CLONE ITS BACKGROUND!):" });
                aiParts.push(base64OutfitParts[0]);
                if (isOutfit && base64OutfitParts.length > 1) {
                    aiParts.push({ text: "ADDITIONAL GARMENTS FOR OUTFIT COORDINATION:" });
                    for(let j=1; j<base64OutfitParts.length; j++) aiParts.push(base64OutfitParts[j]);
                }
            }


            aiParts.push({ text: variantPrompt });

        } else {
            // DYNAMIC SCENE FALLBACK
            currentShotName = "Dynamic Scene";
            currentShotNumber = i + 1;
            const currentPose = strictPoses[i % strictPoses.length];
            
            let currentLighting = "";
            if (varianceEnabled && modeSlug !== 'clean-catalog') {
                const magicalScene = getRandomSceneForSubcategory("t-shirt " + modeSlug + " " + presentationSlug);
                currentLighting += " " + magicalScene;
            }

            const dbGlobalPositive = subcat?.business_mode?.category?.global_positive_prompt ? `\n[GLOBAL CATEGORY POSITIVE RULES]: ${subcat.business_mode.category.global_positive_prompt}` : `\n[CRITICAL PRODUCT LOCK SYSTEM: The uploaded product image is the ONLY source of truth. Replicate exact structure and construction.]`;
            const dbGlobalHardRules = subcat?.business_mode?.category?.global_hard_rules ? `\n[GLOBAL CATEGORY HARD RULES]: ${subcat.business_mode.category.global_hard_rules}` : "";
            
            const wearDirective = isTshirtNoModel ? "\n[DIRECTIVE: The product must be displayed ALONE, flat lay or ghost mannequin. NO HUMAN MODEL.]" : "\n[DIRECTIVE: You MUST generate a REALISTIC HUMAN MODEL wearing the product. If the input is a flat-lay, you must perfectly map it onto the model's 3D body.]";

            const { positive: dynPos, negative: dynNeg } = getDynamicAestheticRules(taxonomyMode);
            variantPrompt = userPrompt + dynPos + `\n\n${dbGlobalPositive}${dbGlobalHardRules}${wearDirective}\n[CONTROLLED VARIATION SYSTEM: The environment, lighting, and model MUST remain identical across all generations. This is a single photoshoot. Do NOT change location, lighting direction/intensity, outfit, or model identity. Allowed variations ONLY in: camera angle, framing, and pose.]\n[MICRO VARIATION SYSTEM: Introduce subtle natural variations between shots: slight differences in facial expression, micro changes in body posture, minimal variation in hand positioning. These must feel natural and human, not staged.]\n[CAMERA VARIATION RULE: Each image MUST have a clearly different framing. Do NOT repeat the same framing. Each image must feel intentionally different in composition.]\n\n[SEED/VARIANTE: Generazione nr. ${i+1}.\nSTRICT CAMERA/POSE DIRECTIVE (YOU MUST FOLLOW THIS): ${currentPose}\nLOCKED LIGHTING/AESTHETIC: ${currentLighting}\nMantieni la FORMA/COLORE del capo identici all'originale. DO NOT GENERATE: ${dynNeg}]`;
            
            if (base64BackPart) {
                aiParts.push({ text: "SUBJECT GARMENT - FRONT VIEW (To be mapped on front-facing parts of the pose):" });
                aiParts.push(base64OutfitParts[0]);
                aiParts.push({ text: "SUBJECT GARMENT - BACK VIEW (To be mapped on back-facing parts of the pose):" });
                aiParts.push(base64BackPart);
            } else {
                aiParts.push({ text: "SUBJECT GARMENT TO STRICTLY CLONE (Do NOT change details on this specific item. CRITICAL: DO NOT CLONE ITS BACKGROUND!):" });
                aiParts.push(base64OutfitParts[0]);
                if (isOutfit && base64OutfitParts.length > 1) {
                    aiParts.push({ text: "ADDITIONAL GARMENTS FOR OUTFIT COORDINATION:" });
                    for(let j=1; j<base64OutfitParts.length; j++) aiParts.push(base64OutfitParts[j]);
                }
            }

            if (currentRefInline) {
                aiParts.push({ text: "INSPIRATION / MOODBOARD PHOTOGRAPHY (Use ONLY for lighting and pose. DO NOT copy the clothes from this image. DO NOT copy any messy or cluttered background elements; adapt the background to perfectly match the POSITIVE INSTRUCTIONS and HARD RULES):" });
                aiParts.push({ inlineData: currentRefInline });
            }
            aiParts.push({ text: variantPrompt });
        }

        batches.push({ aiParts, shotName: currentShotName, shotNumber: currentShotNumber });
    }

    return await executeGeminiBatch(generationModel, aspectRatio, batches);
}
