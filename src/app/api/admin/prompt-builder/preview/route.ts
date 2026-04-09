import { NextResponse } from 'next/server';
import { buildCreatorPrompt } from '@/lib/promptBuilder';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      config,         // Tutta la configurazione in JSON (proveniente dalla UI non salvata)
      categoryName,   // Esempio "Donna"
      scenarioId,     // Esempio "ambientata"
      modifiers,      // Esempio { gender: "female", bottomType: "jeans" }
      inspectorData   // Un Inspector mock dummy per testare i cloni
    } = body;

    if (!config || !config.PROMPT_CONFIG_MASTER) {
       return NextResponse.json({ error: "Configurazione assente o corrotta" }, { status: 400 });
    }

    // Estraiamo la struttura proprio come fa api/generate/route.ts
    const masterPromptText = config.PROMPT_CONFIG_MASTER.is_active 
        ? config.PROMPT_CONFIG_MASTER.prompt_text 
        : "MASTER_PROMPT_DISATTIVATO_IN_CONFIG";

    const negativeRulesText = config.PROMPT_CONFIG_NEGATIVES?.is_active
        ? config.PROMPT_CONFIG_NEGATIVES.global_rules
        : "Nessuna negative rule globale.";

    let categoryFocusName = categoryName || 'Sconosciuta';
    if (config.PROMPT_CONFIG_CATEGORIES) {
        const catOverride = config.PROMPT_CONFIG_CATEGORIES.find((c: any) => c.category_name === categoryFocusName && c.is_active);
        if (catOverride) {
            categoryFocusName = catOverride.prompt_text; 
        }
    }

    let sceneText = "Nessuna Scena.";
    if (config.PROMPT_CONFIG_SCENARIOS) {
         const sc = config.PROMPT_CONFIG_SCENARIOS.find((s: any) => s.id === scenarioId && s.is_active);
         if (sc) {
              sceneText = sc.scene_text; 
         }
    }

    const testPrompt = buildCreatorPrompt(
        inspectorData || { preservation_constraints: { critical_details: "[SIMULATED CLONE OF THE ORIGINAL IMAGE]" } },
        categoryFocusName,
        { ...modifiers, cameraAngle: "Mid shot, framed from the waist up" },
        masterPromptText,
        sceneText,
        negativeRulesText,
        "",
        ""
    );

    return NextResponse.json({ success: true, prompt: testPrompt });
  } catch (error) {
    console.error("Preview Generator fallito", error);
    return NextResponse.json({ error: "Errore compilazione Preview" }, { status: 500 });
  }
}
