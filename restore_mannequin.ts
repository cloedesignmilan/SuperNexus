import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const bmId = 'ec0c0f72-cb9d-4bdc-8c00-6e530bcfe257' // Casual & Streetwear

  // Check if exists
  let sub = await prisma.subcategory.findFirst({ where: { slug: 'mannequin-display' } })
  if (!sub) {
    sub = await prisma.subcategory.create({
      data: {
        business_mode_id: bmId,
        name: 'Mannequin Display',
        slug: 'mannequin-display',
        description: 'Turn standard store mannequins into lifelike models wearing your latest collections.',
        preview_image: '/prove/Donna/Mannequin Display/prima.jpeg',
        max_images_allowed: 4,
        style_type: 'Photorealistic',
        output_goal: 'Ecommerce',
        business_context: 'Boutique'
      }
    })
    console.log("Created subcategory:", sub.name)
  } else {
    console.log("Subcategory already exists")
  }

  // Clear existing images if any
  await prisma.subcategoryReferenceImage.deleteMany({
    where: { subcategory_id: sub.id }
  })

  // Add reference images
  const images = [
    '/prove/Donna/Mannequin Display/prima.jpeg',
    '/prove/Donna/Mannequin Display/IMG_1829.JPG',
    '/prove/Donna/Mannequin Display/IMG_1830.JPG',
    '/prove/Donna/Mannequin Display/IMG_1832.JPG',
    '/prove/Donna/Mannequin Display/IMG_1833.JPG'
  ]

  for (let i = 0; i < images.length; i++) {
    await prisma.subcategoryReferenceImage.create({
      data: {
        subcategory_id: sub.id,
        image_url: images[i],
        title: `Reference ${i+1}`,
        image_order: i
      }
    })
  }
  console.log("Created reference images for Mannequin Display")
}

main().finally(() => prisma.$disconnect())
