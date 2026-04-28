async function run() {
  const payload = {
    imageUrl: "https://example.com/test.jpg",
    finalPrompt: "test",
    negativePrompt: "test",
    qty: 1,
    aspectRatio: "4:5",
    selectedSnippetIds: [],
    taxonomyCat: "dress",
    taxonomyMode: "Detail / Texture",
    taxonomySubcat: "Model Photo",
    clientGender: "WOMAN",
    detectedProductType: "dress"
  };
  const res = await fetch('http://localhost:3000/api/web/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
