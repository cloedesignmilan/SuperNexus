"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryEditor({ initialData }: { initialData?: any }) {
    const router = useRouter();

    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [ageRange, setAgeRange] = useState(initialData?.age_range || "20-35");
    const [childAgeRange, setChildAgeRange] = useState(initialData?.child_age_range || "4-12");
    const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

    const [masterPromptText, setMasterPromptText] = useState(initialData?.prompt_master?.prompt_text || "");
    const [negativeRules, setNegativeRules] = useState(initialData?.prompt_master?.negative_rules || "");
    const [studioPromptsText, setStudioPromptsText] = useState(initialData?.prompt_master?.studio_prompts || "");

    const [scenes, setScenes] = useState<any[]>(initialData?.scenes || [ {title: "Scena 1", scene_text: ""} ]);
    const [saving, setSaving] = useState(false);
    
    // Bulk Import State
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkText, setBulkText] = useState("");

    const handleBulkImport = () => {
        const lines = bulkText.split('\n').filter(l => l.trim() !== '');
        if (lines.length === 0) {
            alert("Inserisci almeno una scena!");
            return;
        }
        if (lines.length > 20) {
            alert("Puoi importare un massimo di 20 scene alla volta!");
            return;
        }

        const newScenes = lines.map((line, idx) => {
            const parts = line.split('|');
            if (parts.length > 1) {
                return {
                    title: parts[0].trim(),
                    scene_text: parts.slice(1).join('|').trim()
                };
            } else {
                return {
                    title: `Scena ${scenes.length + idx + 1}`,
                    scene_text: line.trim()
                };
            }
        });

        setScenes([...scenes, ...newScenes]);
        setBulkText("");
        setShowBulkModal(false);
        alert(`Importate ${newScenes.length} scene con successo!`);
    };

    const handleAddScene = () => {
        setScenes([...scenes, {title: `Scena ${scenes.length + 1}`, scene_text: ""}]);
    };

    const handleSceneChange = (index: number, field: string, val: string) => {
        const newScenes = [...scenes];
        newScenes[index][field] = val;
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
                    description,
                    age_range: ageRange,
                    child_age_range: childAgeRange,
                    is_active: isActive,
                    prompt_master: {
                        title: `${name} Master`,
                        prompt_text: masterPromptText,
                        negative_rules: negativeRules,
                        studio_prompts: studioPromptsText
                    },
                    scenes: scenes.filter(s => s.scene_text.trim() !== '')
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

    const inputStyle = { width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px', marginBottom: '20px' };
    const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 'bold' as 'bold', color: '#03dac6' };

    return (
        <form onSubmit={handleSave} style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
            {/* BLOCCO CATEGORIA */}
            <div style={{padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid #333', borderRadius: '12px'}}>
                <h3 style={{marginTop: 0, marginBottom: '20px'}}>1. Setup Categoria</h3>
                
                <label style={labelStyle}>Nome Categoria (Appare su Telegram)</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} required placeholder="Es. Sposi, Streetwear, Ecc..." />

                <div style={{display: 'flex', gap: '20px'}}>
                    <div style={{flex: 1}}>
                        <label style={labelStyle}>Età Modelli (Adulti)</label>
                        <input type="text" value={ageRange} onChange={e => setAgeRange(e.target.value)} style={inputStyle} required placeholder="Es. 20-35" />
                    </div>
                    <div style={{flex: 1}}>
                        <label style={labelStyle}>Età Modelli (Bambini)</label>
                        <input type="text" value={childAgeRange} onChange={e => setChildAgeRange(e.target.value)} style={inputStyle} required placeholder="Es. 4-12" />
                    </div>
                </div>

                <label style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', cursor: 'pointer'}}>
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{width: '20px', height: '20px'}} />
                    Categoria Attiva (Visibile al pubblico)
                </label>
            </div>

            {/* BLOCCO PROMPT MASTER */}
            <div style={{padding: '20px', background: 'rgba(187, 134, 252, 0.05)', border: '1px solid #bb86fc', borderRadius: '12px'}}>
                <h3 style={{marginTop: 0, marginBottom: '20px', color: '#bb86fc'}}>2. Modulo Prompt Master</h3>
                <p style={{fontSize: '0.9rem', color: '#bbb', marginBottom: '20px'}}>Queste regole vengono applicate ad ogni singola generazione in questa categoria, indipendentemente dalla scena scelta.</p>

                <label style={labelStyle}>Regole Positive / Direttive (Es. Stile fotografico, Tipo di modella)</label>
                <textarea 
                    value={masterPromptText} onChange={e => setMasterPromptText(e.target.value)} required
                    style={{...inputStyle, minHeight: '120px'}}
                    placeholder="Realistic gorgeous fashion model photography, high contrast lighting..."
                />

                <label style={{...labelStyle, color: '#ff5470'}}>Regole Negative (Cosa NON deve generare)</label>
                <textarea 
                    value={negativeRules} onChange={e => setNegativeRules(e.target.value)}
                    style={{...inputStyle, minHeight: '80px', border: '1px solid #ff5470'}}
                    placeholder="No unrealistic anatomy, no cuts in the fabric..."
                />

                <label style={{...labelStyle, color: '#ffb300', marginTop: '10px'}}>Prompt Modalità Studio Speciale (Opzionale: 1 riga = 1 foto)</label>
                <p style={{fontSize: '0.85rem', color: '#bbb', marginBottom: '10px', marginTop: '-5px'}}>Se compilato, per categorie come Calzature sovrascrive le pose fisse in modalità "In Studio". Scrivi una posa per riga.</p>
                <textarea 
                    value={studioPromptsText} onChange={e => setStudioPromptsText(e.target.value)}
                    style={{...inputStyle, minHeight: '100px', border: '1px solid #ffb300'}}
                    placeholder="Es:&#10;Still life product photography, front view, pure white floor&#10;Still life product photography, side view..."
                />
            </div>

            {/* BLOCCO SCENE */}
            <div style={{padding: '20px', background: 'rgba(3, 218, 198, 0.05)', border: '1px solid #03dac6', borderRadius: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <div>
                        <h3 style={{margin: 0, color: '#03dac6'}}>3. Blocchi Scena (Ambiante & Azione)</h3>
                        <p style={{fontSize: '0.9rem', color: '#bbb', margin: '5px 0 0 0'}}>L'utente di Telegram potrà selezionare quale scena applicare al capo.</p>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button type="button" onClick={() => setShowBulkModal(!showBulkModal)} style={{background: '#bb86fc', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>Bulk Import</button>
                        <button type="button" onClick={handleAddScene} style={{background: '#03dac6', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>+ Aggiungi Scena</button>
                    </div>
                </div>

                {showBulkModal && (
                    <div style={{marginBottom: '25px', padding: '15px', background: 'rgba(187, 134, 252, 0.1)', borderRadius: '8px', border: '1px solid #bb86fc'}}>
                        <h4 style={{marginTop: 0, color: '#bb86fc'}}>Importazione Massiva (Max 20 righe)</h4>
                        <p style={{fontSize: '0.85rem', color: '#bbb', marginBottom: '10px'}}>Incolla una scena per riga. Formato opzionale: <code>Titolo | Testo Scena</code></p>
                        <textarea 
                            value={bulkText} 
                            onChange={e => setBulkText(e.target.value)} 
                            style={{...inputStyle, minHeight: '150px'}} 
                            placeholder="Es.&#10;Wedding Walk | Walking slowly through a wedding garden&#10;In the city wearing casual..."
                        />
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                            <button type="button" onClick={() => setShowBulkModal(false)} style={{background: 'transparent', color: '#fff', border: '1px solid #555', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer'}}>Annulla</button>
                            <button type="button" onClick={handleBulkImport} style={{background: '#bb86fc', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                                Importa {bulkText.split('\n').filter(l=>l.trim()!=='').length} Scene
                            </button>
                        </div>
                    </div>
                )}
                
                {scenes.map((scene, idx) => (
                    <div key={idx} style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <input 
                                type="text" value={scene.title} onChange={e => handleSceneChange(idx, 'title', e.target.value)} required
                                style={{...inputStyle, width: '70%', marginBottom: 0, padding: '8px'}} placeholder="Titolo Scena (Per Telegram)" 
                            />
                            <button type="button" onClick={() => handleRemoveScene(idx)} style={{background: '#ff5470', color: 'white', border: 'none', padding: '0 15px', borderRadius: '8px', cursor: 'pointer'}}>Rimuovi</button>
                        </div>
                        <textarea 
                            value={scene.scene_text} onChange={(e) => handleSceneChange(idx, 'scene_text', e.target.value)} required
                            style={{...inputStyle, marginBottom: 0, minHeight: '80px'}}
                            placeholder="Prompt ambientazione (Es. Modella che cammina in una strada parigina acciottolata...)"
                        />
                    </div>
                ))}
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                {initialData?.id ? (
                    <button type="button" onClick={handleDelete} disabled={saving} style={{background: 'transparent', color: '#ff5470', border: '1px solid #ff5470', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
                        Elimina Categoria
                    </button>
                ) : <div></div>}
                <button type="submit" disabled={saving} style={{background: '#bb86fc', color: 'black', border: 'none', padding: '12px 40px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem'}}>
                    {saving ? "Salvataggio in corso..." : "Salva l'Architettura"}
                </button>
            </div>
        </form>
    );
}
