import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const cols = ['logo_url', 'image', 'picture', 'photo_url', 'link_url', 'cta_link', 'cta_url', 'target_url', 'business_name', 'business_url'];

for (const col of cols) {
  const { error } = await supabase.from('manifest_brand_ads').select(col).limit(1);
  if (!error) console.log(col + " exists!");
}
