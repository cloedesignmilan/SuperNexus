const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const subcat = await prisma.subcategory.findFirst({
    where: { 
      name: { contains: "Ecommerce Studio Clean", mode: "insensitive" }
    },
    select: {
      name: true,
      base_prompt_prefix: true,
      negative_prompt: true,
      product_integrity_rules: true
    }
  });
  console.log(JSON.stringify(subcat, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
