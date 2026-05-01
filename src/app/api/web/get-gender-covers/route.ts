import { NextResponse } from 'next/server';
import { getPromptsForSelection } from '@/lib/prompt-configs/index';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categorySlug, modeSlug, presentationSlug } = body;

    if (!categorySlug || !modeSlug || !presentationSlug) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch MAN shot 1
    const manShots = await getPromptsForSelection({
      categorySlug,
      modeSlug,
      presentationSlug: presentationSlug.toLowerCase(),
      gender: 'MAN',
      quantity: 1,
      specificShotNumber: 1
    });

    // Fetch WOMAN shot 1
    const womanShots = await getPromptsForSelection({
      categorySlug,
      modeSlug,
      presentationSlug: presentationSlug.toLowerCase(),
      gender: 'WOMAN',
      quantity: 1,
      specificShotNumber: 1
    });

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
