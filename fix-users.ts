import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  await prisma.user.updateMany({
    where: { NOT: { email: 'admin@local.test' } },
    data: { base_allowance: 100 }
  })
  console.log("Updated users to 100 base_allowance");
}
main()
