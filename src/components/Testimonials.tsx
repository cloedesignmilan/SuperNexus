"use client";
import React from 'react';
import './testimonials.css';
import { Star } from 'lucide-react';

const testimonialsRow1 = [
  { text: "Un game changer assoluto. Prima spendevo migliaia di euro l'anno per fotografi e modelle. Adesso il budget va tutto in pubblicità.", author: "Martina V.", role: "Titolare Boutique Donna" },
  { text: "Incredibile come rispetti la trama dei tessuti. Le vendite generate dalle storie Instagram sono oggettivamente raddoppiate in due mesi.", author: "Davide S.", role: "E-Commerce Fashion" },
  { text: "Appena caricato il catalogo generato con SuperNexus abbiamo fatto sold-out dei capi di punta. Sembrano scatti rubati in passerella.", author: "Giulia L.", role: "Store Manager" },
  { text: "Le mie clienti credono che abbia ingaggiato un'agenzia prestigiosa da Milano. Nessuno sa che faccio tutto dal retro del negozio su Telegram.", author: "Francesca G.", role: "Proprietaria Concept Store" },
  { text: "Risparmio 3 ore a settimana di shooting. Scatto sul manichino e pubblico foto editoriali. Non tornerei MAI indietro.", author: "Lorenzo M.", role: "Outlet Abbigliamento" },
];

const testimonialsRow2 = [
  { text: "Avevo forti dubbi sugli abiti da cerimonia. Invece l'Intelligenza Artificiale riesce a definire i pizzi e i tulle perfettamente.", author: "Elena R.", role: "Atelier Sposa & Cerimonia" },
  { text: "Mai più problemi di taglie o vestibilità. L'IA indossa il capo e lo modella sui manichini digitali proporzionandolo al meglio.", author: "Sara D.", role: "Boutique Curvy" },
  { text: "La funzione per i capi da uomo ha una qualità visiva pazzesca. Adesso usiamo queste immagini direttamente per fare le Ads su Facebook.", author: "Marco P.", role: "Negozio Uomo" },
  { text: "Ci ha permesso di lanciare capsule collection settimanali senza dover organizzare mini-shooting ogni venerdì. Innovativo.", author: "Valentina F.", role: "Multi-Brand Store" },
  { text: "È così intuitivo che l'hanno iniziato ad usare le commesse. Ora creano loro stesse i contenuti social per il negozio nei momenti morti.", author: "Roberto T.", role: "Imprenditore Retail" },
];

const TestimonialCard = ({ item }: { item: any }) => (
  <div className="testimonial-card">
    <div className="testimonial-stars">
      <Star size={16} fill="#ccff00" color="#ccff00" />
      <Star size={16} fill="#ccff00" color="#ccff00" />
      <Star size={16} fill="#ccff00" color="#ccff00" />
      <Star size={16} fill="#ccff00" color="#ccff00" />
      <Star size={16} fill="#ccff00" color="#ccff00" />
    </div>
    <p className="testimonial-text">"{item.text}"</p>
    <div className="testimonial-author">
      <div className="avatar-circle">{item.author.charAt(0)}</div>
      <div>
        <h4>{item.author}</h4>
        <p>{item.role}</p>
      </div>
    </div>
  </div>
);

export default function Testimonials() {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-header">
        <h2 className="section-title">Più di 100 negozianti<br/>hanno già svoltato.</h2>
        <p>Scopri cosa dicono i pionieri dell'Intelligenza Artificiale applicata al retail.</p>
      </div>

      <div className="marquee-container">
        {/* ROW 1: Scorre a sinistra */}
        <div className="marquee-row marquee-left">
          <div className="marquee-track">
            {testimonialsRow1.map((item, i) => <TestimonialCard key={i} item={item} />)}
            {testimonialsRow1.map((item, i) => <TestimonialCard key={`dup-${i}`} item={item} />)}
          </div>
        </div>

        {/* ROW 2: Scorre a destra */}
        <div className="marquee-row marquee-right">
          <div className="marquee-track track-reverse">
            {testimonialsRow2.map((item, i) => <TestimonialCard key={i} item={item} />)}
            {testimonialsRow2.map((item, i) => <TestimonialCard key={`dup-${i}`} item={item} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
