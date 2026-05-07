const fs = require('fs');
const path = require('path');

const dir = 'src/lib/ai/engines';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Engine.ts') && f !== 'coreEngine.ts' && f !== 'tshirtEngine.ts');

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // 1. Add import
    if (!content.includes('getDynamicAestheticRules')) {
        content = content.replace('import { getPromptsForSelection } from "../../prompt-configs";', 'import { getPromptsForSelection } from "../../prompt-configs";\nimport { getDynamicAestheticRules } from "./coreEngine";');
    }
    
    // 2. Inject getDynamicAestheticRules before finalNegative
    if (!content.includes('const { positive: dynPos, negative: dynNeg } = getDynamicAestheticRules(taxonomyMode);')) {
        content = content.replace(/let finalNegative = "plastic skin/g, `const { positive: dynPos, negative: dynNeg } = getDynamicAestheticRules(taxonomyMode);\n            let finalNegative = "plastic skin, " + dynNeg + ", `);
    }
    
    // 3. Update variantPrompt with dynPos
    // We look for variantPrompt = userPrompt + `\n\n
    if (!content.includes('variantPrompt = userPrompt + dynPos + `\\n\\n')) {
        content = content.replace(/variantPrompt = userPrompt \+ `\\n\\n/g, 'variantPrompt = userPrompt + dynPos + `\\n\\n');
    }

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log(`Patched ${file}`);
});

// Also patch generate.ts
const genFile = 'src/lib/ai/generate.ts';
let genContent = fs.readFileSync(genFile, 'utf8');
if (!genContent.includes('getDynamicAestheticRules')) {
    genContent = genContent.replace('import { getPromptsForSelection } from "../prompt-configs";', 'import { getPromptsForSelection } from "../prompt-configs";\nimport { getDynamicAestheticRules } from "./engines/coreEngine";');
}
if (!genContent.includes('const { positive: dynPos, negative: dynNeg } = getDynamicAestheticRules(taxonomyMode);')) {
    genContent = genContent.replace(/let finalNegative = "plastic skin/g, `const { positive: dynPos, negative: dynNeg } = getDynamicAestheticRules(taxonomyMode);\n            let finalNegative = "plastic skin, " + dynNeg + ", `);
}
if (!genContent.includes('variantPrompt = userPrompt + dynPos + `\\n\\n')) {
    genContent = genContent.replace(/variantPrompt = userPrompt \+ `\\n\\n/g, 'variantPrompt = userPrompt + dynPos + `\\n\\n');
}
fs.writeFileSync(genFile, genContent, 'utf8');
console.log(`Patched generate.ts`);

