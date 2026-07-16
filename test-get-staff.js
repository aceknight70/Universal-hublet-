import { createClient } from '@supabase/supabase-js';
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);
async function test() {
  const { data, error } = await supabase.from('manifest_staff').select('*');
  console.log("Staff:", data);
  console.log("Error:", error);
}
test();
