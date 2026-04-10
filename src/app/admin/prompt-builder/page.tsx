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
        <button className={`${styles.tabBtn} ${activeTab === 'categories' ? styles.active : ''}`} onClick={() => setActiveTab('categories')}>
          <Tags size={16} /> 2. Categorie & Scenari
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



      {activeTab === 'categories' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>I Tuoi Modelli (Categorie & Scenari Personalizzati)</div>
          <p style={{fontSize: '13px', color: '#888', marginBottom: '20px'}}>Clicca su una categoria per esplodere i suoi prompt e i suoi pulsanti visibili all'utente in Telegram. Il controllo è totale.</p>
          <div className={styles.cardList}>
            {data.PROMPT_CONFIG_CATEGORIES.map((cat: any, cIdx: number) => (
              <details key={cIdx} className={styles.itemCard} style={{cursor: 'pointer', padding: '0'}}>
                <summary style={{padding: '15px', fontWeight: 'bold', fontSize: '16px', borderBottom: '1px solid #333', outline: 'none'}}>
                  📂 {cat.category_name}
                </summary>
                
                <div style={{padding: '20px', cursor: 'default'}}>
                  <div className={styles.formGroup} style={{display: 'flex', justifyContent: 'space-between'}}>
                    <label className={styles.label}>Nome UI Categoria (Esatto)</label>
                    <button 
                      onClick={() => {
                          if(confirm('Eliminare l\'intera categoria?')) {
                              const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                              nu.splice(cIdx, 1);
                              setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                          }
                      }} 
                      style={{background: '#ff444422', padding: '5px 10px', borderRadius: '4px', border: '1px solid #ff4444', color: '#ff4444', cursor: 'pointer', fontSize: '12px'}}
                    >
                      🗑 Rimuovi Categoria Completa
                    </button>
                  </div>
                  <input 
                      className={styles.input} 
                      style={{marginBottom: '15px'}}
                      value={cat.category_name}
                      onChange={(e) => {
                        const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                        nu[cIdx].category_name = e.target.value;
                        setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                      }}
                      placeholder="Nome esatto categoria (es. Donna)"
                  />
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Prompt Master Categoria</label>
                    <p style={{fontSize: '11px', color: '#aaa', margin: '4px 0 8px 0'}}>Regola base applicata ad ogni foto generata per {cat.category_name}.</p>
                    <textarea 
                      className={styles.textarea} style={{minHeight: '60px'}}
                      value={cat.prompt_text}
                      onChange={(e) => {
                        const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                        nu[cIdx].prompt_text = e.target.value;
                        setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                      }}
                    />
                  </div>

                  <hr style={{borderColor: '#444', margin: '20px 0'}} />
                  <h3 style={{fontSize: '15px', color: '#fff', marginBottom: '15px'}}>🔘 Pulsanti Telegram (Scenari per {cat.category_name})</h3>
                  
                  {cat.scenarios?.map((sc: any, sIdx: number) => (
                    <div key={sIdx} style={{background: '#1a1a1a', border: '1px solid #333', padding: '15px', borderRadius: '8px', marginBottom: '15px'}}>
                      <div className={styles.formGroup} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                        <input 
                          className={styles.input} style={{width: '60%', fontWeight: 'bold'}}
                          value={sc.button_label}
                          onChange={(e) => {
                            const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                            nu[cIdx].scenarios[sIdx].button_label = e.target.value;
                            setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                          }}
                          placeholder="Etichetta Pulsante (es. 📸 In Studio)"
                        />
                        <button 
                          onClick={() => {
                            const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                            nu[cIdx].scenarios.splice(sIdx, 1);
                            setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                          }}
                          style={{background: 'transparent', color: '#ff4a4a', border: 'none', cursor: 'pointer', fontSize: '13px'}}
                        >
                          X Rimuovi Pulsante
                        </button>
                      </div>

                      <div className={styles.formGroup} style={{display: 'flex', gap: '15px'}}>
                         <div style={{flex: 1}}>
                           <label className={styles.label}>ID Logico (Univoco)</label>
                           <input 
                              className={styles.input} value={sc.button_id}
                              onChange={(e) => {
                                const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                                nu[cIdx].scenarios[sIdx].button_id = e.target.value;
                                setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                              }}
                           />
                         </div>
                         <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                           <label className={styles.checkboxContainer} style={{marginTop: 'auto', marginBottom: '10px'}}>
                             <input 
                               type="checkbox" className={styles.checkbox} checked={sc.ask_quantity}
                               onChange={(e) => {
                                 const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                                 nu[cIdx].scenarios[sIdx].ask_quantity = e.target.checked;
                                 setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                               }}
                             />
                             <span style={{fontSize: '12px'}}>Chiedi Variante 3/5/10 su Telegram?</span>
                           </label>
                         </div>
                      </div>

                      <div className={styles.formGroup}>
                         <label className={styles.label}>Descrizione Scenario (Sfondo / Luci)</label>
                         <textarea 
                           className={styles.textarea} style={{minHeight: '60px'}}
                           value={sc.scene_text}
                           onChange={(e) => {
                             const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                             nu[cIdx].scenarios[sIdx].scene_text = e.target.value;
                             setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                           }}
                         />
                      </div>

                      <div className={styles.formGroup}>
                         <label className={styles.label}>Inquadrature Fotografiche Precise (1 per riga)</label>
                         {!sc.ask_quantity && <p style={{fontSize: '11px', color: '#f59e0b', margin: '0 0 5px 0'}}>Attenzione: Avendo disattivato la domanda 3/5/10, il bot scatterà esattamente {Math.max(sc.camera_angles.split('\n').filter((x:any)=>x.trim()!=='').length, 1)} foto usando queste angolazioni in sequenza fissa!</p>}
                         {sc.ask_quantity && <p style={{fontSize: '11px', color: '#9ca3af', margin: '0 0 5px 0'}}>Avendo attivato la domanda 3/5/10, queste inquadrature verranno ruotate casualmente sulle {`{N}`} immagini richieste dal cliente.</p>}
                         <textarea 
                           className={styles.textarea} style={{minHeight: '80px', fontFamily: 'monospace', fontSize: '11px'}}
                           placeholder="Full body shot...&#10;Close-up face..."
                           value={sc.camera_angles}
                           onChange={(e) => {
                             const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                             nu[cIdx].scenarios[sIdx].camera_angles = e.target.value;
                             setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                           }}
                         />
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => {
                        const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                        if (!nu[cIdx].scenarios) nu[cIdx].scenarios = [];
                        nu[cIdx].scenarios.push({
                            button_label: "✨ Nuovo Scenario", button_id: "new_scene_" + Date.now().toString().slice(-4), is_active: true, ask_quantity: true, camera_angles: "", scene_text: ""
                        });
                        setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
                    }}
                    style={{background: '#333', color: '#fff', border: '1px dashed #555', padding: '10px', width: '100%', borderRadius: '4px', cursor: 'pointer', marginTop: '5px'}}
                  >
                    + Aggiungi Nuovo Pulsante Telegram per {cat.category_name}
                  </button>

                </div>
              </details>
            ))}
          </div>
          <button 
            className={styles.saveBtn} 
            style={{ marginTop: '20px', background: '#3b82f6', width: '100%' }}
            onClick={() => {
                const nu = [...data.PROMPT_CONFIG_CATEGORIES];
                nu.push({ category_name: "Nuova Categoria", prompt_text: "", order: nu.length + 1, is_active: true, scenarios: [] });
                setData({...data, PROMPT_CONFIG_CATEGORIES: nu});
            }}
          >
            + Crea Intera Nuova Categoria
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
