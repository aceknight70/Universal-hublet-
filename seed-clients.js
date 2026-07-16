import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function seed() {
  const clients = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Ugomenz Electronics', slug: 'ugomenz', categories: [], theme: { accent_color: '#E8622C' } },
    { id: '22222222-2222-2222-2222-222222222222', name: 'O Frank Electronics', slug: 'o-frank', categories: [], theme: { accent_color: '#2B5FD9' } },
    { id: '33333333-3333-3333-3333-333333333333', name: 'AllSufficiency (ORB)', slug: 'allsufficiency', categories: [], theme: { accent_color: '#C0392B' } },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Linz Electronics', slug: 'linz', categories: [], theme: { accent_color: '#6F4E37' } }
  ];
  
  for (const c of clients) {
     const { data, error } = await supabase.from('manifest_clients').upsert(c).select().single();
     console.log(data, error);
  }
}
seed();
