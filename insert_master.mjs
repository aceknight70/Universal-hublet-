import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    // Try to insert a dummy row
    const { error } = await supabase.from('manifest_master').insert({id: 'b819f39f-723a-4efb-8af1-580a1334c2ab'});
    console.log(error);
}
run();
