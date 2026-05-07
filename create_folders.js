const fs = require('fs');
const path = require('path');

const structure = {
  't-shirt': {
    'Clean Catalog': ['No Model', 'STILL LIFE PACK'],
    'Model Studio': ['Model Photo', 'Curvy - Plus Size'],
    'Lifestyle': ['Model Photo', 'Candid'],
    'UGC': ['UGC in Home', 'UGC in Store', 'Candid'],
    'Ads - Scroll Stopper': ['Model Photo', 'No Model'],
    'Detail - Texture': ['Model Photo', 'No Model']
  },
  'swimwear': {
    'Clean Catalog': ['No Model', 'STILL LIFE PACK'],
    'Model Studio': ['Model Photo', 'Curvy - Plus Size'],
    'Lifestyle': ['Model Photo', 'Candid'],
    'UGC': ['UGC in Home', 'UGC in Store', 'Candid'],
    'Ads - Scroll Stopper': ['Model Photo', 'No Model'],
    'Detail - Texture': ['Model Photo', 'No Model']
  },
  'dress': {
    'Clean Catalog': ['No Model', 'STILL LIFE PACK'],
    'Model Studio': ['Model Photo', 'Curvy - Plus Size'],
    'Lifestyle': ['Model Photo', 'Candid'],
    'UGC': ['UGC in Home', 'UGC in Store', 'Candid'],
    'Ads - Scroll Stopper': ['Model Photo', 'No Model'],
    'Detail - Texture': ['Model Photo', 'No Model']
  },
  'shoes': {
    'Clean Catalog': ['No Model', 'STILL LIFE PACK'],
    'Model Studio': ['Model Photo', 'Curvy - Plus Size'],
    'Lifestyle': ['Model Photo', 'Candid'],
    'UGC': ['UGC in Home', 'UGC in Store', 'Candid'],
    'Ads - Scroll Stopper': ['Model Photo', 'No Model'],
    'Detail - Texture': ['Model Photo', 'No Model']
  }
};

const baseDir = path.join(__dirname, 'public', 'vetrina-landing');

for (const cat in structure) {
  for (const mode in structure[cat]) {
    for (const sub of structure[cat][mode]) {
      const dir = path.join(baseDir, cat, mode, sub);
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
console.log('Folders created at public/vetrina-landing');
