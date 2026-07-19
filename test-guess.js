import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { error } = await supabase.from('manifest_product_images').insert({ product_id: '123e4567-e89b-12d3-a456-426614174000', image_url: 'test' });
  console.log("Insert 1:", error);
  const { error: e2 } = await supabase.from('manifest_product_images').insert({ product_id: '123e4567-e89b-12d3-a456-426614174000', main_image: 'test' });
  console.log("Insert 2:", e2);
}
test();
