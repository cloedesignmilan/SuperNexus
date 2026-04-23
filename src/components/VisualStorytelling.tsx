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
      <style dangerouslySetInnerHTML={{__html: `
        .video-desktop { display: none; }
        .video-mobile { display: block; }
        @media (min-width: 768px) {
          .video-desktop { display: block; }
          .video-mobile { display: none; }
        }
        .bg-video {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: translate(-50%, -50%);
          z-index: 0;
        }
      `}} />

      {/* Background Video - Desktop */}
      <video
        className="video-desktop bg-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/Video/video-breve-compresso.mp4" type="video/mp4" />
      </video>

      {/* Background Video - Mobile */}
      <video
        className="video-mobile bg-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/Video/video-breve-mobile-compresso.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
