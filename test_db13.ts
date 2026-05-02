import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const snippets = await prisma.promptSnippet.findMany({
    where: { 
      is_active: true,
      snippet_type: 'MODEL_OPTION'
    }
  });
  console.log("ACTIVE MODEL_OPTION snippets:");
  snippets.forEach(s => console.log(`- ${s.label}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
