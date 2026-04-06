import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const categories = await prisma.category.findMany({
            include: { 
                prompt_master: true, 
                _count: { select: { scenes: true } }
            },
            orderBy: { sort_order: 'asc' }
        });
        return NextResponse.json(categories);
    } catch (e: any) {
        return NextResponse.json({error: e.message}, {status: 500});
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        
        const promptMasterPayload = data.prompt_master || { title: data.name + ' Master', prompt_text: "Modella base", negative_rules: "", studio_prompts: "" };
        const scenesPayload = data.scenes || []; 

        const created = await prisma.category.create({
            data: {
                name: data.name,
                description: data.description || '',
                age_range: data.age_range || "20-35",
                child_age_range: data.child_age_range || "4-12",
                is_active: data.is_active ?? true,
                sort_order: data.sort_order ?? 0,
                prompt_master: {
                    create: {
                        title: promptMasterPayload.title,
                        prompt_text: promptMasterPayload.prompt_text,
                        negative_rules: promptMasterPayload.negative_rules,
                        studio_prompts: promptMasterPayload.studio_prompts
                    }
                },
                scenes: {
                    create: scenesPayload.map((s: any, idx: number) => ({
                        title: s.title || `Scena ${idx}`,
                        scene_text: s.scene_text,
                        sort_order: idx,
                        is_active: true
                    }))
                }
            }
        });
        return NextResponse.json({ success: true, data: created });
    } catch(e: any) {
        return NextResponse.json({error: e.message}, {status: 500});
    }
}
