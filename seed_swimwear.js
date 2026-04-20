const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const womenCat = await prisma.category.findUnique({ where: { slug: 'cat-women' } });
  const menCat = await prisma.category.findUnique({ where: { slug: 'cat-men' } });

  if (!womenCat || !menCat) {
    console.error("Could not find Women or Men categories.");
    return;
  }

  // Define Swimwear Business Modes
  const modes = [
    {
      category_id: womenCat.id,
      name: 'Costumi da Bagno',
      slug: 'bm-swimwear-women',
      description: 'Generazione AI per costumi da bagno femminili (Bikini, Interi).',
      sort_order: 10,
    },
    {
      category_id: menCat.id,
      name: 'Costumi da Bagno',
      slug: 'bm-swimwear-men',
      description: 'Generazione AI per costumi da bagno maschili (Slip, Pantaloncino).',
      sort_order: 10,
    }
  ];

  for (const modeData of modes) {
    const bm = await prisma.businessMode.upsert({
      where: { slug: modeData.slug },
      update: modeData,
      create: modeData,
    });

    const isWomen = modeData.slug === 'bm-swimwear-women';
    const subSlugPrefix = isWomen ? 'sub-swim-w' : 'sub-swim-m';
    const subject = isWomen ? 'donna' : 'uomo';

    const subcategories = [
      {
        business_mode_id: bm.id,
        name: 'E-Commerce Clean',
        slug: `${subSlugPrefix}-ecommerce`,
        description: 'Posa frontale pulita su sfondo neutro da studio, ideale per catalogo.',
        base_prompt_prefix: `Professional e-commerce photography of a ${subject} wearing swimwear on a clean white studio background.`,
        negative_prompt: 'NSFW, suggestive pose, seductive, bikini model pose, arched back, instagram influencer style, erotic.',
        sort_order: 1
      },
      {
        business_mode_id: bm.id,
        name: 'Poolside / Beach Lifestyle',
        slug: `${subSlugPrefix}-poolside`,
        description: 'Modello/a a bordo piscina o spiaggia, illuminazione naturale e realistica.',
        base_prompt_prefix: `High-end commercial lifestyle photography of a ${subject} wearing swimwear at a luxury poolside or beach resort. Natural sunlight.`,
        negative_prompt: 'NSFW, suggestive pose, seductive, bikini model pose, arched back, instagram influencer style, erotic.',
        sort_order: 2
      },
      {
        business_mode_id: bm.id,
        name: 'Flat Lay',
        slug: `${subSlugPrefix}-flatlay`,
        description: 'Costume steso piatto o piegato, senza modello.',
        base_prompt_prefix: `Professional overhead flat lay photography of swimwear laid neatly on a soft white towel or wooden deck. NO HUMANS.`,
        negative_prompt: 'humans, body parts, hands, feet, model, mannequin.',
        sort_order: 3
      },
      {
        business_mode_id: bm.id,
        name: 'Fitting Room UGC',
        slug: `${subSlugPrefix}-ugc`,
        description: 'Scatto in stile selfie o candid nel camerino di una boutique. Modello/a realistico/a e "normale".',
        base_prompt_prefix: `UGC smartphone mirror selfie in a luxury boutique fitting room. Casual standing pose. Beautiful but normal and realistic ${subject}.`,
        negative_prompt: 'NSFW, professional studio lighting, perfect skin, supermodel, suggestive pose, arched back, erotic.',
        sort_order: 4
      }
    ];

    for (const sub of subcategories) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: sub,
        create: sub,
      });
    }
  }
  
  console.log("Swimwear categories successfully seeded!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
