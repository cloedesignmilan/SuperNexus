import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });

async function main() {
  try {
    const response = await ai.models.list();
    const models = [];
    for await (const model of response) {
      if (model?.name?.includes("image") || model?.name?.includes("gen") || model?.name?.includes("flash") || model?.name?.includes("pro")) {
        models.push(model.name);
      }
    }
    console.log("Available models:", models);
  } catch (e) {
    console.error(e);
  }
}

main();
