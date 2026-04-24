import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import GalleryCard from './GalleryCard'
import "../../admin.css"

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const supabase = await createClient()

  // 1. Authenticate Request
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/auth')
  }

  // 2. Fetch Prisma User to get their db ID and potentially their Telegram ID
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email?.toLowerCase() }
  })

  if (!dbUser) {
    redirect('/auth')
  }

  // 3. Fetch files from Supabase Storage (both Web and Telegram generations)
  const adminSupabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: files, error: storageError } = await adminSupabase.storage
    .from('telegram-outputs')
    .list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  let userImages: string[] = []

  if (!storageError && files) {
    const webPrefix = `web_out_${dbUser.id}_`
    const tgPrefix = dbUser.telegram_chat_id ? `out_${dbUser.telegram_chat_id}_` : null

    // Filter files that belong to this user
    const userFiles = files.filter(f => 
      f.name.startsWith(webPrefix) || (tgPrefix && f.name.startsWith(tgPrefix))
    )

    // Generate public URLs
    userImages = userFiles.map(f => {
      const { data } = adminSupabase.storage.from('telegram-outputs').getPublicUrl(f.name)
      return data.publicUrl
    })
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Gallery</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Your generated AI outputs from the last 24 hours.
        </p>
      </div>

      {userImages.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>
            No images generated in the last 24 hours. Head to the Studio to create some!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {userImages.map((url, i) => (
            <GalleryCard key={i} url={url} />
          ))}
        </div>
      )}
    </div>
  )
}
