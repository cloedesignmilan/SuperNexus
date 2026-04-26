import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const taxonomyCat = 't-shirt';
const taxonomyMode = 'Model Studio';
const taxonomySubcat = 'Model Photo';

async function test() {
    let subcat = null;
    if (taxonomyCat && taxonomyMode && taxonomySubcat) {
      subcat = await prisma.subcategory.findFirst({
        where: { 
          name: taxonomySubcat,
          business_mode: {
            name: taxonomyMode,
            category: {
              slug: taxonomyCat.toLowerCase()
            }
          }
        },
        include: { business_mode: { include: { category: true } } }
      });
    }
    console.log("SUBCAT:", subcat ? subcat.name : "NULL");
}
test();
