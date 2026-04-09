import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CONFIG = {
  PROMPT_CONFIG_MASTER: {
    is_active: true,
    prompt_text: "You are a world-class professional commercial photographer. Create a hyper-realistic, 8k resolution, ultra-detailed fashion editorial photo."
  },
  PROMPT_CONFIG_SCENARIOS: [
    { id: "studio", title: "Studio E-commerce", scene_text: "Shot in a professional photo studio. Clean, neutral gray or white seamless backdrop. Softbox studio lighting for perfect product clarity.", camera_angles: ["Full body shot", "Mid shot", "Close-up portrait"], is_active: true },
    { id: "ambientata", title: "Ambientata Moderna", scene_text: "Shot on location in a stylish, modern realistic environment that matches the garment's vibe. Cinematic warm lighting.", camera_angles: ["Full body shot", "Mid shot", "Close-up portrait"], is_active: true },
    { id: "studio_calzature", title: "Studio Calzature", scene_text: "E-commerce macro still life. Floating or cleanly grounded on a reflective white pedestal.", camera_angles: ["Angled 3/4 front view", "Straight top-down flat lay", "Back heel view", "Side profile view"], is_active: true }
  ],
  PROMPT_CONFIG_CATEGORIES: [
    { category_name: "T-Shirt", prompt_text: "Focus on a natural, modern urban or studio vibe. Casual but premium look. The t-shirt must fit naturally without looking stiff.", order: 1, is_active: true },
    { category_name: "Cerimonia", prompt_text: "High-end luxury atmosphere. Focus on elegance, sophisticated lighting, and perfect draping. The character should look majestic and formal.", order: 2, is_active: true }
  ],
  PROMPT_CONFIG_MODIFIERS: [
    { key: "gender", name: "Genere", prompt_template: "Model Description: An attractive {gender} model posing naturally.", is_active: true },
    { key: "bottomType", name: "Bottom Fittizio", prompt_template: "Paired Bottom: {bottomType} (keep it matching, elegant and neutral, do not let it steal focus from the main garment)", is_active: true }
  ],
  PROMPT_CONFIG_NEGATIVES: {
    is_active: true,
    global_rules: "AVOID: cartoon style, 3d render, CGI, watermark, text, signature, bad anatomy, bad proportions, unnatural poses, distorted faces, altered garment details."
  },
  PROMPT_CONFIG_SETTINGS: {
    use_modular_builder: false, // Disabilitato di default, usa fallback vecchio finchè non attivato
    order: ["master", "scenario", "preservation", "category", "modifiers", "brand", "negative"]
  }
};

export async function GET(request: Request) {
  try {
    const keys = Object.keys(DEFAULT_CONFIG);
    const result: any = {};
    
    for (const key of keys) {
      const setting = await (prisma as any).setting.findUnique({ where: { key } });
      if (setting && setting.value) {
        result[key] = JSON.parse(setting.value);
      } else {
        result[key] = (DEFAULT_CONFIG as any)[key];
      }
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET prompt-builder completato con errore", error);
    return NextResponse.json({ error: "DB Fetch Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Support partial updates
    for (const key of Object.keys(body)) {
      if (Object.keys(DEFAULT_CONFIG).includes(key)) {
        await (prisma as any).setting.upsert({
          where: { key },
          update: { value: JSON.stringify(body[key]) },
          create: { key, value: JSON.stringify(body[key]) }
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST prompt-builder completato con errore", error);
    return NextResponse.json({ error: "DB Write Error" }, { status: 500 });
  }
}
