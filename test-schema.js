import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.rpc('execute_sql', { query: `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'manifest_product_images'
  ` });
  console.log("Schema:", error || data);
}
test();
