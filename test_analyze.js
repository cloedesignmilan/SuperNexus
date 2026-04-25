fetch("http://localhost:3001/api/web/analyze-product", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ imageUrl: "https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-uploads/web_d2f327b0-a7ea-40a3-975a-2aa7340210a8_1777104831045.jpg" })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(console.error);
