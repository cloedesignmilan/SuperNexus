"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Copyright, Users, Box, Zap, Share2, LogOut } from "lucide-react";
import { adminLogout } from "@/app/login/actions";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: <Copyright size={18} /> },
    { href: "/admin/categories", label: "Macrocategorie", icon: <Box size={18} /> },
    { href: "/admin/business-modes", label: "Business Modes", icon: <Box size={18} /> },
    { href: "/admin/subcategories", label: "Sottocategorie & Asset", icon: <Share2 size={18} /> },
    { href: "/admin/clients", label: "CRM & Clienti", icon: <Users size={18} /> },
    { href: "/admin/jobs", label: "Generazioni AI", icon: <Zap size={18} /> },
  ];

  return (
    <aside className="admin-sidebar" style={{ width: '280px', background: 'var(--color-sidebar)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--color-primary)' }}>Super</span>Nexus <span style={{ fontWeight: 300, color: 'var(--color-text-muted)' }}>CRM</span>
          </h1>
        </div>

        <nav className="admin-nav" style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '8px', paddingLeft: '1rem', fontWeight: 600 }}>
             Menu Principale
          </div>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  color: isActive ? 'white' : 'var(--color-text-muted)',
                  background: isActive ? 'linear-gradient(90deg, rgba(230,46,191,0.2) 0%, transparent 100%)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--color-primary)' : '4px solid transparent',
                  borderRadius: '0 8px 8px 0',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ color: isActive ? 'var(--color-primary)' : 'currentColor' }}>
                  {item.icon}
                </div>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1rem', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <form action={adminLogout}>
            <button 
              type="submit"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', 
                width: '100%', background: 'transparent', border: 'none', 
                color: 'var(--color-text-muted)', cursor: 'pointer', borderRadius: '8px',
                fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', textAlign: 'left'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#ff3333'; e.currentTarget.style.background = 'rgba(255,51,51,0.1)' }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent' }}
            >
              <LogOut size={16} /> Disconnettiti
            </button>
          </form>
        </div>
    </aside>
  );
}
