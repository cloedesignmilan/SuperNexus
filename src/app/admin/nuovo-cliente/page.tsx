import { createStoreAction } from './actions';
import Link from 'next/link';
import styles from '../page.module.css';

export default function NuovoClientePage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                  <h1 className={styles.title}>Registra Nuovo Cliente</h1>
                  <p style={{color: '#a0a0a0', marginTop: '10px'}}>Inizializza un nuovo Tenant e abbina la sua Intelligenza Artificiale</p>
                </div>
                <Link href="/admin" className={styles.primaryBtn} style={{background: 'rgba(255,255,255,0.05)', boxShadow: 'none', textDecoration: 'none'}}>← Torna a Dashboard</Link>
            </header>

            <form action={createStoreAction} className={styles.glassCard} style={{maxWidth: '600px', margin: '40px auto'}}>
                <div style={{marginBottom: '25px'}}>
                    <label style={{display: 'block', color: '#03dac6', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                        Nome Brand / Boutique *
                    </label>
                    <input name="name" type="text" required 
                           style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem'}} 
                           placeholder="Es. Boutique Carla" />
                </div>

                <div style={{marginBottom: '25px'}}>
                    <label style={{display: 'block', color: '#03dac6', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                        Telegram Bot Token
                    </label>
                    <p style={{color: '#888', fontSize: '0.8rem', marginBottom: '10px'}}>Crea un bot su @BotFather e incolla qui il token. Noi lo collegheremo in automatico in background!</p>
                    <input name="telegram_bot_token" type="text" 
                           style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#bb86fc', fontFamily: 'monospace', fontSize: '1rem'}} 
                           placeholder="Es. 123456789:ABCdefGHI..." />
                </div>

                <div style={{marginBottom: '35px'}}>
                    <label style={{display: 'block', color: '#03dac6', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                        Canone Premium Mensile (€) *
                    </label>
                    <input name="monthly_fee" type="number" step="0.01" defaultValue="199.00" required 
                           style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem'}} />
                </div>

                <button type="submit" className={styles.primaryBtn} style={{width: '100%', padding: '18px', fontSize: '1.1rem', letterSpacing: '1px'}}>
                    Crea & Inizializza Tenant
                </button>
            </form>
        </div>
    )
}
