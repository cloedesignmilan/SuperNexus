"use client";

import React from 'react';
import { 
  Shirt, Footprints, Sparkles, Heart, Briefcase, Baby, 
  Camera, ShoppingBag, Smartphone, Image as ImageIcon,
  Sun, UserCheck, Star, Building, Trees, MapPin
} from 'lucide-react';

const CATEGORY_STRUCTURE = [
  {
    name: "T-Shirt & Knitwear",
    icon: <Shirt size={20} className="text-blue-400" />,
    color: "rgba(59, 130, 246, 0.2)",
    border: "rgba(59, 130, 246, 0.4)",
    subcategories: [
      { name: "Streetwear FlatLay", icon: <Camera size={12} /> },
      { name: "E-Commerce Clean", icon: <ShoppingBag size={12} /> },
      { name: "UGC Content", icon: <Smartphone size={12} /> },
    ]
  },
  {
    name: "Footwear & Sneakers",
    icon: <Footprints size={20} className="text-orange-400" />,
    color: "rgba(249, 115, 22, 0.2)",
    border: "rgba(249, 115, 22, 0.4)",
    subcategories: [
      { name: "Sneakers Donna", icon: <Star size={12} /> },
      { name: "Product Clean", icon: <ShoppingBag size={12} /> },
      { name: "Tacchi Eleganti", icon: <Sparkles size={12} /> },
      { name: "On Feet Urban", icon: <MapPin size={12} /> },
    ]
  },
  {
    name: "Women's Fashion",
    icon: <Sparkles size={20} className="text-purple-400" />,
    color: "rgba(168, 85, 247, 0.2)",
    border: "rgba(168, 85, 247, 0.4)",
    subcategories: [
      { name: "Mannequin Display", icon: <UserCheck size={12} /> },
      { name: "Runway Editorial", icon: <Star size={12} /> },
      { name: "Luxury Villa", icon: <Building size={12} /> },
      { name: "Instagram Style", icon: <Smartphone size={12} /> },
      { name: "Mature Sophistication", icon: <Heart size={12} /> },
      { name: "Gym & Fitness", icon: <Sun size={12} /> },
      { name: "Outfit Coordination", icon: <ImageIcon size={12} /> },
    ]
  },
  {
    name: "Men's Apparel",
    icon: <Briefcase size={20} className="text-emerald-400" />,
    color: "rgba(16, 185, 129, 0.2)",
    border: "rgba(16, 185, 129, 0.4)",
    subcategories: [
      { name: "Ecommerce Studio", icon: <ShoppingBag size={12} /> },
      { name: "Street Style", icon: <MapPin size={12} /> },
      { name: "Silver Fox Luxury", icon: <Star size={12} /> },
      { name: "Executive Lifestyle", icon: <Building size={12} /> },
    ]
  },
  {
    name: "Bridal & Groom",
    icon: <Heart size={20} className="text-rose-400" />,
    color: "rgba(244, 63, 94, 0.2)",
    border: "rgba(244, 63, 94, 0.4)",
    subcategories: [
      { name: "Bridal Collection", icon: <Sparkles size={12} /> },
      { name: "Groom Collection", icon: <UserCheck size={12} /> },
    ]
  },
  {
    name: "Kids Collection",
    icon: <Baby size={20} className="text-yellow-400" />,
    color: "rgba(234, 179, 8, 0.2)",
    border: "rgba(234, 179, 8, 0.4)",
    subcategories: [
      { name: "Elegant Event", icon: <Star size={12} /> },
      { name: "Playful Lifestyle", icon: <Trees size={12} /> },
    ]
  },
];

export default function ShowcaseCategories() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto 4rem auto',
      padding: '0 20px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {CATEGORY_STRUCTURE.map((cat, idx) => (
          <div key={idx} style={{
            background: 'rgba(20, 20, 20, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
            e.currentTarget.style.border = `1px solid ${cat.border}`;
            e.currentTarget.style.boxShadow = `0 10px 30px ${cat.color}`;
            const glow = e.currentTarget.querySelector('.cat-glow') as HTMLElement;
            if (glow) glow.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.boxShadow = 'none';
            const glow = e.currentTarget.querySelector('.cat-glow') as HTMLElement;
            if (glow) glow.style.opacity = '0';
          }}>
            {/* Background Glow */}
            <div className="cat-glow" style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: `radial-gradient(circle at center, ${cat.color} 0%, transparent 60%)`,
              opacity: 0,
              transition: 'opacity 0.4s ease',
              zIndex: 0,
              pointerEvents: 'none'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Macro Category Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: cat.color,
                  border: `1px solid ${cat.border}`
                }}>
                  {cat.icon}
                </div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1.2rem', 
                  fontWeight: 600, 
                  color: '#fff',
                  letterSpacing: '-0.02em'
                }}>
                  {cat.name}
                </h3>
              </div>

              {/* Subcategories Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {cat.subcategories.map((sub, i) => (
                  <span key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    color: '#aaa',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.color = '#aaa';
                  }}>
                    <span style={{ opacity: 0.7 }}>{sub.icon}</span>
                    {sub.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
