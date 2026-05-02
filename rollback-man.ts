import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- ROLLING BACK MAN SEED ---');
  
  // Delete MAN subcategories
  const deletedSubs = await prisma.subcategory.deleteMany({
    where: { name: 'MAN' }
  });
  console.log(`Deleted ${deletedSubs.count} MAN subcategories.`);

  // Delete MAN PromptSnippet
  const deletedSnips = await prisma.promptSnippet.deleteMany({
    where: { label: 'MAN', snippet_type: 'MODEL_OPTION' }
  });
  console.log(`Deleted ${deletedSnips.count} MAN snippets.`);
  
  console.log('--- ROLLBACK COMPLETE ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
