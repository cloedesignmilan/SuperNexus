export default function DashboardPage() {
  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>AI Virtual Studio</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
        Welcome to your generation dashboard. Upload an image to begin.
      </p>

      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.1)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>[ Phase 3 UI Placeholder: Upload Component Here ]</p>
      </div>
    </div>
  )
}
