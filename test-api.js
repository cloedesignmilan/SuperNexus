const payload = {
  contents: [{
    role: "user",
    parts: [{ text: "Hello, reply with YES" }]
  }]
};
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GOOGLE_AI_STUDIO_API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
}).then(res => res.json()).then(console.log).catch(console.error);
