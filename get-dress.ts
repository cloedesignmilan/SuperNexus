import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const subcats = await prisma.subcategory.findMany({
    where: { business_mode: { category: { slug: 'dress' }, name: 'Lifestyle' } },
  });
  console.log(subcats.map(s => s.name).join('\n'))
}
main()
