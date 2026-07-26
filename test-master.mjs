import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data: m, error: mE } = await supabase.from('manifest_staff').select('*').eq('role', 'master');
    console.log("Master in manifest_staff:", m, mE);
    
    // sign in as the user
    // wait, I don't know the password for aceknight790@gmail.com
}
run();
