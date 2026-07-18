import { createClient } from '@supabase/supabase-js';
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);
async function test() {
  const { data, error } = await supabase.storage
    .from('manifest_product_photos')
    .upload('123e4567-e89b-12d3-a456-426614174000/test.txt', 'hello', { upsert: true });
  console.log("UUID folder Result:", error || data);
}
test();
