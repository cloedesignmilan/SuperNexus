import "@/app/globals.css";
import Link from "next/link";
import { LayoutDashboard, Images, Settings2, Command } from "lucide-react";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-container">
      {/* Sidebar Laterale in stile elegante e neutro */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h1>SUPERNEXUS</h1>
          <p>SaaS Protocol Layer</p>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="nav-item" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <LayoutDashboard size={18} /> Dashboard Finanziaria
          </Link>
          <Link href="/admin/generazioni" className="nav-item" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Images size={18} /> Operazioni AI
          </Link>
          <Link href="/admin/template" className="nav-item" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Command size={18} /> Prompt di Sistema
          </Link>
          <Link href="/admin/impostazioni" className="nav-item" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Settings2 size={18} /> Settings Piattaforma
          </Link>
        </nav>
      </aside>

      {/* Contenuto Principale Dinamico */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
