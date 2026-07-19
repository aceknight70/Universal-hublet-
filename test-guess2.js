import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { error: e3 } = await supabase.from('manifest_product_images').insert({ slot: 'front' });
  console.log("Insert 3 (slot):", e3?.message);
  const { error: e4 } = await supabase.from('manifest_product_images').insert({ client_id: '123e4567-e89b-12d3-a456-426614174000' });
  console.log("Insert 4 (client_id):", e4?.message);
}
test();
