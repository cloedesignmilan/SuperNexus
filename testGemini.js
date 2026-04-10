const { GoogleGenAI } = require('@google/genai');

async function test() {
  const p = process.env.KEY;
  console.log('Key exists:', !!p);
  const ai = new GoogleGenAI({ apiKey: p });
  try {
     console.log('Testing model...');
     const res = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: [
            {
                role: 'user',
                parts: [
                    { text: 'A white cat' }
                ]
            }
        ],
        config: { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } }
     });
     console.log('Response:', JSON.stringify(res, null, 2));
  } catch(e) {
     console.error('ERROR from Gemini:', e.message);
  }
}
test();
