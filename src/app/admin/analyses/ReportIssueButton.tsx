"use client";

import React, { useState } from 'react';
import { MessageSquareWarning, X } from 'lucide-react';

interface ReportIssueButtonProps {
    path: string;
    shotBadge: number;
}

export default function ReportIssueButton({ path, shotBadge }: ReportIssueButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reportText, setReportText] = useState('');
    const [reportImageUrl, setReportImageUrl] = useState('');

    const handleCopyReport = () => {
        let msg = `🔧 **FIX REQUIRED FOR SINGLE SHOT**\nPath: \`${path}\` | Shot: \`${shotBadge}\`\n\n**Feedback from Testing:**\n"${reportText}"`;
        if (reportImageUrl.trim()) {
            msg += `\n\n**Reference Image for Desired Result:**\n${reportImageUrl.trim()}`;
        }
        msg += `\n\n_Please adjust the PromptConfigShot for this exact shot to fix the issue._`;
        
        navigator.clipboard.writeText(msg);
        alert('Copied to clipboard! Paste this message in your chat with Antigravity.');
        setIsOpen(false);
        setReportText('');
        setReportImageUrl('');
    };

    return (
        <>
            <button 
                onClick={(e) => { e.preventDefault(); setIsOpen(true); }}
                style={{ 
                    width: '100%', 
                    padding: '6px', 
                    background: 'rgba(255, 209, 102, 0.1)', 
                    border: '1px solid rgba(255, 209, 102, 0.3)', 
                    color: '#ffd166', 
                    borderRadius: '8px', 
                    fontSize: '0.65rem', 
                    fontWeight: 700, 
                    cursor: 'pointer', 
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                }}
            >
                <MessageSquareWarning size={12} /> Segnala Errore
            </button>

            {isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'left' }}>
                    <div className="glass-card" style={{ width: '500px', background: '#1c1c1e', border: '1px solid rgba(255,209,102,0.3)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ color: '#ffd166', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                                <MessageSquareWarning size={20} /> Report Issue per Scatto {shotBadge}
                            </h3>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                            Percorso: <strong>{path}</strong>
                        </p>
                        <textarea
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            placeholder="es. La modella non guarda in camera, fai in modo che l'inquadratura sia frontale."
                            style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', resize: 'none' }}
                        />
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Reference Image URL (Opzionale)</label>
                            <input
                                type="text"
                                value={reportImageUrl}
                                onChange={(e) => setReportImageUrl(e.target.value)}
                                placeholder="https://..."
                                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.9rem', padding: '0.6rem 1rem', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <button 
                            onClick={handleCopyReport} 
                            disabled={!reportText.trim()}
                            style={{ padding: '0.8rem', background: '#ffd166', color: '#1c1c1e', border: 'none', borderRadius: '12px', cursor: !reportText.trim() ? 'not-allowed' : 'pointer', fontWeight: 700, marginTop: '1rem', opacity: !reportText.trim() ? 0.5 : 1 }}
                        >
                            Copy AI Command to Clipboard
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
