import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching data from database...");
  
  // We need to fetch Categories, their Business Modes, Subcategories, and PromptTemplateSettings
  const categories = await prisma.category.findMany({
    include: {
      business_modes: {
        include: {
          subcategories: {
            include: {
              variations: true
            }
          }
        }
      }
    }
  });

  if (!categories || categories.length === 0) {
    console.log("No categories found in the database.");
    return;
  }

  // We will format this as CSV
  // Header
  const headers = [
    'Category_ID', 'Category_Name', 'Category_Slug', 
    'BusinessMode_ID', 'BusinessMode_Name', 'BusinessMode_Slug',
    'Subcategory_ID', 'Subcategory_Name', 'Subcategory_Slug',
    'Output_Language', 'Base_Prompt_Prefix', 'Product_Integrity_Rules', 'Negative_Prompt'
  ];

  const rows: string[][] = [];

  for (const cat of categories) {
    if (cat.business_modes.length === 0) {
      // Create a row for category only if it has no business modes? Probably not useful to export empty ones, 
      // but let's include it with empty sub-levels.
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
        const varPrompt = sub.variations?.[0]?.variation_prompt || '';
        rows.push([
          cat.id, cat.name, cat.slug,
          bm.id, bm.name, bm.slug,
          sub.id, sub.name, sub.slug,
          sub.output_language || 'it',
          sub.base_prompt_prefix || '',
          sub.product_integrity_rules || '',
          sub.negative_prompt || ''
        ]);
      }
    }
  }

  // Convert to CSV
  // Helper to escape quotes and commas
  const escapeCsv = (str: string) => {
    if (str == null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\n');

  const filePath = path.join(process.cwd(), 'supernexus_data.csv');
  fs.writeFileSync(filePath, csvContent, 'utf-8');
  
  console.log(`Successfully exported ${rows.length} rows to ${filePath}`);
}

main()
  .catch((e) => {
    console.error("Error during export:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
