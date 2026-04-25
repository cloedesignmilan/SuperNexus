"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Copy, Download, Upload, Check, Loader2 } from 'lucide-react';

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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [filterCat, setFilterCat] = useState('t-shirt');
  const [filterMode, setFilterMode] = useState('clean-catalog');
  const [filterScene, setFilterScene] = useState('all');
  
  // Basic Categories based on user request
  const categories = ['t-shirt', 'shoes', 'swimwear', 'dress', 'bags', 'jewelry'];
  const modes = ['clean-catalog', 'ugc', 'lifestyle', 'ads', 'premium'];
  const scenes = ['all', 'studio', 'street', 'home', 'beach'];

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
      presentation: 'no-model',
      scene: filterScene,
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

  const filteredConfigs = configs.filter(c => c.mode === filterMode && (c.scene === filterScene || c.scene === null)).sort((a,b) => b.priority - a.priority || a.shotNumber - b.shotNumber);

  return (
    <div className="p-8 max-w-7xl mx-auto text-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Prompt Configs</h1>
          <p className="text-gray-400 mt-2">Manage AI generation prompts via Database.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImport} 
          />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 text-white font-medium">
            <Upload className="w-4 h-4" /> Import JSON
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 p-4 rounded-xl mb-8 flex gap-4 border border-gray-800">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select 
            value={filterCat} 
            onChange={(e) => setFilterCat(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mode</label>
          <select 
            value={filterMode} 
            onChange={(e) => setFilterMode(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            {modes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Scene</label>
          <select 
            value={filterScene} 
            onChange={(e) => setFilterScene(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            {scenes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="ml-auto flex items-end">
          <button 
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Shot
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : (
        <div className="space-y-6">
          {filteredConfigs.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
              <p className="text-gray-400">No prompt shots found for this selection.</p>
              <p className="text-sm text-gray-500 mt-2">The AI will fallback to local JSON configs if they exist.</p>
            </div>
          ) : (
            filteredConfigs.map((shot, idx) => (
              <div key={shot.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg transition-all focus-within:ring-2 focus-within:ring-blue-500/50">
                
                {/* Header Row */}
                <div className="bg-gray-800/50 p-4 flex items-center gap-4 border-b border-gray-800">
                  <div className="bg-blue-900/50 text-blue-400 font-mono font-bold px-3 py-1 rounded-md text-sm border border-blue-800">
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
                    placeholder="Shot Name..."
                  />
                  <div className="ml-auto flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer mr-4">
                      <input 
                        type="checkbox" 
                        checked={shot.isActive}
                        onChange={(e) => {
                          const newConfigs = [...configs];
                          const s = newConfigs.find(c => c.id === shot.id);
                          if (s) s.isActive = e.target.checked;
                          setConfigs(newConfigs);
                        }}
                        className="rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" 
                      />
                      Active
                    </label>
                    <button onClick={() => handleUpdate(shot)} className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors" title="Save Changes">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDuplicate(shot)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Duplicate Shot">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(shot.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete Shot">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Editor Body */}
                <div className="p-4 grid grid-cols-12 gap-4">
                  {/* Meta Params */}
                  <div className="col-span-3 space-y-4 pr-4 border-r border-gray-800">
                    <div>
                      <label className="block text-xs font-mono text-gray-500 mb-1">presentation</label>
                      <input type="text" value={shot.presentation} onChange={(e) => {
                        const newConfigs = [...configs];
                        const s = newConfigs.find(c => c.id === shot.id);
                        if (s) s.presentation = e.target.value;
                        setConfigs(newConfigs);
                      }} className="w-full bg-gray-800 border border-gray-700 rounded text-sm px-3 py-1.5 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-500 mb-1">shot_number</label>
                      <input type="number" value={shot.shotNumber} onChange={(e) => {
                        const newConfigs = [...configs];
                        const s = newConfigs.find(c => c.id === shot.id);
                        if (s) s.shotNumber = Number(e.target.value);
                        setConfigs(newConfigs);
                      }} className="w-full bg-gray-800 border border-gray-700 rounded text-sm px-3 py-1.5 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-500 mb-1">priority</label>
                      <input type="number" value={shot.priority} onChange={(e) => {
                        const newConfigs = [...configs];
                        const s = newConfigs.find(c => c.id === shot.id);
                        if (s) s.priority = Number(e.target.value);
                        setConfigs(newConfigs);
                      }} className="w-full bg-gray-800 border border-gray-700 rounded text-sm px-3 py-1.5 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-500 mb-1">scene</label>
                      <select value={shot.scene || 'all'} onChange={(e) => {
                        const newConfigs = [...configs];
                        const s = newConfigs.find(c => c.id === shot.id);
                        if (s) s.scene = e.target.value;
                        setConfigs(newConfigs);
                      }} className="w-full bg-gray-800 border border-gray-700 rounded text-sm px-3 py-1.5 text-white">
                        {scenes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Prompts */}
                  <div className="col-span-9 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-green-400 mb-1 tracking-wider uppercase">Positive Prompt</label>
                      <textarea 
                        value={shot.positivePrompt}
                        onChange={(e) => {
                          const newConfigs = [...configs];
                          const s = newConfigs.find(c => c.id === shot.id);
                          if (s) s.positivePrompt = e.target.value;
                          setConfigs(newConfigs);
                        }}
                        rows={2}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg text-sm px-3 py-2 text-gray-300 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50"
                        placeholder="E.g. T-shirt front view, facing camera..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-red-400 mb-1 tracking-wider uppercase">Negative Prompt</label>
                        <textarea 
                          value={shot.negativePrompt}
                          onChange={(e) => {
                            const newConfigs = [...configs];
                            const s = newConfigs.find(c => c.id === shot.id);
                            if (s) s.negativePrompt = e.target.value;
                            setConfigs(newConfigs);
                          }}
                          rows={2}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg text-sm px-3 py-2 text-gray-300 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                          placeholder="E.g. people, models, perspective..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-yellow-400 mb-1 tracking-wider uppercase">Hard Rules</label>
                        <textarea 
                          value={shot.hardRules}
                          onChange={(e) => {
                            const newConfigs = [...configs];
                            const s = newConfigs.find(c => c.id === shot.id);
                            if (s) s.hardRules = e.target.value;
                            setConfigs(newConfigs);
                          }}
                          rows={2}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg text-sm px-3 py-2 text-gray-300 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50"
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
