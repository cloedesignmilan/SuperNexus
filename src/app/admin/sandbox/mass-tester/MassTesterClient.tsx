"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Play, CheckCircle, XCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { saveValidationFeedback } from '@/app/admin/actions';

type Cat = any;

export default function MassTesterClient({ categories }: { categories: Cat[] }) {
    const [womanUrl, setWomanUrl] = useState<string>('');
    const [manUrl, setManUrl] = useState<string>('');
    const [isUploadingWoman, setIsUploadingWoman] = useState(false);
    const [isUploadingMan, setIsUploadingMan] = useState(false);
    
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedSubcatIds, setSelectedSubcatIds] = useState<string[]>([]);
    const [generationQty, setGenerationQty] = useState<number>(5);
    const [isTesting, setIsTesting] = useState(false);
    
    const [progress, setProgress] = useState<{current: number, total: number, status: string}>({ current: 0, total: 0, status: '' });
    const [results, setResults] = useState<any[]>([]);

    const womanFileRef = useRef<HTMLInputElement>(null);
    const manFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedCategoryId) {
            const cat = categories.find((c: any) => c.id === selectedCategoryId);
            if (cat) {
                const allIds: string[] = [];
                for (const bm of cat.business_modes) {
                    for (const sub of bm.subcategories) {
                        allIds.push(sub.id);
                    }
                }
                setSelectedSubcatIds(allIds);
            }
        } else {
            setSelectedSubcatIds([]);
        }
    }, [selectedCategoryId, categories]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, gender: 'WOMAN' | 'MAN') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (gender === 'WOMAN') setIsUploadingWoman(true);
        else setIsUploadingMan(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/web/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                if (gender === 'WOMAN') setWomanUrl(data.url);
                else setManUrl(data.url);
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Errore durante l'upload.");
        } finally {
            if (gender === 'WOMAN') setIsUploadingWoman(false);
            else setIsUploadingMan(false);
        }
    };

    const startTest = async () => {
        if (!selectedCategoryId) return alert("Seleziona una categoria prima di avviare il test.");
        if (!womanUrl && !manUrl) return alert("Carica almeno un'immagine (Uomo o Donna) per avviare il test.");

        const category = categories.find((c: any) => c.id === selectedCategoryId);
        if (!category) return;

        // Raccogli tutte le sottocategorie
        const subcategoriesToTest: any[] = [];
        for (const bm of category.business_modes) {
            for (const sub of bm.subcategories) {
                if (selectedSubcatIds.includes(sub.id)) {
                    // Combina le info per passare all'API
                    subcategoriesToTest.push({
                        categorySlug: category.slug,
                        modeSlug: bm.slug,
                        presentationSlug: sub.slug,
                        subcatId: sub.id,
                        name: `${bm.name} > ${sub.name}`,
                        subcatObj: sub,
                        bmObj: bm
                    });
                }
            }
        }

        if (subcategoriesToTest.length === 0) return alert("Nessuna sottocategoria attiva trovata in questa categoria.");

        // Calcola totale test (se hai caricato entrambe le immagini, fai 2 test per sottocategoria)
        const testsToRun = [];
        for (const sub of subcategoriesToTest) {
            if (womanUrl) testsToRun.push({ ...sub, gender: 'WOMAN', url: womanUrl });
            if (manUrl) testsToRun.push({ ...sub, gender: 'MAN', url: manUrl });
        }

        setIsTesting(true);
        setResults([]);
        setProgress({ current: 0, total: testsToRun.length, status: 'Inizializzazione...' });

        const newResults: any[] = [];

        for (let i = 0; i < testsToRun.length; i++) {
            const test = testsToRun[i];
            setProgress({ current: i + 1, total: testsToRun.length, status: `Generazione in corso: ${test.name} (${test.gender})` });

            try {
                let taxonomyModeMapped = test.bmObj.name;
                if (taxonomyModeMapped.includes('UGC')) taxonomyModeMapped = 'UGC';
                else if (taxonomyModeMapped.includes('Catalog') || taxonomyModeMapped.includes('Ecommerce') || taxonomyModeMapped.includes('Clean')) taxonomyModeMapped = 'Clean Catalog';
                else if (taxonomyModeMapped.includes('Ad') || taxonomyModeMapped.includes('Scroll')) taxonomyModeMapped = 'Ads / Scroll Stopper';
                else if (taxonomyModeMapped.includes('Detail') || taxonomyModeMapped.includes('Texture')) taxonomyModeMapped = 'Detail / Texture';
                else if (taxonomyModeMapped.includes('Model') || taxonomyModeMapped.includes('Studio')) taxonomyModeMapped = 'Model Studio';
                else taxonomyModeMapped = 'Lifestyle';

                const payload = {
                    imageUrl: test.url,
                    finalPrompt: "Taxonomy Mass Tester Auto Prompt",
                    negativePrompt: "text, watermark, poorly rendered, ugly, deformed, blurry",
                    qty: generationQty,
                    aspectRatio: "4:5",
                    taxonomyCat: category.slug,
                    taxonomyMode: taxonomyModeMapped,
                    taxonomySubcat: test.subcatObj.name,
                    clientGender: test.gender,
                    detectedProductType: category.slug
                };

                const res = await fetch('/api/web/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                const imagesArray = data.results ? data.results.map((r: any) => r.url) : (data.images || []);
                
                newResults.push({
                    ...test,
                    success: res.ok,
                    images: imagesArray,
                    error: data.error || null
                });

                // Add to Analisi e Feedback
                if (res.ok && imagesArray.length > 0) {
                    try {
                        const taxonomyReadableGlobal = `${category.name} > ${test.bmObj.name} > ${test.subcatObj.name}`;
                        await saveValidationFeedback(
                            test.subcatObj.id,
                            taxonomyReadableGlobal,
                            imagesArray,
                            "Mass Test Generation", 
                            test.url,
                            data.modelUsed || "gemini-3.1-flash-image-preview",
                            undefined,
                            test.gender
                        );
                    } catch (e) {
                        console.error("Auto-save feedback failed for Mass Test", e);
                    }
                }

            } catch (err: any) {
                newResults.push({
                    ...test,
                    success: false,
                    images: [],
                    error: err.message || "Errore di rete"
                });
            }

            // Aggiorna la vista man mano che arrivano i risultati
            setResults([...newResults]);
        }

        setProgress({ current: testsToRun.length, total: testsToRun.length, status: 'Test completato.' });
        setIsTesting(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* SETUP SECTION */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                
                {/* Uploaders */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* WOMAN */}
                    <div 
                        onClick={() => womanFileRef.current?.click()}
                        style={{ width: '150px', height: '200px', border: '2px dashed #444', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: womanUrl ? '#111' : '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
                        {womanUrl ? (
                            <img src={womanUrl} alt="Woman Ref" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <>
                                {isUploadingWoman ? <Loader2 className="animate-spin" size={24} color="#888" /> : <Upload size={24} color="#888" />}
                                <span style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px' }}>Upload Woman</span>
                            </>
                        )}
                        <input type="file" ref={womanFileRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUpload(e, 'WOMAN')} />
                    </div>

                    {/* MAN */}
                    <div 
                        onClick={() => manFileRef.current?.click()}
                        style={{ width: '150px', height: '200px', border: '2px dashed #444', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: manUrl ? '#111' : '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
                        {manUrl ? (
                            <img src={manUrl} alt="Man Ref" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <>
                                {isUploadingMan ? <Loader2 className="animate-spin" size={24} color="#888" /> : <Upload size={24} color="#888" />}
                                <span style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px' }}>Upload Man</span>
                            </>
                        )}
                        <input type="file" ref={manFileRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUpload(e, 'MAN')} />
                    </div>
                </div>

                {/* Controls */}
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #222' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Seleziona Categoria da testare:</label>
                        <select 
                            value={selectedCategoryId} 
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            style={{ padding: '10px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', outline: 'none' }}>
                            <option value="">-- Scegli Categoria --</option>
                            {categories.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name} ({c.business_modes.reduce((acc: number, bm: any) => acc + bm.subcategories.length, 0)} subcats)</option>
                            ))}
                        </select>
                    </div>

                    {selectedCategoryId && (() => {
                        const activeCategory = categories.find((c: any) => c.id === selectedCategoryId);
                        if (!activeCategory) return null;
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Sottocategorie da lanciare:</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={() => {
                                                const allIds: string[] = [];
                                                activeCategory.business_modes.forEach((bm: any) => {
                                                    bm.subcategories.forEach((sub: any) => allIds.push(sub.id));
                                                });
                                                setSelectedSubcatIds(allIds);
                                            }}
                                            style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                            Seleziona Tutte
                                        </button>
                                        <button 
                                            onClick={() => setSelectedSubcatIds([])}
                                            style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                            Rimuovi Tutte
                                        </button>
                                    </div>
                                </div>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#000', border: '1px solid #333', borderRadius: '4px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {activeCategory.business_modes.map((bm: any) => (
                                        <div key={bm.id} style={{ marginBottom: '5px' }}>
                                            <strong style={{ color: '#03dac6', fontSize: '0.85rem' }}>{bm.name}</strong>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px', paddingLeft: '10px' }}>
                                                {bm.subcategories.map((sub: any) => (
                                                    <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedSubcatIds.includes(sub.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedSubcatIds([...selectedSubcatIds, sub.id]);
                                                                else setSelectedSubcatIds(selectedSubcatIds.filter((id: string) => id !== sub.id));
                                                            }}
                                                            style={{ accentColor: '#03dac6', width: '16px', height: '16px' }}
                                                        />
                                                        <span style={{ color: '#ddd', fontSize: '0.85rem' }}>{sub.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Quantità per sottocategoria (1-5):</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="5" 
                            value={generationQty} 
                            onChange={(e) => setGenerationQty(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                            style={{ padding: '10px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', outline: 'none' }}
                        />
                    </div>

                    <button 
                        onClick={startTest}
                        disabled={isTesting || !selectedCategoryId || (!womanUrl && !manUrl)}
                        style={{ 
                            marginTop: 'auto', 
                            padding: '12px', 
                            background: isTesting ? '#333' : '#03dac6', 
                            color: isTesting ? '#888' : '#000', 
                            border: 'none', 
                            borderRadius: '4px', 
                            fontWeight: 'bold', 
                            cursor: isTesting || !selectedCategoryId || (!womanUrl && !manUrl) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                        {isTesting ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                        {isTesting ? 'Test in corso...' : 'Avvia Test Massivo'}
                    </button>

                    {progress.total > 0 && (
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>
                                <span>{progress.status}</span>
                                <span>{progress.current} / {progress.total}</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#03dac6', width: `${(progress.current / progress.total) * 100}%`, transition: 'width 0.3s ease' }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RESULTS GRID */}
            {results.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <h2 style={{ fontSize: '1.2rem', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Risultati Generazione ({results.length})</h2>
                    
                    {results.map((res, idx) => (
                        <div key={idx} style={{ background: '#111', borderRadius: '8px', border: `1px solid ${res.success ? '#222' : '#ff5470'}`, overflow: 'hidden' }}>
                            <div style={{ padding: '10px 15px', background: '#1a1a1c', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {res.success ? <CheckCircle size={16} color="#03dac6" /> : <XCircle size={16} color="#ff5470" />}
                                    <strong style={{ fontSize: '1rem', color: '#ddd' }}>{res.name}</strong>
                                    <span style={{ padding: '2px 8px', background: '#333', borderRadius: '12px', fontSize: '0.7rem', color: '#aaa' }}>{res.gender}</span>
                                </div>
                                {res.error && <span style={{ color: '#ff5470', fontSize: '0.85rem' }}>{res.error}</span>}
                            </div>
                            
                            <div style={{ padding: '15px', display: 'flex', gap: '15px', overflowX: 'auto' }}>
                                {res.success && res.images.length === 0 && (
                                    <span style={{ color: '#888', fontSize: '0.9rem' }}>Nessuna immagine restituita.</span>
                                )}
                                {res.images.map((imgUrl: string, imgIdx: number) => (
                                    <div key={imgIdx} style={{ width: '200px', height: '266px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', background: '#0a0a0a', position: 'relative' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={imgUrl} alt="Generated" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: '5px', left: '5px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                                            Shot {imgIdx + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
        </div>
    );
}
