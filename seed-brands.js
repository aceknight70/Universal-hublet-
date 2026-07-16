import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function seed() {
  const brands = [
    { name: 'Samsung', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
    { name: 'LG', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%left%29.svg' },
    { name: 'Sony', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Sony_logo.svg' },
    { name: 'TCL', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/TCL_logo.svg/512px-TCL_logo.svg.png' },
    { name: 'Hisense', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Hisense_logo.svg' }
  ];
  
  for (const b of brands) {
     const { data, error } = await supabase.from('manifest_brands').insert(b).select().single();
     console.log(data, error);
  }
}
seed();
