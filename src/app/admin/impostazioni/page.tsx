export default function ImpostazioniPage() {
  return (
    <>
      <h2 className="page-title">Impostazioni</h2>
      <p className="page-subtitle">Configurazioni sistemiche (Bot Telegram e API Google).</p>

      <div className="card-grid" style={{ gridTemplateColumns: "1fr", maxWidth: "600px" }}>
        
        <div className="stats-card">
          <h3 style={{fontSize: "1rem", color: "var(--color-text-main)", fontWeight: 600}}>Chiave Google AI Studio</h3>
          <p style={{fontSize: "1rem", fontFamily: "monospace", color: "var(--color-text-muted)", marginTop: "0.5rem"}}>
            {process.env.GOOGLE_AI_STUDIO_API_KEY ? "••••••••••••••••••••••••" : "Non configurata"}
          </p>
        </div>

        <div className="stats-card">
          <h3 style={{fontSize: "1rem", color: "var(--color-text-main)", fontWeight: 600}}>Bot Telegram (BotFather)</h3>
          <p style={{fontSize: "1rem", fontFamily: "monospace", color: "var(--color-text-muted)", marginTop: "0.5rem"}}>
            {process.env.TELEGRAM_BOT_TOKEN ? "Connesso e Configurato ✅" : "Manca il Token"}
          </p>
        </div>

        <div className="stats-card" style={{borderColor: "var(--color-status-error)", background: "#FDFDFD"}}>
          <h3 style={{fontSize: "1rem", color: "var(--color-text-main)", fontWeight: 600}}>WebHook URL Configurazione</h3>
          <p style={{fontSize: "0.9rem", color: "var(--color-text-muted)", marginTop: "0.5rem"}}>
            Usa questo comando per collegare definitivamente Telegram in produzione:
          </p>
          <code style={{display: "block", background: "#f4f4f4", padding: "1rem", borderRadius: "8px", marginTop: "1rem", fontSize: "0.85rem", wordBreak: "break-all"}}>
            https://api.telegram.org/bot{process.env.TELEGRAM_BOT_TOKEN}/setWebhook?url={process.env.APP_BASE_URL}/api/telegram/webhook
          </code>
        </div>
        
      </div>
    </>
  );
}
