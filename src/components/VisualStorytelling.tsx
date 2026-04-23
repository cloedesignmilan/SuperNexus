"use client";

import React from 'react';

export default function VisualStorytelling() {
  return (
    <section style={{ 
      position: 'relative', 
      minHeight: '85vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#000'
    }}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }}
      >
        <source src="/Video/video-breve.4mp4-compresso.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
