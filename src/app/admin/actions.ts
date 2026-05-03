"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleAiModel(modelName: string) {
    if (!['gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'].includes(modelName)) {
        throw new Error("Invalid model name");
    }

    await (prisma as any).setting.upsert({
        where: { key: 'ACTIVE_GENERATION_MODEL' },
        update: { value: modelName },
        create: { key: 'ACTIVE_GENERATION_MODEL', value: modelName }
    });

    revalidatePath('/admin');
}

export async function getActiveAiModel() {
    const setting = await (prisma as any).setting.findUnique({
        where: { key: 'ACTIVE_GENERATION_MODEL' }
    });
    return setting?.value || "gemini-3.1-flash-image-preview";
}

export async function toggleAiSceneVariance(enabled: boolean) {
    await (prisma as any).setting.upsert({
        where: { key: 'AI_SCENE_VARIANCE_ENABLED' },
        update: { value: enabled ? "true" : "false" },
        create: { key: 'AI_SCENE_VARIANCE_ENABLED', value: enabled ? "true" : "false" }
    });
    revalidatePath('/admin');
}

export async function getAiSceneVariance() {
    const setting = await (prisma as any).setting.findUnique({
        where: { key: 'AI_SCENE_VARIANCE_ENABLED' }
    });
    return setting?.value === "true";
}

// --- Sandbox / God Mode Actions ---

export async function toggleVisibility(id: string, type: 'category' | 'business_mode' | 'subcategory', isActive: boolean) {
    if (type === 'category') {
        await prisma.category.update({ where: { id }, data: { is_active: isActive } });
    } else if (type === 'business_mode') {
        await prisma.businessMode.update({ where: { id }, data: { is_active: isActive } });
    } else if (type === 'subcategory') {
        await prisma.subcategory.update({ where: { id }, data: { is_active: isActive } });
    }
    revalidatePath('/admin/sandbox');
    revalidatePath('/dashboard');
}

export async function toggleLock(id: string, type: 'category' | 'business_mode' | 'subcategory', isLocked: boolean) {
    if (type === 'category') {
        await (prisma.category as any).update({ where: { id }, data: { is_locked: isLocked } });
    } else if (type === 'business_mode') {
        await (prisma.businessMode as any).update({ where: { id }, data: { is_locked: isLocked } });
    } else if (type === 'subcategory') {
        await (prisma.subcategory as any).update({ where: { id }, data: { is_locked: isLocked } });
    }
    revalidatePath('/admin/sandbox');
    revalidatePath('/dashboard');
}

export async function saveReferenceImage(subcategoryId: string, imageUrl: string, title: string) {
    await prisma.subcategoryReferenceImage.create({
        data: {
            subcategory_id: subcategoryId,
            image_url: imageUrl,
            title: title,
            is_active: true
        }
    });
    revalidatePath('/admin/subcategories/[id]', 'page');
}

export async function saveValidationFeedback(subcategoryId: string, taxonomyPath: string, imageUrls: string[], notes: string, referenceImageUrl: string, modelUsed?: string) {
    const record = await prisma.outputValidationCheck.create({
        data: {
            subcategory_id: subcategoryId,
            reference_image_url: referenceImageUrl, 
            generated_sample_image: JSON.stringify({ path: taxonomyPath, urls: imageUrls, model: modelUsed || 'gemini-3.1-flash-image-preview' }),
            review_notes: notes,
            comparison_status: "pending"
        }
    });
    revalidatePath('/admin/analyses');
    return record.id;
}

export async function updateValidationFeedback(id: string, formData: FormData) {
    const notes = formData.get('notes') as string;
    await prisma.outputValidationCheck.update({
        where: { id },
        data: { review_notes: notes }
    });
    revalidatePath('/admin/analyses');
}

export async function restartServer() {
    const { exec } = require("child_process");
    exec('touch next.config.ts', (err: any) => {
        if (err) console.error("Failed to restart server", err);
    });
}
