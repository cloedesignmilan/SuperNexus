const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/DashboardWizard.tsx', 'utf8');

content = content.replace(
  "const needsClientType = (modeId: string | undefined, modelOptionId: string | undefined) => {",
  `const needsClientType = (modeId: string | undefined, modelOptionId: string | undefined) => {
    if (!modeId || !modelOptionId) return false;
    // Auto-resolve gender if it's explicitly in the subcategory name
    if (modelOptionId.includes('woman') || modelOptionId.includes('man') || modelOptionId.includes('girl') || modelOptionId.includes('boy')) {
        return false;
    }`
);

fs.writeFileSync('src/app/dashboard/DashboardWizard.tsx', content);
