import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const cols = ['banner', 'logo', 'image_path', 'cover', 'photo', 'brand_name', 'business', 'company_name', 'title'];

for (const col of cols) {
  const { error } = await supabase.from('manifest_brand_ads').select(col).limit(1);
  if (!error) console.log(col + " exists!");
}
