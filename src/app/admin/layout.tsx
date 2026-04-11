import { ReactNode } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import "../admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-main)' }}>
      <AdminSidebar />
      <main className="admin-main" style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
