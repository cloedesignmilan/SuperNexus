import re

with open('src/components/ShowcaseCategories.tsx', 'r') as f:
    content = f.read()

# 1. Extract the reveal JSX block
reveal_start = content.find("{/* INLINE EXAMPLE REVEAL */}")
reveal_end = content.find("          </div>\n        );\n      })}\n    </div>\n  );\n}")

reveal_jsx = content[reveal_start:reveal_end]

# We need to build the renderExampleReveal function
func_def = """  const renderExampleReveal = (cat: any, index: number) => {
    if (activeExample?.catIndex !== index) return null;
    
    return (
      <div style={{
        marginTop: '2rem',
        background: '#111',
        border: `1px solid ${cat.border}`,
        borderRadius: '24px',
        padding: '2rem',
        animation: 'fadeUp 0.5s ease forwards',
        boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 30px ${cat.color.replace('0.5', '0.1')}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            <span style={{ color: cat.border }}>{activeExample.subName}</span> Example
          </h4>
          <button 
            onClick={() => setActiveExample(null)}
            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}
          >
            ×
          </button>
        </div>
        
        {(() => {
          const exampleData = showcaseData.find((d: any) => (activeExample.showcaseId && d.id === activeExample.showcaseId) || d.subcategory === activeExample.subName || d.category === activeExample.subName);
          if (!exampleData) return <p style={{ color: '#888' }}>Example coming soon for this specific mode...</p>;
          
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <p style={{ color: '#ccc', fontStyle: 'italic', margin: 0, fontSize: '1rem', borderLeft: `3px solid ${cat.border}`, paddingLeft: '1rem' }}>"{exampleData.desc}"</p>
              
              {/* SIDE BY SIDE COMPARISON */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
                
                {/* LEFT: FIRST BEFORE IMAGE */}
                {exampleData.before.length > 0 && (
                  <div style={{ flex: '1 1 calc(50% - 0.75rem)', minWidth: '280px', position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', background: '#050505' }}>
                     <p style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                       ORIGINAL WAREHOUSE PHOTO
                     </p>
                     <img src={exampleData.before[0]} alt="Original" style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}

                {/* RIGHT: FIRST AFTER IMAGE */}
                {exampleData.afters.length > 0 && (
                  <div style={{ flex: '1 1 calc(50% - 0.75rem)', minWidth: '280px', position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', background: '#050505' }}>
                     <p style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: cat.border, border: `1px solid ${cat.border}` }}>
                       AI RESULT
                     </p>
                     <img src={exampleData.afters[0]} alt="Result 1" style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
              </div>

              {/* OTHER IMAGES GRID */}
              {(exampleData.before.length > 1 || exampleData.afters.length > 1) && (
                <div style={{ marginTop: '1.5rem' }}>
                  <p style={{ color: cat.border, fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>MORE VARIATIONS</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {exampleData.before.slice(1).map((bImg: string, i: number) => (
                      <div key={`b-${i}`} style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                         <p style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.6rem', color: '#fff' }}>ORIGINAL {i+2}</p>
                         <img src={bImg} alt={`Before ${i+2}`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                      </div>
                    ))}
                    {exampleData.afters.slice(1).map((aImg: string, i: number) => (
                      <div key={`a-${i}`} style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                         <p style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.6rem', color: '#fff' }}>AI RESULT {i+2}</p>
                         <img src={aImg} alt={`Result ${i+2}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })()}
      </div>
    );
  };
"""

# Insert the function just after state declaration
state_decl = "const [activeExample, setActiveExample] = useState<{ catIndex: number, subName: string, showcaseId?: string } | null>(null);\n"
content = content.replace(state_decl, state_decl + "\n" + func_def)

# Replace the old reveal block with the desktop reveal call
content = content.replace(reveal_jsx, "            {/* INLINE EXAMPLE REVEAL */}\n            <div className=\"desktop-reveal\">\n              {renderExampleReveal(cat, index)}\n            </div>\n")

# Now inject the mobile reveal inside the map loop
old_map_return = """                return (
                <div key={sub.name} className="subcategory-card\""""

new_map_return = """                return (
                  <React.Fragment key={sub.name}>
                    <div className="subcategory-card\""""

content = content.replace(old_map_return, new_map_return)

old_card_end = """                  )}
                </div>
              )})}"""

new_card_end = """                  )}
                </div>
                {/* MOBILE REVEAL */}
                {isActive && (
                  <div className="mobile-reveal">
                    {renderExampleReveal(cat, index)}
                  </div>
                )}
              </React.Fragment>
              )})}"""

content = content.replace(old_card_end, new_card_end)

with open('src/components/ShowcaseCategories.tsx', 'w') as f:
    f.write(content)
