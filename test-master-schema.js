import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data: q, error } = await supabase.from('manifest_master').select('*').limit(0);
    console.log(q, error);
}
run();
