import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { generateImagesWithAI } from '@/lib/ai/generate'
import { generateTshirtImages } from '@/lib/ai/engines/tshirtEngine'
import { generateDressImages } from '@/lib/ai/engines/dressEngine'
import { generateBagsImages } from '@/lib/ai/engines/bagsEngine'
import { generateSwimwearImages } from '@/lib/ai/engines/swimwearEngine'
import { generateJewelryImages } from '@/lib/ai/engines/jewelryEngine'
import { generateShoesImages } from '@/lib/ai/engines/shoesEngine'
import { generateEverydayImages } from '@/lib/ai/engines/everydayEngine'
import { generateProductsImages } from '@/lib/ai/engines/productsEngine'
import { logApiCost } from '@/lib/gemini-cost'

export const maxDuration = 300 // Max duration for Vercel

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const cookieStore = await cookies()
    const adminAuthCookie = cookieStore.get('supernexus_admin_auth')
    const isAdminPasskey = adminAuthCookie && adminAuthCookie.value === 'authenticated'

    if (!user && !isAdminPasskey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let dbUser = null;
    if (user && user.email) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } })
    } else if (isAdminPasskey) {
      dbUser = await prisma.user.findFirst({ where: { role: 'admin' } })
    }

    if (!dbUser || !dbUser.subscription_active) {
      return NextResponse.json({ error: 'Account deactivated or not found.' }, { status: 403 })
    }

    const body = await req.json()
    let { imageUrl, finalPrompt, negativePrompt, qty, aspectRatio, selectedSnippetIds, taxonomyCat, taxonomyMode, taxonomySubcat, specificShotNumber, clientGender, detectedProductType, printLocation, imageBackUrl, productColors, outfitUrls } = body

    if (!imageUrl || !finalPrompt) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // --- STRICT GENDER SANITIZATION ---
    if (clientGender === 'MAN') {
        finalPrompt = finalPrompt.replace(/female fashion model|beautiful woman|beautiful girls/gi, 'handsome man')
                                 .replace(/\bfemale\b|\bwoman\b|\bgirl\b|\bgirls\b|\bwomen\b/gi, 'man');
    } else if (clientGender === 'WOMAN') {
        finalPrompt = finalPrompt.replace(/male fashion model|handsome man|handsome boy/gi, 'beautiful woman')
                                 .replace(/\bmale\b|\bman\b|\bboy\b|\bboys\b|\bmen\b/gi, 'woman');
    }

    // Cost verification
    let requestedQty = qty || 1
    const remaining = dbUser.images_allowance - dbUser.images_generated

    if (remaining <= 0 && dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient credits', remaining }, { status: 402 })
    }

    if (requestedQty > remaining && dbUser.role !== 'admin') {
      requestedQty = remaining
    }

    // Trova la Subcategory reale selezionata dall'utente
    let subcat = null;
    console.log("PAYLOAD RECEIVED FOR TAXONOMY:", { taxonomyCat, taxonomyMode, taxonomySubcat });
    
    if (taxonomyCat && taxonomyMode && taxonomySubcat) {
      subcat = await prisma.subcategory.findFirst({
        where: { 
          name: taxonomySubcat,
          business_mode: {
            name: taxonomyMode,
            category: {
              slug: taxonomyCat.toLowerCase()
            }
          }
        },
        include: { business_mode: { include: { category: true } }, reference_images: true }
      });
      console.log("SUBCAT FOUND:", subcat ? subcat.name : "NULL");
    }

    // Fallback al Dynamic Engine se la tassonomia non è mappata o mancano i parametri
    if (!subcat) {
      console.log("FALLING BACK TO DYNAMIC ENGINE. ONE OF THE PARAMS WAS MISSING OR QUERY FAILED.");
      subcat = await prisma.subcategory.findFirst({
        where: { slug: 'dynamic-engine' },
        include: { business_mode: { include: { category: true } }, reference_images: true }
      })
    }

    if (!subcat) {
      return NextResponse.json({ error: 'System architecture not initialized. Please run seeder.' }, { status: 500 })
    }

    // Iniettiamo il prompt dinamico sovrascrivendo temporaneamente quello del subcat
    const dynamicSubcat = {
        ...subcat,
        base_prompt_prefix: finalPrompt,
        negative_prompt: negativePrompt || "text, watermark, poorly rendered, ugly, deformed, blurry"
    }

    // Fetch global setting
    const globalModelSetting = await (prisma as any).setting.findUnique({ where: { key: 'ACTIVE_GENERATION_MODEL' } });
    const globalModel = globalModelSetting?.value || 'gemini-3.1-flash-image-preview';
    
    const generationModel = subcat?.active_model || globalModel;
    
    // Create Pending Job
    const newJob = await prisma.generationJob.create({
      data: {
        user_id: dbUser.id,
        category_id: subcat.business_mode.category_id,
        business_mode_id: subcat.business_mode_id,
        subcategory_id: subcat.id,
        original_product_image_url: imageUrl,
        status: "pending",
        total_cost_eur: 0,
        results_count: 0,
        prompt_generated: finalPrompt, // Salviamo il prompt dinamico nel job per tracciabilità
        model_used: generationModel
      }
    })

    const allUrls = outfitUrls && outfitUrls.length > 0 ? [imageUrl, ...outfitUrls] : [imageUrl];

    // GENERATE VIA AI ENGINE
    const aiParams = {
      qty: requestedQty,
      subcat: dynamicSubcat as any, // Type cast per compatibilità
      publicUrls: allUrls,
      userClarification: `Aspect Ratio: ${aspectRatio || '4:5'}`, // Usato come meta
      isOutfit: allUrls.length > 1,
      varianceEnabled: false,
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
    };

    let aiResult;
    switch (taxonomyCat) {
      case 't-shirt':
        aiResult = await generateTshirtImages(aiParams);
        break;
      case 'dress':
        aiResult = await generateDressImages(aiParams);
        break;
      case 'everyday':
        aiResult = await generateEverydayImages(aiParams);
        break;
      case 'bags':
        aiResult = await generateBagsImages(aiParams);
        break;
      case 'swimwear':
        aiResult = await generateSwimwearImages(aiParams);
        break;
      case 'jewelry':
        aiResult = await generateJewelryImages(aiParams);
        break;
      case 'shoes':
        aiResult = await generateShoesImages(aiParams);
        break;
      case '{product}s':
      case 'system':
        aiResult = await generateProductsImages(aiParams);
        break;
      default:
        // Fallback monolithic engine for unmapped categories
        aiResult = await generateImagesWithAI(aiParams);
        break;
    }

    if (aiResult.generatedBase64s.length === 0) {
      await prisma.generationJob.update({ where: { id: newJob.id }, data: { status: 'failed', error_message: aiResult.errorMessages.join(', ') } })
      return NextResponse.json({ error: 'AI Generation failed', details: aiResult.errorMessages }, { status: 500 })
    }

    // Log Costs
    let jobCost = 0;
    if (aiResult.totalTokensIn > 0 || aiResult.totalTokensOut > 0) {
      jobCost = await logApiCost("web_generation", generationModel, aiResult.totalTokensIn, aiResult.totalTokensOut, dbUser.id, aiResult.generatedBase64s.length)
    }

    // Save outputs to Supabase Cloud
    const adminSupabase = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const timestamp = Date.now();
    const safeName = (str: string) => (str || 'UNKNOWN').toUpperCase().replace(/[^A-Z0-9 -]/g, '').trim();
    const taxonomyPrefix = `${safeName(taxonomyCat)}-${safeName(taxonomyMode)}-${safeName(taxonomySubcat)}`;
    
    const uploadPromises = aiResult.generatedBase64s.map(async (base64String, i) => {
        const buffer = Buffer.from(base64String, 'base64')
        const oFileName = `${taxonomyPrefix}-${i + 1}_${timestamp}.jpg`
        const { error: upErr } = await adminSupabase.storage.from('telegram-outputs').upload(oFileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
        })
        if (!upErr) {
            const { data: { publicUrl } } = adminSupabase.storage.from('telegram-outputs').getPublicUrl(oFileName)
            
            const metadata = aiResult.generatedMetadata[i] || { shotNumber: null, shotName: null };
            
            await prisma.jobImage.create({
              data: {
                job_id: newJob.id,
                image_url: publicUrl,
                storage_path: oFileName,
                image_order: i
              }
            })

            // Auto-cover logic: set as cover if missing (only on the first generated image)
            if (i === 0 && subcat && subcat.slug !== 'dynamic-engine') {
              if (subcat.business_mode?.category && !subcat.business_mode.category.cover_image) {
                await prisma.category.update({ where: { id: subcat.business_mode.category.id }, data: { cover_image: publicUrl } });
                subcat.business_mode.category.cover_image = publicUrl;
              }
              if (subcat.business_mode && !subcat.business_mode.cover_image) {
                await prisma.businessMode.update({ where: { id: subcat.business_mode.id }, data: { cover_image: publicUrl } });
                subcat.business_mode.cover_image = publicUrl;
              }
              if (!subcat.preview_image) {
                await prisma.subcategory.update({ where: { id: subcat.id }, data: { preview_image: publicUrl } });
                subcat.preview_image = publicUrl;
              }
            }

            // Auto-cover per i pulsanti Shot (Thumbnail Wizard)
            if (metadata && metadata.shotName && taxonomyCat && taxonomyMode && taxonomySubcat) {
              try {
                let normMode = taxonomyMode.toLowerCase().trim();
                let normPres = taxonomySubcat.toLowerCase().trim().replace(/-/g, ' ');
                let cg = (clientGender || '').toUpperCase();

                if (normMode.includes('ads') || normMode.includes('scroll-stopper')) normMode = 'ads';
                else if (normMode.includes('detail') || normMode.includes('texture')) normMode = 'detail';
                else normMode = normMode.replace(/\s+/g, '-');
                
                if (normPres === 'candid' && cg) {
                  normPres = `candid-${cg.toLowerCase()}`;
                } else if (normPres === 'ugc in home' && cg) {
                  normMode = 'ugc-home';
                  normPres = `candid-${cg.toLowerCase()}`;
                } else if (normPres === 'ugc in store' && cg) {
                  normMode = 'ugc-store';
                  normPres = `candid-${cg.toLowerCase()}`;
                } else if (normPres === 'model photo' && cg) {
                  normPres = `model-photo-${cg.toLowerCase()}`;
                } else if (normPres.includes('ugc in home') && cg === 'WOMAN') {
                  normMode = 'ugc-home';
                  normPres = 'candid-woman';
                } else if (normPres.includes('ugc in store') && cg === 'WOMAN') {
                  normMode = 'ugc-store';
                  normPres = 'candid-woman';
                } else if (normPres.includes('ugc in home') && cg === 'MAN') {
                  normMode = 'ugc-home';
                  normPres = 'candid-man';
                } else if (normPres.includes('ugc in store') && cg === 'MAN') {
                  normMode = 'ugc-store';
                  normPres = 'candid-man';
                } else if (normPres === 'ugc in home') {
                  normMode = 'ugc-home';
                  normPres = 'candid-woman';
                } else if (normPres === 'ugc in store') {
                  normMode = 'ugc-store';
                  normPres = 'candid-woman';
                } else if (normPres.includes('candid') && cg === 'WOMAN') {
                  normPres = 'candid-woman';
                } else if (normPres.includes('candid') && cg === 'MAN') {
                  normPres = 'candid-man';
                } else if (normPres === 'candid') {
                  normPres = cg === 'MAN' ? 'candid-man' : 'candid-woman';
                } else if (normPres === 'model photo') {
                  normPres = cg === 'MAN' ? 'model-photo-man' : 'model-photo-woman';
                } else if (normPres === 'woman') {
                  normPres = 'candid-woman';
                } else if (normPres === 'man') {
                  normPres = 'candid-man';
                } else if (normPres.includes('curvy') || normPres.includes('plus-size')) {
                  normPres = 'curvy';
                } else if (normPres.includes('still life')) {
                  normPres = 'still-life-pack';
                } else if (normPres.includes('ugc creator pack')) {
                  normPres = 'ugc-creator-pack';
                } else if (normPres === 'no model') {
                  normPres = 'no-model';
                } else {
                  normPres = normPres.replace(/\s+/g, '-');
                }

                const shotConfig = await prisma.promptConfigShot.findFirst({
                  where: {
                    category: taxonomyCat.toLowerCase().trim(),
                    mode: normMode,
                    presentation: normPres,
                    shotName: metadata.shotName,
                    OR: [{ imageUrl: null }, { imageUrl: '' }]
                  }
                });
                if (shotConfig) {
                  await prisma.promptConfigShot.update({
                    where: { id: shotConfig.id },
                    data: { imageUrl: publicUrl }
                  });
                  console.log(`[AUTO-COVER] Salvato thumbnail per lo shot: ${metadata.shotName}`);
                } else {
                  console.log(`[AUTO-COVER] Nessun update. Config non trovato per: cat=${taxonomyCat}, mode=${normMode}, pres=${normPres}, shot=${metadata.shotName}`);
                }
              } catch (err) {
                console.error("Errore salvataggio thumbnail PromptConfigShot:", err);
              }
            }
            
            return {
                url: publicUrl,
                shotNumber: metadata.shotNumber,
                shotName: metadata.shotName
            };
        }
        return null;
    });

    const uploadResults = await Promise.all(uploadPromises);
    const outputResults = uploadResults.filter(r => r !== null);

    // Deduct Credits & Finalize Job
    await prisma.user.update({
        where: { id: dbUser.id },
        data: { images_generated: { increment: outputResults.length } }
    })

    await prisma.generationJob.update({
        where: { id: newJob.id },
        data: { status: 'completed', results_count: outputResults.length, total_cost_eur: jobCost }
    })

    return NextResponse.json({ success: true, results: outputResults, jobId: newJob.id, modelUsed: generationModel })

  } catch (error) {
    console.error("Web Generate Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
