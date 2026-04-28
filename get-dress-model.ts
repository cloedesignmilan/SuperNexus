import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const subcat = await prisma.subcategory.findFirst({
    where: { 
      name: 'Model Photo',
      business_mode: { category: { slug: 'dress' }, name: 'Lifestyle' }
    },
  });
  console.log(subcat?.slug)
}
main()
