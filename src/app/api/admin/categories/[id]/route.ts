import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const category = await prisma.promptTemplate.findUnique({
            where: { id: params.id },
            include: { store: true }
        });
        if (!category) return NextResponse.json({error: "Non trovato"}, {status: 404});
        return NextResponse.json(category);
    } catch (e: any) {
        return NextResponse.json({error: e.message}, {status: 500});
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const data = await req.json();
        
        let scenesString = data.scenes;
        if (typeof data.scenes !== 'string') {
           try { scenesString = JSON.stringify(data.scenes); } catch(e) {}
        }

        const defaultUpdateData: any = {
            name: data.name,
            category: data.name,
            num_images: data.num_images ? parseInt(data.num_images) : undefined,
            scenes: scenesString,
            store_id: data.store_id || null
        };
        
        const updated = await prisma.promptTemplate.update({
            where: { id: params.id },
            data: defaultUpdateData
        });

        return NextResponse.json({ success: true, data: updated });
    } catch(e: any) {
        return NextResponse.json({error: e.message}, {status: 500});
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await prisma.promptTemplate.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch(e: any) {
        return NextResponse.json({error: e.message}, {status: 500});
    }
}
