const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getPromptsForSelection({ categorySlug, modeSlug, presentationSlug, scene, quantity, specificShotNumber, gender }) {
  const normCat = categorySlug.toLowerCase().trim();
  let normMode = modeSlug.toLowerCase().trim();
  let normPres = presentationSlug.toLowerCase().trim().replace(/-/g, ' ');

  if (normMode.includes('ads') || normMode.includes('scroll-stopper')) normMode = 'ads';
  else if (normMode.includes('detail') || normMode.includes('texture')) normMode = 'detail';
  else normMode = normMode.replace(/\s+/g, '-');
  
  if (normPres === 'candid' && gender) normPres = `candid-${gender.toLowerCase()}`;
  else if (normPres === 'ugc in home' && gender) { normMode = 'ugc-home'; normPres = `candid-${gender.toLowerCase()}`; }
  else if (normPres === 'ugc in store' && gender) { normMode = 'ugc-store'; normPres = `candid-${gender.toLowerCase()}`; }
  else if (normPres === 'model photo' && gender) normPres = `model-photo-${gender.toLowerCase()}`;
  else if (normPres.includes('ugc in home') && normPres.includes('woman')) { normMode = 'ugc-home'; normPres = 'candid-woman'; }
  else if (normPres.includes('ugc in store') && normPres.includes('woman')) { normMode = 'ugc-store'; normPres = 'candid-woman'; }
  else if (normPres.includes('ugc in home') && normPres.includes('man')) { normMode = 'ugc-home'; normPres = 'candid-man'; }
  else if (normPres.includes('ugc in store') && normPres.includes('man')) { normMode = 'ugc-store'; normPres = 'candid-man'; }
  else if (normPres === 'ugc in home') { normMode = 'ugc-home'; normPres = 'candid-woman'; }
  else if (normPres === 'ugc in store') { normMode = 'ugc-store'; normPres = 'candid-woman'; }
  else if (normPres === 'woman') normPres = 'candid-woman';
  else if (normPres === 'man') normPres = 'candid-man';
  else if (normPres.includes('curvy') || normPres.includes('plus-size')) { normPres = (gender && gender.toLowerCase() === 'man') ? 'curvy-man' : 'curvy-woman'; }
  else if (normPres.includes('still life')) normPres = 'still-life-pack';
  else if (normPres.includes('ugc creator pack')) normPres = 'ugc-creator-pack';
  else if (normPres === 'no model') normPres = 'no-model';
  else if (normPres === 'model photo') normPres = 'model-photo';
  else normPres = normPres.replace(/\s+/g, '-');

  console.log("Query Params:", { category: normCat, mode: normMode, presentation: normPres, OR: [{ scene: scene || "all" }, { scene: "all" }], isActive: true });

  const dbShots = await prisma.promptConfigShot.findMany({
      where: {
          category: normCat,
          mode: normMode,
          presentation: normPres,
          OR: [
              { scene: scene || "all" },
              { scene: "all" }
          ],
          isActive: true,
      },
      orderBy: [
          { priority: 'desc' },
          { shotNumber: 'asc' }
      ]
  });

  console.log(`Found ${dbShots.length} shots.`);
  return dbShots;
}

async function main() {
  await getPromptsForSelection({
    categorySlug: 'shoes',
    modeSlug: 'model-studio',
    presentationSlug: 'model-photo-woman',
    quantity: 5,
    gender: 'WOMAN'
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
