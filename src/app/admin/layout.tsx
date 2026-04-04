import "@/app/globals.css";
import Link from "next/link";
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
          <Link href="/admin/dashboard" className="nav-item">Dashboard</Link>
          <Link href="/admin/generazioni" className="nav-item">Generazioni</Link>
          <Link href="/admin/template" className="nav-item">Template Prompt</Link>
          <Link href="/admin/impostazioni" className="nav-item">Impostazioni</Link>
        </nav>
      </aside>

      {/* Contenuto Principale Dinamico */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
