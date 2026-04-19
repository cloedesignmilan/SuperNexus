import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const bms = await prisma.businessMode.findMany({ where: { category_id: '953f9b5a-4643-4638-817f-de27a1b5e593' } })
  console.log(bms)
}

main().finally(() => prisma.$disconnect())
