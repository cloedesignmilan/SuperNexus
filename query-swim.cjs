const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const cats = await prisma.category.findMany({
    where: { slug: 'swimwear' },
    include: {
      business_modes: {
        include: {
          subcategories: true
        }
      }
    }
  });
  console.log(JSON.stringify(cats, null, 2));
}
run();
