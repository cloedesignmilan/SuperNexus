import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const templates = await (prisma as any).promptTemplate.findMany();
    const data = templates.map((t: any) => ({
        name: t.name,
        sceneCount: JSON.parse(t.scenes).length
    }));
    return NextResponse.json(data);
}
