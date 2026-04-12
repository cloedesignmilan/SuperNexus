const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  await prisma.user.updateMany({
    data: { base_allowance: 100 }
  })
  console.log("Updated all users to 100 base_allowance");
}
main()
