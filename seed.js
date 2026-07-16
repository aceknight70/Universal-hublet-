import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const clients = [
  { name: 'Ugomenz Electronics', slug: 'ugomenz', categories: [], theme: {accent_color: '#E8622C'} },
  { name: 'O Frank Electronics', slug: 'o-frank', categories: [], theme: {accent_color: '#2B5FD9'} },
  { name: 'AllSufficiency (ORB)', slug: 'allsufficiency', categories: [], theme: {accent_color: '#C0392B'} },
  { name: 'Linz Electronics', slug: 'linz', categories: [], theme: {accent_color: '#6F4E37'} }
];

const { data, error } = await supabase.from('manifest_clients').insert(clients).select();
console.log('Inserted:', data);
console.log('Error:', error);
