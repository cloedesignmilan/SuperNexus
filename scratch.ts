import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const categories = await prisma.category.findMany({
        include: { subcategories: true }
    });
    for (const cat of categories) {
        console.log(`\n=== Categoria: ${cat.name} ===`);
        if (cat.subcategories.length === 0) {
            console.log("  Nessuna sottocategoria.");
        }
        for (const sub of cat.subcategories) {
            console.log(`  - [${sub.is_active ? 'ATTIVA' : 'SPENTA'}] ${sub.name} (Slug: ${sub.slug})`);
        }
    }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
