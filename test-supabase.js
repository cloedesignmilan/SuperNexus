require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkBucket() {
  const { data, error } = await supabase.storage.from('telegram-outputs').list('', { limit: 10, search: 'SWIMWEAR' });
  if (error) console.error(error);
  else console.log("Files found in bucket:", data.map(f => f.name));
}

checkBucket();
