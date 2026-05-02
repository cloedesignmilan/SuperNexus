import { getCreazioniTree } from './getCreazioniData';
import CreazioniGallery from './CreazioniGallery';

export default function CreazioniPage() {
  const tree = getCreazioniTree('Creazioni');
  
  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
       <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
           <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
               <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1px', background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                   Vetrina Creazioni
               </h1>
               <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '1rem', fontSize: '1.1rem' }}>
                   Esplora tutti gli esempi visivi generabili dalla nostra intelligenza artificiale.
               </p>
           </div>
           
           <CreazioniGallery initialTree={tree} />
       </div>
    </div>
  );
}
