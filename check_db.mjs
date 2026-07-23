import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: invData } = await supabase.from('manifest_inventory').select('*').limit(5);
  const { data: catData } = await supabase.from('manifest_catalog').select('*').limit(5);
  const { data: prodData, error: prodErr } = await supabase.from('manifest_products').select('*').limit(5);
  const { data: imgData, error: imgErr } = await supabase.from('manifest_product_images').select('*').limit(5);

  console.log("Inventory:", invData?.length);
  console.log("Catalog:", catData?.length);
  console.log("Legacy Products:", prodData?.length, prodErr?.message);
  console.log("Legacy Images:", imgData?.length, imgErr?.message);
}
check();
