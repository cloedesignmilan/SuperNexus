import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const categories = await prisma.promptTemplate.findMany({
            include: { store: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(categories);
    } catch (e: any) {
        return NextResponse.json({error: e.message}, {status: 500});
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        
        let scenesString = '[]';
        try {
           scenesString = typeof data.scenes === 'string' ? data.scenes : JSON.stringify(data.scenes || []);
        } catch(e) {}

        const created = await prisma.promptTemplate.create({
            data: {
                name: data.name,
                category: data.category || data.name,
                base_prompt: data.base_prompt || "N/A",
                rules: data.rules || "N/A",
                num_images: data.num_images ? parseInt(data.num_images) : 10,
                scenes: scenesString,
                store_id: data.store_id || null
            }
        });
        return NextResponse.json({ success: true, data: created });
    } catch(e: any) {
        return NextResponse.json({error: e.message}, {status: 500});
    }
}
