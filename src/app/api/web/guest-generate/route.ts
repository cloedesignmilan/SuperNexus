import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { generateImagesWithAI } from '@/lib/ai/generate'

export const maxDuration = 300 // Max duration for Vercel

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageUrl, taxonomyCat, taxonomyMode, taxonomySubcat, clientGender, detectedProductType } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Per gli ospiti, forziamo qty a 3 (prima era 1)
    const requestedQty = 3

    // Trova la Subcategory reale selezionata per il routing
    let subcat = null;
    
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
    }

    // Fallback al Dynamic Engine se la tassonomia non è mappata
    if (!subcat) {
      subcat = await prisma.subcategory.findFirst({
        where: { slug: 'dynamic-engine' },
        include: { business_mode: { include: { category: true } }, reference_images: true }
      })
    }

    if (!subcat) {
      return NextResponse.json({ error: 'System architecture not initialized.' }, { status: 500 })
    }

    // Preleviamo l'utente di sistema (System Admin) o uno fittizio per addebitare il job
    const systemUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!systemUser) {
        return NextResponse.json({ error: 'No admin user found to bind the job.' }, { status: 500 })
    }

    // Generiamo un prompt standard "Wow" per la subcat se non fornito
    const finalPrompt = subcat.base_prompt_prefix || "High end fashion editorial photography, stunning lighting, professional studio";

    // Create Pending Job for the guest
    const newJob = await prisma.generationJob.create({
      data: {
        user_id: systemUser.id,
        category_id: subcat.business_mode.category_id,
        business_mode_id: subcat.business_mode_id,
        subcategory_id: subcat.id,
        original_product_image_url: imageUrl,
        status: "pending",
        total_cost_eur: 0,
        results_count: 0,
        prompt_generated: finalPrompt + " [GUEST GENERATION]"
      }
    })

    const generationModel = 'gemini-3.1-flash-image-preview'

    // GENERATE VIA AI ENGINE
    const aiResult = await generateImagesWithAI({
      qty: requestedQty,
      subcat: subcat as any,
      publicUrls: [imageUrl],
      userClarification: `Aspect Ratio: 4:5`,
      isOutfit: false,
      varianceEnabled: false,
      generationModel,
      taxonomyCat,
      taxonomyMode,
      taxonomySubcat,
      clientGender,
      detectedProductType
    })

    if (aiResult.generatedBase64s.length === 0) {
      await prisma.generationJob.update({ where: { id: newJob.id }, data: { status: 'failed', error_message: aiResult.errorMessages.join(', ') } })
      return NextResponse.json({ error: 'AI Generation failed', details: aiResult.errorMessages }, { status: 500 })
    }

    // Save outputs to Supabase Cloud
    const adminSupabase = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const timestamp = Date.now()
    const outputResults = []

    for (let i = 0; i < aiResult.generatedBase64s.length; i++) {
        const buffer = Buffer.from(aiResult.generatedBase64s[i], 'base64')
        const oFileName = `guest_output_${timestamp}_${i}.jpg`
        const { error: upErr } = await adminSupabase.storage.from('telegram-outputs').upload(oFileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
        })
        if (!upErr) {
            const { data: { publicUrl } } = adminSupabase.storage.from('telegram-outputs').getPublicUrl(oFileName)
            
            outputResults.push({
                url: publicUrl
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

    await prisma.generationJob.update({
        where: { id: newJob.id },
        data: { status: 'completed', results_count: outputResults.length }
    })

    return NextResponse.json({ success: true, results: outputResults, jobId: newJob.id })

  } catch (error) {
    console.error("Guest Web Generate Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
