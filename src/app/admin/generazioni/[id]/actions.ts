'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function rateJob(jobId: string, rating: string) {
    const existingJob = await (prisma as any).generationJob.findUnique({
        where: { id: jobId }
    });
    if (!existingJob) throw new Error("Job not found");

    let meta = existingJob.metadata;
    if (typeof meta === 'string') meta = JSON.parse(meta);
    if (!meta) meta = {};

    meta.quality_rating = rating;

    await (prisma as any).generationJob.update({
        where: { id: jobId },
        data: { metadata: meta }
    });

    revalidatePath(`/admin/generazioni/${jobId}`);
}
