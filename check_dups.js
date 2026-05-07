const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { isActive: true },
    select: { id: true, category: true, mode: true, presentation: true, shotNumber: true, imageUrl: true }
  });
  
  // Find all shots that lack a suffix but there is another shot WITH a suffix for the same cat/mode/shotNumber
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
      // Find the one without suffix and without URL
      const noUrlNoSuffix = list.find(s => !s.presentation.includes('-woman') && !s.presentation.includes('-man') && !s.imageUrl);
      if (noUrlNoSuffix) {
        toDelete.push(noUrlNoSuffix.id);
      }
    }
  }
  
  console.log(`Found ${toDelete.length} orphaned duplicate shots without URLs to delete.`);
  const deleted = await prisma.promptConfigShot.deleteMany({
    where: { id: { in: toDelete } }
  });
  console.log(`Deleted ${deleted.count} shots.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
