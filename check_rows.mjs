import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data, count, error } = await supabase.from('manifest_products').select('id', { count: 'exact' });
  console.log("Count:", count, "Error:", error?.message);
}
check();
