"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Currently uses a fixed admin user ID since auth isn't fully implemented
// In production, obtain from auth session
const ADMIN_USER_ID = "admin-user-id";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  if (!name) throw new Error("Il nome della categoria è obbligatorio");

  // Basic slugification
  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  
  // Ensure unique slug
  let counter = 1;
  let uniqueSlug = slug;
  while (await prisma.category.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  // Ensure user exists (Temp fallback for local dev)
  let user = await prisma.user.findUnique({ where: { id: ADMIN_USER_ID } });
  if (!user) {
    user = await prisma.user.create({ data: { id: ADMIN_USER_ID, email: "admin@local.test", role: "admin" } });
  }

  const highestPriority = await prisma.category.findFirst({
    orderBy: { sort_order: 'desc' }
  });
  const nextOrder = highestPriority ? highestPriority.sort_order + 1 : 0;

  await prisma.category.create({
    data: {
      name,
      slug: uniqueSlug,
      description,
      sort_order: nextOrder,
      user_id: user.id
    }
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/subcategories");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/subcategories");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  if (!name) throw new Error("Il nome della categoria è obbligatorio");

  await prisma.category.update({
    where: { id },
    data: { name, description }
  });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/subcategories");
}

export async function toggleCategoryStatus(id: string, currentStatus: boolean) {
  await prisma.category.update({
    where: { id },
    data: { is_active: !currentStatus }
  });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/subcategories");
}

export async function updateCategoryOrder(items: { id: string, sort_order: number }[]) {
  // Use a transaction to reorder
  for (const item of items) {
    await prisma.category.update({
      where: { id: item.id },
      data: { sort_order: item.sort_order }
    });
  }
  revalidatePath("/admin/categories");
}
