import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { updateStoreTemplateAction } from './actions';
import { Settings, CreditCard, Sparkles, Download, Clock } from 'lucide-react';

export default async function PortalDashboard() {
    const cookieStore = await cookies();
    const session = cookieStore.get('store_session');
    if (!session?.value) redirect('/portal/login');

    const store = await prisma.store.findUnique({
        where: { id: session.value }
    });
    if (!store) redirect('/portal/login');

    const templates = await prisma.promptTemplate.findMany();

    // Fetch up to 50 latest images across jobs of this store
    // Since images are nested under GenerationJob, we can get the jobs and extract them
    const latestJobs = await prisma.generationJob.findMany({
        where: { store_id: store.id },
        orderBy: { createdAt: 'desc' },
        include: { images: true },
        take: 50 // We take max 50 jobs to be safe and extract their images
    });

    const allImages = latestJobs.flatMap(job => job.images);
    const displayedImages = allImages.slice(0, 50); // limit to 50 strict

    return (
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
            <header style={{marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 10px 0'}}>Bentornato, {store.name}</h1>
                <p style={{color: '#a0a0a0', fontSize: '1.1rem', margin: 0}}>Gestisci le tue foto AI, il tuo abbonamento e le preferenze del negozio.</p>
            </header>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '50px'}}>
                {/* INQUADRAMENTO ABBONAMENTO */}
                <div style={{background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '30px', border: '1px solid rgba(255,255,255,0.1)'}}>
                    <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', color: '#03dac6', marginTop: 0}}>
                        <CreditCard size={24} /> Piano Licenza Mensile
                    </h2>
                    <div style={{margin: '20px 0', display: 'flex', alignItems: 'baseline', gap: '10px'}}>
                        <span style={{fontSize: '3rem', fontWeight: 'bold'}}>€ {store.monthly_fee.toFixed(2)}</span>
                        <span style={{color: '#888'}}>/mese</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px'}}>
                        <div style={{width: '12px', height: '12px', borderRadius: '50%', background: store.is_active ? '#03dac6' : '#ff6b6b'}}></div>
                        <span style={{color: '#a0a0a0'}}>{store.is_active ? 'Licenza Attiva e Operativa' : 'Licenza Sospesa'}</span>
                    </div>
                    <button style={{width: '100%', padding: '15px', background: 'transparent', border: '1px solid #03dac6', color: '#03dac6', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}>
                        Gestisci Pagamento su Stripe (Demo)
                    </button>
                </div>

                {/* IMPOSTAZIONI STILE AI */}
                <div style={{background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '30px', border: '1px solid rgba(255,255,255,0.1)'}}>
                    <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', color: '#bb86fc', marginTop: 0}}>
                        <Sparkles size={24} /> Preferenze Fotografiche
                    </h2>
                    <p style={{color: '#a0a0a0', marginBottom: '20px', lineHeight: 1.5}}>
                        Scegli lo stile predominante delle tue prossime elaborazioni. Se non lo selezioni, l'IA analizzerà ogni capo e deciderà autonomamente l'ambiente più adatto.
                    </p>
                    <form action={updateStoreTemplateAction} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        <select name="default_template_id" defaultValue={store.default_template_id || ""}
                                style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '1rem'}}>
                            <option value="">-- Auto-Decisione AI Intelligente --</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                            ))}
                        </select>
                        <button type="submit" style={{width: '100%', padding: '15px', background: '#bb86fc', color: '#000', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer'}}>
                            Salva Preferenza Stile
                        </button>
                    </form>
                </div>
            </div>

            {/* GALLERIA RISERVATA */}
            <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                    <h2 id="gallery" style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.8rem', margin: 0}}>
                        <Clock size={28} /> Ultime 50 Generazioni
                    </h2>
                    <span style={{color: '#a0a0a0', fontSize: '0.9rem'}}>{displayedImages.length} foto in Cloud</span>
                </div>
                
                {displayedImages.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', color: '#888'}}>
                        Nessuna foto trovata.. Invia un'immagine al Bot per iniziare!
                    </div>
                ) : (
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px'}}>
                        {displayedImages.map(img => (
                            <div key={img.id} style={{position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '3/4', background: '#1a1a1a'}}>
                                {/* Immagine */}
                                {img.image_url.startsWith('data:') || img.image_url.startsWith('uploaded_storage_link') ? (
                                    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', color: '#555'}}>
                                        {/* Qui in ambiente reale avremmo il link. Per MVP abbiamo generato un base64 su Telegram ma simuliamo l'url. */}
                                        [File Originale spedito via Telegram Chat]
                                        <br/>{img.scene_type}
                                    </div>
                                ) : (
                                    <img src={img.image_url} alt="Generated" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                )}
                                
                                {/* Overlay e Scarica */}
                                <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                                    <span style={{fontSize: '0.8rem', color: '#fff', maxWidth: '70%'}}>{img.scene_type}</span>
                                    <a href={img.image_url !== 'uploaded_storage_link' ? `/api/download?url=${encodeURIComponent(img.image_url)}` : '#'} 
                                       style={{background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '6px', color: '#fff', textDecoration: 'none', display: 'flex', gap: '5px', alignItems: 'center', backdropFilter: 'blur(5px)'}}>
                                        <Download size={14} /> Download
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
        </div>
    );
}
