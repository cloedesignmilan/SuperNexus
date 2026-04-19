const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updates = [
    {
      oldSlug: "vogue-cover",
      newName: "New Collection Cover",
      newSlug: "new-collection-cover",
      oldText: '"VOGUE"',
      newText: '"NEW COLLECTION"'
    },
    {
      oldSlug: "bazaar-cover",
      newName: "New Arrivals Cover",
      newSlug: "new-arrivals-cover",
      oldText: '"HARPER\'S BAZAAR"',
      newText: '"NEW ARRIVALS"'
    },
    {
      oldSlug: "elle-cover",
      newName: "Limited Edition Cover",
      newSlug: "limited-edition-cover",
      oldText: '"ELLE"',
      newText: '"LIMITED EDITION"'
    },
    {
      oldSlug: "marie-claire-cover",
      newName: "Trending Now Cover",
      newSlug: "trending-now-cover",
      oldText: '"MARIE CLAIRE"',
      newText: '"TRENDING NOW"'
    }
  ];

  for (const up of updates) {
    const sub = await prisma.subcategory.findFirst({ where: { slug: up.oldSlug }});
    if (sub) {
      const newPrompt = sub.base_prompt_prefix.replace(up.oldText, up.newText);
      await prisma.subcategory.update({
        where: { id: sub.id },
        data: {
          name: up.newName,
          slug: up.newSlug,
          base_prompt_prefix: newPrompt
        }
      });
      console.log(`Updated ${up.oldSlug} to ${up.newName} with text ${up.newText}`);
    } else {
      console.log(`Subcategory ${up.oldSlug} not found.`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
