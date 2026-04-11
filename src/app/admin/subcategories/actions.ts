"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

export async function createSubcategory(formData: FormData) {
  const name = formData.get("name") as string;
  const category_id = formData.get("category_id") as string;
  const short_description = formData.get("short_description") as string;
  const visual_direction_notes = formData.get("visual_direction_notes") as string;
  
  if (!name || !category_id) throw new Error("Il nome e la macrocategoria sono obbligatori");

  // Basic slugification
  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  
  // Ensure unique slug
  let counter = 1;
  let uniqueSlug = slug;
  while (await prisma.subcategory.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  const highestPriority = await prisma.subcategory.findFirst({
    where: { category_id },
    orderBy: { sort_order: 'desc' }
  });
  const nextOrder = highestPriority ? highestPriority.sort_order + 1 : 0;

  await prisma.subcategory.create({
    data: {
      name,
      slug: uniqueSlug,
      category_id,
      short_description,
      visual_direction_notes,
      sort_order: nextOrder
    }
  });

  revalidatePath("/admin/subcategories");
}

export async function deleteSubcategory(id: string) {
  await prisma.subcategory.delete({ where: { id } });
  revalidatePath("/admin/subcategories");
}

export async function updateSubcategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const category_id = formData.get("category_id") as string;
  const short_description = formData.get("short_description") as string;
  const visual_direction_notes = formData.get("visual_direction_notes") as string;
  
  if (!name || !category_id) throw new Error("Nome e categoria sono obbligatori");

  await prisma.subcategory.update({
    where: { id },
    data: { name, category_id, short_description, visual_direction_notes }
  });
  revalidatePath("/admin/subcategories");
}

export async function toggleSubcategoryStatus(id: string, currentStatus: boolean) {
  await prisma.subcategory.update({
    where: { id },
    data: { is_active: !currentStatus }
  });
  revalidatePath("/admin/subcategories");
}

/* 
 * Server Action for Image Uploads (up to 4.5MB limit per file via Vercel payload) 
 * Bypasses need for public ANON keys by using Service Role Key.
 */
export async function uploadReferenceImage(formData: FormData) {
  const file = formData.get("file") as File;
  const subcategory_id = formData.get("subcategory_id") as string;
  
  if (!file || !subcategory_id) {
    throw new Error("File e Sottocategoria sono obbligatori");
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${subcategory_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Read buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload to Supabase
  const { data, error } = await supabaseAdmin.storage
    .from('reference-images')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true
    });

  if (error) {
    console.error("Supabase Upload Error:", error);
    throw new Error(`Errore upload: ${error.message}. Assicurati di aver creato il bucket 'reference-images'.`);
  }

  // Get public URL
  const { data: publicUrlData } = supabaseAdmin.storage
    .from('reference-images')
    .getPublicUrl(fileName);

  const highestPriority = await prisma.subcategoryReferenceImage.findFirst({
    where: { subcategory_id },
    orderBy: { image_order: 'desc' }
  });
  const nextOrder = highestPriority ? highestPriority.image_order + 1 : 0;

  await prisma.subcategoryReferenceImage.create({
    data: {
      subcategory_id,
      image_url: publicUrlData.publicUrl,
      storage_path: fileName,
      image_order: nextOrder
    }
  });

  revalidatePath("/admin/subcategories");
  return { success: true };
}

export async function deleteReferenceImage(id: string, storagePath: string) {
  // Elimina da Supabase
  if (storagePath) {
    await supabaseAdmin.storage.from('reference-images').remove([storagePath]);
  }
  
  // Elimina dal DB
  await prisma.subcategoryReferenceImage.delete({ where: { id } });
  
  revalidatePath("/admin/subcategories");
}

export async function runVisionAnalysis(subcategoryId: string) {
  const subcat = await prisma.subcategory.findUnique({
    where: { id: subcategoryId },
    include: { reference_images: true }
  });

  if (!subcat || subcat.reference_images.length === 0) {
    throw new Error("Nessuna immagine fornita.");
  }

  // 1. Download images to buffer and convert to base64
  const inlineDataImages = await Promise.all(
    subcat.reference_images.map(async (img) => {
      const response = await fetch(img.image_url);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/jpeg';
      return {
        inlineData: {
          data: base64,
          mimeType
        }
      };
    })
  );

  // 2. Build Gemini prompt
  const systemInstruction = "Sei un Senior Art Director. Il tuo compito è analizzare un set di reference fotografiche e sfornare un PROMPT DI GENERAZIONE (in inglese) per clonare l'esatto Mood/Lifestyle fotografico di queste reference. NON limitarti solo alle luci. Presta MOLTA attenzione al LIFESTYLE: descrivi fedelmente l'ambiente circostante (es. strada di New York sfocata, cafe parigino, camera da letto luxury), il mood (gioioso, candid, posato, editoriale) e SE SONO PRESENTI PERSONE, DEVI descrivere il loro atteggiamento, etnicità apparente e pose (es. 'young european woman walking happily, candid lifestyle pose'). Crea una ricetta visiva testuale ricchissima, piena di tag fotografici (photorealistic, 8k, 35mm lens, depth of field). L'output deve essere SOLO in inglese e SOLO il blocco di prompt.";

  const visualDirection = subcat.visual_direction_notes ? `REQUISITI EXTRA DELL'AMMINISTRATORE: ${subcat.visual_direction_notes}` : "";

  const payload = {
    contents: [{
      role: "user",
      parts: [
        { text: `${systemInstruction}\n\n${visualDirection}\n\nEstrai la ricetta visiva master in inglese da queste reference:` },
        ...inlineDataImages
      ]
    }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 600
    }
  };

  const aiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_STUDIO_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const aiData = await aiResp.json();
  
  if (!aiResp.ok) {
    console.error(aiData);
    throw new Error("Errore Gemini: " + (aiData.error?.message || "Unknown error"));
  }

  const generatedPrompt = aiData.candidates[0].content.parts[0].text.trim();

  // 3. Save to DB PromptTemplateSettings
  await prisma.promptTemplateSettings.upsert({
    where: { subcategory_id: subcategoryId },
    create: {
      subcategory_id: subcategoryId,
      base_prompt_prefix: generatedPrompt,
    },
    update: {
      base_prompt_prefix: generatedPrompt
    }
  });

  revalidatePath("/admin/subcategories");
}
