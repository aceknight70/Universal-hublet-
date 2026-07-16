import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const dummyUUID = '00000000-0000-0000-0000-000000000000';
  const { data, error } = await supabase.storage
    .from('manifest_gallery')
    .upload(`${dummyUUID}/test_gallery.txt`, 'hello', { upsert: true });

  if (error) {
    console.log("EXACT ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCCESS:", data);
  }
}
test();
