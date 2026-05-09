async function main() {
  const url = 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-uploads/web_admin_sandbox_1778345695077.jpg';
  const res = await fetch(url);
  const ab = await res.arrayBuffer();
  console.log("LENGTH:", ab.byteLength);
}
main();
