const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/DashboardWizard.tsx', 'utf8');

// The original logic is likely scattered, but the core issue is `needsGender` check at line ~447.
// Let's replace the needsGender logic directly!

const search = "const needsGender = analysisData?.needsGenderClarification && !!selections['CLIENT_TYPE'];";
const replace = `const needsGender = analysisData?.needsGenderClarification && !selections['CLIENT_TYPE'] && 
      !(selections['MODEL_OPTION']?.label?.toLowerCase().includes('woman')) && 
      !(selections['MODEL_OPTION']?.label?.toLowerCase().includes('man')) &&
      !(selections['MODEL_OPTION']?.label?.toLowerCase().includes('girl')) &&
      !(selections['MODEL_OPTION']?.label?.toLowerCase().includes('boy'));`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync('src/app/dashboard/DashboardWizard.tsx', content);
    console.log("Patched needsGender at step 3 back button");
} else {
    console.log("Could not find needsGender search string");
}

const search2 = "if (snip.label !== 'No Model' && snip.label !== 'STILL LIFE PACK') {";
const replace2 = `if (snip.label !== 'No Model' && snip.label !== 'STILL LIFE PACK' && !snip.label.toLowerCase().includes('man') && !snip.label.toLowerCase().includes('woman')) {`;

if (content.includes(search2)) {
    content = content.replace(new RegExp(search2.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replace2);
    fs.writeFileSync('src/app/dashboard/DashboardWizard.tsx', content);
    console.log("Patched MODEL_OPTION forward transition");
} else {
    console.log("Could not find MODEL_OPTION search string");
}
