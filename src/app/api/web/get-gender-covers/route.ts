import { NextResponse } from 'next/server';
import { getPromptsForSelection } from '@/lib/prompt-configs/index';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categorySlug, modeSlug, presentationSlug } = body;

    if (!categorySlug || !modeSlug) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const normMode = modeSlug.toLowerCase().trim();

    let manShots: any[] = [];
    let womanShots: any[] = [];

    if (presentationSlug) {
      manShots = (await getPromptsForSelection({
        categorySlug,
        modeSlug,
        presentationSlug: presentationSlug.toLowerCase(),
        gender: 'MAN',
        quantity: 1,
        specificShotNumber: 1
      })) || [];

      womanShots = (await getPromptsForSelection({
        categorySlug,
        modeSlug,
        presentationSlug: presentationSlug.toLowerCase(),
        gender: 'WOMAN',
        quantity: 1,
        specificShotNumber: 1
      })) || [];
    } else {
      // If presentation is not selected yet, find ANY shot with an image for MAN and WOMAN under this Category+Mode
      const manShotEntry = await prisma.promptConfigShot.findFirst({
         where: { category: categorySlug, mode: { contains: normMode }, presentation: { contains: 'man' }, imageUrl: { not: null, notIn: [''] } }
      });
      const womanShotEntry = await prisma.promptConfigShot.findFirst({
         where: { category: categorySlug, mode: { contains: normMode }, presentation: { contains: 'woman' }, imageUrl: { not: null, notIn: [''] } }
      });
      if (manShotEntry) manShots = [manShotEntry];
      if (womanShotEntry) womanShots = [womanShotEntry];
    }

    const manImageUrl = (manShots && manShots.length > 0) ? ((manShots[0] as any).image_url || (manShots[0] as any).imageUrl || null) : null;
    const womanImageUrl = (womanShots && womanShots.length > 0) ? ((womanShots[0] as any).image_url || (womanShots[0] as any).imageUrl || null) : null;

    return NextResponse.json({ 
      manImage: manImageUrl,
      womanImage: womanImageUrl
    });

  } catch (error) {
    console.error("Error fetching gender covers:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
