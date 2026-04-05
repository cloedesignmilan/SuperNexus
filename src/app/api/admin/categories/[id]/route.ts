import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const category = await prisma.category.findUnique({
            where: { id: params.id },
            include: { prompt_master: true, scenes: { orderBy: { sort_order: 'asc' } } }
        });
        if (!category) return NextResponse.json({error: "Non trovato"}, {status: 404});
        return NextResponse.json(category);
    } catch (e: any) {
        return NextResponse.json({error: e.message}, {status: 500});
    }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const data = await req.json();
        const promptMasterPayload = data.prompt_master || { title: data.name + ' Master', prompt_text: "Modella base", negative_rules: "" };
        const scenesPayload = data.scenes || []; 

        const updated = await prisma.category.update({
            where: { id: params.id },
            data: {
                name: data.name,
                description: data.description || '',
                age_range: data.age_range || "20-35",
                is_active: data.is_active ?? true,
                sort_order: data.sort_order ?? 0,
                prompt_master: {
                    upsert: {
                        create: {
                            title: promptMasterPayload.title,
                            prompt_text: promptMasterPayload.prompt_text,
                            negative_rules: promptMasterPayload.negative_rules
                        },
                        update: {
                            title: promptMasterPayload.title,
                            prompt_text: promptMasterPayload.prompt_text,
                            negative_rules: promptMasterPayload.negative_rules
                        }
                    }
                }
            }
        });

        // Update scenes by deleting old and inserting new
        await prisma.scene.deleteMany({ where: { category_id: params.id } });
        if (scenesPayload.length > 0) {
             await prisma.scene.createMany({
                 data: scenesPayload.map((s: any, idx: number) => ({
                     category_id: params.id,
                     title: s.title || `Scena ${idx}`,
                     scene_text: s.scene_text,
                     sort_order: idx,
                     is_active: true
                 }))
             });
        }

        return NextResponse.json({ success: true, data: updated });
    } catch(e: any) {
        return NextResponse.json({error: e.message}, {status: 500});
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        await prisma.category.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch(e: any) {
        return NextResponse.json({error: e.message}, {status: 500});
    }
}
