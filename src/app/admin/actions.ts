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
