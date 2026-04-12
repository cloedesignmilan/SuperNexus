"use client";
import React from 'react';
import './testimonials.css';
import { Star } from 'lucide-react';

const testimonialsRow1 = [
  { text: "An absolute game changer. I used to spend thousands of dollars a year on photographers and models. Now the entire budget goes into ads.", author: "Martina V.", role: "Women's Boutique Owner" },
  { text: "Incredible how it respects the fabric texture. Sales generated from Instagram stories have objectively doubled in two months.", author: "David S.", role: "Fashion E-Commerce" },
  { text: "As soon as we uploaded the catalog generated with SuperNexus, our flagship items sold out. They look like stolen catwalk shots.", author: "Julia L.", role: "Store Manager" },
  { text: "My clients think I hired a prestigious agency from Milan. No one knows I do everything from the back of the store on Telegram.", author: "Francesca G.", role: "Concept Store Owner" },
  { text: "I save 3 hours a week on shooting. I take a picture of the mannequin and publish editorial photos. I would NEVER go back.", author: "Lorenzo M.", role: "Clothing Outlet" },
];

const testimonialsRow2 = [
  { text: "I had strong doubts about formal wear. Instead, Artificial Intelligence manages to define lace and tulle perfectly.", author: "Elena R.", role: "Bridal Atelier & Ceremony" },
  { text: "No more sizing or fit problems. The AI wears the garment and models it on digital mannequins, proportioning it to the best.", author: "Sarah D.", role: "Curvy Boutique" },
  { text: "The feature for menswear has crazy visual quality. Now we use these images directly to run Facebook Ads.", author: "Mark P.", role: "Menswear Store" },
  { text: "It allowed us to launch weekly capsule collections without having to organize mini-shoots every Friday. Innovative.", author: "Valentina F.", role: "Multi-Brand Store" },
  { text: "It's so intuitive that the sales assistants started using it. They now create the social media content for the store during downtime.", author: "Robert T.", role: "Retail Entrepreneur" },
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
        <h2 className="section-title">Over 100 shop owners<br/>have already made the switch.</h2>
        <p>Discover what the pioneers of AI applied to retail are saying.</p>
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
