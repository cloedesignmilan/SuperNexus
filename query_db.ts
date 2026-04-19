import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const categories = await prisma.category.findMany()
  const subcategories = await prisma.subcategory.findMany()
  console.log("Categories:", categories.map(c => c.name))
  console.log("Subcategories:", subcategories.map(s => s.name))
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
