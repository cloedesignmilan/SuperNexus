import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    await prisma.user.updateMany({
        where: { paypal_subscription_id: 'free_trial' },
        data: { images_generated: 10 }
    });
    console.log("Crediti esauriti per i Free Trial!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
