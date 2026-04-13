"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleSaveGenerationOutputs(enabled: boolean) {
    try {
        await (prisma as any).setting.upsert({
            where: { key: 'SAVE_GENERATION_OUTPUTS_ENABLED' },
            update: { value: enabled ? 'true' : 'false' },
            create: { key: 'SAVE_GENERATION_OUTPUTS_ENABLED', value: enabled ? 'true' : 'false' }
        });
        
        revalidatePath("/admin/jobs");
        return { success: true };
    } catch(err) {
        return { success: false };
    }
}
