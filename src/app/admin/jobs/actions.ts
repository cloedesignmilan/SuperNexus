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

export async function getSubcategoryReferences(subcategoryId: string) {
    try {
        const references = await prisma.subcategoryReferenceImage.findMany({
            where: { subcategory_id: subcategoryId, is_active: true },
            orderBy: { image_order: 'asc' }
        });
        return { success: true, references };
    } catch (err: any) {
        console.error(err);
        return { success: false, error: err.message };
    }
}

export async function createValidationCheck(data: {
    subcategory_id: string;
    reference_image_url: string;
    generated_sample_image: string;
}) {
    try {
        await prisma.outputValidationCheck.create({
            data: {
                subcategory_id: data.subcategory_id,
                reference_image_url: data.reference_image_url,
                generated_sample_image: data.generated_sample_image,
                comparison_status: "pending"
            }
        });
        revalidatePath(`/admin/subcategories/${data.subcategory_id}`);
        return { success: true };
    } catch (err: any) {
        console.error("Create Validation Check Error:", err);
        return { success: false, error: err.message };
    }
}
