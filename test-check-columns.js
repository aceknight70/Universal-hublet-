import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('manifest_products').select('main_image, front_image, left_image, right_image, back_image, video_url, extra_details').limit(1);
  console.log("Columns Check:", error || data);
}
test();
