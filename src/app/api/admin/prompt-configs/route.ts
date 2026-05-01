import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let whereClause = {};
    if (category) {
      whereClause = { category };
    }

    const configs = await prisma.promptConfigShot.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { mode: 'asc' },
        { presentation: 'asc' },
        { shotNumber: 'asc' }
      ]
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error('Error fetching prompt configs:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newShot = await prisma.promptConfigShot.create({
      data: {
        category: body.category,
        mode: body.mode,
        presentation: body.presentation,
        scene: body.scene,
        aspectRatio: body.aspectRatio,
        shotNumber: Number(body.shotNumber),
        shotName: body.shotName,
        positivePrompt: body.positivePrompt,
        negativePrompt: body.negativePrompt,
        hardRules: body.hardRules,
        outputGoal: body.outputGoal,
        imageUrl: body.imageUrl,
        priority: Number(body.priority || 0),
        isActive: body.isActive ?? true
      }
    });

    return NextResponse.json(newShot);
  } catch (error) {
    console.error('Error creating prompt config:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const updated = await prisma.promptConfigShot.update({
      where: { id: body.id },
      data: {
        category: body.category,
        mode: body.mode,
        presentation: body.presentation,
        scene: body.scene,
        aspectRatio: body.aspectRatio,
        shotNumber: Number(body.shotNumber),
        shotName: body.shotName,
        positivePrompt: body.positivePrompt,
        negativePrompt: body.negativePrompt,
        hardRules: body.hardRules,
        outputGoal: body.outputGoal,
        imageUrl: body.imageUrl,
        priority: Number(body.priority || 0),
        isActive: body.isActive
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating prompt config:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.promptConfigShot.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt config:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
