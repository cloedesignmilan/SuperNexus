import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const store = await prisma.store.findFirst({ where: { slug: 'magazzini-emilio' } });
    console.log("TOKEN ATTUALE IN DB:", store?.telegram_bot_token);
}
main().catch(console.error).finally(() => prisma.$disconnect());
