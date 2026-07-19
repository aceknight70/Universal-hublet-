import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('manifest_client_product_overrides').upsert({
  client_id: '158e9987-a068-45fb-a1c6-2c1cf6027fb4', // fallback client
  product_id: 'e696f81e-df8d-4b95-a228-56ebdd42b0da', // some product
  preset_tags: ['default']
}, { onConflict: 'client_id,product_id' });
console.log(error);
