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
    { name: "Detail / Texture", slug: "detail", desc: "Qualità prodotto. Zoom, materiali." }
  ],
  subcategories: {
    clean_catalog: [
      { name: "No Model", slug: "no-model" }
    ],
    model_studio: [
      { name: "Model Photo", slug: "model-photo" },
      { name: "Curvy / Plus Size", slug: "curvy" }
    ],
    lifestyle: [
      { name: "Model Photo", slug: "model-photo" },
      { name: "Candid Real Woman", slug: "candid-woman" },
      { name: "Candid Real Man", slug: "candid-man" }
    ],
    ugc: [
      { name: "Candid Real Woman", slug: "candid-woman" },
      { name: "Candid Real Man", slug: "candid-man" }
    ],
    ads: [
      { name: "Model Photo", slug: "model-photo" },
      { name: "No Model", slug: "no-model" }
    ],
    detail: [
      { name: "No Model", slug: "no-model" },
      { name: "Model Photo", slug: "model-photo" }
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

  console.log("Seeding Realigned Master Blueprint...");

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

      let subsToCreate = [];
      if (mode.slug === 'clean-catalog') subsToCreate = blueprint.subcategories.clean_catalog;
      else if (mode.slug === 'model-studio') subsToCreate = blueprint.subcategories.model_studio;
      else if (mode.slug === 'lifestyle') subsToCreate = blueprint.subcategories.lifestyle;
      else if (mode.slug === 'ugc') subsToCreate = blueprint.subcategories.ugc;
      else if (mode.slug === 'ads') subsToCreate = blueprint.subcategories.ads;
      else if (mode.slug === 'detail') subsToCreate = blueprint.subcategories.detail;

      for (let s = 0; s < subsToCreate.length; s++) {
        const sub = subsToCreate[s];
        await prisma.subcategory.create({
          data: {
            business_mode_id: modeRecord.id,
            name: sub.name,
            slug: `${cat.slug}-${mode.slug}-${sub.slug}`,
            output_goal: sub.name,
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
