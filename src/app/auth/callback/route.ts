import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

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
          // New user! Create them in our system with default allowances
          dbUser = await prisma.user.create({
            data: {
              email,
              role: 'user',
              bot_pin: Math.random().toString(36).substring(2, 8).toUpperCase(), // Generate a random 6 char PIN
              images_allowance: 10, // Default Free Trial amount
              images_generated: 0,
              base_allowance: 10,
              subscription_active: true,
              paypal_subscription_id: 'free_trial_oauth'
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
