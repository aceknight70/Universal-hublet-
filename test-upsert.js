import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { error } = await supabase.from('manifest_product_images').upsert({ product_id: '123e4567-e89b-12d3-a456-426614174000', slot: 'main_image', image_url: 'test' }, { onConflict: 'product_id,slot' });
  console.log("Upsert Check:", error);
}
test();
