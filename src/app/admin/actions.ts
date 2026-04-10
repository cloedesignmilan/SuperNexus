"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleStoreStatus(storeId: string, currentStatus: boolean) {
  try {
    await (prisma as any).store.update({
      where: { id: storeId },
      data: { is_active: !currentStatus }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling store status:", error);
    return { success: false, error: error.message };
  }
}
