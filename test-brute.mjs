import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const cols = ['id', 'created_at', 'brand_id', 'banner_url', 'tagline', 'description', 'cta', 'active', 'client_id', 'name', 'title', 'url', 'image_url', 'link'];

for (const col of cols) {
  const { error } = await supabase.from('manifest_brand_ads').select(col).limit(1);
  if (!error) console.log(col + " exists!");
}
