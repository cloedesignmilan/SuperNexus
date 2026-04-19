const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subcategory = await prisma.subcategory.findFirst({
    where: { slug: 'ts-ecommerce-clean' }
  });

  if (!subcategory) {
    console.log("Subcategory not found!");
    return;
  }

  // Add reference images
  const images = [
    "/prove/Tshirt/Ecommerce Clean/627D75E3-D637-42B7-94EB-1672B1AB8C88.jpeg",
    "/prove/Tshirt/Ecommerce Clean/977B8826-3409-4E4A-A402-9DD039F7A315.jpeg",
    "/prove/Tshirt/Ecommerce Clean/1029E5FF-14DC-4352-9C9C-3E3538BAD5D3.jpeg",
    "/prove/Tshirt/Ecommerce Clean/285EF91B-511E-4866-8E52-00DCF520370B.jpeg"
  ];

  for (const img of images) {
    await prisma.subcategoryReferenceImage.create({
      data: {
        subcategory_id: subcategory.id,
        image_url: img,
        title: "E-Commerce Clean Reference",
        is_active: true
      }
    });
  }

  console.log("Added 4 reference images!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
