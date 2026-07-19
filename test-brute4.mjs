import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const cols = ['brand_logo', 'ad_image', 'ad_image_url', 'brand_image', 'brand_logo_url', 'media_url', 'image_url', 'img_url', 'pic_url', 'banner_image', 'banner_image_url', 'thumbnail_url', 'icon_url'];

for (const col of cols) {
  const { error } = await supabase.from('manifest_brand_ads').select(col).limit(1);
  if (!error) console.log(col + " exists!");
}
