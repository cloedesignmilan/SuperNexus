import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 Minuti massimo

export async function GET(request: Request) {
    // PROTEZIONE ENDPOINT
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
        return NextResponse.json({ error: 'Unauthorized. Invalid CRON_SECRET.' }, { status: 401 });
    } else if (!expectedSecret) {
        console.warn('Protezione CRON_SECRET mancante. Si prega di impostare la variabile CRON_SECRET su Vercel.');
    }

    try {
        const BUCKETS = ['telegram-uploads', 'telegram-outputs'];
        const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        const cutoffDate = new Date(now - TWENTY_FOUR_HOURS_MS);
        
        // Recupera le immagini usate come thumbnail per i PromptConfigShot
        const promptConfigs = await prisma.promptConfigShot.findMany({
            where: {
                NOT: [{ imageUrl: null }, { imageUrl: '' }]
            },
            select: { imageUrl: true }
        });
        
        // Recupera le altre immagini di sistema che non devono essere cancellate
        const categories = await prisma.category.findMany({ where: { NOT: [{ cover_image: null }, { cover_image: '' }] }, select: { cover_image: true } });
        const businessModes = await prisma.businessMode.findMany({ where: { NOT: [{ cover_image: null }, { cover_image: '' }] }, select: { cover_image: true } });
        const subcategories = await prisma.subcategory.findMany({ where: { NOT: [{ preview_image: null }, { preview_image: '' }] }, select: { preview_image: true } });
        const referenceImages = await prisma.subcategoryReferenceImage.findMany({ where: { NOT: [{ image_url: '' }] }, select: { image_url: true } });

        const protectedUrls = [
            ...promptConfigs.map(c => c.imageUrl),
            ...categories.map(c => c.cover_image),
            ...businessModes.map(c => c.cover_image),
            ...subcategories.map(c => c.preview_image),
            ...referenceImages.map(c => c.image_url)
        ].filter(Boolean) as string[];

        let totalDeleted = 0;
        let totalScanned = 0;

        for (const bucketName of BUCKETS) {
            let allFiles: any[] = [];
            let hasMore = true;
            let cOffset = 0;
            
            // RECUPERA TUTTI I FILE NEL BUCKET
            while (hasMore) {
                const { data, error } = await supabaseAdmin.storage
                    .from(bucketName)
                    .list('', {
                        limit: 500,
                        offset: cOffset,
                        sortBy: { column: 'created_at', order: 'asc' },
                    });

                if (error || !data) {
                    console.error(`Errore fetch file dal bucket ${bucketName}:`, error);
                    break;
                }

                if (data.length === 0) {
                    hasMore = false;
                } else {
                    allFiles.push(...data);
                    cOffset += data.length;
                    if (data.length < 500) hasMore = false;
                }
            }

            totalScanned += allFiles.length;
            const filesToDelete: string[] = [];

            for (const file of allFiles) {
                 if (file.name === '.emptyFolderPlaceholder') continue;
                 if (!file.metadata) continue; 

                 const fileDate = new Date(file.created_at).getTime();
                 if (fileDate < cutoffDate.getTime()) {
                     // Check se il file è protetto da un thumbnail (decodificando l'URL per spazi o caratteri speciali)
                     const isProtected = protectedUrls.some(url => {
                         try {
                             return decodeURIComponent(url).includes(file.name);
                         } catch (e) {
                             return url.includes(file.name);
                         }
                     });
                     if (isProtected) {
                         console.log(`[STORAGE-CLEANUP] Salvato dalla pulizia (è un thumbnail dei pulsanti): ${file.name}`);
                         continue;
                     }
                     
                     filesToDelete.push(file.name);
                 }
            }

            if (filesToDelete.length === 0) {
                console.log(`[STORAGE-CLEANUP] Nessun file da pulire nel secchio ${bucketName}.`);
                continue;
            }

            // CANCELLA I FILE IN BATCH DI 100 ALLA VOLTA
            const chunkSize = 100;
            let deletedInBucket = 0;
            
            for (let i = 0; i < filesToDelete.length; i += chunkSize) {
                const chunk = filesToDelete.slice(i, i + chunkSize);
                const { data, error } = await supabaseAdmin.storage.from(bucketName).remove(chunk);
                if (error) {
                    console.error(`Errore cancellazione blocco in ${bucketName} (file: ${chunk[0]}):`, error);
                } else {
                    deletedInBucket += data?.length || 0;
                }
            }

            console.log(`[STORAGE-CLEANUP] Rimossi ${deletedInBucket} file vecchi di oltre 24h dal bucket ${bucketName}.`);
            totalDeleted += deletedInBucket;
        }

        // DATABASE CLEANUP
        const dbCleanupResult = await prisma.generationJob.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate
                }
            }
        });
        console.log(`[DB-CLEANUP] Rimossi ${dbCleanupResult.count} Job vecchi di oltre 24h dal database.`);

        return NextResponse.json({ 
            message: `Pulizia conclusa con successo.`, 
            deleted_storage_files: totalDeleted,
            deleted_db_jobs: dbCleanupResult.count,
            target_scanned: totalScanned 
        });

    } catch (error: any) {
        console.error("[STORAGE-CLEANUP] ERRORE CRITICO:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
