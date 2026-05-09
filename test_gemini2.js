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
  const imgUrl = 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-uploads/web_admin_sandbox_1778345695077.jpg';
  const res = await fetch(imgUrl);
  const ab = await res.arrayBuffer();
  
  const parts = [
    { text: "SUBJECT GARMENT TO STRICTLY CLONE:" },
    { inlineData: { data: Buffer.from(ab).toString('base64'), mimeType: 'image/jpeg' } },
    { text: "" } // WAIT! If variantPrompt is undefined or something? Let's try undefined text!
  ];
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [{ role: 'user', parts }]
    });
    console.log("SUCCESS");
  } catch(e) {
    console.log("ERROR STATUS:", e.status);
    console.log("ERROR MESSAGE:", e.message);
  }
}
main();
