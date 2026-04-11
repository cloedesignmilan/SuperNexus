"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Genera un PIN alfanumerico di 6 caratteri
function generatePIN() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createClient(formData: FormData) {
  const email = formData.get("email") as string;
  const initialAllowance = parseInt(formData.get("allowance") as string, 10) || 0;
  
  const bot_pin = generatePIN();

  await prisma.user.create({
    data: {
      email,
      role: "user",
      bot_pin,
      images_allowance: initialAllowance,
      subscription_active: true
    }
  });

  revalidatePath("/admin/clients");
}

export async function toggleSubscription(userId: string, currentState: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: { subscription_active: !currentState }
  });
  revalidatePath("/admin/clients");
}

export async function updateAllowance(userId: string, additionalAllowance: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { 
      images_allowance: { increment: additionalAllowance } 
    }
  });
  revalidatePath("/admin/clients");
}

export async function deleteClient(userId: string) {
  await prisma.user.delete({
    where: { id: userId }
  });
  revalidatePath("/admin/clients");
}
