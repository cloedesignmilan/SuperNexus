const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
    const job = await prisma.generationJob.findFirst({
        where: {
            status: 'failed'
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    console.log("Last failed job error:", job.error_message);
}
test();
