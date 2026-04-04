'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <button onClick={() => window.print()} className="print-hide" style={{background: '#bb86fc', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '1rem'}}>
            <Printer size={20} /> Stampa Resoconto
        </button>
    )
}
