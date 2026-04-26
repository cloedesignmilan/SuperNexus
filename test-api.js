const http = require('http');

const data = JSON.stringify({
  imageUrl: "https://example.com/image.jpg",
  finalPrompt: "A beautiful dress",
  negativePrompt: "",
  qty: 1,
  aspectRatio: "4:5",
  selectedSnippetIds: [],
  taxonomyCat: "Dress / Elegant",
  taxonomyMode: "Clean Catalog",
  taxonomySubcat: "No Model"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/web/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log(body.substring(0, 500));
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
