import { ReactNode } from "react";
import Link from "next/link";
import "../admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-layout">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>
      
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h1 className="title-gradient" style={{ fontSize: '1.8rem', margin: 0 }}>
            SuperNexus<span style={{ color: 'white', fontWeight: 300 }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)', marginTop: '0.5rem', fontWeight: 700 }}>Director Dashboard</p>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-item">
            <span style={{ color: 'var(--color-primary)' }}>✦</span> Dashboard
          </Link>
          <Link href="/admin/categories" className="admin-nav-item">
            <span style={{ color: '#c084fc' }}>❖</span> Macrocategorie
          </Link>
          <Link href="/admin/subcategories" className="admin-nav-item">
            <span style={{ color: 'var(--color-secondary)' }}>◩</span> Sottocategorie & Asset
          </Link>
          <Link href="/admin/clients" className="admin-nav-item">
            <span style={{ color: '#f59e0b' }}>👥</span> CRM & Clienti
          </Link>
          <Link href="/admin/jobs" className="admin-nav-item">
            <span style={{ color: 'var(--color-success)' }}>⚡</span> Generazioni AI
          </Link>
        </nav>
      </aside>
      
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
