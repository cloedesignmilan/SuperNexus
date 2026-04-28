import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const cats = await prisma.category.findMany();
  console.log(cats.map(c => `Name: ${c.name}, Slug: ${c.slug}`).join('\n'))
}
main()
