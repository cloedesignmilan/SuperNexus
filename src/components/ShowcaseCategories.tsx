"use client";

import React from 'react';
import { Shirt, Footprints, Sparkles, Heart, Briefcase, Baby } from 'lucide-react';

const CATEGORY_TAGS = [
  { name: "T-Shirt & Knitwear", icon: <Shirt size={16} /> },
  { name: "Footwear & Sneakers", icon: <Footprints size={16} /> },
  { name: "Women's Fashion", icon: <Sparkles size={16} /> },
  { name: "Bridal", icon: <Heart size={16} /> },
  { name: "Groom & Formal", icon: <Briefcase size={16} /> },
  { name: "Men's Apparel", icon: <Briefcase size={16} /> },
  { name: "Kids Collection", icon: <Baby size={16} /> },
];

export default function ShowcaseCategories() {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '12px',
      maxWidth: '900px',
      margin: '0 auto 4rem auto',
      padding: '0 20px'
    }}>
      {CATEGORY_TAGS.map(cat => (
        <div key={cat.name} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '30px',
          color: '#e0e0e0',
          fontSize: '0.95rem',
          fontWeight: 500,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          cursor: 'default',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}>
          <span style={{ color: '#fff', opacity: 0.8 }}>{cat.icon}</span>
          {cat.name}
        </div>
      ))}
    </div>
  );
}
