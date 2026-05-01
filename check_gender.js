const { GoogleGenAI } = require('@google/genai');

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });
  const urls = [
    "https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-UGC-UGC%20CREATOR%20PACK-1_1777626474975.jpg",
    "https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-UGC-UGC%20CREATOR%20PACK-2_1777626474975.jpg",
    "https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-UGC-UGC%20CREATOR%20PACK-3_1777626474975.jpg",
    "https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-UGC-UGC%20CREATOR%20PACK-4_1777626474975.jpg",
    "https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-UGC-UGC%20CREATOR%20PACK-5_1777626474975.jpg"
  ];
  
  for (let i = 0; i < urls.length; i++) {
     try {
       const res = await fetch(urls[i]);
       const buf = await res.arrayBuffer();
       const result = await ai.models.generateContent({
         model: "gemini-3.1-flash",
         contents: [{
           role: 'user',
           parts: [
             { text: 'Is the main person in this image a man or a woman? Reply ONLY with MAN or WOMAN.' },
             { inlineData: { data: Buffer.from(buf).toString('base64'), mimeType: 'image/jpeg' } }
           ]
         }]
       });
       console.log('Image ' + (i+1) + ': ' + result.text);
     } catch(e) {
       console.error(e.message);
     }
  }
}
run();
