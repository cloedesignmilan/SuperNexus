import { prisma } from "@/lib/prisma";
import CategoryEditor from "./CategoryEditor";

export default async function EditCategoryPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    let categoryData = null;

    if (params.id !== 'nuova') {
        const cat = await prisma.category.findUnique({
            where: { id: params.id },
            include: { prompt_master: true, scenes: { orderBy: { sort_order: 'asc' } } }
        });
        if (cat) {
            categoryData = cat;
        }
    }

    return (
        <div style={{padding: '40px', maxWidth: '800px', margin: '0 auto', color: 'white', fontFamily: 'sans-serif'}}>
            <h2>{categoryData ? `Modifica Categoria: ${categoryData.name}` : "Crea Nuova Categoria"}</h2>
            <p style={{color: '#888', marginBottom: '30px'}}>Configura le scene testuali che Imagen utilizzerà per generare la posa.</p>

            <CategoryEditor initialData={categoryData} />
        </div>
    );
}
