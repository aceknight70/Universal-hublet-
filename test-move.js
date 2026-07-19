import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.storage.from('manifest_gallery').move('public/test.txt', 'public/matched_test.txt');
  console.log("Move check:", error || data);
}
test();
