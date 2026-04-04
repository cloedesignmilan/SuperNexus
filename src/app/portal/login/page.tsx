import LoginForm from './LoginForm';

export default function LoginPage() {
    return (
        <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff', padding: '20px'}}>
            <div style={{width: '100%', maxWidth: '450px', background: '#121212', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'}}>
                
                <div style={{textAlign: 'center', marginBottom: '30px'}}>
                    <h1 style={{fontSize: '2rem', margin: '0 0 10px 0', background: 'linear-gradient(to right, #bb86fc, #03dac6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                        SuperNexus Portal
                    </h1>
                    <p style={{color: '#a0a0a0', margin: 0}}>Accesso riservato Negozianti & Imprese</p>
                </div>

                <LoginForm />

                <div style={{marginTop: '30px', textAlign: 'center', fontSize: '0.8rem', color: '#666'}}>
                    <p>© 2026 SuperNexus AI Generation.<br/>Gestione Privata Negozi White-Label.</p>
                </div>
            </div>
        </div>
    );
}
