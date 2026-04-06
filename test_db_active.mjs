import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const cats = await prisma.category.findMany({ select: { name: true, is_active: true } });
console.log("CATEGORIES AND STATUS:");
console.table(cats);
process.exit(0);
