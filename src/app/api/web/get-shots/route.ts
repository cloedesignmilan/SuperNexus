import { NextResponse } from 'next/server';
import { getPromptsForSelection } from '@/lib/prompt-configs/index';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categorySlug, modeSlug, presentationSlug } = body;

    if (!categorySlug || !modeSlug || !presentationSlug) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Passiamo quantity: 5 per recuperare tutti gli shot definiti per questa combo
    const shots = await getPromptsForSelection({
      categorySlug,
      modeSlug,
      presentationSlug,
      quantity: 5 
    });

    if (!shots || shots.length === 0) {
       return NextResponse.json({ shots: [] });
    }

    // Restituiamo solo l'elenco degli shot name unici
    const uniqueShots = Array.from(new Map(shots.map(s => {
       const sNum = (s as any).shotNumber || s.shot_number;
       const sName = (s as any).shotName || s.shot_name;
       return [sNum, { shot_number: sNum, shot_name: sName }];
    })).values());
    
    return NextResponse.json({ shots: uniqueShots });

  } catch (error) {
    console.error("Error fetching available shots:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
