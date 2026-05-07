const fs = require('fs');
let content = fs.readFileSync('src/components/InfiniteShowcase.tsx', 'utf8');
const newObject = `  {
    displayCategory: 'NEW CAT',
    displaySubcategory: 'NEW SUB',
    originalImage: '',
    manualImages: []
  }`;
const match = content.match(/(\n];\n\s*const UNIQUE_CATEGORIES)/);
console.log(match ? "Matched the end of array!" : "Failed to match end of array");
const newContent = content.replace(/(\n];\n\s*const UNIQUE_CATEGORIES)/, `,\n${newObject}$1`);
console.log(newContent.includes('NEW CAT') ? "Append success" : "Append fail");
