const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const donnaCatId = "953f9b5a-4643-4638-817f-de27a1b5e593";
  const uomoCatId = "e389a425-731f-4fdf-ac51-75ba84eeb5e6";

  // Create Business Modes
  const donnaMagMode = await prisma.businessMode.create({
    data: {
      category_id: donnaCatId,
      name: "Magazine Covers",
      slug: "w-magazine-covers",
      sort_order: 50,
      is_active: true
    }
  });

  const uomoMagMode = await prisma.businessMode.create({
    data: {
      category_id: uomoCatId,
      name: "Magazine Covers",
      slug: "m-magazine-covers",
      sort_order: 50,
      is_active: true
    }
  });

  // Create Subcategories
  const subs = [
    {
      name: "Vogue Cover",
      slug: "vogue-cover",
      business_mode_id: donnaMagMode.id,
      base_prompt_prefix: 'Shot on 35mm film, Leica M11. Masterpiece, high-fashion magazine cover. Beautiful model in avant-garde designer wear, dramatic studio lighting, bold serif typography that says "VOGUE" at the top. Elegant minimalist layout, sophisticated editorial photography, realistic skin texture.',
      negative_prompt: "(plastic skin:1.5), (CGI:1.5), (fake lighting:1.5), heavily airbrushed, cartoon, 3d render, low resolution, bad anatomy, deformed limbs",
      product_integrity_rules: "Must absolutely preserve the exact shape, texture, pattern, and color of the original garments. Do not invent details.",
      preview_image: "/copertine/vogue.jpg",
      sort_order: 10
    },
    {
      name: "Harper's Bazaar Cover",
      slug: "bazaar-cover",
      business_mode_id: donnaMagMode.id,
      base_prompt_prefix: 'Shot on medium format, Hasselblad. Masterpiece, luxury fashion magazine cover. Stunning model in high-end couture, soft ethereal natural lighting, sophisticated serif typography that says "HARPER\'S BAZAAR" at the top. Artistic high-fashion editorial layout, elegant, realistic skin texture.',
      negative_prompt: "(plastic skin:1.5), (CGI:1.5), (fake lighting:1.5), heavily airbrushed, cartoon, 3d render, low resolution, bad anatomy, deformed limbs",
      product_integrity_rules: "Must absolutely preserve the exact shape, texture, pattern, and color of the original garments. Do not invent details.",
      preview_image: "/copertine/bazaar.jpg",
      sort_order: 20
    },
    {
      name: "Elle Cover",
      slug: "elle-cover",
      business_mode_id: donnaMagMode.id,
      base_prompt_prefix: 'Shot on 35mm film, Leica M11. Masterpiece, lifestyle fashion magazine cover. Beautiful model in trendy accessible fashion, vibrant colors, dynamic and confident pose, bold modern typography that says "ELLE" at the top. Clean commercial editorial layout, realistic skin texture.',
      negative_prompt: "(plastic skin:1.5), (CGI:1.5), (fake lighting:1.5), heavily airbrushed, cartoon, 3d render, low resolution, bad anatomy, deformed limbs",
      product_integrity_rules: "Must absolutely preserve the exact shape, texture, pattern, and color of the original garments. Do not invent details.",
      preview_image: "/copertine/elle.jpg",
      sort_order: 30
    },
    {
      name: "Marie Claire Cover",
      slug: "marie-claire-cover",
      business_mode_id: donnaMagMode.id,
      base_prompt_prefix: 'Shot on 35mm film. Masterpiece, sophisticated women\'s magazine cover. Beautiful intellectual model in chic fashion, soft studio lighting, elegant typography that says "MARIE CLAIRE" at the top. Sophisticated culture and fashion editorial design, realistic skin texture.',
      negative_prompt: "(plastic skin:1.5), (CGI:1.5), (fake lighting:1.5), heavily airbrushed, cartoon, 3d render, low resolution, bad anatomy, deformed limbs",
      product_integrity_rules: "Must absolutely preserve the exact shape, texture, pattern, and color of the original garments. Do not invent details.",
      preview_image: "/copertine/marie-claire.jpg",
      sort_order: 40
    },
    {
      name: "GQ Cover",
      slug: "gq-cover",
      business_mode_id: uomoMagMode.id,
      base_prompt_prefix: 'Shot on medium format, Hasselblad. Masterpiece, contemporary men\'s lifestyle magazine cover. Handsome stylish man in a tailored outfit, high-contrast studio lighting, bold modern sans-serif typography that says "GQ" at the top. Sleek professional editorial design, realistic skin texture, confident pose.',
      negative_prompt: "(plastic skin:1.5), (CGI:1.5), (fake lighting:1.5), heavily airbrushed, cartoon, 3d render, low resolution, bad anatomy, deformed limbs",
      product_integrity_rules: "Must absolutely preserve the exact shape, texture, pattern, and color of the original garments. Do not invent details.",
      preview_image: "/copertine/gq.jpg",
      sort_order: 10
    }
  ];

  for (const s of subs) {
    await prisma.subcategory.create({
      data: {
        name: s.name,
        slug: s.slug,
        business_mode_id: s.business_mode_id,
        base_prompt_prefix: s.base_prompt_prefix,
        negative_prompt: s.negative_prompt,
        product_integrity_rules: s.product_integrity_rules,
        preview_image: s.preview_image,
        sort_order: s.sort_order,
        is_active: true,
        max_images_allowed: 10,
        visual_priority: 0,
        strict_reference_mode: false,
        output_language: "en"
      }
    });
    console.log(`Created subcategory: ${s.name}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
