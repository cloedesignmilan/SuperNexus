import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const sposoScenesEn = [
  "Groom riding a vintage Vespa outside a church, bride behind smiling",
  "Groom hugging a little girl in front of a cathedral",
  "Groom smiling at a wedding reception with guests blurred in background",
  "Groom standing at the altar during outdoor ceremony",
  "Groom being adjusted by a tailor in a boutique",
  "Groom holding a glass during elegant indoor reception dinner",
  "Groom with a child in a romantic historic square",
  "Groom walking out of a church with confetti moment",
  "Groom posing alone in boutique with suit on hanger behind",
  "Groom adjusting his tie in a refined room with window light"
];

const sposoScenesIt = [
  "Vespa Vintage",
  "Cattedrale",
  "Ricevimento Nozze",
  "Altare All'aperto",
  "Sarto Boutique",
  "Cena Elegante",
  "Piazza Romantica",
  "Lancio Coriandoli",
  "Posa in Boutique",
  "Stanza Raffinata"
];

const PROMPT_MASTER = "A hyper-realistic professional wedding photograph of an attractive 28-40 year old European male model with well-groomed hair and natural skin texture. He is wearing EXACTLY the groom suit shown in the reference image (same color, fabric, fit, proportions, details). {SCENE}. Cinematic lighting, shot on 50mm or 85mm lens, shallow depth of field, natural colors, high-end wedding editorial style.";
const NEGATIVE_RULES = "No text, no logos, no watermarks, no AI artifacts, no bad proportions, no bad hands.";

export async function GET() {
  try {
    // 1. Controlla o Crea la Categoria "Sposo (Prova Live)"
    let category = await (prisma as any).category.findFirst({
        where: { name: "Sposo Uomo (AI)" }
    });

    if (!category) {
        category = await (prisma as any).category.create({
            data: {
                name: "Sposo Uomo (AI)",
                description: "Generatore integrato dal progetto GitHub Google AI",
                age_range: "28-40",
                is_active: true,
                sort_order: 10
            }
        });
    }

    // 2. Aggiorna o Crea il Prompt Master
    const existingMaster = await (prisma as any).promptMaster.findUnique({
        where: { category_id: category.id }
    });

    if (existingMaster) {
        await (prisma as any).promptMaster.update({
            where: { id: existingMaster.id },
            data: {
                prompt_text: PROMPT_MASTER,
                negative_rules: NEGATIVE_RULES
            }
        });
    } else {
        await (prisma as any).promptMaster.create({
            data: {
                category_id: category.id,
                title: "Prompt Ufficiale GitHub Sposo",
                prompt_text: PROMPT_MASTER,
                negative_rules: NEGATIVE_RULES
            }
        });
    }

    // 3. Purga vecchie Scene (se necessario) e inserisci le nuove 10
    await (prisma as any).scene.deleteMany({
        where: { category_id: category.id }
    });

    for (let i = 0; i < sposoScenesEn.length; i++) {
        await (prisma as any).scene.create({
            data: {
                category_id: category.id,
                title: sposoScenesIt[i],       // Titolo leggibile nel Database
                scene_text: sposoScenesEn[i],  // Il prompt inglese iniettabile in {SCENE}
                sort_order: i,
                is_active: true
            }
        });
    }

    return NextResponse.json({ 
        ok: true, 
        message: "✅ Categoria 'Sposo Uomo (AI)' integrata con successo nel DB Telegram!",
        scenes_count: sposoScenesEn.length 
    });

  } catch (error: any) {
    console.error("Errore Seed Sposo:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
