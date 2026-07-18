import { createClient } from '@supabase/supabase-js';
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);
async function test() {
  const { data, error } = await supabase.storage
    .from('manifest_product_photos')
    .upload('public/test.txt', 'hello', { upsert: true });
  console.log("public/test.txt Result:", error || data);
}
test();
