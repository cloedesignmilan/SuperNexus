"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

export async function createSubcategory(formData: FormData) {
  const name = formData.get("name") as string;
  const business_mode_id = formData.get("business_mode_id") as string;
  const description = formData.get("description") as string;
  const internal_notes = formData.get("internal_notes") as string;
  const preview_image = formData.get("preview_image") as string;
  const max_images_allowed = parseInt(formData.get("max_images_allowed") as string) || 10;
  const style_type = formData.get("style_type") as string;
  const output_goal = formData.get("output_goal") as string;
  const business_context = formData.get("business_context") as string;
  const visual_priority = parseInt(formData.get("visual_priority") as string) || 0;
  
  if (!name || !business_mode_id) throw new Error("Il nome e la macrocategoria (Business Mode) sono obbligatori");

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
    where: { business_mode_id },
    orderBy: { sort_order: 'desc' }
  });
  const nextOrder = highestPriority ? highestPriority.sort_order + 1 : 0;

  await prisma.subcategory.create({
    data: {
      name,
      slug: uniqueSlug,
      business_mode_id,
      description,
      internal_notes,
      preview_image,
      max_images_allowed,
      style_type,
      output_goal,
      business_context,
      visual_priority,
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
  const business_mode_id = formData.get("business_mode_id") as string;
  const description = formData.get("description") as string;
  const internal_notes = formData.get("internal_notes") as string;
  const preview_image = formData.get("preview_image") as string;
  const max_images_allowed = parseInt(formData.get("max_images_allowed") as string) || 10;
  const style_type = formData.get("style_type") as string;
  const output_goal = formData.get("output_goal") as string;
  const business_context = formData.get("business_context") as string;
  const visual_priority = parseInt(formData.get("visual_priority") as string) || 0;
  
  if (!name || !business_mode_id) throw new Error("Nome e genitore sono obbligatori");

  await prisma.subcategory.update({
    where: { id },
    data: { 
      name, business_mode_id, description, internal_notes, preview_image, 
      max_images_allowed, style_type, output_goal, business_context, visual_priority 
    }
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

export async function toggleStrictReferenceMode(id: string, currentStatus: boolean) {
  await prisma.subcategory.update({
    where: { id },
    data: { strict_reference_mode: !currentStatus }
  });
  revalidatePath(`/admin/subcategories/${id}`);
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

export async function reorderReferenceImages(subcategoryId: string, imageIds: string[]) {
  const updates = imageIds.map((id, index) => 
    prisma.subcategoryReferenceImage.update({
      where: { id },
      data: { image_order: index }
    })
  );
  await prisma.$transaction(updates);
  revalidatePath(`/admin/subcategories/${subcategoryId}`);
}

export async function runVisionAnalysis(subcategoryId: string) {
  try {
    const subcat = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
      include: { reference_images: true }
    });

    if (!subcat || subcat.reference_images.length === 0) {
      return { success: false, error: "Nessuna immagine fornita." };
    }

  // 1. Download images to buffer and convert to base64
  const fs = require('fs');
  const path = require('path');
  
  const inlineDataImages = await Promise.all(
    subcat.reference_images.map(async (img) => {
      let base64 = '';
      let mimeType = 'image/jpeg';
      
      if (img.image_url.startsWith('/')) {
        // Local file
        const filePath = path.join(process.cwd(), 'public', img.image_url);
        const buffer = fs.readFileSync(filePath);
        base64 = buffer.toString('base64');
        if (img.image_url.toLowerCase().endsWith('.png')) mimeType = 'image/png';
        if (img.image_url.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';
      } else {
        // Remote URL
        const response = await fetch(img.image_url);
        const arrayBuffer = await response.arrayBuffer();
        base64 = Buffer.from(arrayBuffer).toString('base64');
        mimeType = response.headers.get('content-type') || 'image/jpeg';
      }
      
      return {
        inlineData: {
          data: base64,
          mimeType
        }
      };
    })
  );

  // 2. Build Gemini prompt
  const systemInstruction = `Sei un Master Prompt Engineer e Senior Art Director.
Il tuo compito è analizzare un set di reference fotografiche e fare "reverse engineering" per estrarre il VERO "DNA visivo" creando un PROMPT DI GENERAZIONE MAGISTRALE (in inglese).
Il tuo prompt DEVE incorporare queste 4 dimensioni e amalgamarle in un testo descrittivo continuo, denso e iper-tecnico:
1. Cinematography & Camera: Tipologia di pellicola, lenti, esposizione (es. 35mm, f/1.8, bokeh, Kodak Portra 400). Orario solare, direzionalità e tipologia del lighting (golden hour, neon, rim lighting, softbox).
2. Environment: Sfondo e macro-ambiente circostante dettagliati al millimetro. Non essere vago, fornisci il mood spaziale esatto.
3. Subject & Lifestyle: L'atteggiamento dei soggetti, posa, emozione, probabile etnicità (se essenziale per il vibe). La tipologia di scatto (es. candid street photography, posed high-end fashion editorial).
4. Styling Mood: Le texture dominanti (seta, pelle, materiali industriali) per supportare il mood.
ATTENZIONE MASSIMA: Non fare una lista puntata. Genera UN UNICO blocco di testo narrativo ricchissimo in inglese (max 120 parole). Sii specifico, non generalizzare. L'output deve essere composto SOLO ED ESCLUSIVAMENTE dal testo per il prompt, nessuna parola introduttiva.`;

  const visualDirection = subcat.internal_notes ? `\nDIRETTIVA CATEGORICA DELL'AMMINISTRATORE (Deve avere assoluta priorità sull'estrazione): ${subcat.internal_notes}\n` : "";

  const payload = {
    contents: [{
      role: "user",
      parts: [
        { text: `${systemInstruction}\n\n${visualDirection}\n\nAdesso estrai l'identikit visivo master in inglese da queste reference fornite:` },
        ...inlineDataImages
      ]
    }],
    generationConfig: {
      temperature: 0.2, // Temperatura bassa per massima estrazione analitica
      maxOutputTokens: 4000
    },
    safetySettings: [
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ]
  };

  const aiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GOOGLE_AI_STUDIO_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

    const aiData = await aiResp.json();
    
    if (!aiResp.ok) {
      console.error(aiData);
      return { success: false, error: "Errore API Gemini: " + (aiData.error?.message || "Unknown error") };
    }

    if (!aiData.candidates || !aiData.candidates[0]) {
      console.error("Gemini Response Data:", JSON.stringify(aiData, null, 2));
      return { success: false, error: `Risposta AI Anomala o Blocco Sicurezza: ${JSON.stringify(aiData)}` };
    }

    const generatedPrompt = aiData.candidates[0].content?.parts?.[0]?.text?.trim() || "";
    if (!generatedPrompt) {
       console.error("Generazione VUOTA. Dati completi:", JSON.stringify(aiData, null, 2));
       return { success: false, error: `Generazione Vuota. FinishReason: ${aiData.candidates[0].finishReason}` };
    }

    // 3. Salva nella Subcategory
    await prisma.subcategory.update({
      where: { id: subcategoryId },
      data: {
        base_prompt_prefix: generatedPrompt
      }
    });

    revalidatePath("/admin/subcategories");
    return { success: true };
  } catch(error: any) {
    console.error("Critical runVisionAnalysis error", error);
    return { success: false, error: error.message };
  }
}

export async function updateValidationStatus(id: string, status: string) {
  await prisma.outputValidationCheck.update({
    where: { id },
    data: { comparison_status: status, last_checked_at: new Date() }
  });
  revalidatePath("/admin/subcategories");
}

export async function updateValidationNotes(id: string, notes: string) {
  await prisma.outputValidationCheck.update({
    where: { id },
    data: { review_notes: notes }
  });
  revalidatePath("/admin/subcategories");
}

export async function updateSubcategoryModel(id: string, model: string | null) {
  await prisma.subcategory.update({
    where: { id },
    data: { active_model: model }
  });
  revalidatePath(`/admin/subcategories/${id}`);
}

export async function updateSubcategorySceneVariance(subcategoryId: string, value: boolean | null) {
  await prisma.subcategory.update({
    where: { id: subcategoryId },
    data: { scene_variance_active: value }
  });
  revalidatePath("/admin/subcategories");
}
