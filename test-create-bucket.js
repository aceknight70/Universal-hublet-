import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.storage.createBucket('manifest_product_photos', { public: true });
  console.log("CREATE BUCKET DATA:", data);
  console.log("CREATE BUCKET ERROR:", error);
}
test();
