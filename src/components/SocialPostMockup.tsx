import React from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

interface SocialPostMockupProps {
  imgSrc: string;
  accountName?: string;
  likes?: string;
  label?: string;
  className?: string;
}

export default function SocialPostMockup({ imgSrc, accountName = 'luxury_boutique', likes = '1.240', label, className = '' }: SocialPostMockupProps) {
  return (
    <div className={`social-post-mockup ${className}`}>
      {label && <div className="mockup-floating-label">{label}</div>}
      <div className="social-card">
        <div className="social-header">
          <div className="social-user-info">
            <div className="social-avatar"></div>
            <div className="social-name">{accountName}</div>
          </div>
          <MoreHorizontal size={18} color="#666" />
        </div>
        
        <div className="social-image-wrapper">
          <img src={imgSrc} alt="Post" className="social-image" />
        </div>
        
        <div className="social-footer">
          <div className="social-actions">
             <div className="social-action-left">
               <Heart size={22} className="social-icon" />
               <MessageCircle size={22} className="social-icon" />
               <Send size={22} className="social-icon" />
             </div>
             <Bookmark size={22} className="social-icon" />
          </div>
          <div className="social-likes">Piace a <strong>{likes} persone</strong></div>
        </div>
      </div>
    </div>
  );
}
