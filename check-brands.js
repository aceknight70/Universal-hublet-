import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('manifest_brands').select('count', { count: 'exact' });
console.log('Brands Count:', data);
console.log('Error:', error);
