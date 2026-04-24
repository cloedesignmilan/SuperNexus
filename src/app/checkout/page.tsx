import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CheckoutClient from './CheckoutClient'

export default async function CheckoutPage(props: { searchParams: Promise<{ plan?: string }> }) {
    const searchParams = await props.searchParams;
    
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user || !user.email) {
        redirect('/auth')
    }

    const plan = searchParams?.plan;
    if (!plan || plan === 'free_trial') {
        redirect('/dashboard') // Nothing to buy
    }

    return (
       <CheckoutClient email={user.email} plan={plan} />
    )
}
