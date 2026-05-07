const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shoesCat = await prisma.category.findUnique({
    where: { slug: 'shoes' }
  });

  if (shoesCat) {
    let newNegative = shoesCat.global_negative_prompt || "";
    if (!newNegative.includes("price tag, store tag")) {
        newNegative += ", price tag, store tag, brand label, hang tag, barcode, extra accessories, added socks, fake laces";
    }

    let newHardRules = shoesCat.global_hard_rules || "";
    if (!newHardRules.includes("NEVER ADD UNWANTED ACCESSORIES")) {
        newHardRules += " NEVER ADD UNWANTED ACCESSORIES. DO NOT ADD PRICE TAGS, CARDBOARD LABELS, HANG TAGS, OR ANY ACCESSORIES THAT ARE NOT PRESENT IN THE ORIGINAL IMAGE.";
    }

    await prisma.category.update({
      where: { id: shoesCat.id },
      data: {
        global_negative_prompt: newNegative.trim().replace(/^,/, ''),
        global_hard_rules: newHardRules.trim()
      }
    });

    console.log("Regola globale per Shoes aggiunta con successo!");
  } else {
    console.log("Categoria Shoes non trovata nel DB!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
