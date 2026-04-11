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
  const systemInstruction = "Sei un direttore artistico di moda AI ad altissimo livello. Il tuo compito è analizzare queste immagini di abbigliamento/stile fornite e scrivere un PROMPT DI GENERAZIONE IMMAGINI master e universale in INGLESE. Questo prompt servirà come 'prefisso' o 'modello di stile' fisso per tutte le future generazioni di questa estetica. Devi estrarre: luci, inquadratura, mood, color grading, tipo di tessuto prevalente o dettagli stilistici. Esempio output valido: 'High fashion editorial photography, neon lights, cyberpunk aesthetic, harsh shadows, glowing accents, 8k resolution, volumetric lighting, photorealistic --'. NON DEVI inserire il soggetto umano, perché quello verrà aggiunto in seguito dal cliente (es. 'a woman wearing...'). Scrivi SOLO il prefisso di stile in inglese, partendo subito con gli stili senza preamboli.";

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
