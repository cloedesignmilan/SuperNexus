const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mode = await prisma.businessMode.findFirst({
    where: { name: 'Casual & Streetwear' }
  });

  if (!mode) {
    console.error("Casual & Streetwear mode not found!");
    return;
  }

  const newSub = await prisma.subcategory.create({
    data: {
      name: "Outfit Coordination",
      slug: "w-outfit-coordination",
      business_mode_id: mode.id,
      preview_image: "/copertine/outfit.jpg",
      max_images_allowed: 10,
      visual_priority: 0,
      sort_order: 15,
      is_active: true,
      strict_reference_mode: false,
      base_prompt_prefix: "Shot on 35mm film, Leica M11. Masterpiece, photorealistic, cinematic lighting, natural sunlight. Full body or medium shot of a beautiful, stylish young woman (20-30 years old) walking in a cool urban street setting. She is wearing a highly fashionable, coordinated street style outfit. Realistic skin texture, candid, dynamic fashion editorial look. The garments are layered perfectly.",
      product_integrity_rules: "Must absolutely preserve the exact shape, texture, pattern, and color of the original garments. Do not invent details.",
      negative_prompt: "(text:1.8), (watermark:1.8), typography, words, (plastic skin:1.5), (CGI:1.5), (fake lighting:1.5), heavily airbrushed, cartoon, 3d render, low resolution, bad anatomy, deformed limbs",
      output_language: "it"
    }
  });

  console.log("Created subcategory:", newSub.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
