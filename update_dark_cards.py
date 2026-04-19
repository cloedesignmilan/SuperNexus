import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Replace Starter Pack
starter_old = """          {/* Starter Pack */}
          <div className="pricing-card">
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0' }}>STARTER PACK</h3>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Perfect for testing without subscription.</p>
            <div className="pricing-price">$29<span>/one-time</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li><CheckCircle2 size={20} color="#ff0ab3" /> <strong>100 images</strong></li>
              <li><CheckCircle2 size={20} color="#ff0ab3" /> Telegram Bot Access</li>
              <li><CheckCircle2 size={20} color="#ff0ab3" /> Instant Setup</li>
              <li><CheckCircle2 size={20} color="#ff0ab3" /> No recurring fees</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              No expiration date
            </div>
            <Link href="/registrazione" className="btn-secondary hover-scale" style={{ width: '100%', padding: '1.2rem', fontWeight: '800', background: '#ff0ab3', color: '#fff', border: 'none', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Get Starter Pack</Link>
          </div>"""

starter_new = """          {/* Starter Pack */}
          <div className="pricing-card" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '1px solid rgba(255,10,179,0.3)' }}>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#fff' }}>STARTER PACK</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Perfect for testing without subscription.</p>
            <div className="pricing-price" style={{ color: 'white' }}>$29<span style={{ color: '#888' }}>/one-time</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> <strong>100 images</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> Telegram Bot Access</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> Instant Setup</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> No recurring fees</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              No expiration date
            </div>
            <Link href="/registrazione" className="btn-secondary hover-scale" style={{ width: '100%', padding: '1.2rem', fontWeight: '800', background: '#ff0ab3', color: '#fff', border: 'none', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Get Starter Pack</Link>
          </div>"""

content = content.replace(starter_old, starter_new)

# Replace Retail Pack
retail_old = """          {/* Retail Pack */}
          <div className="pricing-card">
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: 'white' }}>RETAIL PACK</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Scale your volumes without a subscription.</p>
            <div className="pricing-price">$69<span>/one-time</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li><CheckCircle2 size={20} color="#00ffff" /> <strong>300 images</strong></li>
              <li><CheckCircle2 size={20} color="#00ffff" /> Nano Pro absolute fidelity</li>
              <li><CheckCircle2 size={20} color="#00ffff" /> Priority GPU Ultra Bot</li>
              <li><CheckCircle2 size={20} color="#00ffff" /> No recurring fees</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              No expiration date
            </div>
            <Link href="/registrazione" className="btn-secondary hover-scale" style={{ padding: '1.2rem', fontWeight: '800', background: '#00ffff', color: '#000', border: 'none', width: '100%', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Get Retail Pack</Link>
          </div>"""

retail_new = """          {/* Retail Pack */}
          <div className="pricing-card" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '1px solid rgba(0,255,255,0.3)' }}>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#fff' }}>RETAIL PACK</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Scale your volumes without a subscription.</p>
            <div className="pricing-price" style={{ color: 'white' }}>$69<span style={{ color: '#888' }}>/one-time</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> <strong>300 images</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> Nano Pro absolute fidelity</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> Priority GPU Ultra Bot</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> No recurring fees</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              No expiration date
            </div>
            <Link href="/registrazione" className="btn-secondary hover-scale" style={{ padding: '1.2rem', fontWeight: '800', background: '#00ffff', color: '#000', border: 'none', width: '100%', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Get Retail Pack</Link>
          </div>"""

content = content.replace(retail_old, retail_new)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("Updated page.tsx")
