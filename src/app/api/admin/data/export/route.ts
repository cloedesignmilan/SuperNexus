import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        business_modes: {
          include: {
            subcategories: {
              include: {
                prompt_settings: true
              }
            }
          }
        }
      }
    });

    const headers = [
      'Category_ID', 'Category_Name', 'Category_Slug', 
      'BusinessMode_ID', 'BusinessMode_Name', 'BusinessMode_Slug',
      'Subcategory_ID', 'Subcategory_Name', 'Subcategory_Slug',
      'Output_Language', 'Base_Prompt_Prefix', 'Product_Integrity_Rules', 'Negative_Prompt'
    ];

    const rows: string[][] = [];

    for (const cat of categories) {
      if (cat.business_modes.length === 0) {
        rows.push([
          cat.id, cat.name, cat.slug,
          '', '', '',
          '', '', '',
          '', '', '', ''
        ]);
      }

      for (const bm of cat.business_modes) {
        if (bm.subcategories.length === 0) {
           rows.push([
            cat.id, cat.name, cat.slug,
            bm.id, bm.name, bm.slug,
            '', '', '',
            '', '', '', ''
          ]);
        }

        for (const sub of bm.subcategories) {
          const prompt = sub.prompt_settings;
          rows.push([
            cat.id, cat.name, cat.slug,
            bm.id, bm.name, bm.slug,
            sub.id, sub.name, sub.slug,
            prompt?.output_language || 'it',
            prompt?.base_prompt_prefix || '',
            prompt?.product_integrity_rules || '',
            prompt?.negative_prompt || ''
          ]);
        }
      }
    }

    const escapeCsv = (str: string) => {
      if (str == null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="supernexus_data.csv"',
      },
    });

  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
