import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data, error } = await supabase.storage.from('manifest_gallery').list('00000000-0000-0000-0000-000000000000');
  console.log("Gallery zero:", data?.length, error);
}
check();
