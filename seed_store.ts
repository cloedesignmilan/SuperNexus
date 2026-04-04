const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const store = await prisma.store.upsert({
    where: { slug: 'magazzini-emilio' },
    update: {},
    create: {
      name: 'Magazzini Emilio',
      slug: 'magazzini-emilio',
      telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN || 'MISSING_TOKEN',
    },
  });

  console.log('Magazzini Emilio Store ID:', store.id);

  await prisma.user.updateMany({
    where: { store_id: null },
    data: { store_id: store.id },
  });

  await prisma.generationJob.updateMany({
    where: { store_id: null },
    data: { store_id: store.id },
  });

  console.log('Migrations Done');
}

main().catch(console.error).finally(() => prisma.$disconnect());
