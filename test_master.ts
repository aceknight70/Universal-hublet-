import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
    const { data: master, error: mErr } = await supabase.from('manifest_master').select('*');
    console.log("Master table:", master, mErr);
}
run();
