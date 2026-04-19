import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const donna = await prisma.category.findFirst({ where: { name: 'Donna (Women)' } })
  console.log(donna)
}

main().finally(() => prisma.$disconnect())
