import { createClient } from '@supabase/supabase-js';
async function test() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`);
  const spec = await res.json();
  const table = spec.definitions.manifest_product_images;
  console.log("manifest_product_images:", JSON.stringify(table, null, 2));
}
test();
