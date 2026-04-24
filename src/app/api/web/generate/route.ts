import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { generateImagesWithAI } from '@/lib/ai/generate'
import { logApiCost } from '@/lib/gemini-cost'

export const maxDuration = 300 // Max duration for Vercel Hobby/Pro

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
    const { subcategoryId, imageUrls, qty, isOutfit, userClarification } = body

    if (!subcategoryId || !imageUrls || imageUrls.length === 0) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Cost verification
    const requestedQty = qty || 1
    const remaining = dbUser.images_allowance - dbUser.images_generated
    if (requestedQty > remaining && dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient credits', remaining }, { status: 402 })
    }

    // Fetch Subcategory config
    const subcat = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
      include: { business_mode: { include: { category: true } }, reference_images: true }
    })

    if (!subcat) {
      return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 })
    }

    // Check Settings
    const varianceSetting = await prisma.setting.findUnique({ where: { key: 'AI_SCENE_VARIANCE_ENABLED' }})
    const globalVariance = varianceSetting?.value === 'true'
    const varianceEnabled = subcat.scene_variance_active !== null ? subcat.scene_variance_active : globalVariance

    const activeModelSetting = await prisma.setting.findUnique({ where: { key: 'ACTIVE_GENERATION_MODEL' }})
    const generationModel = subcat.active_model || activeModelSetting?.value || 'gemini-3.1-flash-image-preview'

    // Create Pending Job
    const newJob = await prisma.generationJob.create({
      data: {
        user_id: dbUser.id,
        category_id: subcat.business_mode.category_id,
        business_mode_id: subcat.business_mode_id,
        subcategory_id: subcategoryId,
        original_product_image_url: imageUrls[0],
        status: "pending",
        total_cost_eur: 0,
        results_count: 0
      }
    })

    // GENERATE VIA AI ENGINE
    const aiResult = await generateImagesWithAI({
      qty: requestedQty,
      subcat,
      publicUrls: imageUrls,
      userClarification: userClarification || 'X',
      isOutfit: isOutfit || false,
      varianceEnabled,
      generationModel
    })

    if (aiResult.generatedBase64s.length === 0) {
      await prisma.generationJob.update({ where: { id: newJob.id }, data: { status: 'failed' } })
      return NextResponse.json({ error: 'AI Generation failed', details: aiResult.errorMessages }, { status: 500 })
    }

    // Log Costs
    if (aiResult.totalTokensIn > 0 || aiResult.totalTokensOut > 0) {
      await logApiCost("web_generation", generationModel, aiResult.totalTokensIn, aiResult.totalTokensOut, dbUser.id, aiResult.generatedBase64s.length)
    }

    // Save outputs to Supabase Cloud
    const adminSupabase = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const timestamp = Date.now()
    const outputUrls = []

    for (let i = 0; i < aiResult.generatedBase64s.length; i++) {
        const buffer = Buffer.from(aiResult.generatedBase64s[i], 'base64')
        const oFileName = `web_out_${dbUser.id}_${timestamp}_${i}.jpg`
        const { error: upErr } = await adminSupabase.storage.from('telegram-outputs').upload(oFileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
        })
        if (!upErr) {
            const { data: { publicUrl } } = adminSupabase.storage.from('telegram-outputs').getPublicUrl(oFileName)
            outputUrls.push(publicUrl)
        }
    }

    // Deduct Credits & Finalize Job
    await prisma.user.update({
        where: { id: dbUser.id },
        data: { images_generated: { increment: outputUrls.length } }
    })

    await prisma.generationJob.update({
        where: { id: newJob.id },
        data: { status: 'completed', results_count: outputUrls.length }
    })

    return NextResponse.json({ success: true, results: outputUrls, jobId: newJob.id })

  } catch (error) {
    console.error("Web Generate Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
