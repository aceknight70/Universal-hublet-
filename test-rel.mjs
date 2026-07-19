import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('manifest_products').select('code, name, price, stock_status, category, manifest_brands(name), manifest_client_product_overrides(preset_tags)').limit(1);
console.log(data, error);
