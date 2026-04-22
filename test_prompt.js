const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });
async function main() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [{ role: 'user', parts: [{ text: "A hyper-detailed, high-end e-commerce product photograph of a single, luxury ruched bikini top, meticulously styled." }] }],
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    console.log("Success! Generated parts:", res.candidates[0]?.content?.parts?.length);
  } catch(e) {
    console.error("API Error:", e.message);
  }
}
main();
