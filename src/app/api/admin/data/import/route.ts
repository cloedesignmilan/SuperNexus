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

    // Assuming a user_id for categories, we'll just pick the first admin user
    // or we might need to get it from auth. For this script, we'll find an admin.
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

      const subcategory = await prisma.subcategory.upsert({
        where: { slug: subSlug },
        update: { name: subName, business_mode_id: businessMode.id },
        create: {
          name: subName,
          slug: subSlug,
          business_mode_id: businessMode.id,
          is_active: true
        }
      });

      // 4. Upsert Prompt Settings
      const outputLang = row.Output_Language?.trim() || 'it';
      const basePrompt = row.Base_Prompt_Prefix?.trim() || '';
      const integrityRules = row.Product_Integrity_Rules?.trim() || '';
      const negativePrompt = row.Negative_Prompt?.trim() || '';

      await prisma.promptTemplateSettings.upsert({
        where: { subcategory_id: subcategory.id },
        update: {
          output_language: outputLang,
          base_prompt_prefix: basePrompt,
          product_integrity_rules: integrityRules,
          negative_prompt: negativePrompt
        },
        create: {
          subcategory_id: subcategory.id,
          output_language: outputLang,
          base_prompt_prefix: basePrompt,
          product_integrity_rules: integrityRules,
          negative_prompt: negativePrompt
        }
      });

      updatedCount++;
    }

    return NextResponse.json({ success: true, updatedCount });

  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: 'Failed to import data', message: error.message }, { status: 500 });
  }
}
