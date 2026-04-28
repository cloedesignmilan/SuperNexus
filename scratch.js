const fs = require('fs');
const files = ['tshirt.json', 'swimwear.json', 'dress.json', 'shoes.json', 'bags.json', 'jewelry.json'];
const tree = {};

files.forEach(f => {
  const data = JSON.parse(fs.readFileSync('./src/lib/prompt-configs/' + f));
  const catName = f.replace('.json', '');
  const catTree = {};
  
  data[0].configs.forEach(conf => {
    if (!catTree[conf.mode]) catTree[conf.mode] = [];
    if (!catTree[conf.mode].includes(conf.presentation)) {
      catTree[conf.mode].push(conf.presentation);
    }
  });
  
  tree[catName] = catTree;
});

console.log(JSON.stringify(tree, null, 2));
