"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryEditor({ initialData, stores }: { initialData?: any, stores: any[] }) {
    const router = useRouter();
    const [name, setName] = useState(initialData?.name || "");
    const [storeId, setStoreId] = useState(initialData?.store_id || "");
    const [scenes, setScenes] = useState<string[]>(initialData?.scenes || ["A beautiful portrait..."]);
    const [saving, setSaving] = useState(false);

    const handleAddScene = () => {
        setScenes([...scenes, ""]);
    };

    const handleSceneChange = (index: number, val: string) => {
        const newScenes = [...scenes];
        newScenes[index] = val;
        setScenes(newScenes);
    };

    const handleRemoveScene = (index: number) => {
        setScenes(scenes.filter((_, i) => i !== index));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const endpoint = initialData?.id ? `/api/admin/categories/${initialData.id}` : `/api/admin/categories`;
            const method = initialData?.id ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    store_id: storeId || null,
                    scenes: scenes.filter(s => s.trim() !== '')
                })
            });

            if (res.ok) {
                router.push('/admin/categorie');
                router.refresh();
            } else {
                alert("Errore durante il salvataggio.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id || !confirm("Sicuro di voler eliminare questa categoria? Non sarà più disponibile su Telegram per nessuno.")) return;
        setSaving(true);
        const res = await fetch(`/api/admin/categories/${initialData.id}`, { method: 'DELETE' });
        if (res.ok) {
            router.push('/admin/categorie');
            router.refresh();
        }
        setSaving(false);
    };

    const inputStyle = {
        width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px', marginBottom: '20px'
    };

    return (
        <form onSubmit={handleSave}>
            <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Nome Categoria (Mostrato nel bottone Telegram)</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    style={inputStyle}
                    required
                    placeholder="Es. Sposi, Streetwear, Ecc..."
                />
            </div>

            <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Esclusività (Opzionale)</label>
                <select value={storeId} onChange={e => setStoreId(e.target.value)} style={inputStyle}>
                    <option value="">GLOBALE (Tutti i clienti possono usarla)</option>
                    {stores.map(s => (
                        <option key={s.id} value={s.id}>Solo per: {s.name}</option>
                    ))}
                </select>
            </div>

            <div style={{marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid #333', borderRadius: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <h3 style={{margin: 0}}>Scenes (I Prompts Inviati all'AI)</h3>
                    <button type="button" onClick={handleAddScene} style={{background: '#03dac6', color: 'black', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>+ Aggiungi Scena</button>
                </div>
                
                {scenes.map((scene, idx) => (
                    <div key={idx} style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                        <textarea 
                            value={scene}
                            onChange={(e) => handleSceneChange(idx, e.target.value)}
                            style={{...inputStyle, marginBottom: 0, minHeight: '80px', flex: 1}}
                            placeholder="Es. Modella che cammina in città bevendo caffè..."
                            required
                        />
                        <button type="button" onClick={() => handleRemoveScene(idx)} style={{background: '#ff5470', color: 'white', border: 'none', padding: '0 15px', borderRadius: '8px', cursor: 'pointer'}}>Rimuovi</button>
                    </div>
                ))}
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '40px'}}>
                {initialData?.id ? (
                    <button type="button" onClick={handleDelete} disabled={saving} style={{background: 'transparent', color: '#ff5470', border: '1px solid #ff5470', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
                        Elimina Definitivamente
                    </button>
                ) : <div></div>}
                <button type="submit" disabled={saving} style={{background: '#bb86fc', color: 'black', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem'}}>
                    {saving ? "Salvataggio..." : "Salva Categoria"}
                </button>
            </div>
        </form>
    );
}
