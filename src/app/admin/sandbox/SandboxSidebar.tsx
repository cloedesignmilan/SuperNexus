"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Unlock, ChevronDown, ChevronRight } from 'lucide-react';
import { toggleVisibility, toggleLock } from '../actions';

type Cat = any;

export default function SandboxSidebar({ categories }: { categories: Cat[] }) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const router = useRouter();

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleToggleVis = async (id: string, type: 'category' | 'business_mode' | 'subcategory', current: boolean) => {
        await toggleVisibility(id, type, !current);
        router.refresh();
    };

    const handleToggleLock = async (id: string, type: 'category' | 'business_mode' | 'subcategory', current: boolean) => {
        await toggleLock(id, type, !current);
        router.refresh();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map((cat: Cat) => (
                <div key={cat.id} style={{ background: '#1c1c1e', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: expanded[cat.id] ? '1px solid #333' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }} onClick={() => toggleExpand(cat.id)}>
                            {expanded[cat.id] ? <ChevronDown size={16} color="#aaa" /> : <ChevronRight size={16} color="#aaa" />}
                            <strong style={{ fontSize: '0.9rem', color: cat.is_active ? '#fff' : '#666' }}>{cat.name}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleToggleVis(cat.id, 'category', cat.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                {cat.is_active ? <Eye size={16} color="#03dac6" /> : <EyeOff size={16} color="#666" />}
                            </button>
                            <button onClick={() => handleToggleLock(cat.id, 'category', cat.is_locked)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                {cat.is_locked ? <Lock size={16} color="#ff5470" /> : <Unlock size={16} color="#666" />}
                            </button>
                        </div>
                    </div>
                    
                    {expanded[cat.id] && (
                        <div style={{ paddingLeft: '16px', background: '#151515' }}>
                            {cat.business_modes.map((bm: Cat) => (
                                <div key={bm.id}>
                                    <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: expanded[bm.id] ? '1px solid #222' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }} onClick={() => toggleExpand(bm.id)}>
                                            {expanded[bm.id] ? <ChevronDown size={14} color="#888" /> : <ChevronRight size={14} color="#888" />}
                                            <span style={{ fontSize: '0.85rem', color: bm.is_active ? '#ddd' : '#555' }}>{bm.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleToggleVis(bm.id, 'business_mode', bm.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                                {bm.is_active ? <Eye size={14} color="#03dac6" /> : <EyeOff size={14} color="#555" />}
                                            </button>
                                            <button onClick={() => handleToggleLock(bm.id, 'business_mode', bm.is_locked)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                                {bm.is_locked ? <Lock size={14} color="#ff5470" /> : <Unlock size={14} color="#555" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {expanded[bm.id] && (
                                        <div style={{ paddingLeft: '24px', background: '#0a0a0a', paddingBottom: '8px' }}>
                                            {bm.subcategories.map((sub: Cat) => (
                                                <div key={sub.id} style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.8rem', color: sub.is_active ? '#bbb' : '#444' }}>{sub.name}</span>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => handleToggleVis(sub.id, 'subcategory', sub.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                                            {sub.is_active ? <Eye size={14} color="#03dac6" /> : <EyeOff size={14} color="#444" />}
                                                        </button>
                                                        <button onClick={() => handleToggleLock(sub.id, 'subcategory', sub.is_locked)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                                            {sub.is_locked ? <Lock size={14} color="#ff5470" /> : <Unlock size={14} color="#444" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
