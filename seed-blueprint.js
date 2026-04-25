const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const blueprint = {
  categories: [
    { name: "T-shirt", slug: "t-shirt" },
    { name: "Shoes", slug: "shoes" },
    { name: "Swimwear", slug: "swimwear" },
    { name: "Dress / Elegant", slug: "dress" },
    { name: "Bags", slug: "bags" },
    { name: "Jewelry", slug: "jewelry" }
  ],
  modes: [
    { name: "Clean Catalog", slug: "clean-catalog", desc: "Ecommerce puro. Sfondo pulito, prodotto protagonista, niente persone." },
    { name: "Model Studio", slug: "model-studio", desc: "Catalogo con modella/o. Studio, pose controllate." },
    { name: "Lifestyle", slug: "lifestyle", desc: "Ambientato. Strada / casa / contesto naturale." },
    { name: "UGC", slug: "ugc", desc: "User Generated Content. iPhone look, imperfetto, realistico." },
    { name: "Ads / Scroll Stopper", slug: "ads", desc: "Pubblicità. Forte impatto, visivo aggressivo." },
    { name: "Detail / Texture", slug: "detail", desc: "Qualità prodotto. Zoom, materiali." },
    { name: "Variants", slug: "variants", desc: "Varianti prodotto. Colori, versioni." }
  ],
  shots: {
    base_clean: [
      { name: "Front", slug: "front" },
      { name: "Back", slug: "back" },
      { name: "Angle", slug: "angle" },
      { name: "Flat Lay", slug: "flat-lay" },
      { name: "Detail", slug: "detail-shot" }
    ],
    model: [
      { name: "Front worn", slug: "front-worn" },
      { name: "Side pose", slug: "side-pose" },
      { name: "Movement", slug: "movement" },
      { name: "Detail worn", slug: "detail-worn" }
    ],
    lifestyle: [
      { name: "Walking", slug: "walking" },
      { name: "Standing", slug: "standing" },
      { name: "Sitting", slug: "sitting" },
      { name: "Interaction", slug: "interaction" }
    ],
    ugc: [
      { name: "Mirror selfie", slug: "mirror-selfie" },
      { name: "Casual", slug: "casual" },
      { name: "Movement", slug: "ugc-movement" },
      { name: "Close handheld", slug: "close-handheld" }
    ],
    ads: [
      { name: "Bold front", slug: "bold-front" },
      { name: "Close dramatic", slug: "close-dramatic" },
      { name: "Dynamic shot", slug: "dynamic-shot" }
    ],
    detail: [
      { name: "Fabric", slug: "fabric" },
      { name: "Print", slug: "print" },
      { name: "Stitching", slug: "stitching" }
    ]
  }
};

async function seed() {
  console.log("Wiping old taxonomy...");
  await prisma.category.deleteMany({});
  await prisma.businessMode.deleteMany({});
  await prisma.subcategory.deleteMany({});
  
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  const userId = adminUser ? adminUser.id : "00000000-0000-0000-0000-000000000000";

  console.log("Seeding Master Blueprint...");

  for (let c = 0; c < blueprint.categories.length; c++) {
    const cat = blueprint.categories[c];
    const categoryRecord = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        user_id: userId,
        sort_order: c * 10
      }
    });

    for (let m = 0; m < blueprint.modes.length; m++) {
      const mode = blueprint.modes[m];
      const modeRecord = await prisma.businessMode.create({
        data: {
          category_id: categoryRecord.id,
          name: mode.name,
          slug: `${cat.slug}-${mode.slug}`,
          description: mode.desc,
          sort_order: m * 10
        }
      });

      let subcategoriesToCreate = [];
      if (mode.slug === 'clean-catalog') subcategoriesToCreate = [...blueprint.shots.base_clean];
      else if (mode.slug === 'model-studio') subcategoriesToCreate = [...blueprint.shots.model];
      else if (mode.slug === 'lifestyle') subcategoriesToCreate = [...blueprint.shots.lifestyle];
      else if (mode.slug === 'ugc') subcategoriesToCreate = [...blueprint.shots.ugc];
      else if (mode.slug === 'ads') subcategoriesToCreate = [...blueprint.shots.ads];
      else if (mode.slug === 'detail') subcategoriesToCreate = [...blueprint.shots.detail];

      // Special overrides
      if (cat.slug === 'shoes' && mode.slug === 'clean-catalog') {
        subcategoriesToCreate.push({ name: 'Sole', slug: 'sole' }, { name: 'On-foot', slug: 'on-foot' });
      }
      if (cat.slug === 'bags' && mode.slug === 'model-studio') {
        subcategoriesToCreate.push({ name: 'Shoulder Worn', slug: 'shoulder-worn' });
      }

      for (let s = 0; s < subcategoriesToCreate.length; s++) {
        const shot = subcategoriesToCreate[s];
        await prisma.subcategory.create({
          data: {
            business_mode_id: modeRecord.id,
            name: shot.name,
            slug: `${cat.slug}-${mode.slug}-${shot.slug}`,
            output_goal: shot.name,
            sort_order: s * 10
          }
        });
      }
    }
  }

  console.log("Database seeded successfully!");
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
