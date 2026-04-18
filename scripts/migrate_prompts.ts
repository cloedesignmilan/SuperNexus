import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Inizio migrazione dati da PromptTemplateSettings a Subcategory...");

  // Trova tutti i prompt template esistenti
  const settings = await prisma.promptTemplateSettings.findMany();

  console.log(`Trovati ${settings.length} settings da migrare.`);

  for (const s of settings) {
    // Aggiorna la Subcategory
    await prisma.subcategory.update({
      where: { id: s.subcategory_id },
      data: {
        base_prompt_prefix: s.base_prompt_prefix,
        product_integrity_rules: s.product_integrity_rules,
        negative_prompt: s.negative_prompt,
        output_language: s.output_language,
      }
    });

    // Crea una prima variazione vuota di default in modo che generi almeno 1 immagine (se lo desideriamo)
    // Creiamo 3 variazioni di base per simulare il comportamento "genera 3 immagini" che c'era prima?
    // Il cliente ha detto "generate ONE image per variation prompt". Prima ne generavamo 3 o 4 (imgCount).
    // Creiamo 3 variazioni temporanee per mantenere la retrocompatibilità del numero di immagini generate:
    
    // Controlliamo se ha già variazioni (per sicurezza se lo script gira più volte)
    const existingVars = await prisma.subcategoryVariation.count({
        where: { subcategory_id: s.subcategory_id }
    });

    if (existingVars === 0) {
        await prisma.subcategoryVariation.createMany({
            data: [
                {
                    subcategory_id: s.subcategory_id,
                    variation_code: "var_1",
                    variation_name: "Variazione 1",
                    variation_prompt: "Standard photorealistic composition, beautifully centered.",
                    sort_order: 1
                },
                {
                    subcategory_id: s.subcategory_id,
                    variation_code: "var_2",
                    variation_name: "Variazione 2",
                    variation_prompt: "Dynamic angle, cinematic lighting.",
                    sort_order: 2
                },
                {
                    subcategory_id: s.subcategory_id,
                    variation_code: "var_3",
                    variation_name: "Variazione 3",
                    variation_prompt: "Close up detail shot.",
                    sort_order: 3
                }
            ]
        });
    }
  }

  console.log("Migrazione completata con successo!");
}

main()
  .catch(e => {
    console.error("Errore durante migrazione:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
