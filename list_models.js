require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function main() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_STUDIO_API_KEY}`);
  const data = await res.json();
  if (data.models) {
    const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    console.log(generateModels.map(m => m.name).join("\n"));
  } else {
    console.log(data);
  }
}
main().catch(console.error);
