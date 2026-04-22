const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const subcat = await prisma.subcategory.findFirst({
    where: { 
      name: { contains: "Ecommerce Studio Clean", mode: "insensitive" }
    },
    include: {
      business_mode: {
        include: {
          category: true
        }
      }
    }
  });
  console.log(JSON.stringify(subcat, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
