"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// Genera un PIN alfanumerico di 6 caratteri
function generatePIN() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getAdminSupabase() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function createClient(formData: FormData) {
  const email = formData.get("email") as string;
  const planAllowance = parseInt(formData.get("plan") as string, 10) || 100;
  const extraCredits = parseInt(formData.get("extra") as string, 10) || 0;
  
  const bot_pin = generatePIN();

  // Create user in Supabase Auth first
  const supabaseAdmin = getAdminSupabase();
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.toLowerCase(),
    password: bot_pin,
    email_confirm: true,
  });

  if (authError) {
    throw new Error(`Errore Supabase Auth: ${authError.message}`);
  }

  // Create user in Prisma
  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      role: "user",
      bot_pin,
      base_allowance: planAllowance,
      images_allowance: planAllowance + extraCredits,
      subscription_active: true
    }
  });

  revalidatePath("/admin/clients");
}

export async function getLoginDataByPin(pin: string) {
  const user = await prisma.user.findUnique({
    where: { bot_pin: pin.toUpperCase() }
  });

  if (!user || !user.email) {
    return { success: false, error: "Codice non valido o inesistente." };
  }

  return { success: true, email: user.email };
}

export async function syncClientPinAuth(clientId: string) {
  const user = await prisma.user.findUnique({ where: { id: clientId } });
  if (!user || !user.email || !user.bot_pin) throw new Error("Dati cliente mancanti");

  const supabaseAdmin = getAdminSupabase();
  
  // Create or update Supabase Auth user
  const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find(u => u.email === user.email);

  if (existingUser) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      password: user.bot_pin,
      email_confirm: true
    });
    if (error) throw new Error(`Errore update Supabase: ${error.message}`);
  } else {
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.bot_pin,
      email_confirm: true
    });
    if (error) throw new Error(`Errore creazione Supabase: ${error.message}`);
  }

  revalidatePath("/admin/clients");
  return { success: true };
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
  // Try to delete from Supabase first if exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.email) {
    const supabaseAdmin = getAdminSupabase();
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === user.email);
    if (existingUser) {
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
    }
  }

  await prisma.user.delete({
    where: { id: userId }
  });
  revalidatePath("/admin/clients");
}
