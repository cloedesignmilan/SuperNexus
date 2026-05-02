import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    // 1. Verify User Session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const cookieStore = await cookies()
    const adminAuthCookie = cookieStore.get('supernexus_admin_auth')
    const isAdminPasskey = adminAuthCookie && adminAuthCookie.value === 'authenticated'

    if (!user && !isAdminPasskey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse Form Data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 3. Upload to Supabase Storage using Admin Key
    // We use the admin key here to upload to the same bucket Telegram uses.
    const adminSupabase = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const timestamp = Date.now()
    const userId = user ? user.id : 'admin_sandbox'
    const fileName = `web_${userId}_${timestamp}.jpg`

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

    // 4. Get Public URL
    const { data: { publicUrl } } = adminSupabase.storage
      .from('telegram-uploads')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl, fileName })
  } catch (error) {
    console.error("Web Upload Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
