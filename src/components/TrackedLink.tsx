"use client";

import React from 'react';
import Link from 'next/link';

interface TrackedLinkProps {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  eventName: string;
}

export default function TrackedLink({ href, className, style, children, eventName }: TrackedLinkProps) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', eventName);
    }
  };

  return (
    <Link href={href} className={className} style={style} onClick={handleClick}>
      {children}
    </Link>
  );
}
