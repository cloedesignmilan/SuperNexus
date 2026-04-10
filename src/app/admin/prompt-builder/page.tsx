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

      <div className={styles.topActions} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           {data.PROMPT_CONFIG_SETTINGS.use_modular_builder ? (
               <span style={{background: '#1b4a2e', color: '#4ade80', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold'}}>🟢 KILLSWITCH ATTIVO: Telegram usa questo Builder</span>
           ) : (
               <span style={{background: '#4a1b1b', color: '#ff6b6b', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold'}}>🔴 KILLSWITCH SPENTO: Telegram usa backend legacy</span>
           )}
        </div>
        <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
          <Save size={18} /> {isSaving ? "Salvataggio..." : "Salva Configurazioni"}
        </button>
      </div>

      <div className={styles.tabs} style={{ flexWrap: 'wrap' }}>
        <button className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>
          <Settings size={16} /> Impostazioni
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
        <button className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.active : ''}`} onClick={() => setActiveTab('preview')} style={{ color: '#facc15' }}>
          👁️ Preview & Dry Run
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'backups' ? styles.active : ''}`} onClick={() => setActiveTab('backups')} style={{ color: '#9ca3af' }}>
          🕒 Backups
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
            <span>Attiva il nuovo Modular Prompt Builder nell'App (Esclude le vecchie configurazioni Category-based del DB)</span>
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
                <div className={styles.formGroup} style={{display: 'flex', justifyContent: 'space-between'}}>
                  <label className={styles.label}>Categoria UI</label>
                  <button 
                    onClick={() => {
                        if(confirm('Eliminare questa categoria?')) {
                            const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                            nu.splice(idx, 1);
                            setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                        }
                    }} 
                    style={{background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '12px'}}
                  >
                    Rimuovi
                  </button>
                </div>
                <input 
                    className={styles.input} 
                    style={{marginBottom: '10px'}}
                    value={cat.category_name}
                    onChange={(e) => {
                      const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                      nu[idx].category_name = e.target.value;
                      setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                    }}
                    placeholder="Nome esatto categoria (es. Donna)"
                />
                <div className={styles.formGroup}>
                  <label className={styles.label}>Prompt Master</label>
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
                <div className={styles.formGroup} style={{marginTop: '10px'}}>
                  <label className={styles.label}>Inquadrature Personalizzate In Studio (Opzionale, 1 per riga)</label>
                  <div style={{fontSize: '11px', color: '#ffaaaa', marginBottom: '5px'}}>
                    Se compili questo campo, il Bot in modalità "Studio" scatterà ESATTAMENTE le angolazioni richieste qui (es. 4 righe = 4 foto) ignorando le inquadrature globali.
                  </div>
                  <textarea 
                    className={styles.textarea} style={{minHeight: '80px'}}
                    placeholder="Es:&#10;Vista asimmetrica a 3/4...&#10;Ripresa zenitale piatta...&#10;Vista posteriore...&#10;Vista di profilo..."
                    value={cat.custom_camera_angles || ''}
                    onChange={(e) => {
                      const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                      nu[idx].custom_camera_angles = e.target.value;
                      setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button 
            className={styles.saveBtn} 
            style={{ marginTop: '20px', background: '#3b82f6' }}
            onClick={() => {
                const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                nu.push({ category_name: "Nuova Categoria", prompt_text: "", order: nu.length + 1, is_active: true });
                setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
            }}
          >
            + Aggiungi Nuova Categoria
          </button>
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

      {activeTab === 'backups' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Gestione Sicurezza e Rollback</div>
          <div className={styles.formGroup}>
            <p style={{ color: '#ccc', marginBottom: '20px' }}>
              Ogni volta che premi "Salva Configurazioni", il sistema crea una copia di sicurezza automatica dello stato precedente.
            </p>
            <button 
              className={styles.saveBtn} 
              style={{ background: '#aa3333' }}
              onClick={async () => {
                if(!confirm("Vuoi davvero ripristinare il blocco di configurazioni antecedente all'ultimo salvataggio? Questo sovrascriverà le modifiche attuali.")) return;
                try {
                  const res = await fetch("/api/admin/prompt-builder", { method: "PUT" });
                  if (res.ok) { alert("Backup ripristinato! Ricarico la pagina."); window.location.reload(); }
                  else alert("Nessun backup trovato.");
                } catch(e) { console.error(e); }
              }}
            >
              🔄 Ripristina Ultimo Backup (Undo)
            </button>
          </div>
        </div>
      )}

      {activeTab === 'preview' && <PreviewPanel data={data} />}

    </div>
  );
}

function PreviewPanel({ data }: { data: any }) {
  const [cat, setCat] = useState("Cerimonia");
  const [scene, setScene] = useState("ambientata");
  const [gender, setGender] = useState("female");
  const [bottom, setBottom] = useState("");
  const [previewText, setPreviewText] = useState("Premi Simula per caricare la Preview...");
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
     setLoading(true);
     try {
       const res = await fetch("/api/admin/prompt-builder/preview", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           config: data,
           categoryName: cat,
           scenarioId: scene,
           modifiers: { gender, bottomType: bottom }
         })
       });
       const json = await res.json();
       if (json.prompt) setPreviewText(json.prompt);
       else setPreviewText("Errore API: " + json.error);
     } catch (e) {
       setPreviewText("Network error.");
     }
     setLoading(false);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Console di Simulazione (Dry Run)</div>
      <p style={{ color: '#ccc', marginBottom: '20px' }}>
        Verifica cosa produrrebbero questi blocchi config in produzione prima di salvare.
      </p>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
         <div style={{flex: 1}}>
            <label className={styles.label}>Mock Categoria</label>
            <select className={styles.input} value={cat} onChange={(e) => setCat(e.target.value)}>
               {data.PROMPT_CONFIG_CATEGORIES.map((c: any) => <option key={c.category_name} value={c.category_name}>{c.category_name}</option>)}
            </select>
         </div>
         <div style={{flex: 1}}>
            <label className={styles.label}>Mock Ambiente</label>
            <select className={styles.input} value={scene} onChange={(e) => setScene(e.target.value)}>
               {data.PROMPT_CONFIG_SCENARIOS.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
         </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
         <div style={{flex: 1}}>
            <label className={styles.label}>Mock Genere</label>
            <select className={styles.input} value={gender} onChange={(e) => setGender(e.target.value)}>
               <option value="male">Uomo</option>
               <option value="female">Donna</option>
            </select>
         </div>
         <div style={{flex: 1}}>
            <label className={styles.label}>Mock Bottom (es. gonna)</label>
            <input className={styles.input} value={bottom} onChange={(e) => setBottom(e.target.value)} placeholder="Vuoto per null..." />
         </div>
      </div>

      <button className={styles.saveBtn} style={{ marginBottom: '20px', background: '#eab308', color: '#000' }} onClick={handleSimulate}>
        {loading ? "Calcolo in corso..." : "▶️ Esegui Simulatore Textuale"}
      </button>

      <div className={styles.formGroup}>
        <label className={styles.label}>Risultato esatto che Gemini riceverebbe:</label>
        <textarea 
          className={styles.textarea} style={{minHeight: '400px', backgroundColor: '#000', color: '#32cd32', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.5'}}
          value={previewText}
          readOnly
        />
      </div>
    </div>
  );
}
