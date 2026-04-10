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

export async function addStoreCredits(storeId: string, amount: number) {
  try {
    await (prisma as any).store.update({
      where: { id: storeId },
      data: { supplementary_credits: { increment: amount } }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding credits:", error);
    return { success: false, error: error.message };
  }
}

export async function resetStorePassword(storeId: string) {
  try {
    // Generate an 8-character random alphanumeric password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let newPassword = '';
    for (let i = 0; i < 8; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    await (prisma as any).store.update({
      where: { id: storeId },
      data: { password: newPassword }
    });
    revalidatePath("/admin");
    return { success: true, newPassword };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { success: false, error: error.message };
  }
}
