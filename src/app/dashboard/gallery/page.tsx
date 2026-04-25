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

  // 3. Fetch JobImages from Database instead of Supabase Storage directly
  const jobImages = await prisma.jobImage.findMany({
    where: {
      job: {
        user_id: dbUser.id
      }
    },
    include: {
      job: {
        include: {
          category: true,
          business_mode: true,
          subcategory: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  })

  // Generate objects with url and formatted path
  const userGalleryItems = jobImages.map(img => {
    const job = img.job;
    const pathParts = [];
    if (job.category) pathParts.push(job.category.name);
    if (job.business_mode) pathParts.push(job.business_mode.name);
    if (job.subcategory && job.subcategory.slug !== 'dynamic-engine') pathParts.push(job.subcategory.name);
    
    return {
      url: img.image_url,
      path: pathParts.join(' → ').toUpperCase() || 'CUSTOM CONFIGURATION'
    };
  });

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Gallery</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Your generated AI outputs from the last 24 hours.
        </p>
      </div>

      {userGalleryItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>
            No images generated in the last 24 hours. Head to the Studio to create some!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {userGalleryItems.map((item, i) => (
            <GalleryCard key={i} url={item.url} path={item.path} />
          ))}
        </div>
      )}
    </div>
  )
}
