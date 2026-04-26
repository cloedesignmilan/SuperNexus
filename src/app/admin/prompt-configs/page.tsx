"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Copy, Download, Upload, Check, Loader2, Sparkles } from 'lucide-react';

interface PromptConfigShot {
  id: string;
  category: string;
  mode: string;
  presentation: string;
  scene: string | null;
  aspectRatio: string | null;
  shotNumber: number;
  shotName: string;
  positivePrompt: string;
  negativePrompt: string;
  hardRules: string;
  outputGoal: string | null;
  priority: number;
  isActive: boolean;
}

export default function PromptConfigsAdmin() {
  const [configs, setConfigs] = useState<PromptConfigShot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPromptId, setGeneratingPromptId] = useState<string | null>(null);
  const [showRawImport, setShowRawImport] = useState(false);
  const [rawJsonText, setRawJsonText] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [filterCat, setFilterCat] = useState('t-shirt');
  const [filterMode, setFilterMode] = useState('clean-catalog');
  const [filterScene, setFilterScene] = useState('all');
  
  // Master Taxonomy based on user request
  const categories = ['t-shirt', 'shoes', 'swimwear', 'dress', 'bags', 'jewelry'];
  const modes = ['clean-catalog', 'model-studio', 'lifestyle', 'ugc', 'ads', 'detail', 'variants'];
  const presentations = ['no-model', 'model'];
  
  // Extract unique scenes from configs
  const dynamicScenes = Array.from(new Set(configs.map(c => c.scene).filter(Boolean))) as string[];
  const scenes = Array.from(new Set(['all', 'studio', 'street', 'home', 'beach', ...dynamicScenes]));

  useEffect(() => {
    fetchConfigs();
  }, [filterCat]);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/prompt-configs?category=${filterCat}`);
      if (res.ok) {
        const data = await res.json();
        setConfigs(data);
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    const newConfig = {
      category: filterCat,
      mode: filterMode,
      presentation: 'no-model', // Default, can be changed in the editor
      scene: filterScene === 'all' ? 'studio' : filterScene,
      shotNumber: configs.length > 0 ? Math.max(...configs.map(c => c.shotNumber)) + 1 : 1,
      shotName: 'New Shot',
      positivePrompt: '',
      negativePrompt: '',
      hardRules: '',
      priority: 0,
      isActive: true
    };
    
    setSaving(true);
    const res = await fetch('/api/admin/prompt-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    });
    if (res.ok) {
      fetchConfigs();
    }
    setSaving(false);
  };

  const handleUpdate = async (config: PromptConfigShot) => {
    setSaving(true);
    await fetch('/api/admin/prompt-configs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    setSaving(true);
    await fetch(`/api/admin/prompt-configs?id=${id}`, { method: 'DELETE' });
    fetchConfigs();
    setSaving(false);
  };

  const handleDuplicate = async (config: PromptConfigShot) => {
    const dup = { ...config, shotNumber: config.shotNumber + 1, shotName: config.shotName + ' (Copy)' };
    // @ts-ignore - remove id to create new
    delete dup.id;
    
    setSaving(true);
    await fetch('/api/admin/prompt-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dup)
    });
    fetchConfigs();
    setSaving(false);
  };

  const handleExport = async () => {
    const res = await fetch('/api/admin/prompt-configs/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'export' })
    });
    const { data } = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-configs-backup.json`;
    a.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      setSaving(true);
      const res = await fetch('/api/admin/prompt-configs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', data })
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || 'Import failed');
      } else if (result.errors && result.errors.length > 0) {
        alert(`Import completed with ${result.errors.length} errors:\n\n${result.errors.join('\\n')}`);
      } else {
        alert(`Successfully imported ${result.count} prompt shots!`);
      }
      
      fetchConfigs();
    } catch (err) {
      alert("Invalid JSON file format");
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRawImport = async () => {
    if (!rawJsonText.trim()) return;
    try {
      const data = JSON.parse(rawJsonText);
      setSaving(true);
      const res = await fetch('/api/admin/prompt-configs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', data })
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || 'Import failed');
      } else if (result.errors && result.errors.length > 0) {
        alert(`Import completed with ${result.errors.length} errors:\n\n${result.errors.join('\\n')}`);
      } else {
        alert(`Successfully imported ${result.count} prompt shots!`);
        setRawJsonText('');
        setShowRawImport(false);
      }
      fetchConfigs();
    } catch (err) {
      alert("Invalid JSON format. Please check your syntax.");
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async (shotId: string, instruction: string) => {
    if (!instruction.trim()) {
      alert("Inserisci prima una descrizione per l'AI.");
      return;
    }
    
    setGeneratingPromptId(shotId);
    
    try {
      const shot = configs.find(c => c.id === shotId);
      if (!shot) return;

      const res = await fetch('/api/admin/prompt-configs/generate-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction,
          category: shot.category,
          mode: shot.mode,
          scene: shot.scene
        })
      });

      if (!res.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await res.json();
      
      const newConfigs = [...configs];
      const s = newConfigs.find(c => c.id === shotId);
      if (s) {
        s.positivePrompt = data.positivePrompt || s.positivePrompt;
        s.negativePrompt = data.negativePrompt || s.negativePrompt;
        s.hardRules = data.hardRules || s.hardRules;
      }
      setConfigs(newConfigs);
    } catch (e) {
      console.error(e);
      alert("Errore durante la generazione AI.");
    } finally {
      setGeneratingPromptId(null);
    }
  };

  const filteredConfigs = configs.filter(c => 
    c.mode === filterMode && 
    (filterScene === 'all' ? true : (c.scene && c.scene.toLowerCase().includes(filterScene.toLowerCase())))
  ).sort((a,b) => b.priority - a.priority || a.shotNumber - b.shotNumber);

  return (
    <div>
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'white' }}>Prompt Configs</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Manage AI generation prompts via Database.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="file" 
            accept=".json" 
            style={{ display: 'none' }}
            ref={fileInputRef} 
            onChange={handleImport} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            style={{ 
              padding: '0.8rem 1.5rem', background: 'rgba(0,210,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' 
            }}
          >
            <Upload size={18} /> Import JSON File
          </button>
          <button 
            onClick={() => setShowRawImport(!showRawImport)} 
            style={{ 
              padding: '0.8rem 1.5rem', background: 'rgba(230,46,191,0.2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' 
            }}
          >
            <Sparkles size={18} /> Paste JSON
          </button>
          <button 
            onClick={handleExport} 
            style={{ 
              padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' 
            }}
          >
            <Download size={18} /> Export JSON
          </button>
        </div>
      </div>

      {showRawImport && (
        <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(230,46,191,0.05)', border: '1px solid rgba(230,46,191,0.2)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'white', fontSize: '1.1rem' }}>Paste JSON Code</h3>
          <textarea
            value={rawJsonText}
            onChange={(e) => setRawJsonText(e.target.value)}
            placeholder="Paste your JSON array here... e.g. [{ category: 't-shirt', configs: [...] }]"
            style={{ width: '100%', height: '200px', background: 'rgba(0,0,0,0.5)', color: '#00ffcc', fontFamily: 'monospace', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', resize: 'vertical', marginBottom: '1rem' }}
          />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowRawImport(false)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', color: 'var(--color-text-muted)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button onClick={handleRawImport} disabled={saving} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Importing...' : 'Import Now'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
          <select 
            value={filterCat} 
            onChange={(e) => setFilterCat(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode</label>
          <select 
            value={filterMode} 
            onChange={(e) => setFilterMode(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
          >
            {modes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scene</label>
          <select 
            value={filterScene} 
            onChange={(e) => setFilterScene(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
          >
            {scenes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <button 
            onClick={handleCreate}
            disabled={saving}
            style={{ 
              padding: '0.8rem 1.5rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1
            }}
          >
            <Plus size={18} /> Add Shot
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : (
        <div className="space-y-6">
          {filteredConfigs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--color-card-border)' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No prompt shots found for this selection.</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', opacity: 0.8 }}>The AI will fallback to local JSON configs if they exist.</p>
            </div>
          ) : (
            filteredConfigs.map((shot, idx) => (
              <div key={shot.id} className="admin-card" style={{ overflow: 'hidden', transition: 'all 0.2s ease', border: '1px solid var(--color-card-border)' }}>
                
                {/* Header Row */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--color-card-border)' }}>
                  <div style={{ background: 'rgba(0,210,255,0.1)', color: 'var(--color-secondary)', fontFamily: 'monospace', fontWeight: 700, padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem', border: '1px solid rgba(0,210,255,0.2)' }}>
                    Shot {shot.shotNumber}
                  </div>
                  <input 
                    type="text" 
                    value={shot.shotName}
                    onChange={(e) => {
                      const newConfigs = [...configs];
                      const s = newConfigs.find(c => c.id === shot.id);
                      if (s) s.shotName = e.target.value;
                      setConfigs(newConfigs);
                    }}
                    className="bg-transparent text-lg font-bold text-white border-none focus:ring-0 w-64 p-0 placeholder-gray-600"
                    style={{ background: 'transparent', fontSize: '1.2rem', fontWeight: 700, color: 'white', border: 'none', outline: 'none', width: '250px' }}
                    placeholder="Shot Name..."
                  />
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', cursor: 'pointer', marginRight: '1rem' }}>
                      <input 
                        type="checkbox" 
                        checked={shot.isActive}
                        onChange={(e) => {
                          const newConfigs = [...configs];
                          const s = newConfigs.find(c => c.id === shot.id);
                          if (s) s.isActive = e.target.checked;
                          setConfigs(newConfigs);
                        }}
                        style={{ accentColor: 'var(--color-secondary)', width: '16px', height: '16px' }}
                      />
                      Active
                    </label>
                    <button onClick={() => handleUpdate(shot)} style={{ padding: '0.5rem', color: 'var(--color-success)', background: 'rgba(0,224,143,0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Save Changes">
                      <Save size={16} />
                    </button>
                    <button onClick={() => handleDuplicate(shot)} style={{ padding: '0.5rem', color: 'var(--color-secondary)', background: 'rgba(0,210,255,0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Duplicate Shot">
                      <Copy size={16} />
                    </button>
                    <button onClick={() => handleDelete(shot.id)} style={{ padding: '0.5rem', color: 'var(--color-danger)', background: 'rgba(255,77,109,0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete Shot">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Editor Body */}
                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1.5rem' }}>
                  {/* Meta Params */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '1.5rem', borderRight: '1px solid var(--color-card-border)' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>presentation</label>
                      <input type="text" value={shot.presentation} onChange={(e) => {
                        const newConfigs = [...configs];
                        const s = newConfigs.find(c => c.id === shot.id);
                        if (s) s.presentation = e.target.value;
                        setConfigs(newConfigs);
                      }} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.9rem', padding: '0.4rem 0.8rem', color: 'white', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>shot_number</label>
                      <input type="number" value={shot.shotNumber} onChange={(e) => {
                        const newConfigs = [...configs];
                        const s = newConfigs.find(c => c.id === shot.id);
                        if (s) s.shotNumber = Number(e.target.value);
                        setConfigs(newConfigs);
                      }} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.9rem', padding: '0.4rem 0.8rem', color: 'white', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>priority</label>
                      <input type="number" value={shot.priority} onChange={(e) => {
                        const newConfigs = [...configs];
                        const s = newConfigs.find(c => c.id === shot.id);
                        if (s) s.priority = Number(e.target.value);
                        setConfigs(newConfigs);
                      }} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.9rem', padding: '0.4rem 0.8rem', color: 'white', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>scene</label>
                      <select value={shot.scene || 'all'} onChange={(e) => {
                        const newConfigs = [...configs];
                        const s = newConfigs.find(c => c.id === shot.id);
                        if (s) s.scene = e.target.value;
                        setConfigs(newConfigs);
                      }} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.9rem', padding: '0.4rem 0.8rem', color: 'white', outline: 'none' }}>
                        {scenes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Prompts */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* AI Assistant Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(230, 46, 191, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(230, 46, 191, 0.2)' }}>
                      <div style={{ flex: 1 }}>
                        <input 
                          type="text" 
                          placeholder="✨ Describe how you want this shot in plain language (e.g., 'a single t-shirt lying flat on a wooden table, top down view')"
                          style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.9rem', padding: '0.6rem 1rem', color: 'white', outline: 'none' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAiGenerate(shot.id, e.currentTarget.value);
                            }
                          }}
                        />
                      </div>
                      <button 
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling?.querySelector('input');
                          if (input) handleAiGenerate(shot.id, input.value);
                        }}
                        disabled={generatingPromptId === shot.id}
                        style={{ padding: '0.6rem 1rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: generatingPromptId === shot.id ? 'wait' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', opacity: generatingPromptId === shot.id ? 0.7 : 1 }}
                      >
                        {generatingPromptId === shot.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} 
                        Auto-Write Prompt
                      </button>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Positive Prompt</label>
                      <textarea 
                        value={shot.positivePrompt}
                        onChange={(e) => {
                          const newConfigs = [...configs];
                          const s = newConfigs.find(c => c.id === shot.id);
                          if (s) s.positivePrompt = e.target.value;
                          setConfigs(newConfigs);
                        }}
                        rows={2}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,224,143,0.3)', borderRadius: '8px', fontSize: '0.9rem', padding: '0.8rem', color: 'white', outline: 'none', resize: 'vertical' }}
                        placeholder="E.g. T-shirt front view, facing camera..."
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Negative Prompt</label>
                        <textarea 
                          value={shot.negativePrompt}
                          onChange={(e) => {
                            const newConfigs = [...configs];
                              const s = newConfigs.find(c => c.id === shot.id);
                              if (s) s.negativePrompt = e.target.value;
                              setConfigs(newConfigs);
                            }}
                            rows={2}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: '8px', fontSize: '0.9rem', padding: '0.8rem', color: 'white', outline: 'none', resize: 'vertical' }}
                            placeholder="E.g. people, models, perspective..."
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#ffd166', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hard Rules</label>
                        <textarea 
                          value={shot.hardRules}
                          onChange={(e) => {
                            const newConfigs = [...configs];
                              const s = newConfigs.find(c => c.id === shot.id);
                              if (s) s.hardRules = e.target.value;
                              setConfigs(newConfigs);
                            }}
                            rows={2}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,209,102,0.3)', borderRadius: '8px', fontSize: '0.9rem', padding: '0.8rem', color: 'white', outline: 'none', resize: 'vertical' }}
                            placeholder="E.g. STRICT FRONT VIEW, NO MODEL"
                          />
                        </div>
                      </div>
                    </div>

                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
