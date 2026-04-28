import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const subcat = await prisma.subcategory.findFirst({
    where: { name: 'Candid Photo' },
  });
  console.log(subcat?.slug)
}
main()
