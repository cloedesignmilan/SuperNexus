const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const dressShots = await prisma.promptConfigShot.findMany({
        where: { category: 'dress' }
    });

    console.log(`Found ${dressShots.length} dress shots.`);

    // Delete existing everyday shots just in case
    await prisma.promptConfigShot.deleteMany({
        where: { category: 'everyday' }
    });

    const newShots = dressShots.map(shot => {
        const { id, createdAt, updatedAt, ...rest } = shot;
        return {
            ...rest,
            category: 'everyday'
        };
    });

    await prisma.promptConfigShot.createMany({
        data: newShots
    });

    console.log(`Successfully created ${newShots.length} everyday shots.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
