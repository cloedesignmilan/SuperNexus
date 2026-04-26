const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  const userId = adminUser ? adminUser.id : "00000000-0000-0000-0000-000000000000";

  let cat = await prisma.category.findFirst({ where: { slug: 'system' } });
  if (!cat) {
    cat = await prisma.category.create({
      data: { name: 'System', slug: 'system', user_id: userId, sort_order: 999 }
    });
  }

  let mode = await prisma.businessMode.findFirst({ where: { slug: 'system-mode' } });
  if (!mode) {
    mode = await prisma.businessMode.create({
      data: { name: 'System Mode', slug: 'system-mode', category_id: cat.id, sort_order: 999 }
    });
  }

  let sub = await prisma.subcategory.findFirst({ where: { slug: 'dynamic-engine' } });
  if (!sub) {
    await prisma.subcategory.create({
      data: { name: 'Dynamic Engine', slug: 'dynamic-engine', business_mode_id: mode.id, sort_order: 999 }
    });
  }
  
  console.log("Dynamic Engine restored.");
}

fix().finally(() => prisma.$disconnect());
