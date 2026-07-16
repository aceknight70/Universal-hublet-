import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const fileContent = 'hello world';
  const dummyUUID = 'd407fd4a-f3d6-4444-8d4e-1b8f5cf21a9a';
  const { data, error } = await supabase.storage
    .from('manifest_gallery')
    .upload(`${dummyUUID}/test_gallery.txt`, fileContent, { upsert: true });

  if (error) {
    console.log("EXACT ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCCESS:", data);
  }
}
test();
