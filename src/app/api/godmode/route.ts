import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }

    // God Mode: set role to admin
    await prisma.user.update({
      where: { email: user.email.toLowerCase() },
      data: { role: 'admin', subscription_active: true }
    })

    // Ritorna alla dashboard
    return NextResponse.redirect(new URL('/dashboard?msg=godmode_on', req.url))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to activate God Mode' }, { status: 500 })
  }
}
