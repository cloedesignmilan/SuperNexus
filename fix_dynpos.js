const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Rimuovi la definizione errata
    content = content.replace('const { positive: dynPos, negative: dynNeg } = getDynamicAestheticRules(taxonomyMode);\n            let finalNegative', 'let finalNegative');
    
    // Aggiungi la definizione prima di let variantPrompt
    content = content.replace('let variantPrompt = "";', 'const { positive: dynPos, negative: dynNeg } = getDynamicAestheticRules(taxonomyMode);\n        let variantPrompt = "";');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
}

const dir = 'src/lib/ai/engines';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Engine.ts') && f !== 'coreEngine.ts' && f !== 'tshirtEngine.ts');

files.forEach(file => patchFile(path.join(dir, file)));
patchFile('src/lib/ai/generate.ts');
