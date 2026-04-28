import { POST } from './src/app/api/web/generate/route';

async function run() {
  const req = {
    json: async () => ({
      imageUrl: 'https://example.com/image.jpg',
      finalPrompt: 'test',
      qty: 1,
      taxonomyCat: 'dress',
      taxonomyMode: 'Detail / Texture',
      taxonomySubcat: 'Model Photo'
    })
  } as any;
  
  try {
    const res = await POST(req);
    console.log(res.status);
    console.log(await res.text());
  } catch (e) {
    console.error("CRASH:", e);
  }
}
run();
