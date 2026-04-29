"use client";
import React from 'react';
import './testimonials.css';
import { Star } from 'lucide-react';
import { Locale, dictionaries } from '@/lib/i18n/dictionaries';

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

interface TestimonialsProps {
  lang?: Locale;
}

export default function Testimonials({ lang = 'en' }: TestimonialsProps) {
  const t = dictionaries[lang];
  
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-header">
        <h2 className="section-title">{t.testimonials.title1}<br/>{t.testimonials.title2}</h2>
        <p>{t.testimonials.subtitle}</p>
      </div>

      <div className="marquee-container">
        {/* ROW 1: Scorre a sinistra */}
        <div className="marquee-row marquee-left">
          <div className="marquee-track">
            {t.testimonials.row1.map((item, i) => <TestimonialCard key={i} item={item} />)}
            {t.testimonials.row1.map((item, i) => <TestimonialCard key={`dup-${i}`} item={item} />)}
          </div>
        </div>

        {/* ROW 2: Scorre a destra */}
        <div className="marquee-row marquee-right">
          <div className="marquee-track track-reverse">
            {t.testimonials.row2.map((item, i) => <TestimonialCard key={i} item={item} />)}
            {t.testimonials.row2.map((item, i) => <TestimonialCard key={`dup-${i}`} item={item} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
