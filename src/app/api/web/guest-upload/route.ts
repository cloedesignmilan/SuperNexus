import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    // 1. Parse Form Data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 2. Upload to Supabase Storage using Admin Key
    const adminSupabase = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const timestamp = Date.now()
    const fileName = `guest_${timestamp}_${Math.floor(Math.random() * 1000)}.jpg`

    const { data, error } = await adminSupabase.storage
      .from('telegram-uploads')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true
      })

    if (error) {
      console.error("Upload Error:", error)
      return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 })
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = adminSupabase.storage
      .from('telegram-uploads')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl, fileName })
  } catch (error) {
    console.error("Web Upload Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
