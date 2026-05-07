const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { isActive: true },
    select: { id: true, category: true, mode: true, presentation: true, shotNumber: true, imageUrl: true }
  });
  
  const byKey = {};
  shots.forEach(s => {
    const sBase = s.presentation.replace(/-woman|-man/, '');
    const key = `${s.category}/${s.mode}/${sBase}/${s.shotNumber}`;
    if (!byKey[key]) byKey[key] = [];
    byKey[key].push(s);
  });
  
  const toDelete = [];
  for (const [key, list] of Object.entries(byKey)) {
    if (list.length > 1) {
      // If there's a gendered shot, the generic one is a duplicate.
      const hasGendered = list.some(s => s.presentation.includes('-woman') || s.presentation.includes('-man'));
      if (hasGendered) {
        const genericShots = list.filter(s => !s.presentation.includes('-woman') && !s.presentation.includes('-man'));
        genericShots.forEach(gs => toDelete.push(gs.id));
      }
    }
  }
  
  console.log(`Found ${toDelete.length} orphaned duplicate shots (even with old URLs) to delete.`);
  const deleted = await prisma.promptConfigShot.deleteMany({
    where: { id: { in: toDelete } }
  });
  console.log(`Deleted ${deleted.count} shots.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
