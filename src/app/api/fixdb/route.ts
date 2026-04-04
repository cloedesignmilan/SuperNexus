import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const cats = [
        "Business & tempo libero",
        "Cerimonia e festa",
        "Streetwear",
        "Bambini",
        "Sport",
        "Sposi",
        "Festa 18°"
    ];

    const store = await (prisma as any).store.findFirst();

    for (const cat of cats) {
        const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: cat } });
        if (!existing) {
             await (prisma as any).promptTemplate.create({
                 data: {
                     name: cat,
                     category: "auto_created",
                     base_prompt: "Create a photo.",
                     rules: "No text.",
                     store_id: store?.id,
                     scenes: JSON.stringify(["Walking in the city"])
                 }
             });
        }
    }
    return NextResponse.json({ ok: true, msg: "DB fixed" });
}
