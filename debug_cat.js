const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const checks = await prisma.outputValidationCheck.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      subcategory: {
        include: { business_mode: { include: { category: true } } }
      }
    }
  });

  const extractCategoryFromPath = (check) => {
      try {
          const parsed = JSON.parse(check.generated_sample_image);
          if (parsed.path) {
              return parsed.path.split(' > ')[0].trim();
          }
      } catch (e) {}
      return check.subcategory?.business_mode?.category?.name || "Sconosciuto";
  };

  const availableCategories = Array.from(new Set(checks.map(extractCategoryFromPath).filter(Boolean)));
  console.log("AVAILABLE:", availableCategories);
  
  const everydayCheck = checks.find(c => c.id === "cd48531a-bb90-4091-a618-02bd6607760a" || extractCategoryFromPath(c) === "Everyday / Apparel");
  if (everydayCheck) {
      console.log("EVERYDAY EXTRACTED AS:", extractCategoryFromPath(everydayCheck));
      console.log("JSON:", everydayCheck.generated_sample_image);
  } else {
      console.log("Everyday check not found in the array!");
  }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
