import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data, error } = await supabase.storage.from('manifest_gallery').list();
  console.log("Gallery:", data?.length, error);
}
check();
