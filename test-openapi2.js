import { createClient } from '@supabase/supabase-js';
async function test() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`);
  const spec = await res.json();
  console.log("Keys:", Object.keys(spec.definitions));
  console.log("Images table:", spec.definitions.manifest_product_images.properties);
}
test();
