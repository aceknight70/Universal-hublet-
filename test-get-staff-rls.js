import { createClient } from '@supabase/supabase-js';
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);
async function test() {
  const { data, error } = await supabase.from('manifest_staff').insert({
    id: '00000000-0000-0000-0000-000000000000',
    client_id: null,
    name: 'test',
    role: 'master'
  });
  console.log("Insert Error:", error);
}
test();
