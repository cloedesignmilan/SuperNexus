const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getPromptsForSelection } = require('./src/lib/prompt-configs/index');
const { getDynamicAestheticRules, GLOBAL_INVIOLABLE_RULES } = require('./src/lib/ai/engines/coreEngine');

async function test() {
  const configShots = await getPromptsForSelection({
        categorySlug: 't-shirt',
        modeSlug: 'clean-catalog',
        presentationSlug: 'no-model',
        quantity: 5,
        gender: 'WOMAN'
    });
    console.log(configShots.length);
    const shotInfo = configShots[0];
    let finalPositive = shotInfo.positive_prompt?.replace(/\{product\}/g, 't-shirt').replace(/\{gender\}/g, 'woman') || "";
    console.log("FINAL POSITIVE:", finalPositive);
}
test().catch(console.error).finally(() => prisma.$disconnect());
