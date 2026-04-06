import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const catSposa = await (prisma as any).category.findFirst({
            where: { name: 'Sposa' }
        });

        if (!catSposa) return NextResponse.json({ error: "Categoria Sposa non trovata" });

        await (prisma as any).promptMaster.update({
            where: { category_id: catSposa.id },
            data: {
                prompt_text: "You are the world's most acclaimed bridal fashion photographer shooting a highly realistic, candid bridal editorial shot on 35mm film. The subject is a beautiful bride with highly natural, unretouched facial features, genuine skin texture, real-life slight imperfections, and a soft, authentic expression (absolutely NO plastic, hyper-perfect, or AI-looking airbrushed faces). CRITICAL: The image MUST feature ONE FEMALE BRIDE ONLY. Completely isolate the bride. Do NOT generate a groom. Do NOT generate any male figures. Focus entirely on authentic cinematic lighting, the majestic draping of the bridal gown, the delicate lace, and the ethereal, true-to-life glow of the bride.",
                negative_rules: "No groom, no men, no couples, no split screen, no two people, no plastic faces, no excessive makeup, no airbrushed skin, no CGI looking eyes, no masculine suits, no messy backgrounds, out of focus, bad proportions, bad hands."
            }
        });

        return NextResponse.json({ success: true, message: "Prompt Master 'Sposa' aggiornato per visi più naturali e realistici!" });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
