import re

with open('src/app/registrazione/page.tsx', 'r') as f:
    content = f.read()

# Default plan state to starter_pack
content = content.replace('useState("starter")', 'useState("starter_pack")')
content = content.replace("setPlanName('starter')", "setPlanName('starter_pack')")

# Starter Pack
starter_old = """                        {/* STARTER */}
                        <label style={{cursor: 'pointer', display: 'block'}}>
                            <input type="radio" name="planName" value="starter" className="peer" style={{display: 'none'}} 
                                   checked={planName === 'starter'} onChange={(e) => setPlanName(e.target.value)} />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column'}} 
                                 className="radio-card starter-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><Zap size={18} color="#ff0ab3" /> Starter</h4>
                                    <span style={{fontSize: '1.4rem', fontWeight: 'bold'}}>$29<span style={{fontSize: '0.9rem', color: '#888'}}>/mo</span></span>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#a0a0a0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff0ab3"/> 100 generations / month</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff0ab3"/> Telegram Bot Access</li>
                                </ul>
                            </div>
                        </label>"""

starter_new = """                        {/* STARTER PACK */}
                        <label style={{cursor: 'pointer', display: 'block'}}>
                            <input type="radio" name="planName" value="starter_pack" className="peer" style={{display: 'none'}} 
                                   checked={planName === 'starter_pack'} onChange={(e) => setPlanName(e.target.value)} />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column'}} 
                                 className="radio-card starter-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><Zap size={18} color="#ff0ab3" /> Starter Pack</h4>
                                    <span style={{fontSize: '1.4rem', fontWeight: 'bold'}}>$29<span style={{fontSize: '0.9rem', color: '#888'}}> one-time</span></span>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#a0a0a0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff0ab3"/> <strong>100 generations</strong></li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff0ab3"/> Telegram Bot Access</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff0ab3"/> No Subscription</li>
                                </ul>
                            </div>
                        </label>"""
content = content.replace(starter_old, starter_new)


# Retail Pack (Cyan)
retail_old = """                        {/* RETAIL */}
                        <label style={{cursor: 'pointer', display: 'block'}}>
                            <input type="radio" name="planName" value="retail" className="peer" style={{display: 'none'}} 
                                   checked={planName === 'retail'} onChange={(e) => setPlanName(e.target.value)} />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column'}}
                                 className="radio-card retail-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><Gem size={18} color="#00ffff" /> Retail</h4>
                                    <span style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#fff'}}>$79<span style={{fontSize: '0.9rem', color: '#888'}}>/mo</span></span>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#a0a0a0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#00ffff"/> <strong>300 generations / month</strong></li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#00ffff"/> Ultra GPU Bot Priority</li>
                                </ul>
                            </div>
                        </label>"""

retail_new = """                        {/* RETAIL PACK */}
                        <label style={{cursor: 'pointer', display: 'block'}}>
                            <input type="radio" name="planName" value="retail_pack" className="peer" style={{display: 'none'}} 
                                   checked={planName === 'retail_pack'} onChange={(e) => setPlanName(e.target.value)} />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column'}}
                                 className="radio-card retail-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><Gem size={18} color="#00ffff" /> Retail Pack</h4>
                                    <span style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#fff'}}>$69<span style={{fontSize: '0.9rem', color: '#888'}}> one-time</span></span>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#a0a0a0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#00ffff"/> <strong>300 generations</strong></li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#00ffff"/> Ultra GPU Bot Priority</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#00ffff"/> No Subscription</li>
                                </ul>
                            </div>
                        </label>"""
content = content.replace(retail_old, retail_new)


# Retail Monthly (Yellow)
annual_old = """                        {/* RETAIL ANNUALE */}
                        <label style={{cursor: 'pointer', display: 'block', gridColumn: '1 / -1'}}>
                            <input type="radio" name="planName" value="retail_annual" className="peer" style={{display: 'none'}} 
                                   checked={planName === 'retail_annual'} onChange={(e) => setPlanName(e.target.value)} />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column'}}
                                 className="radio-card annual-card">
                                <span style={{position: 'absolute', top: '-12px', right: '10px', background: '#ccff00', color: '#000', fontSize: '0.65rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '10px', textTransform: 'uppercase'}}>Special Offer</span>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, color: '#ccff00', display: 'flex', alignItems: 'center', gap: '8px'}}>Annual Retail</h4>
                                    <div style={{textAlign: 'right'}}>
                                        <span style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', display: 'block'}}>$49<span style={{fontSize: '0.9rem', color: '#888'}}>/mo</span></span>
                                        <span style={{fontSize: '0.7rem', color: '#ccff00'}}>Billed $588</span>
                                    </div>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#e0e0e0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ccff00"/> <strong>Full Retail Plan</strong></li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ccff00"/> Save $360 per year</li>
                                </ul>
                            </div>
                        </label>"""

annual_new = """                        {/* RETAIL MONTHLY SUBSCRIPTION */}
                        <label style={{cursor: 'pointer', display: 'block', gridColumn: '1 / -1'}}>
                            <input type="radio" name="planName" value="retail_monthly" className="peer" style={{display: 'none'}} 
                                   checked={planName === 'retail_monthly'} onChange={(e) => setPlanName(e.target.value)} />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column'}}
                                 className="radio-card annual-card">
                                <span style={{position: 'absolute', top: '-12px', right: '10px', background: '#ccff00', color: '#000', fontSize: '0.65rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '10px', textTransform: 'uppercase'}}>POPULAR</span>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, color: '#ccff00', display: 'flex', alignItems: 'center', gap: '8px'}}>Retail Monthly</h4>
                                    <div style={{textAlign: 'right'}}>
                                        <span style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', display: 'block'}}>$59<span style={{fontSize: '0.9rem', color: '#888'}}>/mo</span></span>
                                        <span style={{fontSize: '0.7rem', color: '#ccff00'}}>Subscription</span>
                                    </div>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#e0e0e0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ccff00"/> <strong>300 generations / month</strong></li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ccff00"/> Nano Pro absolute fidelity</li>
                                </ul>
                            </div>
                        </label>"""
content = content.replace(annual_old, annual_new)

# Fix CSS
content = content.replace('input[value="starter"]:checked', 'input[value="starter_pack"]:checked')
content = content.replace('input[value="retail"]:checked', 'input[value="retail_pack"]:checked')
content = content.replace('input[value="retail_annual"]:checked', 'input[value="retail_monthly"]:checked')

with open('src/app/registrazione/page.tsx', 'w') as f:
    f.write(content)

print("registrazione/page.tsx updated")
