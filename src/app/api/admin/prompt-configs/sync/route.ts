import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    if (action === 'export') {
      const configs = await prisma.promptConfigShot.findMany({
        orderBy: [
          { category: 'asc' },
          { mode: 'asc' },
          { presentation: 'asc' },
          { shotNumber: 'asc' }
        ]
      });
      return NextResponse.json({ success: true, data: configs });
    }

    if (action === 'import' && Array.isArray(data)) {
      // Clear existing configs if needed or just upsert
      // For simplicity, we just insert avoiding duplicates
      let importedCount = 0;
      for (const item of data) {
        try {
          await prisma.promptConfigShot.upsert({
            where: {
              category_mode_presentation_shotNumber: {
                category: item.category,
                mode: item.mode,
                presentation: item.presentation,
                shotNumber: Number(item.shotNumber)
              }
            },
            update: {
              shotName: item.shotName,
              positivePrompt: item.positivePrompt,
              negativePrompt: item.negativePrompt,
              hardRules: item.hardRules,
              outputGoal: item.outputGoal,
              isActive: item.isActive,
              priority: Number(item.priority || 0),
              scene: item.scene,
              aspectRatio: item.aspectRatio
            },
            create: {
              category: item.category,
              mode: item.mode,
              presentation: item.presentation,
              shotNumber: Number(item.shotNumber),
              shotName: item.shotName,
              positivePrompt: item.positivePrompt,
              negativePrompt: item.negativePrompt,
              hardRules: item.hardRules,
              outputGoal: item.outputGoal,
              isActive: item.isActive ?? true,
              priority: Number(item.priority || 0),
              scene: item.scene,
              aspectRatio: item.aspectRatio
            }
          });
          importedCount++;
        } catch (e) {
          console.error("Import error on item:", item, e);
        }
      }
      return NextResponse.json({ success: true, count: importedCount });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in import/export:', error);
    return NextResponse.json({ error: 'Failed processing' }, { status: 500 });
  }
}
