"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBusinessMode(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const cover_image = formData.get("cover_image") as string;
  const category_id = formData.get("category_id") as string;
  
  if (!name || !category_id) throw new Error("Nome e Macro Categoria sono obbligatori");

  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  
  let counter = 1;
  let uniqueSlug = slug;
  while (await prisma.businessMode.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  const highestPriority = await prisma.businessMode.findFirst({
    where: { category_id },
    orderBy: { sort_order: 'desc' }
  });
  const nextOrder = highestPriority ? highestPriority.sort_order + 1 : 0;

  await prisma.businessMode.create({
    data: {
      name,
      slug: uniqueSlug,
      description,
      cover_image,
      category_id,
      sort_order: nextOrder
    }
  });

  revalidatePath("/admin/business-modes");
}

export async function updateBusinessMode(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const cover_image = formData.get("cover_image") as string;
  const category_id = formData.get("category_id") as string;
  
  if (!name || !category_id) throw new Error("Nome e Macro Categoria sono obbligatori");

  await prisma.businessMode.update({
    where: { id },
    data: { name, description, cover_image, category_id }
  });
  
  revalidatePath("/admin/business-modes");
}

export async function deleteBusinessMode(id: string) {
  await prisma.businessMode.delete({ where: { id } });
  revalidatePath("/admin/business-modes");
}

export async function toggleBusinessModeStatus(id: string, currentStatus: boolean) {
  await prisma.businessMode.update({
    where: { id },
    data: { is_active: !currentStatus }
  });
  revalidatePath("/admin/business-modes");
}
