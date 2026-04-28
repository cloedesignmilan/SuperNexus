const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const subcat = await prisma.subcategory.findFirst({
    where: { 
      name: 'Model Photo',
      business_mode: { name: 'Detail / Texture', category: { slug: 'dress' } }
    }
  });
  console.log(subcat);
}
main().finally(() => prisma.$disconnect());
