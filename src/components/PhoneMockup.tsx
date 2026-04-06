import React from 'react';

interface PhoneMockupProps {
  imgSrc: string;
  label?: string;
  className?: string;
}

export default function PhoneMockup({ imgSrc, label, className = '' }: PhoneMockupProps) {
  return (
    <div className={`phone-mockup ${className}`}>
      {label && <div className="mockup-floating-label">{label}</div>}
      <div className="phone-hardware">
        <div className="phone-notch"></div>
        <div className="phone-screen">
            <img src={imgSrc} alt="Scatto Telefono" className="phone-image" />
        </div>
      </div>
    </div>
  );
}
