import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function TemplatePage() {
  const templates = await prisma.promptTemplate.findMany();

  return (
    <>
      <h2 className="page-title">Template Prompt</h2>
      <p className="page-subtitle">Istruzioni prestabilite che guidano la generazione delle immagini con Google AI Studio.</p>

      <table className="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Scene</th>
            <th>Azione</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr key={t.id}>
              <td style={{ fontWeight: 600 }}>{t.name}</td>
              <td><span className="status-badge" style={{background: "#F5F5F5", color: "#333"}}>{t.category}</span></td>
              <td><div style={{fontSize: "0.80rem", color: "var(--color-text-muted)"}}>{JSON.parse(t.scenes).length} scene configurate</div></td>
              <td>
                <button style={{
                  padding: "0.4rem 0.8rem", 
                  border: "1px solid var(--color-border)",
                  background: "transparent",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.8rem"
                }}>
                  Modifica
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
