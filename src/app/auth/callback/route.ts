import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const plan = searchParams.get('plan')
  let next = searchParams.get('next') ?? '/dashboard'

  if (plan && plan !== 'free_trial') {
    next = `/checkout?plan=${plan}`
  }

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Sync with our Prisma database
      const email = user.email?.toLowerCase()
      
      if (email) {
        // Find existing user or create a new one
        let dbUser = await prisma.user.findUnique({
          where: { email }
        })

        if (!dbUser) {
          // Registrations are active. Create new user with 10 free trial images.
          dbUser = await prisma.user.create({
            data: {
              email: email,
              role: 'client',
              images_allowance: 10, // 10 free trial images
              base_allowance: 10
            }
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
