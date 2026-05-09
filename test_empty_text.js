const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

function parseEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  });
  return env;
}

const env = parseEnv('.env');
const ai = new GoogleGenAI({ apiKey: env.GOOGLE_AI_STUDIO_API_KEY });

async function main() {
  const parts = [
    { text: "   \n\n  " } 
  ];
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [{ role: 'user', parts }]
    });
    console.log("SUCCESS");
  } catch(e) {
    console.log("ERROR STATUS:", e.status);
    console.log("ERROR MESSAGE:", e.message);
  }
}
main();
