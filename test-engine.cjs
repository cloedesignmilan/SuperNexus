require('ts-node').register();
const { getPromptsForSelection } = require('./src/lib/ai/promptEngine.ts');
try {
  const result = getPromptsForSelection('dress', 'Detail / Texture', 'Model Photo');
  console.log(result);
} catch (e) {
  console.error("ERROR:", e);
}
