import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const prisma = new PrismaClient();
const envFile = fs.readFileSync('.env', 'utf-8');
const SUPABASE_URL = envFile.split('\n').find(l => l.startsWith('SUPABASE_URL='))?.split('=')[1] || '';
const SUPABASE_KEY = envFile.split('\n').find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1] || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function recover() {
    console.log("Inizio recupero Reference Images per le T-Shirt...");
    const tsFlat = await prisma.subcategory.findFirst({ where: { slug: 'ts-flat' } });
    const tsUgc = await prisma.subcategory.findFirst({ where: { slug: 'ts-ugc' } });

    if (!tsFlat || !tsUgc) {
        console.error("Subcategories T-Shirt not found in DB.");
        return;
    }

    const map = [
        { folder: 'sub_tshirt_flat_lay', subId: tsFlat.id },
        { folder: 'sub_tshirt_creator_ugc', subId: tsUgc.id }
    ];

    for (const { folder, subId } of map) {
        const { data: files } = await supabase.storage.from('reference-images').list(folder);
        if (!files || files.length === 0) continue;

        let order = 0;
        for (const file of files) {
            const path = `${folder}/${file.name}`;
            const { data: publicUrlData } = supabase.storage.from('reference-images').getPublicUrl(path);

            await prisma.subcategoryReferenceImage.create({
                data: {
                    subcategory_id: subId,
                    image_url: publicUrlData.publicUrl,
                    storage_path: path,
                    image_order: order++,
                    is_active: true
                }
            });
            console.log(`✅ Recuperata: ${path}`);
        }
    }
    console.log("Recupero completato con successo!");
}

recover().catch(console.error).finally(() => prisma.$disconnect());
