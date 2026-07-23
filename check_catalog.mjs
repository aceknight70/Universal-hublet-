import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data: inv, error: invErr } = await supabase.from('manifest_inventory').select('*, manifest_catalog!inner(*)');
  console.log("Inventory joined:", inv?.length, invErr?.message);
  
  const { data: cat } = await supabase.from('manifest_catalog').select('*');
  console.log("Catalog raw:", cat?.length);
  
  const { data: legacy } = await supabase.from('manifest_products').select('*, manifest_product_images(slot, image_url)');
  console.log("Legacy products joined:", legacy?.length);
}
check();
