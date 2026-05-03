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

export async function saveValidationFeedback(subcategoryId: string, taxonomyPath: string, imageUrls: string[], notes: string, referenceImageUrl: string, modelUsed?: string, specificShotNumber?: number, clientGender?: string) {
    const record = await prisma.outputValidationCheck.create({
        data: {
            subcategory_id: subcategoryId,
            reference_image_url: referenceImageUrl, 
            generated_sample_image: JSON.stringify({ path: taxonomyPath, urls: imageUrls, model: modelUsed || 'gemini-3.1-flash-image-preview', specificShotNumber, clientGender }),
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

export async function populateSubcategoryAssets(checkId: string, coverImageUrl: string) {
    const check = await prisma.outputValidationCheck.findUnique({
        where: { id: checkId },
        include: {
            subcategory: {
                include: {
                    business_mode: {
                        include: { category: true }
                    }
                }
            }
        }
    });

    if (!check || !check.subcategory) {
        throw new Error("Validation check or subcategory not found.");
    }

    // Update Subcategory cover
    await prisma.subcategory.update({
        where: { id: check.subcategory_id },
        data: { preview_image: coverImageUrl }
    });

    // Extract urls and specific shot from generated_sample_image
    let urls: string[] = [];
    let specificShotNumber: number | null = null;
    let clientGender: string | null = null;
    try {
        const parsed = JSON.parse(check.generated_sample_image);
        urls = parsed.urls || [];
        specificShotNumber = parsed.specificShotNumber || null;
        clientGender = parsed.clientGender || null;
    } catch (e) {
        urls = [check.generated_sample_image];
    }

    if (urls.length > 0) {
        let presentationSlug = check.subcategory.name.toLowerCase().replace(/\s+/g, '-');
        let modeSlug = check.subcategory.business_mode.name.toLowerCase().replace(/\s+/g, '-');
        const categorySlug = check.subcategory.business_mode.category.slug.toLowerCase().replace(/\s+/g, '-');

        let searchPresSlugs = [presentationSlug];
        
        if (presentationSlug === 'ugc-in-home' || presentationSlug === 'ugc-in-store' || presentationSlug === 'candid') {
          modeSlug = presentationSlug === 'ugc-in-home' ? 'ugc-home' : presentationSlug === 'ugc-in-store' ? 'ugc-store' : modeSlug;
          if (clientGender === 'WOMAN' || clientGender === 'Woman') {
              searchPresSlugs = ['candid-woman'];
          } else if (clientGender === 'MAN' || clientGender === 'Man') {
              searchPresSlugs = ['candid-man'];
          } else {
              searchPresSlugs = ['candid-woman', 'candid-man', 'candid'];
          }
        } else if (presentationSlug === 'model-photo') {
          if (clientGender === 'WOMAN' || clientGender === 'Woman') {
              searchPresSlugs = ['model-photo-woman'];
          } else if (clientGender === 'MAN' || clientGender === 'Man') {
              searchPresSlugs = ['model-photo-man'];
          } else {
              searchPresSlugs = ['model-photo', 'model-photo-woman', 'model-photo-man'];
          }
        } else if (presentationSlug === 'woman') {
          searchPresSlugs = ['candid-woman', 'model-photo-woman'];
        } else if (presentationSlug === 'man') {
          searchPresSlugs = ['candid-man', 'model-photo-man'];
        }

        // Find existing PromptConfigShots
        const shots = await prisma.promptConfigShot.findMany({
            where: {
                category: categorySlug,
                mode: modeSlug,
                presentation: { in: searchPresSlugs }
            },
            orderBy: [
                { presentation: 'asc' },
                { shotNumber: 'asc' }
            ]
        });

        if (specificShotNumber) {
            const targetShots = shots.filter(s => s.shotNumber === specificShotNumber);
            if (urls[0]) {
                for (const targetShot of targetShots) {
                    await prisma.promptConfigShot.update({
                        where: { id: targetShot.id },
                        data: { imageUrl: urls[0] }
                    });
                }
            }
        } else {
            for (let i = 0; i < urls.length; i++) {
                const shotNum = i + 1;
                const targetShots = shots.filter(s => s.shotNumber === shotNum);
                for (const targetShot of targetShots) {
                    await prisma.promptConfigShot.update({
                        where: { id: targetShot.id },
                        data: { imageUrl: urls[i] }
                    });
                }
            }
        }
    }

    revalidatePath('/admin/analyses');
    revalidatePath('/admin/subcategories/[id]', 'page');
    revalidatePath('/dashboard');
}

export async function populateShotsOnly(checkId: string) {
    const check = await prisma.outputValidationCheck.findUnique({
        where: { id: checkId },
        include: {
            subcategory: {
                include: {
                    business_mode: {
                        include: { category: true }
                    }
                }
            }
        }
    });

    if (!check || !check.subcategory) {
        throw new Error("Validation check or subcategory not found.");
    }

    // Extract urls and specific shot from generated_sample_image
    let urls: string[] = [];
    let specificShotNumber: number | null = null;
    let clientGender: string | null = null;
    try {
        const parsed = JSON.parse(check.generated_sample_image);
        urls = parsed.urls || [];
        specificShotNumber = parsed.specificShotNumber || null;
        clientGender = parsed.clientGender || null;
    } catch (e) {
        urls = [check.generated_sample_image];
    }

    if (urls.length > 0) {
        let presentationSlug = check.subcategory.name.toLowerCase().replace(/\s+/g, '-');
        let modeSlug = check.subcategory.business_mode.name.toLowerCase().replace(/\s+/g, '-');
        const categorySlug = check.subcategory.business_mode.category.slug.toLowerCase().replace(/\s+/g, '-');

        let searchPresSlugs = [presentationSlug];
        
        if (presentationSlug === 'ugc-in-home' || presentationSlug === 'ugc-in-store' || presentationSlug === 'candid') {
          modeSlug = presentationSlug === 'ugc-in-home' ? 'ugc-home' : presentationSlug === 'ugc-in-store' ? 'ugc-store' : modeSlug;
          if (clientGender === 'WOMAN' || clientGender === 'Woman') {
              searchPresSlugs = ['candid-woman'];
          } else if (clientGender === 'MAN' || clientGender === 'Man') {
              searchPresSlugs = ['candid-man'];
          } else {
              searchPresSlugs = ['candid-woman', 'candid-man', 'candid'];
          }
        } else if (presentationSlug === 'model-photo') {
          if (clientGender === 'WOMAN' || clientGender === 'Woman') {
              searchPresSlugs = ['model-photo-woman'];
          } else if (clientGender === 'MAN' || clientGender === 'Man') {
              searchPresSlugs = ['model-photo-man'];
          } else {
              searchPresSlugs = ['model-photo', 'model-photo-woman', 'model-photo-man'];
          }
        } else if (presentationSlug === 'woman') {
          searchPresSlugs = ['candid-woman', 'model-photo-woman'];
        } else if (presentationSlug === 'man') {
          searchPresSlugs = ['candid-man', 'model-photo-man'];
        }

        const shots = await prisma.promptConfigShot.findMany({
            where: {
                category: categorySlug,
                mode: modeSlug,
                presentation: { in: searchPresSlugs }
            },
            orderBy: [
                { presentation: 'asc' },
                { shotNumber: 'asc' }
            ]
        });

        if (specificShotNumber) {
            const targetShots = shots.filter(s => s.shotNumber === specificShotNumber);
            if (urls[0]) {
                for (const targetShot of targetShots) {
                    await prisma.promptConfigShot.update({
                        where: { id: targetShot.id },
                        data: { imageUrl: urls[0] }
                    });
                }
            }
        } else {
            for (let i = 0; i < urls.length; i++) {
                const shotNum = i + 1;
                const targetShots = shots.filter(s => s.shotNumber === shotNum);
                for (const targetShot of targetShots) {
                    await prisma.promptConfigShot.update({
                        where: { id: targetShot.id },
                        data: { imageUrl: urls[i] }
                    });
                }
            }
        }
    }

    revalidatePath('/admin/analyses');
    revalidatePath('/admin/subcategories/[id]', 'page');
    revalidatePath('/dashboard');
}
