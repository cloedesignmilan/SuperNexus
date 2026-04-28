import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { generateImagesWithAI } from '@/lib/ai/generate'
import { logApiCost } from '@/lib/gemini-cost'

export const maxDuration = 300 // Max duration for Vercel

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } })
    if (!dbUser || !dbUser.subscription_active) {
      return NextResponse.json({ error: 'Account deactivated or not found.' }, { status: 403 })
    }

    const body = await req.json()
    const { imageUrl, finalPrompt, negativePrompt, qty, aspectRatio, selectedSnippetIds, taxonomyCat, taxonomyMode, taxonomySubcat, specificShotNumber, clientGender, detectedProductType, printLocation, imageBackUrl } = body

    if (!imageUrl || !finalPrompt) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Cost verification
    const requestedQty = qty || 1
    const remaining = dbUser.images_allowance - dbUser.images_generated
    if (requestedQty > remaining && dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient credits', remaining }, { status: 402 })
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
        prompt_generated: finalPrompt // Salviamo il prompt dinamico nel job per tracciabilità
      }
    })

    const generationModel = 'gemini-3.1-flash-image-preview' // Default model or fetch from settings

    // GENERATE VIA AI ENGINE
    const aiResult = await generateImagesWithAI({
      qty: requestedQty,
      subcat: dynamicSubcat as any, // Type cast per compatibilità
      publicUrls: [imageUrl],
      userClarification: `Aspect Ratio: ${aspectRatio || '4:5'}`, // Usato come meta
      isOutfit: false,
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
      imageBackUrl
    })

    if (aiResult.generatedBase64s.length === 0) {
      await prisma.generationJob.update({ where: { id: newJob.id }, data: { status: 'failed', error_message: aiResult.errorMessages.join(', ') } })
      return NextResponse.json({ error: 'AI Generation failed', details: aiResult.errorMessages }, { status: 500 })
    }

    // Log Costs
    if (aiResult.totalTokensIn > 0 || aiResult.totalTokensOut > 0) {
      await logApiCost("web_generation", generationModel, aiResult.totalTokensIn, aiResult.totalTokensOut, dbUser.id, aiResult.generatedBase64s.length)
    }

    // Save outputs to Supabase Cloud
    const adminSupabase = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const timestamp = Date.now()
    const outputResults = []

    const safeName = (str: string) => (str || 'UNKNOWN').toUpperCase().replace(/[^A-Z0-9 -]/g, '').trim();
    const taxonomyPrefix = `${safeName(taxonomyCat)}-${safeName(taxonomyMode)}-${safeName(taxonomySubcat)}`;

    for (let i = 0; i < aiResult.generatedBase64s.length; i++) {
        const buffer = Buffer.from(aiResult.generatedBase64s[i], 'base64')
        const oFileName = `${taxonomyPrefix}-${i + 1}_${timestamp}.jpg`
        const { error: upErr } = await adminSupabase.storage.from('telegram-outputs').upload(oFileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
        })
        if (!upErr) {
            const { data: { publicUrl } } = adminSupabase.storage.from('telegram-outputs').getPublicUrl(oFileName)
            
            const metadata = aiResult.generatedMetadata[i] || { shotNumber: null, shotName: null };
            outputResults.push({
                url: publicUrl,
                shotNumber: metadata.shotNumber,
                shotName: metadata.shotName
            })
            
            await prisma.jobImage.create({
              data: {
                job_id: newJob.id,
                image_url: publicUrl,
                storage_path: oFileName,
                image_order: i
              }
            })
        }
    }

    // Deduct Credits & Finalize Job
    await prisma.user.update({
        where: { id: dbUser.id },
        data: { images_generated: { increment: outputResults.length } }
    })

    await prisma.generationJob.update({
        where: { id: newJob.id },
        data: { status: 'completed', results_count: outputResults.length }
    })

    return NextResponse.json({ success: true, results: outputResults, jobId: newJob.id })

  } catch (error) {
    console.error("Web Generate Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
