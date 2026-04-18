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
                variations: {
                  orderBy: { sort_order: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    const headers = [
      'Category_Slug', 'Category_Name',
      'BusinessMode_Slug', 'BusinessMode_Name',
      'Subcategory_Slug', 'Subcategory_Name',
      'Output_Language', 'Base_Prompt_Prefix', 'Product_Integrity_Rules', 'Negative_Prompt',
      'Variation_Code', 'Variation_Name', 'Variation_Prompt', 'Variation_Sort_Order'
    ];

    const rows: string[][] = [];

    for (const cat of categories) {
      if (cat.business_modes.length === 0) {
        rows.push([
          cat.slug, cat.name,
          '', '',
          '', '',
          '', '', '', '',
          '', '', '', ''
        ]);
      }

      for (const bm of cat.business_modes) {
        if (bm.subcategories.length === 0) {
           rows.push([
            cat.slug, cat.name,
            bm.slug, bm.name,
            '', '',
            '', '', '', '',
            '', '', '', ''
          ]);
        }

        for (const sub of bm.subcategories) {
          if (sub.variations.length === 0) {
             // Subcategory exists but no variations
             rows.push([
              cat.slug, cat.name,
              bm.slug, bm.name,
              sub.slug, sub.name,
              sub.output_language || 'it',
              sub.base_prompt_prefix || '',
              sub.product_integrity_rules || '',
              sub.negative_prompt || '',
              '', '', '', ''
            ]);
          } else {
             for (const variation of sub.variations) {
               rows.push([
                cat.slug, cat.name,
                bm.slug, bm.name,
                sub.slug, sub.name,
                sub.output_language || 'it',
                sub.base_prompt_prefix || '',
                sub.product_integrity_rules || '',
                sub.negative_prompt || '',
                variation.variation_code || '',
                variation.variation_name || '',
                variation.variation_prompt || '',
                variation.sort_order.toString()
               ]);
             }
          }
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
