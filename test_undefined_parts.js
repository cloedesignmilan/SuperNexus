const { GoogleGenAI } = require('@google/genai');
async function main() {
  const ai = new GoogleGenAI({ apiKey: 'AIzaSyA_FAKE_KEY' });
  try {
    await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [{ role: 'user', parts: [ undefined, {text: "hello"} ] }]
    });
  } catch(e) {
    console.log("ERROR:", e.message);
  }
}
main();
