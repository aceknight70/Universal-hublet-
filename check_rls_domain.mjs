import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    // try inserting a dummy domain skin with anon key
    const { error } = await supabase.from('manifest_domain_config').upsert({domain: 'test.com', client_id: 'test'});
    console.log(error);
}
run();
