"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleAiModel(modelName: string) {
    if (!['gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'].includes(modelName)) {
        throw new Error("Invalid model name");
    }

    await prisma.setting.upsert({
        where: { key: 'ACTIVE_GENERATION_MODEL' },
        update: { value: modelName },
        create: { key: 'ACTIVE_GENERATION_MODEL', value: modelName }
    });

    revalidatePath('/admin');
}

export async function getActiveAiModel() {
    const setting = await prisma.setting.findUnique({
        where: { key: 'ACTIVE_GENERATION_MODEL' }
    });
    return setting?.value || "gemini-3.1-flash-image-preview";
}
