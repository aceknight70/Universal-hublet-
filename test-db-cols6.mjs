import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('manifest_brand_ads').insert({
  client_id: '158e9987-a068-45fb-a1c6-2c1cf6027fb4', 
  banner_url: 'abc',
  business_name: 'test'
}).select();
console.log(error);
