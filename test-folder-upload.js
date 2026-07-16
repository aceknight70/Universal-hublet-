import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data: clients } = await supabase.from('manifest_clients').select('id, slug').limit(1);
  const clientId = clients[0]?.id;
  console.log("Found client ID:", clientId);

  const fileContent = 'hello world';
  const { data, error } = await supabase.storage
    .from('manifest_gallery')
    .upload(`${clientId}/test_gallery.txt`, fileContent, { upsert: true });

  if (error) {
    console.log("EXACT ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCCESS:", data);
  }
}
test();
