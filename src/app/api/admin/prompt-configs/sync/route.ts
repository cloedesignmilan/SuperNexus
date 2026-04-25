import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    if (action === 'export') {
      const flatConfigs = await prisma.promptConfigShot.findMany({
        orderBy: [
          { category: 'asc' },
          { mode: 'asc' },
          { presentation: 'asc' },
          { shotNumber: 'asc' }
        ]
      });

      // Group into nested structure
      const grouped: any = {};
      
      for (const row of flatConfigs) {
        if (!grouped[row.category]) {
          grouped[row.category] = { category: row.category, configs: [] };
        }
        
        const catGroup = grouped[row.category];
        
        // Find existing config block
        let configBlock = catGroup.configs.find((c: any) => 
          c.mode === row.mode && 
          c.presentation === row.presentation && 
          c.scene === row.scene &&
          c.aspectRatio === row.aspectRatio
        );
        
        if (!configBlock) {
          configBlock = {
            mode: row.mode,
            presentation: row.presentation,
            scene: row.scene,
            aspectRatio: row.aspectRatio,
            shots: []
          };
          catGroup.configs.push(configBlock);
        }
        
        configBlock.shots.push({
          shotNumber: row.shotNumber,
          shotName: row.shotName,
          positivePrompt: row.positivePrompt,
          negativePrompt: row.negativePrompt,
          hardRules: row.hardRules,
          outputGoal: row.outputGoal,
          priority: row.priority,
          isActive: row.isActive
        });
      }

      const nestedData = Object.values(grouped);
      return NextResponse.json({ success: true, data: nestedData });
    }

    if (action === 'import' && Array.isArray(data)) {
      let importedCount = 0;
      let errors = [];

      // Parse nested structure to flat
      for (const catNode of data) {
        if (!catNode.category || !Array.isArray(catNode.configs)) {
          errors.push(`Invalid category node missing category or configs array.`);
          continue;
        }

        for (const configNode of catNode.configs) {
          if (!configNode.mode || !configNode.presentation || !Array.isArray(configNode.shots)) {
            errors.push(`Category ${catNode.category} has an invalid config block missing mode, presentation or shots array.`);
            continue;
          }

          for (const shot of configNode.shots) {
            if (shot.shotNumber == null || !shot.shotName || !shot.positivePrompt || !shot.negativePrompt || !shot.hardRules) {
              errors.push(`Shot missing required fields in ${catNode.category} -> ${configNode.mode}`);
              continue;
            }

            try {
              const existing = await prisma.promptConfigShot.findFirst({
                where: {
                  category: catNode.category,
                  mode: configNode.mode,
                  presentation: configNode.presentation,
                  scene: configNode.scene || "all",
                  aspectRatio: configNode.aspectRatio || null,
                  shotNumber: Number(shot.shotNumber)
                }
              });

              if (existing) {
                await prisma.promptConfigShot.update({
                  where: { id: existing.id },
                  data: {
                    shotName: shot.shotName,
                    positivePrompt: shot.positivePrompt,
                    negativePrompt: shot.negativePrompt,
                    hardRules: shot.hardRules,
                    outputGoal: shot.outputGoal || null,
                    isActive: shot.isActive ?? true,
                    priority: Number(shot.priority || 0),
                    scene: configNode.scene || "all",
                    aspectRatio: configNode.aspectRatio || null
                  }
                });
              } else {
                await prisma.promptConfigShot.create({
                  data: {
                    category: catNode.category,
                    mode: configNode.mode,
                    presentation: configNode.presentation,
                    shotNumber: Number(shot.shotNumber),
                    shotName: shot.shotName,
                    positivePrompt: shot.positivePrompt,
                    negativePrompt: shot.negativePrompt,
                    hardRules: shot.hardRules,
                    outputGoal: shot.outputGoal || null,
                    isActive: shot.isActive ?? true,
                    priority: Number(shot.priority || 0),
                    scene: configNode.scene || "all",
                    aspectRatio: configNode.aspectRatio || null
                  }
                });
              }
              importedCount++;
            } catch (e) {
              console.error("Import error on shot:", shot, e);
              errors.push(`Failed to save shot ${shot.shotNumber} in ${catNode.category}`);
            }
          }
        }
      }

      if (errors.length > 0) {
        return NextResponse.json({ success: true, count: importedCount, errors });
      }
      return NextResponse.json({ success: true, count: importedCount });
    }

    return NextResponse.json({ error: 'Invalid action or data format' }, { status: 400 });
  } catch (error) {
    console.error('Error in import/export:', error);
    return NextResponse.json({ error: 'Failed processing' }, { status: 500 });
  }
}
