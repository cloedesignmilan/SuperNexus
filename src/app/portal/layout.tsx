import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Image as ImageIcon, Settings, CreditCard, LayoutDashboard } from 'lucide-react';
import { logoutAction } from './login/actions';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const session = cookieStore.get('store_session');

    if (!session?.value) {
        redirect('/portal/login');
    }

    const store = await prisma.store.findUnique({
        where: { id: session.value }
    });

    if (!store) {
        redirect('/portal/login');
    }

    return (
        <div style={{display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif'}}>
            {/* Sidebar Negoziante */}
            <aside style={{width: '280px', background: '#121212', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '30px 20px', display: 'flex', flexDirection: 'column'}}>
                <div style={{marginBottom: '40px'}}>
                    <h2 style={{fontSize: '1.2rem', margin: 0, color: '#bb86fc', textTransform: 'uppercase', letterSpacing: '2px'}}>SuperNexus</h2>
                    <p style={{margin: '5px 0 0 0', color: '#a0a0a0', fontSize: '0.9rem'}}>L'IA di {store.name}</p>
                </div>

                <nav style={{display: 'flex', flexDirection: 'column', gap: '15px', flex: 1}}>
                    <Link href="/portal" style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontWeight: 500}}>
                        <LayoutDashboard size={20} /> Dashboard & Impostazioni
                    </Link>
                    <Link href="#gallery" style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', background: 'transparent', borderRadius: '8px', color: '#a0a0a0', textDecoration: 'none'}}>
                        <ImageIcon size={20} /> Galleria Fotografica
                    </Link>
                    <Link href="#billing" style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', background: 'transparent', borderRadius: '8px', color: '#a0a0a0', textDecoration: 'none'}}>
                        <CreditCard size={20} /> Abbonamento
                    </Link>
                </nav>

                <form action={logoutAction}>
                    <button type="submit" style={{width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', background: 'rgba(255, 60, 60, 0.1)', border: '1px solid rgba(255, 60, 60, 0.2)', borderRadius: '8px', color: '#ff6b6b', cursor: 'pointer', textAlign: 'left'}}>
                        <LogOut size={20} /> Esci Sicuro
                    </button>
                </form>
            </aside>

            {/* Main Content Area */}
            <main style={{flex: 1, padding: '40px 60px', overflowY: 'auto'}}>
                {children}
            </main>
        </div>
    );
}
