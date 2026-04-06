import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const cats = await prisma.category.findMany({ select: { name: true } });
console.log("REAL CATEGORIES:");
console.log(cats.map(c => c.name));
process.exit(0);
