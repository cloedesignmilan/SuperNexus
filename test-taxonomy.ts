import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const subcats = await prisma.subcategory.findMany({
    include: {
      business_mode: {
        include: {
          category: true
        }
      }
    }
  });

  const result = subcats.map(s => `${s.business_mode.category.name} -> ${s.business_mode.name} -> ${s.name}`)
  console.log(result.join('\n'))
}
main()
