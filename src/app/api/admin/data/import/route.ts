import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      console.error("CSV Parse Errors:", result.errors);
      return NextResponse.json({ error: 'Invalid CSV format', details: result.errors }, { status: 400 });
    }

    const rows = result.data as any[];

    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!adminUser) throw new Error("No admin user found to assign categories");

    let updatedCount = 0;

    for (const row of rows) {
      // 1. Upsert Category
      const catName = row.Category_Name?.trim();
      if (!catName) continue;
      
      const catSlug = row.Category_Slug?.trim() || generateSlug(catName);
      
      const category = await prisma.category.upsert({
        where: { slug: catSlug },
        update: { name: catName },
        create: {
          name: catName,
          slug: catSlug,
          user_id: adminUser.id,
          is_active: true
        }
      });

      // 2. Upsert Business Mode
      const bmName = row.BusinessMode_Name?.trim();
      if (!bmName) continue;

      const bmSlug = row.BusinessMode_Slug?.trim() || generateSlug(bmName);
      
      const businessMode = await prisma.businessMode.upsert({
        where: { slug: bmSlug },
        update: { name: bmName, category_id: category.id },
        create: {
          name: bmName,
          slug: bmSlug,
          category_id: category.id,
          is_active: true
        }
      });

      // 3. Upsert Subcategory
      const subName = row.Subcategory_Name?.trim();
      if (!subName) continue;

      const subSlug = row.Subcategory_Slug?.trim() || generateSlug(subName);
      
      const outputLang = row.Output_Language?.trim() || 'it';
      const basePrompt = row.Base_Prompt_Prefix?.trim() || '';
      const integrityRules = row.Product_Integrity_Rules?.trim() || '';
      const negativePrompt = row.Negative_Prompt?.trim() || '';

      const subcategory = await prisma.subcategory.upsert({
        where: { slug: subSlug },
        update: { 
            name: subName, 
            business_mode_id: businessMode.id,
            output_language: outputLang,
            base_prompt_prefix: basePrompt,
            product_integrity_rules: integrityRules,
            negative_prompt: negativePrompt
        },
        create: {
            name: subName,
            slug: subSlug,
            business_mode_id: businessMode.id,
            is_active: true,
            output_language: outputLang,
            base_prompt_prefix: basePrompt,
            product_integrity_rules: integrityRules,
            negative_prompt: negativePrompt
        }
      });

      // 4. Upsert Variation (if specified)
      const varCode = row.Variation_Code?.trim();
      if (varCode) {
          const varName = row.Variation_Name?.trim() || varCode;
          const varPrompt = row.Variation_Prompt?.trim() || '';
          const varSort = parseInt(row.Variation_Sort_Order) || 0;

          // Per l'upsert ci serve un identificatore unico, ma non abbiamo un field unico sul DB per Variation_Code.
          // Troviamo la variazione usando findFirst, poi facciamo update o create.
          const existingVar = await prisma.subcategoryVariation.findFirst({
              where: { subcategory_id: subcategory.id, variation_code: varCode }
          });

          if (existingVar) {
              await prisma.subcategoryVariation.update({
                  where: { id: existingVar.id },
                  data: {
                      variation_name: varName,
                      variation_prompt: varPrompt,
                      sort_order: varSort
                  }
              });
          } else {
              await prisma.subcategoryVariation.create({
                  data: {
                      subcategory_id: subcategory.id,
                      variation_code: varCode,
                      variation_name: varName,
                      variation_prompt: varPrompt,
                      sort_order: varSort,
                      is_active: true
                  }
              });
          }
      }

      updatedCount++;
    }

    return NextResponse.json({ success: true, updatedCount });

  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: 'Failed to import data', message: error.message }, { status: 500 });
  }
}
