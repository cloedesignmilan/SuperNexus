const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existingCat = await prisma.category.findUnique({ where: { slug: 'everyday' } });
  if (existingCat) {
    console.log('Everyday already exists.');
    return;
  }

  // Find t-shirt
  const srcCat = await prisma.category.findUnique({
    where: { slug: 't-shirt' },
    include: {
      business_modes: {
        include: {
          subcategories: true
        }
      }
    }
  });

  if (!srcCat) {
    console.error('T-shirt category not found, cannot duplicate.');
    return;
  }

  console.log('Duplicating t-shirt taxonomy for everyday...');

  const newCat = await prisma.category.create({
    data: {
      user_id: srcCat.user_id,
      name: 'Everyday / Apparel',
      slug: 'everyday',
      description: 'Casual and everyday clothing.',
      sort_order: srcCat.sort_order + 1,
      is_active: true,
      global_positive_prompt: srcCat.global_positive_prompt,
      global_negative_prompt: srcCat.global_negative_prompt,
      global_hard_rules: srcCat.global_hard_rules,
      cover_image: srcCat.cover_image
    }
  });

  for (const bm of srcCat.business_modes) {
    const newBmSlug = `everyday-${bm.slug.replace('t-shirt-', '')}`;
    const newBm = await prisma.businessMode.create({
      data: {
        category_id: newCat.id,
        name: bm.name,
        slug: newBmSlug,
        description: bm.description,
        sort_order: bm.sort_order,
        is_active: bm.is_active,
        cover_image: bm.cover_image
      }
    });

    for (const sub of bm.subcategories) {
      const newSubSlug = `everyday-${newBmSlug}-${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      await prisma.subcategory.create({
        data: {
          business_mode_id: newBm.id,
          name: sub.name,
          slug: newSubSlug,
          description: sub.description,
          strict_reference_mode: sub.strict_reference_mode,
          sort_order: sub.sort_order,
          is_active: sub.is_active,
          negative_prompt: sub.negative_prompt,
          cover_image: sub.cover_image,
          preview_image: sub.preview_image
        }
      });
    }
  }

  console.log('Successfully created Everyday / Apparel taxonomy!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
