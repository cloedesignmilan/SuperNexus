"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateShot(id: string, formData: FormData) {
  const shotName = formData.get("shotName") as string;
  const positivePrompt = formData.get("positivePrompt") as string;
  const negativePrompt = formData.get("negativePrompt") as string;
  const hardRules = formData.get("hardRules") as string;
  const outputGoal = formData.get("outputGoal") as string;

  await prisma.promptConfigShot.update({
    where: { id },
    data: {
      shotName,
      positivePrompt,
      negativePrompt,
      hardRules,
      outputGoal
    }
  });

  revalidatePath("/admin/subcategories/[id]", "page");
}
