import { generateImagesWithAI } from './src/lib/ai/generate';

async function run() {
  try {
    const res = await generateImagesWithAI({
      qty: 1,
      subcat: {
        id: "d036f0ae-9623-447e-a197-9578cedea5ec",
        business_mode_id: "2e54890b-31c6-407a-b036-4c3bcfd8255f",
        name: "Model Photo",
        slug: "dress-detail-model-photo",
        business_mode: {
          slug: "detail",
          category: {
            slug: "dress"
          }
        }
      } as any,
      publicUrls: ["https://example.com/test.jpg"],
      userClarification: "",
      isOutfit: false,
      varianceEnabled: false,
      generationModel: "test",
      taxonomyCat: "dress",
      taxonomyMode: "Detail / Texture",
      taxonomySubcat: "Model Photo",
      clientGender: "WOMAN",
      detectedProductType: "dress",
      aspectRatio: "4:5"
    });
    console.log("SUCCESS");
  } catch (e) {
    console.error("CRASH:", e);
  }
}
run();
