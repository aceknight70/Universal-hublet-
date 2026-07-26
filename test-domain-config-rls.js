import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data: q, error } = await supabase.rpc('get_table_info', {table_name: 'manifest_domain_config'});
    console.log(q, error);
}
run();
