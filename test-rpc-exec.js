import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.rpc('execute_sql', { query: 'SELECT current_user' });
  console.log("Exec SQL:", error || data);
}
test();
