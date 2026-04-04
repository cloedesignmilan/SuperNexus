'use client';

import { useState } from 'react';
import { loginAction } from './actions';
import { Lock, User } from 'lucide-react';

export default function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await loginAction(formData);
        if (result?.error) {
            setError(result.error);
        }
        setLoading(false);
    }

    return (
        <form action={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            {error && (
                <div style={{padding: '15px', background: 'rgba(255, 60, 60, 0.1)', color: '#ff6b6b', borderRadius: '8px', border: '1px solid rgba(255, 60, 60, 0.3)', textAlign: 'center'}}>
                    {error}
                </div>
            )}
            
            <div>
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#a0a0a0', marginBottom: '8px', fontSize: '0.9rem'}}>
                    <User size={16} /> Nome Negozio
                </label>
                <input type="text" name="slug" placeholder="Es. magazzini-emilio" required
                       style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem'}} />
            </div>

            <div>
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#a0a0a0', marginBottom: '8px', fontSize: '0.9rem'}}>
                    <Lock size={16} /> Password Portale
                </label>
                <input type="password" name="password" placeholder="Inserisci la password secreta" required
                       style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem'}} />
            </div>

            <button type="submit" disabled={loading} style={{padding: '18px', background: 'linear-gradient(to right, #bb86fc, #03dac6)', color: '#000', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', boxShadow: '0 4px 15px rgba(3, 218, 198, 0.3)'}}>
                {loading ? 'Accesso in corso...' : 'Entra nel Portale'}
            </button>
        </form>
    );
}
