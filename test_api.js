const { POST } = require('./src/app/api/web/generate/route');
const { NextRequest } = require('next/server');
require('dotenv').config({path: '.env'});

async function main() {
  const req = new NextRequest('http://localhost/api/web/generate', {
    method: 'POST',
    body: JSON.stringify({
      imageUrl: 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-uploads/web_admin_sandbox_1778345695077.jpg',
      finalPrompt: 'A simple dress',
      qty: 1,
      aspectRatio: '3:4',
      taxonomyCat: 'dress',
      taxonomyMode: 'clean-catalog',
      taxonomySubcat: 'no-model',
      clientGender: 'WOMAN'
    })
  });
  
  // Mock cookies/auth if needed, or bypass in the code?
  // Let's just bypass it.
}
main();
