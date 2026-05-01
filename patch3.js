const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/DashboardWizard.tsx', 'utf8');

const search = "clientGender,";
const replace = `clientGender: clientGender || (selections['MODEL_OPTION']?.label?.toLowerCase().includes('woman') ? 'WOMAN' : selections['MODEL_OPTION']?.label?.toLowerCase().includes('man') ? 'MAN' : undefined),`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync('src/app/dashboard/DashboardWizard.tsx', content);
    console.log("Patched clientGender fallback");
} else {
    console.log("Could not find clientGender");
}
