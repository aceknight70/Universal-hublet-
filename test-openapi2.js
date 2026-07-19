import { createClient } from '@supabase/supabase-js';
async function test() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`);
  const spec = await res.json();
  console.log("Keys:", spec.definitions ? Object.keys(spec.definitions) : (spec.components ? Object.keys(spec.components.schemas) : 'unknown'));
  if (spec.components && spec.components.schemas.manifest_product_images) {
    console.log(spec.components.schemas.manifest_product_images.properties);
  }
}
test();
