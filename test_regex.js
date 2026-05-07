const fs = require('fs');
const content = fs.readFileSync('src/components/InfiniteShowcase.tsx', 'utf8');

const displayCategory = 'DRESS / ELEGANT';
const displaySubcategory = 'ADS / SCROLL STOPPER → MODEL PHOTO';
const newUrls = ['url1', 'url2', 'url3', 'url4'];

// We need to find the object in SLIDESHOW_CONFIG matching both displayCategory and displaySubcategory.
// Then replace its manualImages array.

const regex = new RegExp(`(displayCategory:\\s*['"]${displayCategory}['"],\\s*displaySubcategory:\\s*['"]${displaySubcategory}['"][\\s\\S]*?manualImages:\\s*\\[)([\\s\\S]*?)(\\])`, 'g');

const newContent = content.replace(regex, (match, p1, p2, p3) => {
    return p1 + '\n      ' + newUrls.map(u => `"${u}"`).join(',\n      ') + '\n    ' + p3;
});

console.log(newContent.includes(newUrls[0]) ? "Match succeeded" : "Match failed");
