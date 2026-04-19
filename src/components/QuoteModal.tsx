"use client";

import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    website: '',
    garmentType: '',
    aesthetic: '',
    modelCount: '1'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/request-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to send request');
      }

      // Track Meta Pixel Event for Lead Generation
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#111',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        border: '1px solid #333'
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={20} />
        </button>

        <div style={{ padding: '40px' }}>
          
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle2 size={64} color="#ccff00" style={{ margin: '0 auto 20px' }} />
              <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '10px' }}>Request Sent!</h2>
              <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: 1.5 }}>
                Thank you for your interest. Our team will review your requirements and get back to you with a custom quote shortly.
              </p>
              <button 
                onClick={onClose}
                style={{
                  marginTop: '30px',
                  padding: '12px 30px',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  borderRadius: '30px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 10px 0' }}>Request Custom Models</h2>
                <p style={{ color: '#888', margin: 0, fontSize: '1rem', lineHeight: 1.5 }}>
                  Fill out the details below to help us understand your brand's specific needs. We'll get back to you with a personalized quote.
                </p>
              </div>

              {error && (
                <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff5470', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>Full Name *</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      style={{ width: '100%', padding: '12px 16px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>Company / Brand *</label>
                    <input 
                      required
                      type="text" 
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your Brand Ltd."
                      style={{ width: '100%', padding: '12px 16px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>Email Address *</label>
                    <input 
                      required
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      style={{ width: '100%', padding: '12px 16px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>Website / Instagram</label>
                    <input 
                      type="text" 
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="www.brand.com or @brand"
                      style={{ width: '100%', padding: '12px 16px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>What do you sell? *</label>
                  <input 
                    required
                    type="text" 
                    name="garmentType"
                    value={formData.garmentType}
                    onChange={handleChange}
                    placeholder="e.g. Formal dresses, Streetwear T-shirts, Footwear..."
                    style={{ width: '100%', padding: '12px 16px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>Desired Aesthetic / Background Needs *</label>
                  <textarea 
                    required
                    name="aesthetic"
                    value={formData.aesthetic}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the style, location, or vibe you want for your generated images..."
                    style={{ width: '100%', padding: '12px 16px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>How many custom categories/subcategories?</label>
                  <select 
                    name="modelCount"
                    value={formData.modelCount}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px 16px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff', outline: 'none', appearance: 'none' }}
                  >
                    <option value="1">1 Category</option>
                    <option value="2-3">2-3 Categories</option>
                    <option value="4+">4+ Categories</option>
                    <option value="Not sure">Not sure yet</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ 
                    marginTop: '10px',
                    width: '100%', 
                    padding: '16px', 
                    fontWeight: '900', 
                    background: '#ccff00', 
                    color: '#000', 
                    border: 'none', 
                    textAlign: 'center', 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '1.1rem', 
                    boxShadow: '0 4px 15px rgba(204,255,0,0.2)', 
                    borderRadius: '12px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Sending Request...' : 'Submit Request'} <Send size={20} />
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
