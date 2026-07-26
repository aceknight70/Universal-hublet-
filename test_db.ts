import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
    const { data: users, error: uErr } = await supabase.from('manifest_staff').select('*').eq('role', 'master');
    console.log("Master staff:", users, uErr);
}
run();
