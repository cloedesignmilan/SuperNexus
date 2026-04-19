import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const SUPABASE_URL = envFile.split('\n').find(l => l.startsWith('SUPABASE_URL='))?.split('=')[1] || '';
const SUPABASE_KEY = envFile.split('\n').find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1] || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    const { data: items, error } = await supabase.storage.from('reference-images').list();
    if (error) { console.error(error); return; }

    console.log("Items in reference-images:");
    console.log(items);
    for (const item of items || []) {
        console.log(`- Item: ${item.name}`);
        const { data: files } = await supabase.storage.from('reference-images').list(item.name);
        for (const file of files || []) {
            console.log(`  - File: ${item.name}/${file.name}`);
        }
    }
}
run();
