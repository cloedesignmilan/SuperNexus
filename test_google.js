require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function main() {
  const imageUrl = "https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-uploads/web_d2f327b0-a7ea-40a3-975a-2aa7340210a8_1777104831045.jpg";
  const imgRes = await fetch(imageUrl);
  const arrayBuffer = await imgRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const imageBase64 = buffer.toString('base64');
  
  const prompt = `Analizza questa immagine di prodotto. Devi restituire ESCLUSIVAMENTE un JSON valido seguendo questa struttura esatta, senza markdown o testo extra:
    {
      "detectedProductType": "enum(swimwear | women_clothing | men_clothing | tshirt_hoodie | shoes | bags | jewelry | accessories | ceremony_elegant | unknown)",
      "confidence": "number between 0 and 1",
      "detectedAttributes": {
        "genderTarget": "enum(woman | man | unisex | child | unknown)",
        "productCategory": "string",
        "subCategory": "string",
        "colors": ["array of main colors"],
        "style": "enum(casual | elegant | sporty | beach | premium | streetwear | unknown)",
        "hasLogoOrPrint": boolean,
        "recommendedModelOptions": ["array of recommended model types, e.g., 'Candid Real Woman', 'No Model'"],
        "recommendedScenes": ["array of highly recommended background scenes"],
        "blockedOrLowPriorityOptions": ["array of scenes or models that DO NOT match this product"]
      }
    }`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_STUDIO_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });
  console.log(JSON.stringify(await res.json(), null, 2));
}
main().catch(console.error);
