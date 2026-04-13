import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
        const BUCKET_NAME = 'telegram-uploads';
        const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
        const now = new Date().getTime();
        
        let allFiles: any[] = [];
        let hasMore = true;
        let cOffset = 0;
        
        // RECUPERA TUTTI I FILE NEL BUCKET (Paginazione a blocchi di 500)
        while (hasMore) {
            const { data, error } = await supabaseAdmin.storage
                .from(BUCKET_NAME)
                .list('', {
                    limit: 500,
                    offset: cOffset,
                    sortBy: { column: 'created_at', order: 'asc' },
                });

            if (error) {
                console.error("Errore fetch file Supabase:", error);
                throw new Error("Impossibile recuperare i file dal DB");
            }

            if (!data || data.length === 0) {
                hasMore = false;
            } else {
                allFiles.push(...data);
                cOffset += data.length;
                if (data.length < 500) hasMore = false;
            }
        }

        const filesToDelete: string[] = [];

        for (const file of allFiles) {
             // Escludi file di sistema e presunte cartelle
             if (file.name === '.emptyFolderPlaceholder') continue;
             if (!file.metadata) continue; 

             const fileDate = new Date(file.created_at).getTime();
             if (now - fileDate > FORTY_EIGHT_HOURS_MS) {
                 filesToDelete.push(file.name);
             }
        }

        if (filesToDelete.length === 0) {
            return NextResponse.json({ message: 'Nessun file obsoleto (>48h) trovato.', deleted_count: 0 });
        }

        // CANCELLA I FILE IN BATCH DI 100 ALLA VOLTA
        const chunkSize = 100;
        let totalDeleted = 0;
        
        for (let i = 0; i < filesToDelete.length; i += chunkSize) {
            const chunk = filesToDelete.slice(i, i + chunkSize);
            const { data, error } = await supabaseAdmin.storage.from(BUCKET_NAME).remove(chunk);
            if (error) {
                console.error(`Errore cancellazione blocco (file: ${chunk[0]}):`, error);
            } else {
                totalDeleted += data?.length || 0;
            }
        }

        console.log(`[STORAGE-CLEANUP] Rimossi ${totalDeleted} file vecchi di oltre 48h dal bucket ${BUCKET_NAME}.`);

        return NextResponse.json({ 
            message: `Pulizia conclusa con successo.`, 
            deleted_count: totalDeleted,
            target_scanned: allFiles.length 
        });

    } catch (error: any) {
        console.error("[STORAGE-CLEANUP] ERRORE CRITICO:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
