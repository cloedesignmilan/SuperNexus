import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const stores = await prisma.store.findMany({
        include: {
            _count: {
                select: { jobs: true, templates: true, users: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    console.log("Success:", stores.length)
}

main().catch(e => console.error("Prisma error:", e)).finally(() => prisma.$disconnect())
