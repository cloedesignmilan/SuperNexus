const { GoogleGenAI } = require('@google/genai');
async function main() {
  const ai = new GoogleGenAI({ apiKey: 'AIzaSyA_FAKE_KEY' });
  try {
    await ai.models.generateContent({
      model: '',
      contents: [{ role: 'user', parts: [ {text: "hello"} ] }]
    });
  } catch(e) {
    console.log("ERROR:", e.message);
  }
}
main();
