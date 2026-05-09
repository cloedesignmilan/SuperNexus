import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import GalleryCard from './GalleryCard'
import { GalleryHeader, GalleryEmptyState } from './GalleryTextsClient'
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
    
    return {
      url: img.image_url,
      path: job.category?.name?.toUpperCase() || 'CUSTOM'
    };
  });

  return (
    <div>
      <GalleryHeader />

      {userGalleryItems.length === 0 ? (
        <GalleryEmptyState />
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
