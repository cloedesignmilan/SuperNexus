"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Save, Blocks, Image as ImageIcon, Tags, SlidersHorizontal, ShieldAlert, Settings } from "lucide-react";

export default function PromptBuilderAdmin() {
  const [activeTab, setActiveTab] = useState("master");
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/prompt-builder")
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/prompt-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        alert("Configurazioni Modulari Salvate con successo!");
      } else {
        alert("Errore nel salvataggio");
      }
    } catch (e) {
      console.error(e);
      alert("Errore di rete");
    }
    setIsSaving(false);
  };

  if (!data) return <div className={styles.container}>Caricamento Moduli...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Modular Prompt Builder</h1>
        <p className={styles.subtitle}>Gestisci e concatena in tempo reale l'architettura testuale per il motore generativo.</p>
      </div>

      <div className={styles.topActions}>
        <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
          <Save size={18} /> {isSaving ? "Salvataggio..." : "Salva Configurazioni"}
        </button>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>
          <Settings size={16} /> Impostazioni Globali
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'master' ? styles.active : ''}`} onClick={() => setActiveTab('master')}>
          <Blocks size={16} /> 1. Master Prompt
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'scenarios' ? styles.active : ''}`} onClick={() => setActiveTab('scenarios')}>
          <ImageIcon size={16} /> 2. Scenari
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'categories' ? styles.active : ''}`} onClick={() => setActiveTab('categories')}>
          <Tags size={16} /> 3. Focus Categorie
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'modifiers' ? styles.active : ''}`} onClick={() => setActiveTab('modifiers')}>
          <SlidersHorizontal size={16} /> 4. Modificatori
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'negatives' ? styles.active : ''}`} onClick={() => setActiveTab('negatives')}>
          <ShieldAlert size={16} /> 5. Negative Rules
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Motore Modulare SuperNexus</div>
          <label className={styles.checkboxContainer}>
            <input 
              type="checkbox" 
              className={styles.checkbox}
              checked={data.PROMPT_CONFIG_SETTINGS.use_modular_builder}
              onChange={(e) => setData({
                ...data, 
                PROMPT_CONFIG_SETTINGS: { ...data.PROMPT_CONFIG_SETTINGS, use_modular_builder: e.target.checked }
              })}
            />
            <span>Attiva il nuovo Modular Prompt Builder nell'App (Esclude le vecchie configurazioni Category-based)</span>
          </label>
        </div>
      )}

      {activeTab === 'master' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Master Prompt (Root)</div>
          <label className={styles.checkboxContainer}>
            <input 
              type="checkbox" 
              className={styles.checkbox}
              checked={data.PROMPT_CONFIG_MASTER.is_active}
              onChange={(e) => setData({...data, PROMPT_CONFIG_MASTER: { ...data.PROMPT_CONFIG_MASTER, is_active: e.target.checked }})}
            />
            <span>Modulo Attivo</span>
          </label>
          <div className={styles.formGroup}>
            <label className={styles.label}>Testo Fotografia Globale (8k, hyper-realistic, etc.)</label>
            <textarea 
              className={styles.textarea}
              value={data.PROMPT_CONFIG_MASTER.prompt_text}
              onChange={(e) => setData({...data, PROMPT_CONFIG_MASTER: { ...data.PROMPT_CONFIG_MASTER, prompt_text: e.target.value }})}
            />
          </div>
        </div>
      )}

      {activeTab === 'scenarios' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Gestione Scenari ed Environment</div>
          <div className={styles.cardList}>
            {data.PROMPT_CONFIG_SCENARIOS.map((scene: any, idx: number) => (
              <div key={idx} className={styles.itemCard}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>ID Scenario & Titolo</label>
                  <input className={styles.input} value={`${scene.id} - ${scene.title}`} disabled />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Prompt Ambientale</label>
                  <textarea 
                    className={styles.textarea} style={{minHeight: '80px'}}
                    value={scene.scene_text}
                    onChange={(e) => {
                      const nu = [...data.PROMPT_CONFIG_SCENARIOS];
                      nu[idx].scene_text = e.target.value;
                      setData({...data, PROMPT_CONFIG_SCENARIOS: nu});
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Prompt Specifici per Categoria</div>
          <div className={styles.cardList}>
            {data.PROMPT_CONFIG_CATEGORIES.map((cat: any, idx: number) => (
              <div key={idx} className={styles.itemCard}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Categoria UI ({cat.category_name})</label>
                  <textarea 
                    className={styles.textarea} style={{minHeight: '80px'}}
                    value={cat.prompt_text}
                    onChange={(e) => {
                      const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                      nu[idx].prompt_text = e.target.value;
                      setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'modifiers' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Modificatori Variabili (Triggerati da Inspector/UI)</div>
          <div className={styles.cardList}>
            {data.PROMPT_CONFIG_MODIFIERS.map((mod: any, idx: number) => (
              <div key={idx} className={styles.itemCard}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Variabile [{mod.key}] - {mod.name}</label>
                  <textarea 
                    className={styles.textarea} style={{minHeight: '60px'}}
                    value={mod.prompt_template}
                    onChange={(e) => {
                      const nu = [...data.PROMPT_CONFIG_MODIFIERS];
                      nu[idx].prompt_template = e.target.value;
                      setData({...data, PROMPT_CONFIG_MODIFIERS: nu});
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'negatives' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Regole Negative (Cosa NON generare)</div>
          <label className={styles.checkboxContainer}>
            <input 
              type="checkbox" 
              className={styles.checkbox}
              checked={data.PROMPT_CONFIG_NEGATIVES.is_active}
              onChange={(e) => setData({...data, PROMPT_CONFIG_NEGATIVES: { ...data.PROMPT_CONFIG_NEGATIVES, is_active: e.target.checked }})}
            />
            <span>Modulo Attivo</span>
          </label>
          <div className={styles.formGroup}>
            <label className={styles.label}>Testo Negative Preciso</label>
            <textarea 
              className={styles.textarea}
              value={data.PROMPT_CONFIG_NEGATIVES.global_rules}
              onChange={(e) => setData({...data, PROMPT_CONFIG_NEGATIVES: { ...data.PROMPT_CONFIG_NEGATIVES, global_rules: e.target.value }})}
            />
          </div>
        </div>
      )}

    </div>
  );
}
