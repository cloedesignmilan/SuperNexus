import { prisma } from "@/lib/prisma";
import CategoryEditor from "./CategoryEditor";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
    let categoryData = null;

    if (params.id !== 'nuova') {
        const cat = await (prisma as any).promptTemplate.findUnique({
            where: { id: params.id }
        });
        if (cat) {
            categoryData = {
                ...cat,
                scenes: JSON.parse(cat.scenes || "[]")
            };
        }
    }

    // Passiamo i negozi per l'opzione multi-tenant
    const stores = await (prisma as any).store.findMany({ select: { id: true, name: true } });

    return (
        <div style={{padding: '40px', maxWidth: '800px', margin: '0 auto', color: 'white', fontFamily: 'sans-serif'}}>
            <h2>{categoryData ? `Modifica Categoria: ${categoryData.name}` : "Crea Nuova Categoria"}</h2>
            <p style={{color: '#888', marginBottom: '30px'}}>Configura le scene testuali che Imagen utilizzerà per generare la posa.</p>

            <CategoryEditor initialData={categoryData} stores={stores} />
        </div>
    );
}
