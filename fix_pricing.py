import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Replace Starter
starter_old = """          {/* Starter */}
          <div className="pricing-card">
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0' }}>STARTER</h3>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Perfect for testing the first sales.</p>
            <div className="pricing-price">$29<span>/month</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li><CheckCircle2 size={20} color="#ff0ab3" /> <strong>100 images / month</strong></li>
              <li><CheckCircle2 size={20} color="#ff0ab3" /> Telegram Bot Access</li>
              <li><CheckCircle2 size={20} color="#ff0ab3" /> Instant Setup</li>
              <li><CheckCircle2 size={20} color="#ff0ab3" /> All niches unlocked</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              Extra Top-up: <strong>+100 images for $19</strong>
            </div>
            <Link href="/registrazione" className="btn-secondary hover-scale" style={{ width: '100%', padding: '1.2rem', fontWeight: '800', background: '#ff0ab3', color: '#fff', border: 'none', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Get Started</Link>
          </div>"""

starter_new = """          {/* Starter Pack */}
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

content = content.replace(starter_old, starter_new)

# Replace Retail (Cyan)
retail_old = """          {/* Retail */}
          <div className="pricing-card popular">
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: 'white' }}>RETAIL</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Scale your social volumes.</p>
            <div className="pricing-price">$69<span>/month</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li><CheckCircle2 size={20} color="#00ffff" /> <strong>300 images / month</strong></li>
              <li><CheckCircle2 size={20} color="#00ffff" /> Nano Pro absolute fidelity</li>
              <li><CheckCircle2 size={20} color="#00ffff" /> Priority GPU Ultra Bot</li>
              <li><CheckCircle2 size={20} color="#00ffff" /> All niches unlocked</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              Extra Top-up: <strong>+300 images for $49</strong>
            </div>
            <Link href="/registrazione" className="btn-secondary hover-scale" style={{ padding: '1.2rem', fontWeight: '800', background: '#00ffff', color: '#000', border: 'none', width: '100%', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Choose Retail</Link>
          </div>"""

retail_new = """          {/* Retail Pack */}
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

content = content.replace(retail_old, retail_new)

# Replace Retail Annual (Yellow)
annual_old = """          {/* Retail Annuale */}
          <div className="pricing-card" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '1px solid #ccff00', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '20px', background: '#ccff00', color: '#000', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>
              SPECIAL OFFER
            </div>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#ccff00' }}>RETAIL ANNUAL</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Maximum savings.</p>
            <div className="pricing-price" style={{ color: 'white' }}>$49<span>/month</span></div>
            <div style={{ fontSize: '0.85rem', color: '#ccff00', fontWeight: 'bold', marginTop: '-32px', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>Billed annually at $588</div>
            
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> <strong>300 images unlocked monthly</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Save $240 per year</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Priority Support</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Access to extra top-ups ($49)</li>
            </ul>
            <Link href="/registrazione" className="btn-secondary hover-scale" style={{ padding: '1.2rem', fontWeight: '800', background: '#ccff00', color: '#000', border: 'none', width: '100%', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Claim Offer</Link>
          </div>"""

annual_new = """          {/* Retail Subscription */}
          <div className="pricing-card popular" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '2px solid #ccff00', position: 'relative', boxShadow: '0 0 30px rgba(204,255,0,0.15)' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '20px', background: '#ccff00', color: '#000', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>
              POPULAR
            </div>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#ccff00' }}>RETAIL MONTHLY</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Scale your social volumes.</p>
            <div className="pricing-price" style={{ color: 'white' }}>$59<span>/month</span></div>
            <div style={{ fontSize: '0.85rem', color: '#ccff00', fontWeight: 'bold', marginTop: '-32px', marginBottom: '1.5rem', position: 'relative', zIndex: 1, opacity: 0 }}>Spacer</div>
            
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> <strong>300 images unlocked monthly</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Nano Pro absolute fidelity</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Priority GPU Ultra Bot</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> All niches unlocked</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#ccff00', textAlign: 'center', marginBottom: '1.5rem', opacity: 0.8 }}>
              Extra Top-up: <strong>+300 images for $49</strong>
            </div>
            <Link href="/registrazione" className="btn-secondary hover-scale" style={{ padding: '1.2rem', fontWeight: '800', background: '#ccff00', color: '#000', border: 'none', width: '100%', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Subscribe Now</Link>
          </div>"""

content = content.replace(annual_old, annual_new)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("page.tsx updated")
