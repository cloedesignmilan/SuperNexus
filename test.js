const fs = require('fs');
const content = fs.readFileSync('src/app/dashboard/DashboardWizard.tsx', 'utf8');
const match = content.match(/const getModelOptions =[\s\S]*?};/);
if (match) console.log(match[0]);
