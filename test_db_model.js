const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
    const subcats = await prisma.businessSubcategory.findMany({
        where: {
            name: 'No Model'
        }
    });
    console.log("Subcats found:", subcats.length);
    if (subcats.length > 0) {
        console.log("Active model:", subcats[0].active_model);
    }
}
test();
