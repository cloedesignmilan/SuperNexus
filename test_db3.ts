import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const snippets = await prisma.promptSnippet.findMany({
    where: { label: 'Candid' }
  });
  console.log("Snippets named Candid:");
  snippets.forEach(s => console.log(`- ${s.snippet_type} -> ${s.label}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
